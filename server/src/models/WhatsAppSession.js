const mongoose = require('mongoose');

const WhatsAppSessionSchema = new mongoose.Schema({
    content: {
        type: String, // Conteúdo do ficheiro em Base64 ou texto JSON
        required: true
    },
    fileName: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppSession', WhatsAppSessionSchema);
