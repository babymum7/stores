const path = require('path');
const fs = require('fs');

const https = require('https');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const MongoDBStore = require('connect-mongodb-session')(session);

require('./db');
require('../handlers/passport');

const flash = require('../middlewares/flash-message');
const helpers = require('../lib/helpers');
const choices = require('../data/choices');
const router = require('../routers/routers');
const { notFound, developmentErrors, productionErrors } = require('../handlers/errorHandlers');

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');
app.set('view cache', process.env.NODE_ENV === 'production');
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, '..', 'public')));
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
      uri: process.env.DATABASE,
      collection: 'sessions'
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

if (process.env.NODE_ENV === 'production') {
  app.listen(process.env.PORT, () => {
    console.log(`Sever is running on port ${process.env.PORT}`);
  });
} else {
  const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, '..', 'ssl', 'server.key'))
  };
  https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
    console.log(`Sever is running on port ${process.env.PORT}`);
  });
}
