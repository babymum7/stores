const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, 'development.env') });
}

const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('./middlewares/flash-message');
const helpers = require('./lib/helpers');
const choices = require('./data/choices');
const { notFound, developmentErrors, productionErrors } = require('./handlers/errorHandlers');
const router = require('./routers/routers');

require('./models/User');
require('./models/Store');
require('./models/Heart');
require('./models/Rate');
require('./models/Review');
require('./models/Reset');

require('./handlers/passport');

const app = express();

mongoose
  .connect(
    process.env.DATABASE,
    { useNewUrlParser: true }
  )
  .catch(err => {
    console.error(`🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
  });
mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Auto send email for users subscribed
// require('./mail/autoMail');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view cache', process.env.NODE_ENV === 'production');
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    name: 'st',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 * 3, sameSite: true },
    resave: false,
    saveUninitialized: false,
    store: new MongoDBStore({
      uri: mongoose.connection.client.s.url,
      collection: 'sessions'
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());
// update maxAge session when user request to server
// so that session of user nerver gone until he or she logout
// or no request to server in 1 months
app.use((req, res, next) => {
  if (req.session.passport) {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
  }
  next();
});

app.use(flash);

app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.user = req.user || null;
  res.locals.path = req.path;
  res.locals.remember = req.session.remember;
  res.locals.flashes = req.flash();
  res.locals.choices = choices;
  next();
});

app.use('/', router);

app.use(notFound);

if (process.env.NODE_ENV === 'production') {
  app.use(productionErrors);
} else {
  app.use(developmentErrors);
}

if (process.env.NODE_ENV !== 'production') {
  const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
  };
  https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
    console.log(`Sever is running on port ${process.env.PORT}`);
  });
} else {
  app.listen(process.env.PORT, () => {
    console.log(`Sever is running on port ${process.env.PORT}`);
  });
}
