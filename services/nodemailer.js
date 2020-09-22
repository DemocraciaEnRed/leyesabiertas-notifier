const nodemailer = require('nodemailer');

module.exports.sendEmail = function sendEmail(config, mailOptions, done) {
  const transporter = nodemailer.createTransport(config);

  console.log('services/nodemailer.js: Sending mail to', mailOptions && mailOptions.to)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('services/nodemailer.js: Error sending mail')
      console.log(error)
      return done(error);
    }

    console.log('services/nodemailer.js: Mail sent')
    done();
  });
};
