const mongoose = require('mongoose');

const FormFieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'email', 'phone', 'tel', 'number', 'select', 'checkbox', 'date', 'file', 'textarea', 'url'],
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
    description: { type: String, maxLength: 500 },
    logo: { type: String },
    coverImage: { type: String },
    coverImageMode: { type: String, enum: ['full', 'banner'], default: 'full' }, // full = imagem completa, banner = cortada
    videoUrl: { type: String },
    fields: [FormFieldSchema],
    eventDate: { type: Date },
    eventTime: { type: String }, // Ex: "14:00"
    eventType: { type: String, enum: ['modePresencial', 'modeOnline', 'modeHybrid'], default: 'modeOnline' },
    location: { type: String }, // Physical address
    onlineLink: { type: String }, // Zoom/Meet/YouTube link
    waitingVideo: { type: String }, // Link para vídeo de aquecimento/espera (Youtube/Vimeo)
    showVideoOnStart: { type: Boolean, default: false }, // Se true, vídeo abre expandido
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
    // Hub Customization
    welcomeMessage: { type: String }, // Mensagem personalizada do mentor
    welcomeVideo: { type: String }, // URL do vídeo de boas-vindas (YouTube, Vimeo, etc)
    customFields: [{
        label: { type: String, required: true },
        value: { type: String, required: true },
        icon: { type: String }, // Nome do ícone Lucide (opcional)
        order: { type: Number, default: 0 }
    }],
    agenda: [{
        time: { type: String, required: true }, // Ex: "14:00"
        activity: { type: String, required: true },
        description: { type: String },
        duration: { type: String }, // Ex: "30 min"
        order: { type: Number, default: 0 }
    }],
    materials: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, enum: ['pdf', 'video', 'link', 'zip', 'other'], default: 'other' },
        size: { type: String }, // Ex: "2.5 MB"
        availableAfterEvent: { type: Boolean, default: false }, // Só disponível após o evento
        order: { type: Number, default: 0 }
    }],
    certificateConfig: {
        enabled: { type: Boolean, default: false },
        template: { type: String, default: 'classic' },
        primaryColor: { type: String, default: '#D4AF37' },
        title: { type: String, default: 'CERTIFICADO' },
        subtitle: { type: String, default: 'DE CONCLUSÃO' },
        description: { type: String, default: 'concluiu com êxito a participação no evento:' },
        signerName: { type: String },
        signerRole: { type: String, default: 'Mentor Responsável' },
        requireCheckIn: { type: Boolean, default: true }
    },
    active: { type: Boolean, default: true },
    visits: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
