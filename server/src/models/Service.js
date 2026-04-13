const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true,
        maxlength: [100, 'Título não pode ter mais de 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        maxlength: [2000, 'Descrição não pode ter mais de 2000 caracteres']
    },
    category: {
        type: String,
        required: true,
        enum: ['Consultoria', 'Mentoria', 'Treinamento', 'Design', 'Desenvolvimento', 'Marketing', 'Outro']
    },
    price: {
        type: Number,
        min: 0
    },
    currency: {
        type: String,
        default: 'MZN',
        enum: ['MZN', 'USD', 'EUR']
    },
    images: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    contactInfo: {
        email: String,
        phone: String,
        whatsapp: String,
        website: String
    },
    delivery: {
        type: String,
        enum: ['Online', 'Presencial', 'Híbrido'],
        default: 'Online'
    },
    duration: String, // e.g., "1 hora", "1 semana", etc.
    views: {
        type: Number,
        default: 0
    },
    inquiries: {
        type: Number,
        default: 0
    },
    ctaText: {
        type: String,
        trim: true,
        maxlength: [30, 'CTA não pode ter mais de 30 caracteres'],
        default: 'Solicitar'
    }
}, {
    timestamps: true
});

// Index para busca eficiente
serviceSchema.index({ creator: 1, active: 1 });
serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ category: 1, active: 1 });

module.exports = mongoose.model('Service', serviceSchema);
