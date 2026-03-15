const mongoose = require('mongoose');
const User = require('../models/User');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const Transaction = require('../models/Transaction');
const exchangeRateService = require('../services/exchangeRateService');

exports.getAdminStats = async (req, res) => {
    try {
        const totalMentors = await User.countDocuments({ role: 'mentor' });
        const totalParticipants = await User.countDocuments({ role: 'participant' });
        const totalForms = await Form.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        const approvedSubmissions = await Submission.countDocuments({ status: 'approved' });

        // Financial Stats
        const allTx = await Transaction.find({ status: 'completed' });
        const summary = allTx.reduce((acc, tx) => {
            acc.totalRevenue += tx.baseAmount || tx.amount; // Use baseAmount (MZN) if available
            if (tx.type === 'subscription') {
                acc.subscriptionRevenue += tx.baseAmount || tx.amount;
            } else {
                acc.eventFeeRevenue += tx.basePlatformFee || tx.platformFee;
            }
            return acc;
        }, { totalRevenue: 0, subscriptionRevenue: 0, eventFeeRevenue: 0 });

        // For "growth", we can calculate based on last 30 days vs previous 30 days
        // but for now let's just return real counts

        // Auth distribution stats
        const googleUsers = await User.countDocuments({ googleId: { $ne: null } });
        const linkedinUsers = await User.countDocuments({ linkedinId: { $ne: null } });
        const totalUsers = await User.countDocuments();
        const nativeUsers = totalUsers - googleUsers - linkedinUsers;

        res.json({
            mentors: totalMentors,
            participants: totalParticipants,
            totalUsers: totalUsers,
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions,
            revenue: summary.totalRevenue,
            subscriptionRevenue: summary.subscriptionRevenue,
            eventFeeRevenue: summary.eventFeeRevenue,
            authStats: {
                google: googleUsers,
                linkedin: linkedinUsers,
                native: Math.max(0, nativeUsers)
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

exports.getRecentForms = async (req, res) => {
    try {
        const forms = await Form.find()
            .populate('creator', 'name email businessName')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(forms);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recent forms' });
    }
};

exports.getMentorStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get my forms to extract IDs and potential prices
        const myForms = await Form.find({ creator: userId });
        const formIds = myForms.map(f => f._id);
        const formsMap = {};
        myForms.forEach(f => {
            formsMap[f._id.toString()] = f;
        });

        // 2. Stats
        const totalForms = myForms.length;
        const totalSubmissions = await Submission.countDocuments({ form: { $in: formIds } });
        const approvedSubmissions = await Submission.countDocuments({
            form: { $in: formIds },
            status: 'approved'
        });

        // 3. Revenue
        const approvedSubs = await Submission.find({
            form: { $in: formIds },
            status: 'approved'
        });

        let revenue = 0;
        const rates = await exchangeRateService.getCurrentRates();

        approvedSubs.forEach(sub => {
            const form = formsMap[sub.form.toString()];
            if (form && form.paymentConfig && form.paymentConfig.enabled) {
                const price = form.paymentConfig.price || 0;
                const currency = form.paymentConfig.currency || 'USD';

                if (currency === 'MZN' || currency === 'MT') {
                    revenue += price;
                } else {
                    // Convert to MZN for consistent dashboard reporting
                    const rate = rates.MZN / (rates[currency] || 1);
                    revenue += price * rate;
                }
            }
        });

        const pendingCertificates = await Submission.countDocuments({
            form: { $in: formIds },
            certificateStatus: 'requested'
        });

        res.json({
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions,
            pendingCertificates: pendingCertificates,
            revenue: revenue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching mentor stats' });
    }
};

const Visit = require('../models/Visit');

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const myForms = await Form.find({ creator: userId }).lean();
        if (!myForms.length) {
            return res.json({ dailyStats: [], geoStats: [] });
        }

        const formIds = myForms.map(f => f._id);
        const slugs = myForms.map(f => f.slug);
        const formPages = slugs.map(s => `/f/${s}`);

        const formsMap = {};
        myForms.forEach(f => { formsMap[f._id.toString()] = f; });

        // Get window for analytics (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch data using AGGREGATION for speed and memory efficiency
        const [submissionStats, visitStats, geoRawData] = await Promise.all([
            // 1. Daily Submissions & Status (for revenue calculation)
            Submission.aggregate([
                { $match: { form: { $in: formIds }, submittedAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
                            formId: "$form",
                            status: "$status"
                        },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // 2. Daily Visits
            Visit.aggregate([
                { $match: { page: { $in: formPages }, timestamp: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // 3. Geo data - We still need to process this in JS because data is in a Map, 
            // but we only fetch what's needed (just the 'data' field)
            Submission.find(
                { form: { $in: formIds }, submittedAt: { $gte: thirtyDaysAgo } },
                { data: 1 }
            ).lean()
        ]);

        // Process results into final format
        const dailyMap = {};
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyMap[dateStr] = { date: dateStr, count: 0, visits: 0, revenue: 0 };
        }

        // Merge Submission Stats
        submissionStats.forEach(stat => {
            const { date, formId, status } = stat._id;
            if (dailyMap[date]) {
                dailyMap[date].count += stat.count;
                // Revenue calculation
                if (status === 'approved') {
                    const form = formsMap[formId.toString()];
                    if (form && form.paymentConfig?.enabled) {
                        dailyMap[date].revenue += (form.paymentConfig.price || 0) * stat.count;
                    }
                }
            }
        });

        // Merge Visit Stats
        visitStats.forEach(stat => {
            const date = stat._id;
            if (dailyMap[date]) {
                dailyMap[date].visits = stat.count;
            }
        });

        const dailyStats = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

        // 2. Geo Stats (Province Heatmap)
        const MOZ_PROVINCES = [
            'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'
        ];
        const geoMap = {};
        MOZ_PROVINCES.forEach(p => geoMap[p] = 0);

        geoRawData.forEach(sub => {
            if (sub.data) {
                const searchValues = sub.data instanceof Map ? Array.from(sub.data.values()) : Object.values(sub.data);
                const values = searchValues.map(v => String(v).toLowerCase());

                for (const p of MOZ_PROVINCES) {
                    const pLower = p.toLowerCase();
                    if (values.some(v => v.includes(pLower))) {
                        geoMap[p] += 1;
                        break;
                    }
                }
            }
        });

        const geoStats = Object.keys(geoMap)
            .map(key => ({ name: key, value: geoMap[key] }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

        res.json({ dailyStats, geoStats });
    } catch (err) {
        console.error("Mentor Analytics Error:", err);
        res.status(500).json({ message: 'Error fetching analytics', error: err.message });
    }
};

exports.getTopMentors = async (req, res) => {
    try {
        // 1. Get all mentors
        // We could filter by role='mentor', but creators might be admins effectively acting as mentors too. 
        // Let's rely on who has created forms.

        // Aggregate Submissions by Form Creator
        const submissionStats = await Submission.aggregate([
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

        // Aggregate Visits by Form Creator
        // Visits key off 'page' string. We need to match pages to forms.
        // Doing this purely in minimal aggregation is hard because of the string join.
        // Strategy: 
        // 1. Get all forms (id, slug, creator)
        // 2. Get all visits for pages starting with /f/
        // 3. Map in memory (not ideal for huge datasets but fine for small/medium)

        const allForms = await Form.find({}, 'slug creator title');
        const formSlugMap = {}; // slug -> creatorId
        const formCreatorMap = {}; // formId -> creatorId
        const creatorNames = {}; // creatorId -> details

        // Prefetch creator details to avoid N+1
        const creators = await User.find({ _id: { $in: allForms.map(f => f.creator) } }, 'name email profilePhoto');
        creators.forEach(c => {
            creatorNames[c._id.toString()] = c;
        });

        allForms.forEach(f => {
            formSlugMap[`/f/${f.slug}`] = f.creator.toString();
            formCreatorMap[f._id.toString()] = f.creator.toString();
        });

        const visitStats = await Visit.aggregate([
            { $match: { page: { $regex: /^\/f\// } } },
            {
                $group: {
                    _id: "$page",
                    count: { $sum: 1 }
                }
            }
        ]);

        const mentorStats = {};

        // Process Submissions
        submissionStats.forEach(stat => {
            const creatorId = stat._id.toString();
            if (!mentorStats[creatorId]) {
                mentorStats[creatorId] = { id: creatorId, submissions: 0, visits: 0, user: creatorNames[creatorId] || { name: 'Unknown' } };
            }
            mentorStats[creatorId].submissions += stat.totalSubmissions;
        });

        // Process Visits
        visitStats.forEach(stat => {
            const page = stat._id;
            const creatorId = formSlugMap[page];
            if (creatorId) {
                if (!mentorStats[creatorId]) {
                    mentorStats[creatorId] = { id: creatorId, submissions: 0, visits: 0, user: creatorNames[creatorId] || { name: 'Unknown' } };
                }
                mentorStats[creatorId].visits += stat.count;
            }
        });

        // Convert to array and sort
        const topMentors = Object.values(mentorStats)
            .sort((a, b) => {
                // Weighted score: 1 submission = 5 visits? Or just by submissions?
                // The user asked "based on results of inscriptions and visits".
                // Let's sort by submissions first, then visits.
                if (b.submissions !== a.submissions) return b.submissions - a.submissions;
                return b.visits - a.visits;
            })
            .slice(0, 10); // Top 10

        res.json(topMentors);

    } catch (err) {
        console.error('Error fetching top mentors:', err);
        res.status(500).json({ message: 'Error fetching top mentors' });
    }
};
