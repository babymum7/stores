const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { catchErrors } = require('./errorHandlers');
const User = require('../models/User');

passport.use(User.createStrategy());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      callbackURL: `${process.env.HOST}/auth/google/callback`
    },
    catchErrors(async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ google: profile.id });
      if (user) {
        done(null, user);
      } else {
        user = new User();
        user.google = profile.id;
        user.subscribed = true;
        user.name = profile.displayName;
        user.email = profile._json.emails[0].value;
        user.avatar = profile._json.image.url;
        await user.save();
        done(null, user);
      }
    })
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
    catchErrors(async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ facebook: profile.id });
      if (user) {
        done(null, user);
      } else {
        user = new User();
        user.facebook = profile.id;
        user.name = profile.displayName;
        user.subscribed = true;
        user.email = profile._json.email;
        user.avatar = profile._json.picture.data.url;
        await user.save();
        done(null, user);
      }
    })
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});
// passport.serializeUser(User.serializeUser());

passport.deserializeUser(
  catchErrors(async (user, done) => {
    const userDeserialized = await User.findById(user._id)
      .populate('hearts')
      .select('name avatar hearts');
    done(null, userDeserialized);
  })
);
// passport.deserializeUser(User.deserializeUser());
