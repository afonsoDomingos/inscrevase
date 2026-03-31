const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    vacancyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    cvUrl: { type: String },
    motivationLetter: { type: String },
    status: { type: String, enum: ['Pendente', 'Em Revisão', 'Entrevista', 'Contratado', 'Rejeitado'], default: 'Pendente' },
    answers: [{
        question: String,
        answer: String
    }],
    metadata: {
        ip: String,
        userAgent: String
    }
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
