const mongoose = require('mongoose');

const FormFieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'email', 'phone', 'number', 'select', 'checkbox', 'date', 'file', 'textarea'],
        required: true
    },
    placeholder: { type: String },
    options: [{ type: String }], // For select/checkbox
    required: { type: Boolean, default: false },
    conditional: {
        field: { type: String },
        value: { type: String }
    },
    order: { type: Number, default: 0 }
});

const FormSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String },
    coverImage: { type: String },
    videoUrl: { type: String },
    fields: [FormFieldSchema],
    eventDate: { type: Date },
    theme: {
        primaryColor: { type: String, default: '#FFD700' }, // Gold
        backgroundColor: { type: String, default: '#FFFFFF' }, // White
        backgroundImage: { type: String },
        fontFamily: { type: String, default: 'Playfair Display' },
        style: { type: String, enum: ['luxury', 'minimalist'], default: 'luxury' }
    },
    whatsappConfig: {
        phoneNumber: { type: String },
        message: { type: String }
    },
    capacity: { type: Number }, // Target number of submissions
    paymentConfig: {
        enabled: { type: Boolean, default: false },
        price: { type: Number },
        currency: { type: String, default: 'MZN' },
        mpesaNumber: { type: String },
        emolaNumber: { type: String },
        bankAccount: { type: String },
        accountHolder: { type: String },
        instructions: { type: String },
        requireProof: { type: Boolean, default: false }
    },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
