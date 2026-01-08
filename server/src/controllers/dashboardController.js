const User = require('../models/User');
const Form = require('../models/Form');
const Submission = require('../models/Submission');

exports.getAdminStats = async (req, res) => {
    try {
        const totalMentors = await User.countDocuments({ role: 'mentor' });
        const totalForms = await Form.countDocuments();
        const totalSubmissions = await Submission.countDocuments();
        const approvedSubmissions = await Submission.countDocuments({ status: 'approved' });

        // For "growth", we can calculate based on last 30 days vs previous 30 days
        // but for now let's just return real counts

        // Auth distribution stats
        const googleUsers = await User.countDocuments({ googleId: { $ne: null } });
        const linkedinUsers = await User.countDocuments({ linkedinId: { $ne: null } });
        const totalUsers = await User.countDocuments();
        const nativeUsers = totalUsers - googleUsers - linkedinUsers;

        res.json({
            mentors: totalMentors,
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions,
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
        approvedSubs.forEach(sub => {
            const form = formsMap[sub.form.toString()];
            if (form && form.paymentConfig && form.paymentConfig.enabled) {
                revenue += (form.paymentConfig.price || 0);
            }
        });

        res.json({
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions,
            revenue: revenue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching mentor stats' });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const myForms = await Form.find({ creator: userId });
        const formIds = myForms.map(f => f._id);
        const formsMap = {};
        myForms.forEach(f => { formsMap[f._id.toString()] = f; });

        // Get submissions from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const submissions = await Submission.find({
            form: { $in: formIds },
            submittedAt: { $gte: thirtyDaysAgo }
        }).lean(); // Use lean for performance

        // 1. Daily Stats (Evolution)
        const dailyMap = {};
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyMap[dateStr] = { date: dateStr, count: 0, revenue: 0 };
        }

        submissions.forEach(sub => {
            const dateStr = sub.submittedAt.toISOString().split('T')[0];
            if (dailyMap[dateStr]) {
                dailyMap[dateStr].count += 1;
                if (sub.status === 'approved') {
                    const form = formsMap[sub.form.toString()];
                    if (form && form.paymentConfig?.enabled) {
                        dailyMap[dateStr].revenue += (form.paymentConfig.price || 0);
                    }
                }
            }
        });

        const dailyStats = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

        // 2. Geo Stats (Province Heatmap)
        const MOZ_PROVINCES = [
            'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'
        ];

        const geoMap = {};
        MOZ_PROVINCES.forEach(p => geoMap[p] = 0);

        submissions.forEach(sub => {
            // Search in all values of the data map
            if (sub.data) {
                const values = Object.values(sub.data).map(v => String(v).toLowerCase());
                for (const p of MOZ_PROVINCES) {
                    if (values.some(v => v.includes(p.toLowerCase()))) {
                        geoMap[p] += 1;
                        break; // Count user for only one province if multiple match (simple heuristic)
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
        console.error(err);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};
