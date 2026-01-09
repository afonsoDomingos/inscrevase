const Submission = require('../models/Submission');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { PLANS } = require('../config/stripe');

const submitForm = async (req, res) => {
    try {
        const { formId, data, paymentProof } = req.body;

        const form = await Form.findById(formId);
        if (!form || !form.active) {
            return res.status(404).json({ message: 'Form not found or inactive' });
        }

        const submission = new Submission({
            form: formId,
            data,
            paymentProof
        });

        await submission.save();
        res.status(201).json({ message: 'Inscrição enviada com sucesso', submission });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getFormSubmissions = async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Check ownership
        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ form: req.params.formId }).sort('-submittedAt');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const submission = await Submission.findById(req.params.id).populate('form');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        // Check ownership of the form
        if (submission.form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        submission.status = status;

        // --- NEW FINANCIAL LOGIC FOR MANUAL PAYMENTS ---
        if (status === 'approved' && submission.form.paymentConfig?.enabled) {
            // Check if transaction already exists (avoid duplicates)
            const existingTx = await Transaction.findOne({ submission: submission._id });

            if (!existingTx) {
                const mentor = await User.findById(submission.form.creator);
                if (mentor) {
                    const mentorPlan = mentor.plan || 'free';
                    const planConfig = PLANS[mentorPlan] || PLANS.free;
                    const amount = submission.form.paymentConfig.price || 0;
                    const platformFee = amount * planConfig.commissionRate;

                    // Create manual transaction (Status: pending until mentor pays platform)
                    const transaction = new Transaction({
                        user: mentor._id,
                        mentor: mentor._id,
                        form: submission.form._id,
                        submission: submission._id,
                        amount: amount,
                        currency: submission.form.paymentConfig.currency || 'MT',
                        platformFee: platformFee,
                        mentorEarnings: amount, // For manual, mentor already has 100% of money
                        status: 'pending', // Pending platform fee reconciliation
                        paymentMethod: 'manual'
                    });
                    await transaction.save();

                    // Also mark payment as paid in submission since it's approved
                    submission.paymentStatus = 'paid';
                }
            }
        }
        // -----------------------------------------------

        await submission.save();
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllSubmissionsAdmin = async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('form', 'title slug')
            .sort('-submittedAt')
            .limit(100);
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const myForms = await Form.find({ creator: userId }).select('_id');
        const formIds = myForms.map(f => f._id);

        const submissions = await Submission.find({ form: { $in: formIds } })
            .populate('form', 'title slug')
            .sort('-submittedAt');

        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getSubmissionPublic = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate({
                path: 'form',
                populate: { path: 'creator', select: 'name profilePhoto bio socialLinks' }
            });

        if (!submission) return res.status(404).json({ message: 'Inscrição não encontrada' });

        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar inscrição', error: err.message });
    }
};

module.exports = {
    submitForm,
    getFormSubmissions,
    updateStatus,
    getAllSubmissionsAdmin,
    getMySubmissions,
    getSubmissionPublic
};
