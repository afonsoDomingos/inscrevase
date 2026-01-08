const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET;

// Google Strategy
if (googleClientId && googleClientSecret) {
    passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://inscrevase.onrender.com/api/auth/google/callback'
            : 'http://localhost:5000/api/auth/google/callback',
        proxy: true
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (user) return done(null, user);

                const email = profile.emails[0].value;
                user = await User.findOne({ email });

                if (user) {
                    user.googleId = profile.id;
                    if (!user.profilePhoto) user.profilePhoto = profile.photos[0].value;
                    await user.save();
                    return done(null, user);
                }

                user = new User({
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    profilePhoto: profile.photos[0].value,
                    role: 'mentor',
                    password: ''
                });

                await user.save();
                done(null, user);
            } catch (err) {
                console.error("Google Auth Error:", err);
                done(err, null);
            }
        }));
}

// LinkedIn Strategy
if (linkedinClientId && linkedinClientSecret) {
    passport.use(new LinkedInStrategy({
        clientID: linkedinClientId,
        clientSecret: linkedinClientSecret,
        callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://inscrevase.onrender.com/api/auth/linkedin/callback'
            : 'http://localhost:5000/api/auth/linkedin/callback',
        scope: ['openid', 'profile', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // profile object from LinkedIn looks slightly different
                let user = await User.findOne({ linkedinId: profile.id });
                if (user) return done(null, user);

                const email = profile.emails[0].value;
                user = await User.findOne({ email });

                if (user) {
                    user.linkedinId = profile.id;
                    if (!user.profilePhoto && profile.photos && profile.photos.length > 0) {
                        user.profilePhoto = profile.photos[0].value;
                    }
                    await user.save();
                    return done(null, user);
                }

                user = new User({
                    name: profile.displayName,
                    email: email,
                    linkedinId: profile.id,
                    profilePhoto: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
                    role: 'mentor',
                    password: ''
                });

                await user.save();
                done(null, user);
            } catch (err) {
                console.error("LinkedIn Auth Error:", err);
                done(err, null);
            }
        }));
}

if (!googleClientId && !linkedinClientId) {
    console.warn("⚠️ Both Google and LinkedIn OAuth credentials missing.");
}

module.exports = passport;
