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
    location: { type: String }, // Physical address
    onlineLink: { type: String }, // Zoom/Meet/YouTube link
    theme: {
        primaryColor: { type: String, default: '#FFD700' }, // Gold
        backgroundColor: { type: String, default: '#050505' }, // Black
        backgroundImage: { type: String },
        titleColor: { type: String, default: '#FFFFFF' },
        inputColor: { type: String, default: '#FFFFFF' },
        inputBackgroundColor: { type: String, default: 'rgba(255,255,255,0.05)' },
        inputPlaceholderColor: { type: String, default: 'rgba(255,255,255,0.4)' },
        fontFamily: { type: String, default: 'Inter' },
        style: { type: String, enum: ['luxury', 'minimalist'], default: 'luxury' }
    },
    whatsappConfig: {
        phoneNumber: { type: String },
        message: { type: String },
        communityUrl: { type: String }
    },
    capacity: { type: Number }, // Target number of submissions
    paymentConfig: {
        enabled: { type: Boolean, default: false },
        price: { type: Number },
        currency: { type: String, default: 'MT' },
        mpesaNumber: { type: String },
        emolaNumber: { type: String },
        bankAccount: { type: String },
        accountHolder: { type: String },
        instructions: { type: String },
        requireProof: { type: Boolean, default: false },
        stripeEnabled: { type: Boolean, default: false },
        stripePriceId: { type: String },
        stripeProductId: { type: String }
    },
    active: { type: Boolean, default: true },
    visits: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
