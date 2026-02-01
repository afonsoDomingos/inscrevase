const { Router } = require('express');
const Lesson = require('../models/Lesson');
const { authMiddleware: protect, adminMiddleware: adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { uploadToCloudinary } = require('../config/cloudinaryService');

const router = Router();

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for videos
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype.startsWith('video/');

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas vídeos são permitidos!'));
    },
});

// ==================== PUBLIC/MENTOR ROUTES ====================

// @route   GET /api/lessons
// @desc    Get all published lessons
// @access  Private (Mentors/Participants)
router.get('/', protect, async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = { isPublished: true };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by target audience based on user role
        // Mentors see content for mentors
        // Participants see content for participants
        // Admins can see everything (or we can filter if needed, but usually they want to check)
        if (req.user.role === 'mentor') {
            filter.targetAudience = 'mentors';
        } else if (req.user.role === 'participant') {
            filter.targetAudience = 'participants';
        }

        const lessons = await Lesson.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        res.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ message: 'Erro ao buscar aulas' });
    }
});

// @route   GET /api/lessons/:id
// @desc    Get single lesson and increment views
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findOneAndUpdate(
            { _id: req.params.id, isPublished: true },
            { $inc: { views: 1 } },
            { new: true }
        ).select('-__v');

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        res.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ message: 'Erro ao buscar aula' });
    }
});

// ==================== ADMIN ROUTES ====================

// ==================== MANAGEMENT ROUTES (ADMIN & MENTOR) ====================

// @route   GET /api/lessons/manage/all
// @desc    Get all lessons created by user (or all if admin)
// @access  Private (Admin & Mentor)
router.get('/manage/all', protect, async (req, res) => {
    try {
        let query = {};

        // If not admin, only show lessons created by user
        if (req.user.role !== 'admin') {
            query.createdBy = req.user.id;
        }

        const lessons = await Lesson.find(query)
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        const stats = {
            total: lessons.length,
            published: lessons.filter(l => l.isPublished).length,
            unpublished: lessons.filter(l => !l.isPublished).length,
            totalViews: lessons.reduce((sum, l) => sum + l.views, 0)
        };

        res.json({ lessons, stats });
    } catch (error) {
        console.error('Error fetching managed lessons:', error);
        res.status(500).json({ message: 'Erro ao buscar aulas' });
    }
});

// @route   POST /api/lessons
// @desc    Create a new lesson
// @access  Private (Admin & Mentor)
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, videoUrl, thumbnailUrl, duration, category, isPublished, tags, order } = req.body;

        // Determine target audience based on role
        const targetAudience = req.user.role === 'admin' ? 'mentors' : 'participants';

        const newLesson = new Lesson({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            category,
            isPublished,
            tags,
            order,
            createdBy: req.user.id,
            targetAudience
        });

        const savedLesson = await newLesson.save();
        res.status(201).json(savedLesson);
    } catch (error) {
        console.error('Error creating lesson:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: `Erro de validação: ${messages.join(', ')}` });
        }

        res.status(500).json({ message: 'Erro ao criar aula' });
    }
});

// @route   PUT /api/lessons/:id
// @desc    Update a lesson
// @access  Private (Owner & Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        let lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        // Check permission
        if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-__v');

        res.json(updatedLesson);
    } catch (error) {
        console.error('Error updating lesson:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: `Erro de validação: ${messages.join(', ')}` });
        }

        res.status(500).json({ message: 'Erro ao atualizar aula' });
    }
});

// @route   DELETE /api/lessons/:id
// @desc    Delete a lesson
// @access  Private (Owner & Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        // Check permission
        if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        await lesson.remove();
        res.json({ message: 'Aula deletada com sucesso' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ message: 'Erro ao deletar aula' });
    }
});

// @route   POST /api/lessons/upload-video
// @desc    Upload video to Cloudinary
// @access  Private (Admin & Mentor)
router.post(
    '/upload-video',
    protect,
    upload.single('video'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum vídeo enviado' });
            }

            console.log('[LessonRoutes] Uploading video to Cloudinary...');
            const result = await uploadToCloudinary(req.file.buffer, 'lessons');

            res.json({
                videoUrl: result.secure_url,
                thumbnailUrl: result.secure_url.replace(/\.[^.]+$/, '.jpg'), // Cloudinary auto-generates thumbnails
                duration: result.duration || 0,
                format: result.format,
                size: result.bytes
            });
        } catch (error) {
            console.error('Error uploading video to Cloudinary:', error);
            res.status(500).json({ message: 'Erro ao fazer upload do vídeo' });
        }
    }
);

// @route   PATCH /api/lessons/:id/toggle-publish
// @desc    Toggle lesson publish status
// @access  Private (Owner & Admin)
router.patch('/:id/toggle-publish', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        // Check permission
        if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        lesson.isPublished = !lesson.isPublished;
        await lesson.save();

        res.json(lesson);
    } catch (error) {
        console.error('Error toggling publish status:', error);
        res.status(500).json({ message: 'Erro ao alterar status de publicação' });
    }
});

// ==================== PROGRESS ROUTES ====================

const LessonProgress = require('../models/LessonProgress');
const User = require('../models/User');

// @route   POST /api/lessons/:id/progress
// @desc    Mark lesson as completed or update progress
// @access  Private
router.post('/:id/progress', protect, async (req, res) => {
    try {
        const { completed, watchTime } = req.body;

        let progress = await LessonProgress.findOne({
            user: req.user.id,
            lesson: req.params.id
        });

        if (progress) {
            progress.completed = completed !== undefined ? completed : progress.completed;
            progress.watchTime = watchTime || progress.watchTime;
            progress.lastWatchedAt = new Date();
            if (completed && !progress.completedAt) {
                progress.completedAt = new Date();
            }
        } else {
            progress = new LessonProgress({
                user: req.user.id,
                lesson: req.params.id,
                completed: completed || false,
                watchTime: watchTime || 0,
                completedAt: completed ? new Date() : undefined
            });
        }

        await progress.save();
        res.json(progress);
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Erro ao atualizar progresso' });
    }
});

// @route   GET /api/lessons/progress/my-progress
// @desc    Get user's progress for all lessons
// @access  Private
router.get('/progress/my-progress', protect, async (req, res) => {
    try {
        const progress = await LessonProgress.find({ user: req.user.id })
            .populate('lesson', 'title category duration')
            .sort({ lastWatchedAt: -1 });

        const stats = {
            total: progress.length,
            completed: progress.filter(p => p.completed).length,
            inProgress: progress.filter(p => !p.completed && p.watchTime > 0).length
        };

        res.json({ progress, stats });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ message: 'Erro ao buscar progresso' });
    }
});

// ==================== FAVORITES ROUTES ====================

// @route   POST /api/lessons/:id/favorite
// @desc    Toggle favorite status for a lesson
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const lessonId = req.params.id;

        const index = user.favoriteLessons.indexOf(lessonId);

        if (index > -1) {
            user.favoriteLessons.splice(index, 1); // Remove from favorites
        } else {
            user.favoriteLessons.push(lessonId); // Add to favorites
        }

        await user.save();
        res.json({
            isFavorite: index === -1,
            favoriteLessons: user.favoriteLessons
        });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Erro ao favoritar aula' });
    }
});

// @route   GET /api/lessons/favorites/my-favorites
// @desc    Get user's favorite lessons
// @access  Private
router.get('/favorites/my-favorites', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'favoriteLessons',
                match: { isPublished: true },
                select: '-__v'
            });

        res.json(user.favoriteLessons || []);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Erro ao buscar favoritos' });
    }
});

// ==================== COMMENTS ROUTES ====================

// @route   POST /api/lessons/:id/comment
// @desc    Add a comment to a lesson
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'Comentário não pode estar vazio' });
        }

        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        const user = await User.findById(req.user.id);

        const newComment = {
            user: req.user.id,
            userName: user.name,
            userAvatar: user.profilePhoto || '',
            text: text.trim(),
            createdAt: new Date()
        };

        lesson.comments.unshift(newComment);
        await lesson.save();

        res.status(201).json(lesson.comments);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Erro ao adicionar comentário' });
    }
});

// @route   DELETE /api/lessons/:lessonId/comment/:commentId
// @desc    Delete a comment (own comment only)
// @access  Private
router.delete('/:lessonId/comment/:commentId', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId);

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        const comment = lesson.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comentário não encontrado' });
        }

        // Only allow user to delete their own comment or admin
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        comment.remove();
        await lesson.save();

        res.json({ message: 'Comentário deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Erro ao deletar comentário' });
    }
});

module.exports = router;
