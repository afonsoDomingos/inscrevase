const Form = require('../models/Form');
const slugify = require('slugify');

const createForm = async (req, res) => {
    try {
        const { title, description, logo, coverImage, videoUrl, fields, theme, whatsappConfig } = req.body;

        // Generate slug from title or random string
        let slug = slugify(title, { lower: true, strict: true });

        // Check if slug exists
        const existingForm = await Form.findOne({ slug });
        if (existingForm) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        const form = new Form({
            creator: req.user.id,
            title,
            slug,
            description,
            logo,
            coverImage,
            videoUrl,
            fields,
            theme,
            whatsappConfig
        });

        await form.save();
        res.status(201).json(form);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getMyForms = async (req, res) => {
    try {
        const forms = await Form.find({ creator: req.user.id }).sort('-createdAt');
        res.json(forms);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getFormBySlug = async (req, res) => {
    try {
        const form = await Form.findOne({ slug: req.params.slug, active: true })
            .populate('creator', 'name profilePhoto bio socialLinks');
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json(form);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateForm = async (req, res) => {
    try {
        let form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Check ownership
        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        form = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(form);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const deleteForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await form.deleteOne();
        res.json({ message: 'Form removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllFormsAdmin = async (req, res) => {
    try {
        const forms = await Form.find()
            .populate('creator', 'name email businessName')
            .sort('-createdAt');
        res.json(forms);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { createForm, getMyForms, getFormBySlug, updateForm, deleteForm, getAllFormsAdmin };
