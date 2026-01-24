const { Router } = require('express');
const BlogPost = require('../models/BlogPost');
const { authMiddleware: protect, adminMiddleware: adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { uploadToCloudinary } = require('../config/cloudinaryService');

const router = Router();

// Configure multer for memory storage (for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas!'));
    },
});

// @route   GET /api/blog
// @desc    Get all published blog posts (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await BlogPost.find({ published: true })
            .sort({ publishedAt: -1 })
            .select('-content'); // Don't send full content for list

        res.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ message: 'Erro ao buscar artigos' });
    }
});

// @route   GET /api/blog/admin/all
// @desc    Get all blog posts including drafts (admin only)
// @access  Admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const posts = await BlogPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ message: 'Erro ao buscar artigos' });
    }
});

// @route   GET /api/blog/:slug
// @desc    Get single blog post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug, published: true });

        if (!post) {
            return res.status(404).json({ message: 'Artigo não encontrado' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ message: 'Erro ao buscar artigo' });
    }
});

// @route   POST /api/blog
// @desc    Create a new blog post
// @access  Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { title, excerpt, content, category, coverImage, author, readTime, tags, published } =
            req.body;

        const newPost = new BlogPost({
            title,
            excerpt,
            content,
            category,
            coverImage,
            author,
            readTime,
            tags,
            published,
            publishedAt: published ? new Date() : undefined,
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error creating blog post:', error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Já existe um artigo com este slug (título duplicado)' });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: `Erro de validação: ${messages.join(', ')}` });
        }

        res.status(500).json({
            message: 'Erro interno ao criar artigo no servidor.',
            error: error.message,
            details: error.name
        });
    }
});

// @route   PUT /api/blog/:id
// @desc    Update a blog post
// @access  Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { published } = req.body;
        const updateData = { ...req.body };

        // Set publishedAt if publishing for the first time
        if (published && !req.body.publishedAt) {
            updateData.publishedAt = new Date();
        }

        const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedPost) {
            return res.status(404).json({ message: 'Artigo não encontrado' });
        }

        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating blog post:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: `Erro de validação: ${messages.join(', ')}` });
        }

        res.status(500).json({ message: 'Erro ao atualizar artigo' });
    }
});

// @route   DELETE /api/blog/:id
// @desc    Delete a blog post
// @access  Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Artigo não encontrado' });
        }

        res.json({ message: 'Artigo deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ message: 'Erro ao deletar artigo' });
    }
});

// @route   POST /api/blog/upload-image
// @desc    Upload blog cover image
// @access  Admin
router.post(
    '/upload-image',
    protect,
    adminOnly,
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhuma imagem enviada' });
            }

            const result = await uploadToCloudinary(req.file.buffer, 'blog');
            res.json({ url: result.secure_url });
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            res.status(500).json({ message: 'Erro ao fazer upload da imagem para o Cloudinary' });
        }
    }
);

module.exports = router;
