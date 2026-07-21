import nodemailer from "nodemailer"
import config from "../config/config.js"

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        type:'OAuth2',
        user:config.GOOGLE_USER,
        clientId:config.CLIENT_ID,
        clientSecret:config.CLIENT_SEC,
        refreshToken:config.GOOGLE_REFRESH_TOKEN
    }
})

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${config.GOOGLE_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
