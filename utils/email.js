const sgMail = require('@sendgrid/mail');
require('dotenv').config({path:'./config.env'});

sgMail.setApiKey(process.env.SEND_API_KEY);

const sendEmail = (to, subject, text, html) => {
    const message = {
      to: to,
      from: process.env.EMAIL_FROM,
      subject: subject,
      text: text,
      html: html
    };
    
    return sgMail.send(message);
};

module.exports = sendEmail;