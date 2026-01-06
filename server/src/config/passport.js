const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Did we find a user with this googleId?
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }

            // Check if user exists with this email
            const email = profile.emails[0].value;
            user = await User.findOne({ email });

            if (user) {
                // Link googleId to existing user
                user.googleId = profile.id;
                if (!user.profilePhoto) {
                    user.profilePhoto = profile.photos[0].value;
                }
                await user.save();
                return done(null, user);
            }

            // Create new user
            user = new User({
                name: profile.displayName,
                email: email,
                googleId: profile.id,
                profilePhoto: profile.photos[0].value,
                role: 'mentor', // Default role for Google Signups
                password: '' // No password
            });

            await user.save();
            done(null, user);

        } catch (err) {
            console.error("Google Auth Error:", err);
            done(err, null);
        }
    }));

module.exports = passport;
