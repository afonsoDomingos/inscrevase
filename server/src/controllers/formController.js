const Form = require('../models/Form');
const slugify = require('slugify');

const Submission = require('../models/Submission');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const Visit = require('../models/Visit');
const geoip = require('geoip-lite');


exports.createForm = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.isEmailVerified && user.role !== 'admin' && user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Por favor, confirme seu e-mail para criar eventos.' });
        }
        const { title, description, fields, theme, active, eventDate, eventTime, eventType, category, paymentConfig, capacity, extraCapacity, whatsappConfig, videoUrl, videoOrientation, logo, coverImage, coverImageMode, location, onlineLink, hubBackgroundImage, hubButtonColor, showHubButton, welcomeMessage, welcomeVideo, customFields, agenda, materials, certificateConfig, partners } = req.body;

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

        const safePartners = Array.isArray(partners) ? partners.filter(p => p && mongoose.Types.ObjectId.isValid(p)) : [];

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
            partners: safePartners,
            partnersPublic: safePartners, // Default to visible for new partners
            videoOrientation: videoOrientation || 'vertical',
            logo,
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

        // Handle Extra Capacity explicitly
        if (extraCapacity) {
            const extraCap = parseInt(extraCapacity);
            if (!isNaN(extraCap)) newForm.extraCapacity = extraCap;
        }

        const form = await newForm.save();
        await form.populate('partners', 'name businessName profilePhoto');

        // Notify new partners
        if (safePartners.length > 0) {
            try {
                const creator = await User.findById(req.user.id);
                if (creator) {
                    await Promise.all(safePartners.map(async (partnerId) => {
                        return Notification.create({
                            recipient: partnerId,
                            sender: req.user.id,
                            title: 'Convite de Colaboração! 🤝',
                            content: `${creator.name} convidou você para ser co-organizador do evento "${form.title}".`,
                            type: 'personal',
                            actionUrl: '/dashboard/mentor'
                        });
                    }));
                }
            } catch (notifErr) {
                console.error('Error notifying partners in createForm:', notifErr);
            }
        }

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
        console.log(`Fetching forms for user: ${req.user.id}`);
        const forms = await Form.find({
            $or: [
                { creator: req.user.id },
                { partners: req.user.id }
            ]
        }).populate('partners', 'name businessName profilePhoto').sort({ createdAt: -1 }).lean();

        console.log(`Found ${forms.length} forms`);

        const formsWithCount = await Promise.all(forms.map(async (form) => {
            const count = await Submission.countDocuments({ form: form._id });
            return { ...form, submissionCount: count };
        }));

        res.json(formsWithCount);
    } catch (err) {
        console.error("ERROR in getMyForms:", err);
        res.status(500).json({ message: 'Erro ao buscar formulários', error: err.message });
    }
};

exports.getFormBySlug = async (req, res) => {
    try {
        console.log(`Fetching form for slug: ${req.params.slug}`);
        const form = await Form.findOne({ slug: req.params.slug })
            .populate('creator')
            .populate('partners', 'name businessName profilePhoto');
        if (!form) {
            console.log(`Form not found for slug: ${req.params.slug}`);
            return res.status(404).json({ message: 'Form not found' });
        }

        // Get submission count to calculate remaining slots
        const submissionCount = await Submission.countDocuments({ form: form._id });

        res.json({
            ...form.toObject(),
            submissionCount
        });
    } catch (err) {
        console.error(`ERROR in getFormBySlug for slug "${req.params.slug}":`, err);
        res.status(500).json({ message: 'Erro ao buscar evento', error: err.message });
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

        const currentUser = await User.findById(req.user.id);
        if (!currentUser.isEmailVerified && !isAdmin) {
            return res.status(403).json({ message: 'Por favor, confirme seu e-mail para editar eventos.' });
        }

        // Update fields
        const { title, description, fields, theme, active, eventDate, eventTime, eventType, category, paymentConfig, coverImage, coverImageMode, logo, videoOrientation, capacity, extraCapacity, whatsappConfig, location, onlineLink, waitingVideo, showVideoOnStart, videoUrl, hubBackgroundImage, hubButtonColor, showHubButton, welcomeMessage, welcomeVideo, customFields, agenda, materials, certificateConfig, partners } = req.body;

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

        // Extra Capacity
        if (extraCapacity !== undefined) {
            const extraCap = parseInt(extraCapacity);
            if (!isNaN(extraCap)) {
                form.extraCapacity = extraCap;
            }
        }

        // Video & Display
        if (waitingVideo !== undefined) form.waitingVideo = waitingVideo;
        if (showVideoOnStart !== undefined) form.showVideoOnStart = showVideoOnStart;
        if (videoUrl !== undefined) form.videoUrl = videoUrl;
        if (videoOrientation !== undefined) form.videoOrientation = videoOrientation;

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

        if (partners !== undefined && Array.isArray(partners)) {
            const oldPartners = (form.partners || []).map(p => p.toString());
            const newPartners = partners.filter(p => p && !oldPartners.includes(p.toString()));

            form.partners = partners.filter(p => p && mongoose.Types.ObjectId.isValid(p));

            // Auto-add new partners to public visibility too
            if (newPartners.length > 0) {
                form.partnersPublic = [...(form.partnersPublic || []), ...newPartners];
            }

            // Remove partners that are no longer in the main partners list
            const partnerStrings = form.partners.map(p => p.toString());
            form.partnersPublic = (form.partnersPublic || []).filter(p => p && partnerStrings.includes(p.toString()));

            // Notify new partners
            if (newPartners.length > 0) {
                try {
                    const creator = await User.findById(req.user.id);
                    if (creator) {
                        await Promise.all(newPartners.map(async (partnerId) => {
                            if (!mongoose.Types.ObjectId.isValid(partnerId)) return;

                            return Notification.create({
                                recipient: partnerId,
                                sender: req.user.id,
                                title: 'Convite de Colaboração! 🤝',
                                content: `${creator.name} convidou você para ser co-organizador do evento "${form.title}".`,
                                type: 'personal',
                                actionUrl: '/dashboard/mentor'
                            });
                        }));
                    }
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
        await form.populate('partners', 'name businessName profilePhoto');

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
        console.log(`Admin fetching all forms. Admin user: ${req.user.id}`);
        const forms = await Form.find()
            .populate('creator', 'name email')
            .populate('partners', 'name businessName profilePhoto')
            .sort({ createdAt: -1 });
        console.log(`Found ${forms.length} total forms for admin`);
        res.json(forms);
    } catch (err) {
        console.error("ERROR in getAllFormsAdmin:", err);
        res.status(500).json({ message: 'Erro ao buscar todos os formulários (Admin)', error: err.message });
    }
};

exports.getFormsByMentor = async (req, res) => {
    try {
        console.log(`Fetching forms for mentor ID: ${req.params.mentorId}`);
        const forms = await Form.find({
            $or: [
                { creator: req.params.mentorId, active: true },
                { partners: req.params.mentorId, active: true }
            ]
        }).sort({ createdAt: -1 });
        console.log(`Found ${forms.length} public forms for mentor`);
        res.json(forms);
    } catch (err) {
        console.error(`ERROR in getFormsByMentor for ID ${req.params.mentorId}:`, err);
        res.status(500).json({ message: 'Erro ao buscar eventos do mentor', error: err.message });
    }
};

exports.recordVisit = async (req, res) => {
    try {
        const { slug } = req.params;
        const { visitorId, referrer, browser, os, deviceType, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = req.body;

        // 1. IP Tracking & Geo
        const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const ip = ipRaw.split(',')[0].trim();
        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : null;
        const city = geo ? geo.city : null;

        // 2. Prevent F5 Spam (5 min logic)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const existingVisit = visitorId ? await Visit.findOne({
            visitorId,
            page: `event/${slug}`,
            timestamp: { $gte: fiveMinutesAgo }
        }) : null;

        if (!existingVisit) {
            // 3. Create Detailed Visit Record
            const visit = new Visit({
                visitorId: visitorId || 'anonymous',
                ip,
                page: `event/${slug}`,
                referrer,
                browser,
                os,
                deviceType,
                country,
                city,
                utmSource,
                utmMedium,
                utmCampaign,
                utmContent,
                utmTerm
            });
            await visit.save();

            // 4. Increment simple counter on Form
            await Form.findOneAndUpdate(
                { slug },
                { $inc: { visits: 1 } }
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Record form visit error:", err);
        // Fail silently to frontend but log error
        res.status(200).json({ success: false });
    }
};

exports.getExploreEvents = async (req, res) => {
    try {
        const { category, search } = req.query;
        console.log(`Exploring events - Category: ${category}, Search: ${search}`);
        let query = { active: true };

        if (category && category !== 'Todos') {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const forms = await Form.find(query)
            .select('title slug coverImage hubBackgroundImage eventDate eventType category creator location onlineLink isSponsored')
            .populate('creator', 'name businessName')
            .sort({ isSponsored: -1, eventDate: 1 });

        console.log(`Found ${forms.length} events for explore`);
        res.json(forms);
    } catch (err) {
        console.error("ERROR in getExploreEvents:", err);
        res.status(500).json({ message: 'Erro ao buscar eventos para explorar', error: err.message });
    }
};
exports.togglePartnerVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const Form = require('../models/Form');
        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Formulário não encontrado' });

        const isPartner = form.partners.some(p => p.toString() === userId);
        if (!isPartner) return res.status(403).json({ message: 'Não autorizado' });

        const isPublic = form.partnersPublic && form.partnersPublic.some(p => p.toString() === userId);

        if (isPublic) {
            form.partnersPublic = form.partnersPublic.filter(p => p.toString() !== userId);
        } else {
            if (!form.partnersPublic) form.partnersPublic = [];
            form.partnersPublic.push(userId);
        }

        await form.save();
        res.json({ success: true, isPublic: !isPublic });
    } catch (err) {
        console.error('Toggle Visibility Error:', err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
};

exports.toggleSponsorship = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Evento não encontrado' });

        form.isSponsored = !form.isSponsored;
        await form.save();

        res.json({ success: true, isSponsored: form.isSponsored });
    } catch (err) {
        console.error('Toggle Sponsorship Error:', err);
        res.status(500).json({ message: 'Erro ao promover evento' });
    }
};
