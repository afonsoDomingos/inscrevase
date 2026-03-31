const Vacancy = require('../models/Vacancy');
const JobApplication = require('../models/JobApplication');

/**
 * Public - Get all active vacancies
 */
exports.getPublicVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find({ active: true }).sort({ createdAt: -1 });
        res.status(200).json(vacancies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vacancies', error: error.message });
    }
};

/**
 * Public - Get vacancy by slug
 */
exports.getVacancyBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const vacancy = await Vacancy.findOne({ slug, active: true });
        if (!vacancy) return res.status(404).json({ message: 'Vaga não encontrada' });
        res.status(200).json(vacancy);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vacancy', error: error.message });
    }
};

/**
 * Public - Submit application
 */
exports.submitApplication = async (req, res) => {
    try {
        const { vacancyId, fullName, age, email, phone, city, cvUrl, photoUrl, motivationLetter, answers } = req.body;
        
        const application = new JobApplication({
            vacancyId,
            fullName,
            age,
            email,
            phone,
            city,
            cvUrl,
            photoUrl,
            motivationLetter,
            answers,
            metadata: {
                ip: req.ip,
                userAgent: req.headers['user-agent']
            }
        });
        
        await application.save();
        res.status(201).json({ success: true, message: 'Candidatura enviada com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao submeter candidatura', error: error.message });
    }
};

/**
 * Admin - Create Vacancy
 */
exports.createVacancy = async (req, res) => {
    try {
        const { title, description, requirements, location, type, image, category, questions } = req.body;
        const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
        
        const vacancy = new Vacancy({
            title,
            slug,
            description,
            requirements,
            location,
            type,
            image,
            category,
            questions,
            createdBy: req.user.id
        });
        
        await vacancy.save();
        res.status(201).json(vacancy);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vacancy', error: error.message });
    }
};

/**
 * Admin - Update Vacancy
 */
exports.updateVacancy = async (req, res) => {
    try {
        const { id } = req.params;
        const vacancy = await Vacancy.findByIdAndUpdate(id, req.body, { new: true });
        if (!vacancy) return res.status(404).json({ message: 'Vaga não encontrada' });
        res.status(200).json(vacancy);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar vaga', error: error.message });
    }
};

/**
 * Admin - Get all vacancies (active and inactive)
 */
exports.getAdminVacancies = async (req, res) => {
    try {
        const vacancies = await Vacancy.find().sort({ createdAt: -1 });
        res.status(200).json(vacancies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Delete Vacancy
 */
exports.deleteVacancy = async (req, res) => {
    try {
        await Vacancy.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Vaga removida' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Admin - Get Applications for a vacancy
 */
exports.getApplications = async (req, res) => {
    try {
        const { vacancyId } = req.query;
        const filter = vacancyId ? { vacancyId } : {};
        const applications = await JobApplication.find(filter)
            .populate('vacancyId', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
