const Visit = require('../models/Visit');
const geoip = require('geoip-lite');

// Registrar uma nova visita
exports.recordVisit = async (req, res) => {
    try {
        const { visitorId, page, referrer, browser, os, deviceType, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = req.body;

        // Tenta pegar o IP (considerando proxies/render)
        // x-forwarded-for pode ser uma lista "clientAp, proxy1, proxy2..."
        const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const ip = ipRaw.split(',')[0].trim();

        // Geolocalização
        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : null;
        const city = geo ? geo.city : null;

        // Otimização: Se o mesmo visitorId visitou a mesma página nos últimos 5 minutos, não conta de novo (evita F5 spam)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentVisit = await Visit.findOne({
            visitorId,
            page,
            timestamp: { $gte: fiveMinutesAgo }
        });

        if (recentVisit) {
            return res.status(200).json({ message: 'Visit already recorded recently' });
        }

        const newVisit = new Visit({
            visitorId,
            ip, // (Opcional: Armazenar ou limpar depois)
            page,
            referrer,
            browser,
            os,
            deviceType,
            country, // Salva o país (BR, MZ, PT...)
            city,
            // UTM Tracking
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent,
            utmTerm
        });

        await newVisit.save();
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error recording visit:', error);
        res.status(500).json({ message: 'Error recording visit' });
    }
};

// Obter estatísticas para o Dashboard
exports.getAnalyticsStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Visitas Hoje
        const visitsToday = await Visit.countDocuments({
            timestamp: { $gte: today }
        });

        // 2. Visitantes Únicos Hoje
        const uniqueVisitorsToday = (await Visit.distinct('visitorId', {
            timestamp: { $gte: today }
        })).length;

        // 3. Total Geral
        const totalVisits = await Visit.estimatedDocumentCount();

        // 4. Páginas mais acessadas
        const topPages = await Visit.aggregate([
            { $group: { _id: "$page", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 5. Países com mais acessos (Top 5)
        const topCountries = await Visit.aggregate([
            { $match: { country: { $ne: null } } }, // Ignora nulos
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 6. Pico de Tráfego (Visitas por hora - Últimos 30 dias para padrão)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trafficByHour = await Visit.aggregate([
            { $match: { timestamp: { $gte: today } } },
            {
                $project: {
                    hour: { $hour: "$timestamp" }
                }
            },
            { $group: { _id: "$hour", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const peakHours = await Visit.aggregate([
            { $match: { timestamp: { $gte: thirtyDaysAgo } } },
            {
                $project: {
                    hour: { $hour: "$timestamp" }
                }
            },
            { $group: { _id: "$hour", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // 7. Visitas por Dia da Semana (Últimos 30 dias)
        const peakDays = await Visit.aggregate([
            { $match: { timestamp: { $gte: thirtyDaysAgo } } },
            {
                $project: {
                    day: { $dayOfWeek: "$timestamp" } // 1 (Sunday) to 7 (Saturday)
                }
            },
            { $group: { _id: "$day", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // 8. Visitas por Mês (Últimos 12 meses ou Ano Atual)
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const trafficByMonth = await Visit.aggregate([
            { $match: { timestamp: { $gte: startOfYear } } },
            {
                $project: {
                    month: { $month: "$timestamp" } // Retorna 1 (Jan) a 12 (Dez)
                }
            },
            { $group: { _id: "$month", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json({
            visitsToday,
            uniqueVisitorsToday,
            totalVisits,
            topPages: topPages.map(p => ({ page: p._id, count: p.count })),
            topCountries: topCountries.map(c => ({ country: c._id, count: c.count })),
            trafficByHour: trafficByHour.map(t => ({ hour: t._id, count: t.count })),
            peakHours: peakHours.map(t => ({ hour: t._id, count: t.count })),
            peakDays: peakDays.map(t => ({ day: t._id, count: t.count })),
            trafficByMonth: trafficByMonth.map(m => ({ month: m._id, count: m.count }))
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ message: 'Error getting analytics' });
    }
};

// Estatísticas Públicas de Impacto (Home Page)
exports.getPublicImpactStats = async (req, res) => {
    try {
        // 1. Top Mentors (Baseado em inscrições + visitas)
        const submissionStats = await require('../models/Submission').aggregate([
            {
                $lookup: {
                    from: 'forms',
                    localField: 'form',
                    foreignField: '_id',
                    as: 'formDetails'
                }
            },
            { $unwind: '$formDetails' },
            {
                $group: {
                    _id: '$formDetails.creator',
                    totalSubmissions: { $sum: 1 }
                }
            }
        ]);

        const visitStats = await require('../models/Form').aggregate([
            {
                $group: {
                    _id: '$creator',
                    totalVisits: { $sum: '$visits' }
                }
            }
        ]);

        // Merge stats
        const mentorStats = {};
        submissionStats.forEach(stat => {
            mentorStats[stat._id] = { submissions: stat.totalSubmissions, visits: 0 };
        });
        visitStats.forEach(stat => {
            if (!mentorStats[stat._id]) mentorStats[stat._id] = { submissions: 0, visits: 0 };
            mentorStats[stat._id].visits = stat.totalVisits;
        });

        // Get User Details for Top 10
        const topMentorIds = Object.keys(mentorStats);
        const User = require('../models/User');
        const mentorsDetails = await User.find(
            { _id: { $in: topMentorIds } },
            'name profilePhoto businessName' // Apenas dados públicos
        );

        const topMentors = mentorsDetails.map(user => {
            const stats = mentorStats[user._id.toString()] || { submissions: 0, visits: 0 };
            return {
                id: user._id,
                name: user.name,
                businessName: user.businessName,
                profilePhoto: user.profilePhoto,
                submissions: stats.submissions,
                visits: stats.visits,
                impactScore: stats.submissions * 5 + stats.visits // Score simples
            };
        }).sort((a, b) => b.impactScore - a.impactScore).slice(0, 5);

        // 2. Países Alcançados
        const topCountries = await Visit.aggregate([
            { $match: { country: { $ne: null } } },
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 3. Totais Globais
        const [totalSubmissions, totalVisits, totalMentors, totalEvents, topCountriesList] = await Promise.all([
            require('../models/Submission').estimatedDocumentCount(),
            Visit.estimatedDocumentCount(),
            User.countDocuments({ role: { $in: ['admin', 'SuperAdmin', 'mentor', 'specialist', 'company'] } }),
            require('../models/Form').countDocuments(),
            Visit.distinct('country', { country: { $ne: null } })
        ]);

        res.json({
            topMentors,
            topCountries: topCountries.map(c => ({ country: c._id, count: c.count })),
            globalStats: {
                totalSubmissions,
                totalVisits,
                totalMentors,
                totalEvents,
                totalCountries: topCountriesList.length,
                averageRating: 4.9 // Mantemos como valor de referência de qualidade enquanto não há escala de reviews
            }
        });

    } catch (error) {
        console.error('Error getting public impact stats:', error);
        res.status(500).json({ message: 'Error getting public stats' });
    }
};
