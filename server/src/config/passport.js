const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');
const Submission = require('../models/Submission');
const axios = require('axios');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/emailService');
const { generateWelcomeEmail } = require('../utils/emailTemplates');

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
            ? 'https://inscreva-se.com/api/auth/google/callback'
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

                // Extract role from state
                let role = 'mentor';
                if (req.query.state) {
                    try {
                        const state = JSON.parse(req.query.state);
                        if (state.role) role = state.role;
                    } catch (e) {
                        console.error("[Passport Google] Error parsing state:", e);
                    }
                }

                if (user) {
                    user.googleId = profile.id;
                    user.isEmailVerified = true;
                    if (!user.profilePhoto) user.profilePhoto = profile.photos[0].value;
                    // Update role if user already exists? Usually not, but for first-time social linking it might be okay.
                    // For now, let's keep the existing role if they have one.
                    await user.save();
                    return done(null, user);
                }

                user = new User({
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    profilePhoto: profile.photos[0].value,
                    role: role,
                    password: '',
                    isEmailVerified: true,
                    country: await detectCountry(req, profile)
                });

                await user.save();

                // Create Welcome Notification in Dashboard
                const welcomeNotification = new Notification({
                    recipient: user._id,
                    sender: user._id, // System notification
                    title: 'Bem-vindo à Elite! 💎',
                    content: `Olá ${profile.displayName}! Sua conta foi criada com sucesso. Enviamos um e-mail especial de boas-vindas com o seu acesso e um guia rápido. Não esqueça de conferir sua caixa de entrada!`,
                    type: 'welcome',
                    actionUrl: '/dashboard/mentor'
                });
                await welcomeNotification.save();

                // Send Welcome Email for Social Login (No verification needed)
                try {
                    const welcomeHtml = generateWelcomeEmail(profile.displayName);
                    await sendEmail(email, 'Bem-vindo ao Inscreva-se! 💎', welcomeHtml);
                } catch (emailErr) {
                    console.error("Error sending social welcome email:", emailErr);
                }

                // Link existing submissions for this email
                const emailRegex = new RegExp(`^${email}$`, 'i');
                await Submission.updateMany(
                    {
                        $or: [
                            { "data.email": emailRegex },
                            { "data.Email": emailRegex },
                            { "data.e-mail": emailRegex },
                            { "data.E-mail": emailRegex },
                            { "data.seu-email": emailRegex },
                            { "data.seu e-mail": emailRegex },
                            { "data.Seu E-mail": emailRegex }
                        ],
                        user: { $exists: false }
                    },
                    { $set: { user: user._id } }
                );

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
            ? 'https://inscreva-se.com/api/auth/linkedin/callback'
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

                // Extract role from state
                let role = 'mentor';
                if (req.query.state) {
                    try {
                        const state = JSON.parse(req.query.state);
                        if (state.role) role = state.role;
                    } catch (e) {
                        console.error("[Passport LinkedIn] Error parsing state:", e);
                    }
                }

                if (user) {
                    user.linkedinId = linkedinId;
                    user.isEmailVerified = true;
                    if (!user.profilePhoto) user.profilePhoto = photo;
                    await user.save();
                    return done(null, user);
                }

                user = new User({
                    name: name,
                    email: email,
                    linkedinId: linkedinId,
                    profilePhoto: photo,
                    role: role,
                    password: '',
                    isEmailVerified: true,
                    country: await detectCountry(req, data)
                });

                await user.save();

                // Create Welcome Notification in Dashboard
                const welcomeNotification = new Notification({
                    recipient: user._id,
                    sender: user._id, // System notification
                    title: 'Bem-vindo à Elite! 💎',
                    content: `Olá ${name}! Sua conta foi criada com sucesso. Enviamos um e-mail especial de boas-vindas com o seu acesso e um guia rápido. Não esqueça de conferir sua caixa de entrada!`,
                    type: 'welcome',
                    actionUrl: '/dashboard/mentor'
                });
                await welcomeNotification.save();

                // Send Welcome Email for Social Login (No verification needed)
                try {
                    const welcomeHtml = generateWelcomeEmail(name);
                    await sendEmail(email, 'Bem-vindo ao Inscreva-se! 💎', welcomeHtml);
                } catch (emailErr) {
                    console.error("Error sending social welcome email (LinkedIn):", emailErr);
                }

                // Link existing submissions for this email
                const emailRegex = new RegExp(`^${email}$`, 'i');
                await Submission.updateMany(
                    {
                        $or: [
                            { "data.email": emailRegex },
                            { "data.Email": emailRegex },
                            { "data.e-mail": emailRegex },
                            { "data.E-mail": emailRegex },
                            { "data.seu-email": emailRegex },
                            { "data.seu e-mail": emailRegex },
                            { "data.Seu E-mail": emailRegex }
                        ],
                        user: { $exists: false }
                    },
                    { $set: { user: user._id } }
                );

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
