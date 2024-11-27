const passport = require("passport");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const authModel = require("./Models/Model"); // Ensure your model is correctly set up
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

// Google OAuth credentials
const googleCredentials = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.REACT_APP_API_URL}/google/callback`,
  passReqToCallback: true, // Add this line
};

// Facebook OAuth credentials
const fbCredentials = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  allbackURL: `${process.env.REACT_APP_API_URL}/google/callback`, // Ensure the callback matches your API endpoint
  profileFields: ["id", "email", "displayName", "picture.type(large)"], // Fetch these fields from Facebook
};

// Google strategy callback
const googleCallback = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  console.log("Google Profile:", profile); // Debug profile
  try {
    const existingUser = await authModel.findOne({ googleId: profile.id });
    if (existingUser) {
      console.log("User exists:", existingUser);
      return done(null, existingUser);
    }

    const newUser = new authModel({
      userName: profile.displayName,
      email: profile.emails[0]?.value,
      googleId: profile.id,
      picUrl: profile.photos[0]?.value,
    });
    const savedUser = await newUser.save();
    console.log("New User Saved:", savedUser);
    return done(null, savedUser);
  } catch (err) {
    console.error("Google Auth Error:", err);
    return done(err);
  }
};

// Facebook strategy callback
const facebookCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await authModel.findOne({ fbId: profile.id });
    if (existingUser) {
      // User already exists
      return done(null, existingUser);
    }

    // Create a new user if not found
    const newUser = new authModel({
      userName: profile.displayName,
      fbId: profile.id,
      email: profile.emails[0]?.value,
      picUrl: profile.photos[0]?.value,
    });
    const savedUser = await newUser.save();
    return done(null, savedUser);
  } catch (err) {
    return done(err);
  }
};

// Local strategy callback
const localStrategyCallback = (email, password, done) => {
  authModel
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      bcrypt.compare(password, user.password).then((isValid) => {
        if (isValid) {
          return done(null, user);
        }
        return done(null, false, { message: "Incorrect password" });
      });
    })
    .catch((err) => done(err));
};

// Add Google OAuth strategy
passport.use(new GoogleStrategy(googleCredentials, googleCallback));

// Add Facebook OAuth strategy
passport.use(new FacebookStrategy(fbCredentials, facebookCallback));

// Add Local strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, localStrategyCallback)
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
  authModel
    .findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

module.exports = passport;
