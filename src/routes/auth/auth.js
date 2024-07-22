const express = require("express");
const passport = require("passport");
const router = express.Router();

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if user already exists in our db
      const existingUser = await db.execute(
        "SELECT * FROM users WHERE id = ?",
        [profile.id]
      );
      if (existingUser.rows.length > 0) {
        // User already exists
        return done(null, existingUser.rows[0]);
      }

      // If not, create a new user
      await db.execute("INSERT INTO users (id, username) VALUES (?, ?)", [
        profile.id,
        profile.username,
      ]);
      done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const result = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
  done(null, result.rows[0]);
});

// Initiates the Google OAuth 2.0 authentication flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback URL for handling the OAuth 2.0 response
router.get("/google/callback", passport.authenticate("google"), (req, res) => {
  // Successful authentication, redirect or handle the user as desired
  // res.redirect("/");
});

module.exports = router;
