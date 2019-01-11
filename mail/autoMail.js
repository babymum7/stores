const transport = require('./transport');
const User = require('../models/User');

User.find({ subscribed: true }).then(users => {
  const emails = users.map(user => user.email);
  console.log(emails);
  const options = {
    from: 'Trong Nguyen <testemail.stores@gmail.com>',
    to: emails,
    subject: 'Daily news',
    html: '<h1>Our latest news</h1>',
    text: 'Our latest news'
  };
  setInterval(() => {
    transport.sendMail(options).catch(err => console.log(err.message));
  }, 1000 * 60 * 60 * 24);
});
