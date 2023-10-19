const { INTERNAL_SERVER_ERROR, OK } = require('http-status')
const { ObjectId } = require('mongodb')
const mongo = require('../../services/db')
const notification = require('../../core/notification-strategies')

function log (msg) {
  console.log('api/controllers/document-popular.js:', msg)
}

exports.post = async (req, res) => {
  try {
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

    if (documentObj.popularMailSent) { throw new Error(`Already sent popularity mail for document ${documentId}`) }

    const currentVersionObj = documentObj.currentVersionObj

    if (!currentVersionObj) { throw new Error(`DocumentVersion ${documentObj.currentVersion} not found`) }

    // const tagsIds = currentVersionObj.content.tags
    log(`Preparing notification for "${currentVersionObj.content.title}"`)

    const commentsCount = await db.collection('comments').count({ document: documentObj._id, field: "fundation" })
    const aportesCount = await db.collection('comments').count({ document: documentObj._id, field: "articles" })
    const apoyosCount = documentObj.apoyos ? documentObj.apoyos.length : 0

    const emailProps = {
      document: {
        id: documentObj._id.toString(),
        title: currentVersionObj.content.title,
        commentsCount,
        aportesCount,
        apoyosCount
      }
    }

    const usersToNotify = await db.collection('users').find({ 'fields.popularNotification': true }, { projection: { email: 1, fullname: 1 } }).toArray()
    log(`Found ${usersToNotify.length} users to notify (popularNotification: true)`)

    if (!usersToNotify || !usersToNotify.length) {
      log('No users found for popularity notifications... skipping')
      return res.status(OK).json({
        message: 'No users found for popularity notifications, skipping'
      })
    }

    // Rutina de mandada de mails (secuencial)
    let emailsSent = 0

    usersToNotify.forEach((user) => {
      const userEmail = user && user.email

      try {
        if (!userEmail) {
          log(`User "${user.fullname}" has no email, skipping notification`)
          return
        }

        notification.sendEmail('document-popular', {
          user: {
            email: userEmail,
            name: user.fullname
          },
          author: {
            id: documentObj.authorObj._id.toString(),
            fullname: documentObj.authorObj.fullname
          },
          document: {
            id: documentObj._id.toString(),
            title: currentVersionObj.content.title,
            author: documentObj.authorObj.fullname || documentObj.authorObj.username,
            commentsCount: emailProps.document.commentsCount,
            aportesCount: emailProps.document.aportesCount,
            apoyosCount: emailProps.document.apoyosCount
          }
        })

        emailsSent++
      } catch (err) {
        log(`Error when sending mail to ${userEmail}:`)
        log(err)
      }
    })

    // Devolvemos OK
    log(`${emailsSent} email(s) scheduled`)

    // set popularMailSent to true
    await db.collection('documents').updateOne({ _id: ObjectId(documentId) }, { $set: { popularMailSent: true } })

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
