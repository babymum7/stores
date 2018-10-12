const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

passport.use(User.createStrategy());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      callbackURL: `${process.env.HOST}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ 'google.id': profile.id });
        if (user) {
          /* eslint-disable */
          user.google.photo = profile._json.image.url;
          /* eslint-enable */
          await user.save();
          done(null, user);
        } else {
          const newUser = new User();
          newUser.google.id = profile.id;
          newUser.subscribed = true;
          newUser.name = profile.displayName;
          /* eslint-disable */
          newUser.google.url = profile._json.url;
          newUser.google.email = profile._json.emails[0].value;
          newUser.avatar = profile._json.image.url;
          /* eslint-enable */
          await newUser.save();
          done(null, newUser);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENTID,
      clientSecret: process.env.FACEBOOK_CLIENTSECRET,
      callbackURL: `${process.env.HOST}/auth/facebook/callback`,
      authType: 'rerequest',
      enableProof: true,
      profileFields: ['id', 'displayName', 'picture', 'link', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ 'facebook.id': profile.id });
        if (user) {
          /* eslint-disable */
          user.facebook.url = profile._json.link;
          user.avatar = profile._json.picture.data.url;
          /* eslint-enable */
          await user.save();
          done(null, user);
        } else {
          const newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.name = profile.displayName;
          newUser.subscribed = true;
          /* eslint-disable */
          newUser.facebook.email = profile._json.email;
          newUser.avatar = profile._json.picture.data.url;
          newUser.facebook.url = profile._json.link;
          /* eslint-enable */
          await newUser.save();
          done(null, newUser);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  try {
    const returnedUser = await User.findById(user._id);
    done(null, returnedUser);
  } catch (err) {
    done(err);
  }
});

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
