const { transport } = require('./mailToResetPassword');
const User = require('../models/User');

User.find({ subscribe: true }).then(users => {
  const emails = users.map(e => e.mail || e.google.email || e.facebook.email);
  const options = {
    form: 'Trong Nguyen <testemail.stores@gmail.com>',
    bcc: emails,
    subject: 'Daily news',
    html: '<h1>Our latest news</h1>',
    text: 'Our latest news'
  };
  setInterval(() => {
    transport.sendMail(options).catch(err => console.log(err.message));
  }, 1000 * 60 * 60 * 24);
});
