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

        res.json({
            mentors: totalMentors,
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions
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
