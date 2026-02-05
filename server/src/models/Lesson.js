const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'O título da aula é obrigatório'],
        trim: true,
        maxlength: [200, 'O título não pode exceder 200 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'A descrição não pode exceder 2000 caracteres']
    },
    videoUrl: {
        type: String,
        required: [true, 'A URL do vídeo é obrigatória']
    },
    thumbnailUrl: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetAudience: {
        type: String,
        enum: ['mentors', 'participants', 'both'],
        default: 'mentors'
    },
    associatedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form'
    }],
    duration: {
        type: Number, // Duration in seconds
        min: [0, 'A duração não pode ser negativa']
    },
    order: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: {
            values: ['basico', 'intermediario', 'avancado'],
            message: 'Categoria deve ser: basico, intermediario ou avancado'
        },
        default: 'basico'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userName: String,
        userAvatar: String,
        text: {
            type: String,
            required: true,
            maxlength: 1000
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
LessonSchema.index({ isPublished: 1, order: 1 });
LessonSchema.index({ category: 1 });

// Virtual for formatted duration
LessonSchema.virtual('formattedDuration').get(function () {
    if (!this.duration) return 'N/A';
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

module.exports = mongoose.model('Lesson', LessonSchema);
