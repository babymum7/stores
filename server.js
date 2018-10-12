const path = require('path');
const https = require('https');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, 'variables.env') });
}

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
require('./models/User');
require('./models/Store');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
require('./handlers/passport');
const flash = require('./middlewares/flash-messages');

const helpers = require('./helpers');
const choices = require('./data/choices');
const {
  notFound,
  developmentErrors,
  productionErrors
} = require('./handlers/errorHandlers');
const router = require('./routers');

const app = express();

app.set('port', process.env.PORT);
app.set('secret', process.env.SECRET);
app.set('mongodburi', process.env.DATABASE);

mongoose.Promise = global.Promise;
mongoose
  .connect(
    app.get('mongodburi'),
    { useNewUrlParser: true }
  )
  .catch(err => {
    console.error(`🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
  });

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Auto send email for users subscribed
// require('./handlers/automail');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('view cache', process.env.NODE_ENV === 'production');
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: app.get('secret'),
    name: 'st',
    cookie: { maxAge: 1000 * 60 },
    resave: true,
    saveUninitialized: false,
    store: new MongoDBStore({
      uri: mongoose.connection.client.s.url,
      collection: 'Sessions'
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
  res.locals.flashes = req.flash();
  res.locals.choices = choices;
  next();
});

app.use('/', router);

app.use(notFound);

if (app.get('env') === 'production') {
  app.use(productionErrors);
}

if (app.get('env') === 'development') {
  app.use(developmentErrors);
}

if (process.env.NODE_ENV !== 'production') {
  const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
  };
  https.createServer(httpsOptions, app).listen(app.get('port'), () => {
    console.log(`Sever is running on port ${app.get('port')}`);
  });
} else {
  app.listen(app.get('port'), () => {
    console.log(`Sever is running on port ${app.get('port')}`);
  });
}
