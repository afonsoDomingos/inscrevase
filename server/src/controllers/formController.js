const Form = require('../models/Form');
const slugify = require('slugify');

const Submission = require('../models/Submission');

exports.createForm = async (req, res) => {
    try {
        const { title, description, fields, theme, active, eventDate, paymentConfig } = req.body; // Extract only needed fields

        let slug = slugify(title, { lower: true, strict: true });

        // Ensure unique slug
        let slugExists = await Form.findOne({ slug });
        let counter = 1;
        while (slugExists) {
            slug = `${slug}-${counter}`;
            slugExists = await Form.findOne({ slug });
            counter++;
        }

        // Sanitize paymentConfig to ensure price is a valid number
        let sanitizedPaymentConfig = paymentConfig;
        if (sanitizedPaymentConfig && sanitizedPaymentConfig.enabled) {
            const price = parseFloat(sanitizedPaymentConfig.price);
            sanitizedPaymentConfig.price = isNaN(price) ? 0 : price;
        }

        const newForm = new Form({
            creator: req.user.id,
            title,
            description,
            slug,
            fields, // fields array
            theme,
            eventDate: eventDate === "" ? undefined : eventDate, // Handle empty date string
            paymentConfig: sanitizedPaymentConfig,
            active
        });

        const form = await newForm.save();
        res.status(201).json(form);
    } catch (err) {
        console.error("Create Form Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyForms = async (req, res) => {
    try {
        const forms = await Form.find({ creator: req.user.id }).sort({ createdAt: -1 }).lean();

        const formsWithCount = await Promise.all(forms.map(async (form) => {
            const count = await Submission.countDocuments({ form: form._id });
            return { ...form, submissionCount: count };
        }));

        res.json(formsWithCount);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getFormBySlug = async (req, res) => {
    try {
        const form = await Form.findOne({ slug: req.params.slug });
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json(form);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateForm = async (req, res) => {
    try {
        let form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Ensure user owns the form OR is an admin
        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        const { title, description, fields, theme, active, eventDate, paymentConfig, coverImage, logo } = req.body;

        // If title changed, update slug? Usually better not to break links, but user might want to.
        // For now, let's keep slug persistent unless explicitly requested.

        if (title) form.title = title;
        if (description !== undefined) form.description = description;
        if (fields) form.fields = fields;
        if (theme) form.theme = theme;
        if (active !== undefined) form.active = active;
        if (coverImage !== undefined) form.coverImage = coverImage;
        if (logo !== undefined) form.logo = logo;

        // Handle Date Upgrade
        if (eventDate !== undefined) {
            form.eventDate = eventDate === "" ? undefined : eventDate;
        }

        // Handle Payment Config
        if (paymentConfig) {
            let sanitizedConfig = { ...paymentConfig };
            if (sanitizedConfig.enabled) {
                const price = parseFloat(sanitizedConfig.price);
                sanitizedConfig.price = isNaN(price) ? 0 : price;
            }
            form.paymentConfig = sanitizedConfig;
        }

        await form.save();
        res.json(form);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete associated submissions? Or keep them? Usually delete.
        // await Submission.deleteMany({ form: form._id }); // Add Submission model if needed

        await form.deleteOne();
        res.json({ message: 'Form removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getAllFormsAdmin = async (req, res) => {
    try {
        const forms = await Form.find().populate('creator', 'name email').sort({ createdAt: -1 });
        res.json(forms);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};