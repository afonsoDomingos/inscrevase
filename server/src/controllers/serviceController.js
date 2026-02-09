const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Mentor, Company, Specialist)
exports.createService = async (req, res) => {
    try {
        const { title, description, category, price, currency, images, tags, contactInfo, delivery, duration } = req.body;

        // Validate role
        if (!['mentor', 'company', 'specialist'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Apenas mentores, empresas e especialistas podem criar serviços' });
        }

        const service = new Service({
            creator: req.user.id,
            title,
            description,
            category,
            price,
            currency,
            images: images || [],
            tags: tags || [],
            contactInfo: contactInfo || {},
            delivery,
            duration
        });

        await service.save();

        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Erro ao criar serviço', error: error.message });
    }
};

// @desc    Get all services (with filters)
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
    try {
        const { category, creator, search, featured } = req.query;

        const query = { active: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (creator) {
            query.creator = creator;
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (featured === 'true') {
            query.featured = true;
        }

        const services = await Service.find(query)
            .populate('creator', 'name businessName profilePhoto role country')
            .sort({ featured: -1, createdAt: -1 })
            .limit(50);

        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Erro ao buscar serviços' });
    }
};

// @desc    Get services by creator (my services)
// @route   GET /api/services/my-services
// @access  Private
exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ creator: req.user.id })
            .sort({ createdAt: -1 });

        res.json(services);
    } catch (error) {
        console.error('Error fetching my services:', error);
        res.status(500).json({ message: 'Erro ao buscar seus serviços' });
    }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('creator', 'name businessName profilePhoto role country email');

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Erro ao buscar serviço' });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Owner only)
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        // Check ownership
        if (service.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Erro ao atualizar serviço' });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Owner only)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        // Check ownership
        if (service.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        await service.deleteOne();

        res.json({ message: 'Serviço deletado com sucesso' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Erro ao deletar serviço' });
    }
};

// @desc    Toggle service active status
// @route   PATCH /api/services/:id/toggle-status
// @access  Private (Owner only)
exports.toggleServiceStatus = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        // Check ownership
        if (service.creator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        service.active = !service.active;
        await service.save();

        res.json(service);
    } catch (error) {
        console.error('Error toggling service status:', error);
        res.status(500).json({ message: 'Erro ao alterar status do serviço' });
    }
};

// @desc    Increment inquiry count (when someone contacts about service)
// @route   POST /api/services/:id/inquiry
// @access  Public
exports.incrementInquiry = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { $inc: { inquiries: 1 } },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        res.json({ message: 'Interesse registrado', service });
    } catch (error) {
        console.error('Error incrementing inquiry:', error);
        res.status(500).json({ message: 'Erro ao registrar interesse' });
    }
};
