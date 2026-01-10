const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');
const axios = require('axios');

// Helper to detect country from profile or IP
const detectCountry = async (req, profileData) => {
    try {
        // 1. Try from profile locale (Google or LinkedIn)
        let countryCode = null;
        if (profileData?._json?.locale) {
            const parts = profileData._json.locale.split(/[-_]/);
            if (parts.length > 1) countryCode = parts[1].toUpperCase();
        } else if (profileData?.locale?.country) {
            countryCode = profileData.locale.country.toUpperCase();
        }

        const countryMap = {
            'MZ': 'Moçambique',
            'AO': 'Angola',
            'BR': 'Brasil',
            'PT': 'Portugal'
        };

        if (countryCode && countryMap[countryCode]) return countryMap[countryCode];

        // 2. Fallback to IP geolocation
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        if (ip && ip !== '::1' && ip !== '127.0.0.1') {
            const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
            if (data.status === 'success') {
                if (data.countryCode && countryMap[data.countryCode.toUpperCase()]) {
                    return countryMap[data.countryCode.toUpperCase()];
                }
                return data.country;
            }
        }
    } catch (err) {
        console.error("Detect Country Error:", err.message);
    }
    return 'Moçambique'; // Default
};

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
        proxy: true,
        passReqToCallback: true
    },
        async (req, accessToken, refreshToken, profile, done) => {
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
                    password: '',
                    country: await detectCountry(req, profile)
                });

                await user.save();
                done(null, user);
            } catch (err) {
                console.error("Google Auth Error:", err);
                done(err, null);
            }
        }));
}

// LinkedIn Strategy (Manual OIDC Flow)
if (linkedinClientId && linkedinClientSecret) {
    const OAuth2Strategy = require('passport-oauth2').Strategy;

    const strategy = new OAuth2Strategy({
        authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientID: linkedinClientId,
        clientSecret: linkedinClientSecret,
        callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://inscrevase.onrender.com/api/auth/linkedin/callback'
            : 'http://localhost:5000/api/auth/linkedin/callback',
        scope: ['openid', 'profile', 'email'],
        passReqToCallback: true
    },
        async (req, accessToken, refreshToken, params, profile, done) => {
            try {
                // Manual profile fetch using the accessToken
                const response = await fetch('https://api.linkedin.com/v2/userinfo', {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const data = await response.json();

                if (!data || !data.sub) {
                    console.error("LinkedIn OIDC data error:", data);
                    return done(new Error("Falha ao obter dados do usuário do LinkedIn"), null);
                }

                const linkedinId = data.sub;
                const email = data.email;
                const name = data.name || `${data.given_name} ${data.family_name}`;
                const photo = data.picture || '';

                if (!email) {
                    return done(new Error("E-mail não retornado pelo LinkedIn"), null);
                }

                let user = await User.findOne({ linkedinId: linkedinId });
                if (user) return done(null, user);

                user = await User.findOne({ email });

                if (user) {
                    user.linkedinId = linkedinId;
                    if (!user.profilePhoto) user.profilePhoto = photo;
                    await user.save();
                    return done(null, user);
                }

                user = new User({
                    name: name,
                    email: email,
                    linkedinId: linkedinId,
                    profilePhoto: photo,
                    role: 'mentor',
                    password: '',
                    country: await detectCountry(req, data)
                });

                await user.save();
                done(null, user);
            } catch (err) {
                console.error("LinkedIn OAuth Error:", err);
                done(err, null);
            }
        });

    passport.use('linkedin', strategy);
}

if (!googleClientId && !linkedinClientId) {
    console.warn("⚠️ Both Google and LinkedIn OAuth credentials missing.");
}

module.exports = passport;
