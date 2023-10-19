const { INTERNAL_SERVER_ERROR, OK } = require('http-status')
const agenda = require('../jobs/agenda')

function log (msg) {
  console.log('api/controllers/document-popular.js:', msg)
}

exports.post = async (req, res) => {
  try {
    let executionDate = new Date(req.body.closingDate)
    executionDate.setHours(23, 59, 59)
    let document = req.body
    const cantCanceled = await agenda.cancel({ name: 'document-closes', 'data.id': document.id })
    if (cantCanceled > 0) {
      log(`Canceled ${cantCanceled} scheduled closing events for document ${document.id}`)
    }
    // setting execution Date
    const jobCreated = await agenda.schedule(executionDate, 'document-closes', document)

    if (jobCreated) {
      log(`Scheduled closing event for document ${document.id} at ${executionDate}`)
    }

    res.status(OK).json({
      message: 'Closing event scheduled'
    })
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).json({
      message: 'An error ocurred trying to schedule the closing event.',
      reason: err.message
    })
  }
}
