const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, unique: true }, // UUID para validação
    hours: { type: Number, required: true }, // Total de horas contabilizadas
    completedLessons: { type: Number, required: true }, // Quantidade de aulas
    type: { type: String, default: 'participation' },
    issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);
