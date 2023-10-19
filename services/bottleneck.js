require('dotenv').config()
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
  maxConcurrent: parseInt(process.env.BOTTLENECK_MAX_CONCURRENT) || 1000,
  minTime: parseInt(process.env.BOTTLENECK_MIN_TIME) || 1000,
  id: 'bottleneck-notifier'
})

limiter.on('error', (error) => {
  console.log('services/bottleneck.js: Error in limiter')
  console.log(error)
})

limiter.on('executing', () => {
  console.log('services/bottleneck.js: Executing job')
})

module.exports = limiter
