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
