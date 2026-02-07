const Form = require('../models/Form');
const slugify = require('slugify');

const Submission = require('../models/Submission');

exports.createForm = async (req, res) => {
    try {
        const { title, description, fields, theme, active, eventDate, eventTime, eventType, category, paymentConfig, capacity, whatsappConfig, videoUrl, coverImage, coverImageMode, location, onlineLink, hubBackgroundImage, hubButtonColor, showHubButton, welcomeMessage, welcomeVideo, customFields, agenda, materials, certificateConfig, partners } = req.body;

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
            fields,
            theme,
            eventTime,
            eventType,
            category: category || 'Outros',
            paymentConfig: sanitizedPaymentConfig,
            whatsappConfig,
            videoUrl,
            coverImage,
            coverImageMode,
            location,
            onlineLink,
            hubBackgroundImage,
            hubButtonColor,
            showHubButton,
            welcomeMessage,
            welcomeVideo,
            customFields,
            agenda,
            materials,
            certificateConfig,
            partners: partners || [],
            active: active !== undefined ? active : true
        });

        // Handle Date explicitly
        if (eventDate === "" || eventDate === null) {
            newForm.eventDate = undefined;
        } else if (eventDate) {
            const d = new Date(eventDate);
            if (!isNaN(d.getTime())) newForm.eventDate = d;
        }

        // Handle Capacity explicitly
        if (capacity === "" || capacity === null) {
            newForm.capacity = undefined;
        } else if (capacity) {
            const cap = parseInt(capacity);
            if (!isNaN(cap)) newForm.capacity = cap;
        }

        const form = await newForm.save();

        // Handle Lesson Associations
        if (req.body.associatedLessons && Array.isArray(req.body.associatedLessons)) {
            const Lesson = require('../models/Lesson');
            await Lesson.updateMany(
                { _id: { $in: req.body.associatedLessons }, createdBy: req.user.id },
                { $addToSet: { associatedEvents: form._id } }
            );
        }

        res.status(201).json(form);
    } catch (err) {
        console.error("CRITICAL Create Form Error:", err);
        res.status(500).json({
            message: 'Erro interno ao criar formulário',
            error: err.message,
            details: err.errors
        });
    }
};

exports.getMyForms = async (req, res) => {
    try {
        const forms = await Form.find({
            $or: [
                { creator: req.user.id },
                { partners: req.user.id }
            ]
        }).sort({ createdAt: -1 }).lean();

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
        const form = await Form.findOne({ slug: req.params.slug })
            .populate('creator')
            .populate('partners', 'name businessName profilePhoto');
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Get submission count to calculate remaining slots
        const submissionCount = await Submission.countDocuments({ form: form._id });

        res.json({
            ...form.toObject(),
            submissionCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateForm = async (req, res) => {
    try {
        let form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Ensure user owns the form OR is a partner OR is an admin
        const isCreator = form.creator.toString() === req.user.id;
        const isPartner = form.partners && form.partners.some(p => p.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        if (!isCreator && !isPartner && !isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        const { title, description, fields, theme, active, eventDate, eventTime, eventType, category, paymentConfig, coverImage, coverImageMode, logo, capacity, whatsappConfig, location, onlineLink, waitingVideo, showVideoOnStart, videoUrl, hubBackgroundImage, hubButtonColor, showHubButton, welcomeMessage, welcomeVideo, customFields, agenda, materials, certificateConfig, partners } = req.body;

        console.log(`--- Atualizando Formulário ${req.params.id} ---`);

        // Basic Fields
        if (title !== undefined) form.title = title;
        if (description !== undefined) form.description = description;
        if (fields !== undefined) form.fields = fields;
        if (active !== undefined) form.active = active;
        if (coverImage !== undefined) form.coverImage = coverImage;
        if (coverImageMode !== undefined) form.coverImageMode = coverImageMode;
        if (logo !== undefined) form.logo = logo;

        // Event Info
        if (location !== undefined) form.location = location;
        if (onlineLink !== undefined) form.onlineLink = onlineLink;
        if (eventTime !== undefined) form.eventTime = eventTime;
        if (eventType !== undefined) form.eventType = eventType;
        if (category !== undefined) form.category = category;

        // Date handling
        if (eventDate !== undefined) {
            if (eventDate === "" || eventDate === null) {
                form.eventDate = undefined;
            } else {
                const dateParsed = new Date(eventDate);
                if (!isNaN(dateParsed.getTime())) {
                    form.eventDate = dateParsed;
                } else {
                    console.warn(`Data inválida recebida: ${eventDate}`);
                }
            }
        }

        // Capacity - allow clearing with null or empty string
        if (capacity !== undefined) {
            if (capacity === "" || capacity === null) {
                form.capacity = undefined;
            } else {
                const cap = parseInt(capacity);
                if (!isNaN(cap)) {
                    form.capacity = cap;
                }
            }
        }

        // Video & Display
        if (waitingVideo !== undefined) form.waitingVideo = waitingVideo;
        if (showVideoOnStart !== undefined) form.showVideoOnStart = showVideoOnStart;
        if (videoUrl !== undefined) form.videoUrl = videoUrl;

        // Hub Customization
        if (hubBackgroundImage !== undefined) form.hubBackgroundImage = hubBackgroundImage;
        if (hubButtonColor !== undefined) form.hubButtonColor = hubButtonColor;
        if (showHubButton !== undefined) form.showHubButton = showHubButton;
        if (welcomeMessage !== undefined) form.welcomeMessage = welcomeMessage;
        if (welcomeVideo !== undefined) form.welcomeVideo = welcomeVideo;

        // Arrays - replace if provided
        if (customFields !== undefined) form.customFields = customFields;
        if (agenda !== undefined) form.agenda = agenda;
        if (materials !== undefined) form.materials = materials;

        if (partners !== undefined) {
            const Notification = require('../models/Notification');
            const User = require('../models/User');

            const oldPartners = (form.partners || []).map(p => p.toString());
            const newPartners = partners.filter(p => !oldPartners.includes(p.toString()));

            form.partners = partners;

            // Notify new partners
            if (newPartners.length > 0) {
                try {
                    const creator = await User.findById(req.user.id);
                    await Promise.all(newPartners.map(async (partnerId) => {
                        return Notification.create({
                            recipient: partnerId,
                            sender: req.user.id,
                            title: 'Convite de Colaboração! 🤝',
                            content: `${creator.name} convidou você para ser co-organizador do evento "${form.title}".`,
                            type: 'personal',
                            actionUrl: '/dashboard/mentor'
                        });
                    }));
                } catch (notifErr) {
                    console.error('Error notifying new partners:', notifErr);
                }
            }
        }

        // Theme - Deep Merge
        if (theme) {
            const currentTheme = form.theme ? (typeof form.theme.toObject === 'function' ? form.theme.toObject() : form.theme) : {};
            form.theme = {
                ...currentTheme,
                ...theme
            };
        }

        // WhatsApp - Deep Merge
        if (whatsappConfig) {
            const currentWA = form.whatsappConfig ? (typeof form.whatsappConfig.toObject === 'function' ? form.whatsappConfig.toObject() : form.whatsappConfig) : {};
            form.whatsappConfig = {
                ...currentWA,
                ...whatsappConfig
            };
        }

        // Payment Config - Deep Merge
        if (paymentConfig) {
            const currentPayment = form.paymentConfig ? (typeof form.paymentConfig.toObject === 'function' ? form.paymentConfig.toObject() : form.paymentConfig) : {};
            let sanitizedConfig = {
                ...currentPayment,
                ...paymentConfig
            };
            if (sanitizedConfig.enabled) {
                const priceValue = parseFloat(sanitizedConfig.price);
                sanitizedConfig.price = isNaN(priceValue) ? 0 : priceValue;
            }
            form.paymentConfig = sanitizedConfig;
        }

        // Certificate Config - Deep Merge
        if (certificateConfig) {
            const currentCert = form.certificateConfig ? (typeof form.certificateConfig.toObject === 'function' ? form.certificateConfig.toObject() : form.certificateConfig) : {};
            form.certificateConfig = {
                ...currentCert,
                ...certificateConfig
            };
        }

        await form.save();

        // Handle Lesson Associations
        if (req.body.associatedLessons && Array.isArray(req.body.associatedLessons)) {
            const Lesson = require('../models/Lesson');
            const lessonIds = req.body.associatedLessons;

            // 1. Remove this form from ALL lessons created by this mentor
            await Lesson.updateMany(
                { createdBy: req.user.id },
                { $pull: { associatedEvents: form._id } }
            );

            // 2. Add this form to the selected lessons
            if (lessonIds.length > 0) {
                await Lesson.updateMany(
                    { _id: { $in: lessonIds }, createdBy: req.user.id },
                    { $addToSet: { associatedEvents: form._id } }
                );
            }
        }

        console.log('--- Formulário salvo com sucesso! ---');
        res.json(form);
    } catch (err) {
        console.error("CRITICAL Update Form Error:", err);
        res.status(500).json({
            message: 'Erro interno ao atualizar formulário',
            error: err.message,
            details: err.errors // Include validation errors if available
        });
    }
};

exports.deleteForm = async (req, res) => {
    try {
        const formId = req.params.id;
        const form = await Form.findById(formId);

        if (!form) return res.status(404).json({ message: 'Formulário não encontrado' });

        // Ensure user owns the form OR is an admin
        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(401).json({ message: 'Não autorizado' });
        }

        console.log(`--- Excluindo Formulário: ${formId} (${form.title}) ---`);

        // 1. Delete all associated submissions
        const subResult = await Submission.deleteMany({ form: formId });
        console.log(`Removidas ${subResult.deletedCount} inscrições associadas.`);

        // 2. Delete the form itself
        await Form.findByIdAndDelete(formId);

        console.log('Formulário excluído com sucesso do banco de dados.');
        res.json({ message: 'Evento e todas as inscrições foram excluídos permanentemente.' });
    } catch (err) {
        console.error("CRITICAL Delete Form Error:", err);
        res.status(500).json({ message: 'Erro ao excluir o evento do servidor', error: err.message });
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

exports.getFormsByMentor = async (req, res) => {
    try {
        const forms = await Form.find({ creator: req.params.mentorId, active: true }).sort({ createdAt: -1 });
        res.json(forms);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.recordVisit = async (req, res) => {
    try {
        const { slug } = req.params;
        const form = await Form.findOneAndUpdate(
            { slug },
            { $inc: { visits: 1 } },
            { new: true }
        );
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json({ success: true, visits: form.visits });
    } catch (err) {
        console.error("Record form visit error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getExploreEvents = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { active: true };

        if (category && category !== 'Todos') {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const forms = await Form.find(query)
            .select('title slug coverImage hubBackgroundImage eventDate eventType category creator location onlineLink')
            .populate('creator', 'name businessName')
            .sort({ createdAt: -1 });

        res.json(forms);
    } catch (err) {
        console.error("Explore Events Error:", err);
        res.status(500).send('Server Error');
    }
};