const { INTERNAL_SERVER_ERROR, OK } = require('http-status')
const { ObjectID } = require('mongodb')
const mongo = require('../../services/db')
const notification = require('../../core/notification-strategies')

function log(msg){
  console.log('api/controllers/document-published.js:', msg)
}

exports.post = async (req, res) => {
  try {
    const { documentId } = req.body

    const db = mongo.getDB()

    // Traemos datos del proyecto, su versión actual y su autor/a
    const documentsArr = await db.collection('documents').aggregate([
      { $match: { _id: ObjectID(documentId) } },
      {
        $lookup: {
          from: 'documentversions',
          localField: 'currentVersion',
          foreignField: '_id',
          as: 'currentVersionObj'
        }
      },
      { $unwind : "$currentVersionObj" },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorObj'
        }
      },
      { $unwind : "$authorObj" }
    ]).toArray()

    // Muchas validaciones antes de preparar la enviada de mails
    if (!documentsArr || !documentsArr.length)
      throw new Error(`Document ${documentId} not found`)

    const documentObj = documentsArr[0]

    if (documentObj.publishedMailSent)
      throw new Error(`Already sent published mail for document ${documentId}`)

    const currentVersionObj = documentObj.currentVersionObj

    if (!currentVersionObj)
      throw new Error(`DocumentVersion ${documentObj.currentVersion} not found`)

    const tagsIds = currentVersionObj.content.tags
    log(`Preparing notification for "${currentVersionObj.content.title}"`)

    if (!tagsIds || !tagsIds.length){
      log('No tags found for document, skipping notification')
      res.status(OK).json({
        message: 'No tags found for document, skipping notification'
      })
      return
    }

    // Buscamos toda la información de las etiquetas
    const tagsData = await db.collection('documenttags')
      .find({ _id: { $in: tagsIds.map(id => ObjectID(id)) } })
      .toArray()
    log(`Document has ${tagsData.length} tags: "${tagsData.map(t=>t.name).join('", "')}"`)

    // Buscamos todxs lxs usuarixs suscriptos a 1 o más de las etiquetas
    const users = await db.collection('users')
      .find({$and: [
          {'fields.tagsNotification': true},
          {'fields.tags': {$in:  tagsIds}}
      ]}).toArray()
    log(`Found ${users.length} subscribed users (to all or some of document's tags)`)

    if (!users || !users.length){
      log('No users found for document\'s tags, skipping notification')
      res.status(OK).json({
        message: 'No users found for document\'s tags, skipping notification'
      })
      return
    }

    // Rutina de mandada de mails (secuencial)
    let emailsSent = 0

    users.forEach(user => {

      const userEmail = user && user.email

      try {

        if (!userEmail){
          log(`User "${user.username}" has no email, skipping notification for her/him`)
          return
        }

        const matchingTags = tagsData.filter(t => user.fields.tags.includes(t._id.toString())).map(t => t.name)

        notification.sendEmail('document-published', {
          user: {
            email: userEmail,
            name: user.name || user.username
          },
          document: {
            id: documentObj._id,
            title: currentVersionObj.content.title,
            author: documentObj.authorObj.fullname || documentObj.authorObj.username
          },
          matchingTags: matchingTags
        })

        emailsSent++

      } catch (err) {

        log(`Error when sending mail to ${userEmail}:`)
        log(err)

      }
    })

    // Devolvemos OK
    log(`${emailsSent} email(s) scheduled`)
    res.status(OK).json({
      message: `${emailsSent} email(s) scheduled`
    });

  } catch (err) {
    log(err)
    res.status(INTERNAL_SERVER_ERROR).json({
      message: 'An error ocurred trying to schedule the email.',
      reason: err.message
    })
  }
}
