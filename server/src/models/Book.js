const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String }, // Cloudinary URL
    affiliateLink: { type: String }, // Opcional se for PDF do usuário
    category: { type: String, default: 'Desenvolvimento Pessoal' },
    price: { type: String }, // Preço aproximado (opcional)
    rating: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    clicks: { type: Number, default: 0 },
    pdfUrl: { type: String }, // URL do PDF (Upload ou Link)
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sellerPaypalEmail: { type: String }, // E-mail para receber pagamentos
    isUserSubmission: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'approved' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', BookSchema);
