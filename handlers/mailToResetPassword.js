const path = require('path');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const transport = require('./transport');

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(
    path.join(__dirname, '..', 'views', 'email', `${filename}.pug`),
    options
  );
  const inlined = juice(html);
  return inlined;
};

const send = async options => {
  const html = generateHTML(options.filename, { resetURL: options.resetURL });
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: 'Stores app <testemail.stores@gmail.com>',
    to: options.email,
    subject: options.subject,
    html,
    text
  };
  return transport.sendMail(mailOptions);
};

module.exports = send;
