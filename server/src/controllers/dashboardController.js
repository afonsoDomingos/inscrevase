const mongoose = require('mongoose');
const User = require('../models/User');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const SmartLink = require('../models/SmartLink');
const Referral = require('../models/Referral');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const exchangeRateService = require('../services/exchangeRateService');

exports.getAdminStats = async (req, res) => {
    try {
        const [
            totalMentors,
            totalParticipants,
            totalForms,
            totalSubmissions,
            approvedSubmissions,
            googleUsers,
            linkedinUsers,
            totalUsers,
            newsletterSubscribers
        ] = await Promise.all([
            User.countDocuments({ role: 'mentor' }),
            User.countDocuments({ role: 'participant' }),
            Form.countDocuments(),
            Submission.countDocuments(),
            Submission.countDocuments({ status: 'approved' }),
            User.countDocuments({ googleId: { $ne: null } }),
            User.countDocuments({ linkedinId: { $ne: null } }),
            User.countDocuments(),
            NewsletterSubscriber.countDocuments({ status: 'active' })
        ]);

        // Time-based metrics
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            submissionsToday,
            submissionsThisWeek,
            submissionsThisMonth,
            usersToday,
            formsToday,
            booksToday,
            referralsToday,
            smartLinksToday
        ] = await Promise.all([
            Submission.countDocuments({ submittedAt: { $gte: startOfToday } }),
            Submission.countDocuments({ submittedAt: { $gte: startOfWeek } }),
            Submission.countDocuments({ submittedAt: { $gte: startOfMonth } }),
            User.countDocuments({ createdAt: { $gte: startOfToday } }),
            Form.countDocuments({ createdAt: { $gte: startOfToday } }),
            Book.countDocuments({ createdAt: { $gte: startOfToday } }),
            Referral.countDocuments({ createdAt: { $gte: startOfToday } }),
            SmartLink.countDocuments({ createdAt: { $gte: startOfToday } })
        ]);

        // Financial Stats - Using Aggregation for better performance and consistency
        // Note: For 'manual' payments, we count 'pending' as approved by mentor but pending platform settlement
        const financeSummary = await Transaction.aggregate([
            {
                $match: {
                    $or: [
                        { status: 'completed' },
                        { paymentMethod: 'manual', status: 'pending' }
                    ]
                }
            },
            {
                // Unique grouping to avoid double counting (e.g. from webhook + direct redirect)
                $group: {
                    _id: { $ifNull: ["$stripePaymentIntentId", "$paypalCaptureId", "$_id"] },
                    type: { $first: "$type" },
                    baseAmount: { $first: "$baseAmount" },
                    amount: { $first: "$amount" },
                    exchangeRate: { $first: "$exchangeRate" },
                    basePlatformFee: { $first: "$basePlatformFee" },
                    platformFee: { $first: "$platformFee" }
                }
            },
            {
                $addFields: {
                    // Safe calculation of MZN amount: baseAmount > calculated > original amount
                    safeAmount: { 
                        $ifNull: [
                            "$baseAmount", 
                            { $multiply: ["$amount", { $ifNull: ["$exchangeRate", 1] }] }
                        ] 
                    },
                    safeFee: {
                        $ifNull: [
                            "$basePlatformFee",
                            { $multiply: ["$platformFee", { $ifNull: ["$exchangeRate", 1] }] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$safeAmount" },
                    subscriptionRevenue: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "subscription"] }, "$safeAmount", 0]
                        }
                    },
                    eventFeeRevenue: {
                        $sum: {
                            $cond: [{ $ne: ["$type", "subscription"] }, "$safeFee", 0]
                        }
                    }
                }
            }
        ]);

        const summary = financeSummary[0] || { totalRevenue: 0, subscriptionRevenue: 0, eventFeeRevenue: 0 };
        const nativeUsers = totalUsers - googleUsers - linkedinUsers;

        res.json({
            mentors: totalMentors,
            participants: totalParticipants,
            totalUsers: totalUsers,
            newsletterSubscribers,
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions,
            submissionsToday,
            submissionsThisWeek,
            submissionsThisMonth,
            usersToday,
            formsToday,
            booksToday,
            referralsToday,
            smartLinksToday,
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
        console.error('Error in getAdminStats:', err);
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
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

        // Aggregate financial stats for this mentor
        const financeStats = await Transaction.aggregate([
            {
                $match: {
                    mentor: new mongoose.Types.ObjectId(userId),
                    status: 'completed'
                }
            },
            {
                // Unify by ID/Intent to avoid double-counting
                $group: {
                    _id: { $ifNull: ["$stripePaymentIntentId", "$paypalCaptureId", "$_id"] },
                    baseAmount: { $first: "$baseAmount" },
                    amount: { $first: "$amount" },
                    exchangeRate: { $first: "$exchangeRate" },
                    baseMentorEarnings: { $first: "$baseMentorEarnings" },
                    mentorEarnings: { $first: "$mentorEarnings" },
                    basePlatformFee: { $first: "$basePlatformFee" },
                    platformFee: { $first: "$platformFee" }
                }
            },
            {
                $addFields: {
                    safeAmount: { 
                        $ifNull: [
                            "$baseAmount", 
                            { $multiply: ["$amount", { $ifNull: ["$exchangeRate", 1] }] }
                        ] 
                    },
                    safeEarnings: {
                        $ifNull: [
                            "$baseMentorEarnings",
                            { $multiply: ["$mentorEarnings", { $ifNull: ["$exchangeRate", 1] }] }
                        ]
                    },
                    safeFees: {
                        $ifNull: [
                            "$basePlatformFee",
                            { $multiply: ["$platformFee", { $ifNull: ["$exchangeRate", 1] }] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$safeAmount" },
                    totalEarnings: { $sum: "$safeEarnings" },
                    totalFees: { $sum: "$safeFees" }
                }
            }
        ]);

        const summary = financeStats[0] || { totalRevenue: 0, totalEarnings: 0, totalFees: 0 };

        const pendingCertificates = await Submission.countDocuments({
            form: { $in: formIds },
            certificateStatus: 'requested'
        });

        res.json({
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions,
            pendingCertificates: pendingCertificates,
            revenue: summary.totalRevenue,
            earnings: summary.totalEarnings,
            fees: summary.totalFees
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
        const [submissionStats, visitStats, dailyRevenueStats, geoRawData] = await Promise.all([
            // 1. Daily Submissions
            Submission.aggregate([
                { $match: { form: { $in: formIds }, submittedAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
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
            // 3. Daily Revenue from Transactions (more accurate than calculating from current form price)
            Transaction.aggregate([
                {
                    $match: {
                        form: { $in: formIds },
                        $or: [
                            { status: 'completed' },
                            { paymentMethod: 'manual', status: 'pending' }
                        ],
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: { $ifNull: ["$baseAmount", "$amount"] } }
                    }
                }
            ]),
            // 4. Geo data
            Submission.find(
                { form: { $in: formIds }, submittedAt: { $gte: thirtyDaysAgo } },
                { data: 1 }
            ).lean()
        ]);

        // Process results into final format
        const dailyMap = {};
        for (let i = 29; i >= 0; i--) { // Match thirtyDaysAgo window (30 days)
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyMap[dateStr] = { date: dateStr, count: 0, visits: 0, revenue: 0 };
        }

        // Merge Submission Count Stats
        submissionStats.forEach(stat => {
            if (dailyMap[stat._id]) {
                dailyMap[stat._id].count = stat.count;
            }
        });

        // Merge Revenue Stats
        dailyRevenueStats.forEach(stat => {
            if (dailyMap[stat._id]) {
                dailyMap[stat._id].revenue = stat.revenue;
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
