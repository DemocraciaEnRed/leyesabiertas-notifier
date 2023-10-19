require('dotenv').config()
const nodemailer = require('nodemailer')
const limiter = require('./bottleneck')

module.exports.sendEmail = function sendEmail (config, mailOptions, done) {
  const transporter = nodemailer.createTransport(config)

  console.log('services/nodemailer.js: Sending mail to', mailOptions && mailOptions.to)

  const throttled = process.env.BOTTLENECK_ENABLE || false

  if (throttled === 'true' || throttled === true) {
    limiter.submit(transporter.sendMail.bind(transporter), mailOptions, (error, info) => {
      if (error) {
        console.log('services/nodemailer.js: (Bottleneck.js) Error sending mail')
        console.log(error)
        return done(error)
      }

      console.log('services/nodemailer.js: (Bottleneck.js) Mail sent')
      done()
    })
  } else {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('services/nodemailer.js: Error sending mail')
        console.log(error)
        return done(error)
      }

      console.log('services/nodemailer.js: Mail sent')
      done()
    })
  }
}
