const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    location: { type: String, default: 'Remoto' },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Freelance', 'Internship', 'Remote'], default: 'Full-time' },
    image: { type: String },
    active: { type: Boolean, default: true },
    category: { type: String, default: 'Tecnologia' },
    questions: [{
        label: { type: String, required: true },
        required: { type: Boolean, default: true },
        type: { type: String, enum: ['text', 'textarea', 'select'], default: 'text' },
        options: [String] // For select types
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Vacancy', vacancySchema);
