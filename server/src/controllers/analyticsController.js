const Visit = require('../models/Visit');
const geoip = require('geoip-lite');

// Registrar uma nova visita
exports.recordVisit = async (req, res) => {
    try {
        const { visitorId, page, referrer, browser, os, deviceType } = req.body;
        
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
            city
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

        // 6. Pico de Tráfego (Visitas por hora - nas últimas 24h ou Hoje)
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

        // 7. Visitas por Mês (Últimos 12 meses ou Ano Atual)
        // Vamos pegar o ano atual para facilitar a visualização "Jan - Dez"
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
            trafficByMonth: trafficByMonth.map(m => ({ month: m._id, count: m.count }))
        });
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ message: 'Error getting analytics' });
    }
};
