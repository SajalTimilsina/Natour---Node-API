const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //   var transporter = nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_HOST_PASSWORD,
  //     },
  //   });

  // console.log(options);

  var transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '0ea42839b063c7',
      pass: '5a7baa1605cb88',
    },
  });

  //2) Define the email options

  const mailOptions = {
    from: 'Sajal Test <sajal@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html: '<b>options.message</b>',
  };

  //3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; // export as default
