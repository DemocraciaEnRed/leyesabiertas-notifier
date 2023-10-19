const fs = require('fs')
const express = require('express')
const { ObjectId } = require('mongodb')
const { INTERNAL_SERVER_ERROR, OK } = require('http-status')
const mongo = require('../../services/db')
const router = express.Router()
const { NODE_ENV } = process.env
const basePath = NODE_ENV === 'production' ? '../../dist/templates' : '../../templates'
// const mailer = require('../../services/nodemailer');

// function arrayUnique (array) {
//   let a = array.concat()
//   for (let i = 0; i < a.length; ++i) {
//     for (let j = i + 1; j < a.length; ++j) {
//       if (a[i] === a[j]) { a.splice(j--, 1) }
//     }
//   }
//   return a
// }

function buildTemplate (fileName, props) {
  const path = `${basePath}/${fileName}`
  const reactTemplate = require(path)

  return reactTemplate({ ...props })
}

function log (msg) {
  console.log('api/controllers/document-popular.js:', msg)
}

// router.post('/test', async (req, res, next) => {
//   try {
//     const { type, comment } = req.body
//     let commentInfo = await mongo.getDB().collection('comments').aggregate([
//       { $match: { _id: ObjectId(comment) } },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'user',
//           foreignField: '_id',
//           as: 'user'
//         }
//       },
//       {
//         $lookup: {
//           from: 'documents',
//           localField: 'document',
//           foreignField: '_id',
//           as: 'document'
//         }
//       },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'document.author',
//           foreignField: '_id',
//           as: 'author'
//         }
//       },
//       { $project: {
//         'user.avatar': 0,
//         'author.avatar': 0,
//         'version.content.fundation': 0,
//         'version.content.articles': 0,
//         'decoration': 0
//       }
//       }
//     ]).toArray()
//     // console.log(commentInfo[0].document[0])
//     // let emailProps = {
//     //   author: {
//     //     id: commentInfo[0].user[0]._id,
//     //     name: commentInfo[0].user[0].name,
//     //     fullname: commentInfo[0].user[0].fullname,
//     //     email: commentInfo[0].user[0].email
//     //   },
//     //   document: {
//     //     id: commentInfo[0].document,
//     //     title: commentInfo[0].document[0].author
//     //   },
//     //   comment: {
//     //     content: commentInfo[0].content
//     //   },
//     //   reply: commentInfo[0].reply || null
//     // }
//     res.send(commentInfo[0])
//     // const template = buildTemplate(type, emailProps)
//     // res.send(template)
//   } catch (err) {
//     res.status(INTERNAL_SERVER_ERROR).json({
//       message: 'An error ocurred',
//       reason: err.message
//     })
//   }
// })

router.post('/test', async (req, res, next) => {
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

    if (documentObj.publishedMailSent) { throw new Error(`Already sent published mail for document ${documentId}`) }

    const currentVersionObj = documentObj.currentVersionObj

    if (!currentVersionObj) { throw new Error(`DocumentVersion ${documentObj.currentVersion} not found`) }

    const tagsIds = currentVersionObj.content.tags
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
      log('No users found for document\'s tags, skipping notification')
      return res.status(OK).json({
        message: 'No users found for document\'s tags, skipping notification'
      })
    }

    return res.json({
      documentObj,
      tagsIds,
      emailProps,
      usersToNotify
    })
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).json({
      message: 'An error ocurred',
      reason: err.message
    })
  }
})

router.post('/views/:type', (req, res, next) => {
  if (!fs.existsSync(`templates/${req.params.type}.js`)) return next()

  const template = require(`../../templates/${req.params.type}`)
  const props = req.body

  console.log('props')
  console.log(props)
  console.log('-----------------------------')

  res.send(template(props))
})

module.exports = router
