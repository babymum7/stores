const nodemailer = require('nodemailer');

// Using gmail with less scure app
// const transport = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'testemail.stores@gmail.com',
//     pass: 'PASSWORD'
//   }
// });

// Using email with Oauth2
const transportOptionsProductions = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.MAIL_USER,
    clientId: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENTSECRET,
    refreshToken: process.env.MAIL_REFRESHTOKEN
  }
};

// Using mailtrap
const transportOptionsDevelopment = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
};

const transport = nodemailer.createTransport(
  process.env.NODE_ENV === 'production' ? transportOptionsProductions : transportOptionsDevelopment
);

module.exports = transport;
