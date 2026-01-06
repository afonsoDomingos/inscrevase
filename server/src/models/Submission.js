const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    data: { type: Map, of: mongoose.Schema.Types.Mixed }, // Dynamic response data
    paymentProof: { type: String }, // Cloudinary URL
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
