require('dotenv').config({path:'./config.env'});
const sgMail = require('@sendgrid/mail');


const apiKey = process.env.SEND_API_KEY
sgMail.setApiKey(apiKey);

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
