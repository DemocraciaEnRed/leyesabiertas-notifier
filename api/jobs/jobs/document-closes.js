const { ObjectId } = require('mongodb')
const mailer = require('../../../services/nodemailer')
const mongo = require('../../../services/db')
const {
  NODE_ENV,
  ORGANIZATION_NAME,
  ORGANIZATION_EMAIL,
  BULK_EMAIL_CHUNK_SIZE,
  NODEMAILER_HOST,
  NODEMAILER_USER,
  NODEMAILER_PASS,
  NODEMAILER_PORT,
  NODEMAILER_SECURE
} = process.env
const basePath = NODE_ENV === 'production' ? '../../../dist/templates' : '../../../templates'
const limiter = require('../../../services/bottleneck')

function log (message) {
  console.log('jobs/document-closes.js: ' + message)
}

function arrayUnique (array) {
  let a = array.concat()
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) { a.splice(j--, 1) }
    }
  }
  return a
}

function buildTemplate (fileName, props) {
  const path = `${basePath}/${fileName}`
  const reactTemplate = require(path)

  return reactTemplate({ ...props })
}

module.exports = (agenda) => {
  agenda.define('document-closes', async (job, done) => {
    const document = job.attrs.data

    let documentInfo = await mongo.getDB().collection('documents').aggregate([
      { $match: { _id: ObjectId(document.id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $lookup: {
          from: 'documentversions',
          localField: 'currentVersion',
          foreignField: '_id',
          as: 'currentVersion'
        }
      },
      { $project: {
        'author.avatar': 0,
        'currentVersion.content.fundation': 0,
        'currentVersion.content.articles': 0
      }
      }
    ]).toArray()
    if (documentInfo.length === 0) {
      throw new Error('Document doesn\'t exist')
    }

    documentInfo = documentInfo[0]

    const commentsCount = await mongo.getDB().collection('comments').countDocuments({ document: documentInfo._id, field: 'fundation' })
    const aportesCount = await mongo.getDB().collection('comments').countDocuments({ document: documentInfo._id, field: 'articles' })
    const apoyosCount = documentInfo.apoyos ? documentInfo.apoyos.length : 0

    const emailsWhoCommentedResults = await mongo.getDB().collection('comments').aggregate([
      { $match: { document: ObjectId(document.id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $group: { _id: '$userData.email' } },
      { $unwind: '$_id' },
      { $project: { _id: 0, email: '$_id' }
      }
    ]).toArray()
    let emailsWhoCommented = emailsWhoCommentedResults.map((user) => {
      return user.email
    })
    // -----------
    // Get emails from Likes
    // Get Likes from each comment
    const getLikesOfCommentsResults = await mongo.getDB().collection('comments').aggregate([
      { $match: { document: document.id } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'comment',
          as: 'likes'
        }
      },
      { $project: { 'likes._id': 1 } }
    ]).toArray()
    // Deconstruct and get only the like's ID
    let likesIds = []
    getLikesOfCommentsResults.forEach((comment) => {
      comment.likes.forEach((like) => {
        likesIds.push(like._id)
      })
    })
    // Join each like with their user and get only their emails
    const emailsWhoLikedResults = await mongo.getDB().collection('likes').aggregate([
      { $match: { _id: { $in: likesIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $group: { _id: '$user.email' } },
      { $unwind: '$_id' },
      { $project: { _id: 0, email: '$_id' }
      }
    ]).toArray()
    // Deconstruct emails
    const emailsWhoLiked = emailsWhoLikedResults.map((user) => {
      return user.email
    })

    // Now the people who supported the document
    const emailsWhoSupportedResults = await mongo.getDB().collection('documents').find({ _id: ObjectId(document.id) }, { projection: { apoyos: 1 } }).toArray()
    const emailsWhoSupported = []

    for (let i = 0; i < emailsWhoSupportedResults[0].apoyos.length; i++) {
      const apoyo = emailsWhoSupportedResults[0].apoyos[i]
      if (apoyo.userId) {
        const emailUser = await mongo.getDB().collection('users').find({ _id: ObjectId(apoyo.userId) }, { projection: { email: 1 } }).toArray()
        emailsWhoSupported.push(emailUser[0].email)
      }
      if (apoyo.email) {
        emailsWhoSupported.push(apoyo.email)
      }
    }
    // -----------
    // Merge Emails
    const emailsToSend = arrayUnique(emailsWhoCommented.concat(emailsWhoLiked).concat(emailsWhoSupported))
    log(`Found ${emailsWhoCommented.length} emails from comments`)
    log(`Found ${emailsWhoLiked.length} emails from likes`)
    log(`Found ${emailsWhoSupported.length} emails from supports`)
    log(`Found ${emailsToSend.length} UNIQUE emails to send`)

    let emailProps = {
      document: {
        id: documentInfo._id,
        title: documentInfo.currentVersion[0].content.title,
        imageCover: documentInfo.currentVersion[0].content.imageCover,
        commentsCount,
        aportesCount,
        apoyosCount
      },
      author: {
        id: documentInfo.author[0]._id,
        fullname: documentInfo.author[0].fullname
      }
    }
    let config = {
      host: NODEMAILER_HOST,
      port: NODEMAILER_PORT
    }
    if (NODEMAILER_SECURE) {
      config.auth = {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS
      }
    } else {
      config.secure = false
      config.ignoreTLS = true
    }

    const template = buildTemplate('comment-closed', emailProps)

    for (let i = 0; i < emailsToSend.length; i++) {
      let emailOptions = {
        from: `"${ORGANIZATION_NAME}" <${ORGANIZATION_EMAIL}>`, // sender address
        to: emailsToSend[i], // to
        subject: '¡Proyecto cerrado!', // Subject line
        html: template // html body
      }

      // agenda.now('send-email', emailOptions)
      mailer.sendEmail(config, emailOptions, function (err) {
        if (err) {
          log('Sending failed: ' + err)
        } else {
          log('Sent')
        }
      })

      // notifications.sendClosingEmail()
    }
    done()
  })
}
