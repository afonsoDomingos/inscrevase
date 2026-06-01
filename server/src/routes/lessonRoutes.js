const { Router } = require('express');
const Lesson = require('../models/Lesson');
const { authMiddleware: protect, adminMiddleware: adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { uploadToCloudinary } = require('../config/cloudinaryService');
const Submission = require('../models/Submission');

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
        const conditions = [
            { isPublished: true }
        ];

        if (category && category !== 'all') {
            conditions.push({ category });
        }

        if (search) {
            conditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Filter by target audience and associated events based on user role
        if (req.user.role === 'admin' || req.user.role === 'SuperAdmin') {
            // Admins see all published lessons
        } else {
            // Get user's approved submissions to unlock event-specific lessons
            const userSubmissions = await Submission.find({
                user: req.user.id,
                $or: [{ status: 'approved' }, { paymentStatus: 'paid' }]
            }).select('form');

            const approvedFormIds = userSubmissions.map(s => s.form);

            // Map user roles to target audiences
            let roleConditions = [];
            if (['mentor', 'specialist', 'company'].includes(req.user.role)) {
                // These roles should see mentors content
                roleConditions.push('mentors');
                if (req.user.role === 'specialist') roleConditions.push('specialists');
                if (req.user.role === 'company') roleConditions.push('companies');
            } else {
                // participant role
                roleConditions.push('participants');
            }

            conditions.push({
                $and: [
                    // Must match the role/audience OR be general
                    {
                        $or: [
                            { targetAudience: { $in: roleConditions } },
                            { targetAudience: 'both' },
                            { targetAudience: 'all' },
                            { targetAudience: { $exists: false } },
                            { targetAudience: null }
                        ]
                    },
                    // AND must be either general content OR content from an event I paid for
                    {
                        $or: [
                            { associatedEvents: { $size: 0 } },
                            { associatedEvents: { $exists: false } },
                            { associatedEvents: null },
                            { associatedEvents: { $in: approvedFormIds } }
                        ]
                    }
                ]
            });
        }

        const lessons = await Lesson.find({ $and: conditions })
            .populate('associatedEvents', 'title')
            .populate('createdBy', 'name role')
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        res.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ message: 'Erro ao buscar aulas' });
    }
});

// @route   GET /api/lessons/platform/tutorials
// @desc    Get tutorials created by platform admins (Public)
// @access  Public (Optional Auth)
router.get('/platform/tutorials', require('../middleware/authMiddleware').optionalAuthMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const admins = await User.find({ role: { $in: ['admin', 'SuperAdmin'] } }).select('_id');
        const adminIds = admins.map(a => a._id);

        const tutorials = await Lesson.find({
            isPublished: true,
            createdBy: { $in: adminIds }
        })
            .populate('createdBy', 'name role profilePhoto')
            .sort({ order: 1, createdAt: -1 })
            .limit(6);

        res.json(tutorials);
    } catch (error) {
        console.error('Error fetching platform tutorials:', error);
        res.status(500).json({ message: 'Erro ao buscar tutoriais da plataforma' });
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

// ==================== HUB ROUTES (PUBLIC ACCESS VIA SUBMISSION) ====================

// @route   GET /api/lessons/hub/:submissionId
// @desc    Get lessons associated with an event via submission ID (includes progress)
// @access  Public (Validated by Submission)
router.get('/hub/:submissionId', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId).populate('form');

        if (!submission) {
            return res.status(404).json({ message: 'Inscrição não encontrada' });
        }

        // Only approved submissions can access lessons
        if (submission.status !== 'approved' && submission.paymentStatus !== 'paid') {
            return res.status(403).json({ message: 'Acesso às aulas ainda não liberado para esta inscrição' });
        }

        const formId = submission.form._id;

        // Find lessons associated with this event
        const lessons = await Lesson.find({
            isPublished: true,
            associatedEvents: formId
        }).sort({ order: 1, createdAt: -1 });

        // If submission has a linked user, fetch their progress
        let progress = [];
        if (submission.user) {
            progress = await LessonProgress.find({
                user: submission.user,
                lesson: { $in: lessons.map(l => l._id) }
            });
        }

        // Return lessons with progress info
        const lessonsWithProgress = lessons.map(lesson => {
            const p = progress.find(pg => pg.lesson.toString() === lesson._id.toString());
            return {
                ...lesson.toObject(),
                progress: p ? {
                    completed: p.completed,
                    watchTime: p.watchTime,
                    lastWatchedAt: p.lastWatchedAt
                } : { completed: false, watchTime: 0 }
            };
        });

        res.json(lessonsWithProgress);
    } catch (error) {
        console.error('Error fetching hub lessons:', error);
        res.status(500).json({ message: 'Erro ao buscar aulas do evento' });
    }
});

// @route   GET /api/lessons/submission/:submissionId/progress
// @desc    Get progress details for a specific submission (For Mentor tracking)
// @access  Mentor/Admin
router.get('/submission/:submissionId/progress', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId).populate('form');
        if (!submission) return res.status(404).json({ message: 'Inscrição não encontrada' });

        // Verify if mentor owns the form
        if (submission.form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        if (!submission.user) {
            return res.json({ message: 'Nenhum usuário vinculado a esta inscrição', lessons: [] });
        }

        const lessons = await Lesson.find({ associatedEvents: submission.form._id }).sort({ order: 1 });
        const progress = await LessonProgress.find({ user: submission.user, lesson: { $in: lessons.map(l => l._id) } });

        const detailedProgress = lessons.map(lesson => {
            const p = progress.find(pg => pg.lesson.toString() === lesson._id.toString());
            return {
                _id: lesson._id,
                title: lesson.title,
                order: lesson.order,
                completed: p ? p.completed : false,
                watchTime: p ? p.watchTime : 0,
                completedAt: p ? p.completedAt : null,
                lastWatchedAt: p ? p.lastWatchedAt : null
            };
        });

        res.json({
            submissionId: submission._id,
            user: submission.user,
            progress: detailedProgress,
            stats: {
                total: lessons.length,
                completed: detailedProgress.filter(p => p.completed).length,
                percentage: lessons.length > 0 ? (detailedProgress.filter(p => p.completed).length / lessons.length) * 100 : 0
            }
        });
    } catch (error) {
        console.error('Error fetching student progress:', error);
        res.status(500).json({ message: 'Erro ao buscar progresso do aluno' });
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
        if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
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
        const { title, description, videoUrl, thumbnailUrl, duration, category, isPublished, isLocked, tags, order, targetAudience: bodyTargetAudience, associatedEvents } = req.body;

        // Determine target audience based on role if not provided in body
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';
        const targetAudience = bodyTargetAudience || (isAdmin ? 'mentors' : 'participants');

        const newLesson = new Lesson({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            category,
            isPublished: isPublished || false,
            isLocked: isLocked || false,
            tags,
            order,
            createdBy: req.user.id,
            targetAudience,
            associatedEvents: associatedEvents || []
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
        if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
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
        if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        await lesson.deleteOne();
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
        if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
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

// @route   PATCH /api/lessons/:id/toggle-lock
// @desc    Toggle lesson lock status
// @access  Private (Owner & Admin)
router.patch('/:id/toggle-lock', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada' });
        }

        // Check permission
        if (lesson.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        lesson.isLocked = !lesson.isLocked;
        await lesson.save();

        res.json(lesson);
    } catch (error) {
        console.error('Error toggling lock status:', error);
        res.status(500).json({ message: 'Erro ao alterar status de bloqueio' });
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
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        lesson.comments.pull(req.params.commentId);
        await lesson.save();

        res.json({ message: 'Comentário deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Erro ao deletar comentário' });
    }
});

module.exports = router;
