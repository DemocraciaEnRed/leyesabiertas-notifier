const { INTERNAL_SERVER_ERROR, OK } = require('http-status')
const { ObjectId } = require('mongodb')
const mongo = require('../../services/db')
const notification = require('../../core/notification-strategies')

function log (msg) {
  console.log('api/controllers/document-published.js:', msg)
}

exports.post = async (req, res) => {
  try {
    log('Received request to schedule document published notification')

    const { documentId } = req.body

    const db = mongo.getDB()

    // Traemos datos del proyecto, su versión actual y su autor/a
    const documentsArr = await db.collection('documents').aggregate([
      { $match: { _id: ObjectId(documentId) } },
      {
        $lookup: {
          from: 'documentversions',
          localField: 'currentVersion',
          foreignField: '_id',
          as: 'currentVersionObj'
        }
      },
      { $unwind: '$currentVersionObj' },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorObj'
        }
      },
      { $unwind: '$authorObj' }
    ]).toArray()

    // Muchas validaciones antes de preparar la enviada de mails
    if (!documentsArr || !documentsArr.length) { throw new Error(`Document ${documentId} not found`) }

    const documentObj = documentsArr[0]

    if (documentObj.publishedMailSent) { throw new Error(`Already sent published mail for document ${documentId}`) }

    const currentVersionObj = documentObj.currentVersionObj

    if (!currentVersionObj) { throw new Error(`DocumentVersion ${documentObj.currentVersion} not found`) }

    const tagsIds = currentVersionObj.content.tags
    log(`Preparing notification for "${currentVersionObj.content.title}"`)

    if (!tagsIds || !tagsIds.length) {
      log('No tags found for document, skipping notification')
      res.status(OK).json({
        message: 'No tags found for document, skipping notification'
      })
      return
    }

    // Buscamos toda la información de las etiquetas
    const tagsData = await db.collection('documenttags')
      .find({ _id: { $in: tagsIds.map((id) => ObjectId(id)) } })
      .toArray()
    log(`Document has ${tagsData.length} tags: "${tagsData.map((t) => t.name).join('", "')}"`)

    // Buscamos todxs lxs usuarixs suscriptos a 1 o más de las etiquetas
    const usersToNotifyByTagInterest = await db.collection('users')
      .find({ $and: [
        { 'fields.tagsNotification': true },
        { 'fields.tags': { $in: tagsIds } }
      ] }, {
        projection: {
          email: 1,
          fullname: 1,
          username: 1,
          name: 1,
          fields: 1
        }
      }).toArray()
    log(`Found ${usersToNotifyByTagInterest.length} subscribed users (to all or some of document's tags)`)

    const usersToNotifyBecauseSubscribedToAuthor = await db.collection('users')
      .find({ $and: [
        { 'fields.authors': { $exists: true } },
        { 'fields.authors': { $in: [documentObj.authorObj._id.toString()] } }
      ] }, {
        projection: {
          email: 1,
          fullname: 1,
          username: 1,
          name: 1,
          fields: 1
        }
      }).toArray()

    log(`Found ${usersToNotifyBecauseSubscribedToAuthor.length} subscribed users (to document's author)`)

    // usersToNotify -- merge both arrays (skipping copies)

    const usersToNotify = []
    for (let i = 0; i < usersToNotifyByTagInterest.length; i++) {
      const user = usersToNotifyByTagInterest[i]
      if (!usersToNotify.find((u) => u._id.toString() === user._id.toString())) {
        usersToNotify.push(user)
      }
    }

    for (let i = 0; i < usersToNotifyBecauseSubscribedToAuthor.length; i++) {
      const user = usersToNotifyBecauseSubscribedToAuthor[i]
      if (!usersToNotify.find((u) => u._id.toString() === user._id.toString())) {
        usersToNotify.push(user)
      }
    }

    log(`Found ${usersToNotify.length} UNIQUE users to notify (tagsNotification: true or subscribed to author)`)

    // Rutina de mandada de mails (secuencial)
    let emailsSent = 0

    usersToNotify.forEach((user) => {
      const userEmail = user && user.email

      try {
        if (!userEmail) {
          log(`User "${user.fullname}" has no email, skipping notification for her/him`)
          return
        }

        const matchingTags = tagsData.filter((t) => user.fields.tags.includes(t._id.toString())).map((t) => t.name)

        notification.sendEmail('document-published', {
          user: {
            email: userEmail,
            name: user.name || user.username
          },
          author: {
            id: documentObj.authorObj._id.toString(),
            fullname: documentObj.authorObj.fullname
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
    // set publishedMailSent to true
    await db.collection('documents').updateOne({ _id: ObjectId(documentId) }, { $set: { publishedMailSent: true } })

    return res.status(OK).json({
      message: `${emailsSent} email(s) scheduled`
    })
  } catch (err) {
    log(err)
    res.status(INTERNAL_SERVER_ERROR).json({
      message: 'An error ocurred trying to schedule the email.',
      reason: err.message
    })
  }
}
