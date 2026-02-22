const SmartLink = require('../models/SmartLink');
const User = require('../models/User');
const crypto = require('crypto');

// Helper to generate random slug if none provided
const generateSlug = () => {
    return crypto.randomBytes(4).toString('hex');
};

exports.createSmartLink = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        const linkCount = await SmartLink.countDocuments({ userId: req.user.id });

        // Plan Limits Logic
        const limits = {
            free: 1,
            pro: 10,
            enterprise: Infinity
        };

        const userPlan = user.plan || 'free';
        const limit = limits[userPlan] || 1;

        if (linkCount >= limit) {
            return res.status(403).json({
                message: `Limite do plano atingido. O seu plano (${userPlan.toUpperCase()}) permite apenas ${limit} SmartLink(s).`,
                code: 'LIMIT_REACHED',
                currentLimit: limit
            });
        }

        const { title, type, originalUrl, links, bioSettings, slug, category, facebookPixelId, googleAnalyticsId, expiresAt, brandingColor } = req.body;

        // Ensure originalUrl has protocol if provided
        let finalUrl = originalUrl;
        if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }

        const finalSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9_-]/g, '') : generateSlug();

        // Check if slug taken
        const existing = await SmartLink.findOne({ slug: finalSlug });
        if (existing) {
            return res.status(400).json({ message: 'Este link personalizado já está em uso.' });
        }

        const smartLink = new SmartLink({
            userId: req.user.id,
            title,
            type: type || 'direct',
            originalUrl: finalUrl,
            links: links || [],
            bioSettings: bioSettings || {},
            slug: finalSlug,
            category,
            facebookPixelId,
            googleAnalyticsId,
            expiresAt,
            brandingColor
        });

        await smartLink.save();
        res.status(201).json({ success: true, smartLink });
    } catch (error) {
        console.error('Create SmartLink Error:', error);
        res.status(500).json({ message: 'Erro ao criar smartlink' });
    }
};

exports.getMyLinks = async (req, res) => {
    try {
        const links = await SmartLink.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar seus links' });
    }
};

exports.updateSmartLink = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const link = await SmartLink.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            updates,
            { new: true }
        );

        if (!link) return res.status(404).json({ message: 'Link não encontrado' });
        res.json({ success: true, link });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar link' });
    }
};

exports.deleteSmartLink = async (req, res) => {
    try {
        const { id } = req.params;
        const link = await SmartLink.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!link) return res.status(404).json({ message: 'Link não encontrado' });
        res.json({ success: true, message: 'Link excluído' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir link' });
    }
};

exports.getLinkBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const link = await SmartLink.findOne({ slug }).select('-analytics -userId');
        if (!link) return res.status(404).json({ message: 'Link não encontrado' });
        res.json(link);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar link' });
    }
};

// --- REDIRECTION LOGIC ---
exports.handleRedirect = async (req, res) => {
    try {
        const { slug } = req.params;
        const link = await SmartLink.findOne({ slug });

        if (!link) {
            return res.status(404).send('Link não encontrado');
        }

        if (link.status !== 'active') {
            return res.status(403).send('Este link está pausado ou expirado');
        }

        // Async capturing of analytics (don't block the redirect)
        const ua = req.headers['user-agent'] || '';
        const isMobile = /mobile/i.test(ua);
        const device = isMobile ? 'mobile' : 'desktop';

        const analyticsData = {
            ip: req.ip,
            userAgent: ua,
            referer: req.headers['referer'] || 'Direto',
            device,
            timestamp: new Date()
        };

        // Update total clicks and push to analytics array
        await SmartLink.updateOne(
            { _id: link._id },
            {
                $inc: { totalClicks: 1 },
                $push: {
                    analytics: {
                        $each: [analyticsData],
                        $slice: -100
                    }
                }
            }
        );

        // --- BIO PAGE MODE ---
        if (link.type === 'bio') {
            const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/l/${slug}/bio`);
        }

        // If it has Pixel/tracking, we could show an interstitial page
        // But for speed, a direct redirect is better.
        // If Pixel is needed, we'd return an HTML with the tracking script and a meta refresh.

        if (link.facebookPixelId || link.googleAnalyticsId) {
            return res.send(`
                <html>
                    <head>
                        <title>Redirecionando...</title>
                        ${link.facebookPixelId ? `
                        <script>
                            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                            document,'script','https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${link.facebookPixelId}');
                            fbq('track', 'PageView');
                        </script>` : ''}
                        <meta http-equiv="refresh" content="0;url=${link.originalUrl}">
                    </head>
                    <body style="background: #000; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                        <div style="text-align: center;">
                            <div style="width: 40px; height: 40px; border: 4px solid #FFD700; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                            <p style="font-weight: bold; letter-spacing: 1px;">INSCREVA-SE SMARTLINK</p>
                            <p style="font-size: 0.8rem; opacity: 0.6;">Redirecionando você em instantes...</p>
                        </div>
                        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                        <script>setTimeout(() => { window.location.href = "${link.originalUrl}"; }, 500);</script>
                    </body>
                </html>
            `);
        }

        return res.redirect(link.originalUrl);
    } catch (error) {
        console.error('Redirect Error:', error);
        res.status(500).send('Erro interno');
    }
};
