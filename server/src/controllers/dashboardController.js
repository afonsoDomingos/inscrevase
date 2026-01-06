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

        // 1. Count forms created by mentor
        const totalForms = await Form.countDocuments({ creator: userId });

        // 2. Count total submissions for all mentor's forms
        const myForms = await Form.find({ creator: userId }).select('_id');
        const formIds = myForms.map(f => f._id);

        const totalSubmissions = await Submission.countDocuments({ form: { $in: formIds } });
        const approvedSubmissions = await Submission.countDocuments({
            form: { $in: formIds },
            status: 'approved'
        });

        res.json({
            forms: totalForms,
            submissions: totalSubmissions,
            approved: approvedSubmissions
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching mentor stats' });
    }
};
