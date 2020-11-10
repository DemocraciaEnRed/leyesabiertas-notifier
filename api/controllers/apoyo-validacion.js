const { INTERNAL_SERVER_ERROR, OK } = require('http-status')
const { ObjectID } = require('mongodb')
const agenda = require('../jobs/agenda')
const mongo = require('../../services/db')
const notification = require('../../core/notification-strategies')

function log(msg){
  console.log('api/controllers/apoyo-validacion.js:', msg)
}

exports.post = async (req, res) => {
  try {
    const { documentId, tokenId } = req.body

    const db = mongo.getDB()

    const [ documentsArr, token ] = await Promise.all([
      db.collection('documents').aggregate([
        { $match: { _id: ObjectID(documentId) } },
        {
          $lookup: {
            from: 'documentversions',
            localField: 'currentVersion',
            foreignField: '_id',
            as: 'currentVersionObj'
          }
        },
        { $unwind : "$currentVersionObj" }
      ]).toArray(),
      db.collection('apoyotokens').findOne({ _id: ObjectID(tokenId) })
    ]);

    if (!documentsArr || !documentsArr.length)
      throw new Error(`Document ${documentId} not found`)

    const documentObj = documentsArr[0]
    const currentVersionObj = documentObj.currentVersionObj

    if (!currentVersionObj)
      throw new Error(`DocumentVersion ${documentObj.currentVersion} not found`)

    if (!token)
      throw new Error(`Token ${tokenId} not found`)

    if (token.document.toString() != documentObj._id)
      throw new Error(`Token o documento inválidos`)

    await notification.sendEmail('apoyo-validacion', {
      documentTitle: currentVersionObj.content.title,
      token,
      user: { email: token.email }
    })

    log('Apoyo validación mail scheduled')
    res.status(OK).json({
      message: 'Apoyo validación mail scheduled'
    })
  } catch (err) {
    log(err)
    res.status(INTERNAL_SERVER_ERROR).json({
      message: 'An error ocurred trying to schedule the apoyo validación event.',
      reason: err.message
    })
  }
}
