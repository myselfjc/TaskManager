const sgMail = require('@sendgrid/mail');
const apiKey = ""
sgMail.setApiKey(apiKey);

const sendEmail = (to, subject, text, html) => {
    const message = {
      to: to,
      from: 'mongodb4038@gmail.com',
      subject: subject,
      text: text,
      html: html
    };
    
    return sgMail.send(message);
};

module.exports = sendEmail;
