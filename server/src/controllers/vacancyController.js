const Vacancy = require('../models/Vacancy');
const JobApplication = require('../models/JobApplication');
const sendEmail = require('../utils/emailService');
const { generateApplicationConfirmationEmail, generateBasicEmail } = require('../utils/emailTemplates');
const User = require('../models/User');

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

        // Background Tasks: Send Confirmation Emails
        (async () => {
            try {
                const vacancy = await Vacancy.findById(vacancyId).populate('createdBy');
                if (!vacancy) return;

                // 1. Email to Candidate
                const candidateEmailHtml = generateApplicationConfirmationEmail(fullName, vacancy.title);
                await sendEmail(email, `✅ Candidatura Recebida: ${vacancy.title} - Inscreva-se`, candidateEmailHtml);

                // 2. Email to Recruiter
                if (vacancy.createdBy && vacancy.createdBy.email) {
                    const recruiterEmailHtml = generateBasicEmail(
                        '📩 Nova Candidatura Recebida!',
                        vacancy.createdBy.name || 'Recrutador',
                        `Recebeu uma nova candidatura para a vaga <strong>${vacancy.title}</strong>.<br><br>Candidato: <strong>${fullName}</strong><br>Cidade: ${city}<br><br>Aceda ao painel administrativo para rever o currículo e os detalhes do perfil.`,
                        'Ver Candidaturas',
                        `${process.env.FRONTEND_URL || 'https://inscreva-se.com'}/dashboard/mentor`
                    );
                    await sendEmail(vacancy.createdBy.email, `📩 Nova Candidatura: ${fullName} - ${vacancy.title}`, recruiterEmailHtml);
                }

                // 3. Email to SuperAdmins
                const superAdmins = await User.find({ role: 'SuperAdmin' });
                for (const admin of superAdmins) {
                    if (admin.email) {
                        const adminEmailHtml = generateBasicEmail(
                            '🚀 Alerta: Nova Candidatura na Plataforma',
                            admin.name || 'Admin',
                            `Uma nova candidatura foi submetida na plataforma para a vaga <strong>${vacancy.title}</strong>.<br><br>Candidato: <strong>${fullName}</strong><br>Recrutador Responsável: ${vacancy.createdBy?.name || '---'}<br><br>Status: Aguardando revisão.`,
                            'Ir para o Painel',
                            `${process.env.FRONTEND_URL || 'https://inscreva-se.com'}/dashboard/admin`
                        );
                        await sendEmail(admin.email, `🚀 [ADMIN] Nova Candidatura: ${fullName} - ${vacancy.title}`, adminEmailHtml);
                    }
                }
            } catch (emailErr) {
                console.error('Error in vacancy application background emails:', emailErr);
            }
        })();
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
        const vacancy = await Vacancy.findById(id);
        
        if (!vacancy) return res.status(404).json({ message: 'Vaga não encontrada' });

        // Check ownership
        if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin' && vacancy.createdBy?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Não tem permissão para editar esta vaga.' });
        }

        const updatedVacancy = await Vacancy.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedVacancy);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar vaga', error: error.message });
    }
};

/**
 * Admin - Get all vacancies (active and inactive)
 */
exports.getAdminVacancies = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            filter = { createdBy: req.user.id };
        }
        const vacancies = await Vacancy.find(filter).sort({ createdAt: -1 });
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
        const { id } = req.params;
        const vacancy = await Vacancy.findById(id);

        if (!vacancy) return res.status(404).json({ message: 'Vaga não encontrada' });

        // Check ownership
        if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin' && vacancy.createdBy?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Não tem permissão para remover esta vaga.' });
        }

        await Vacancy.findByIdAndDelete(id);
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
        let filter = {};
        
        // If not admin, we must ONLY show applications for vacancies CREATED BY the user
        if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            const userVacancies = await Vacancy.find({ createdBy: req.user.id }).select('_id');
            const userVacancyIds = userVacancies.map(v => v._id);
            
            if (vacancyId) {
                if (!userVacancyIds.some(id => id.toString() === vacancyId)) {
                    return res.status(403).json({ message: 'Acesso negado a estas candidaturas.' });
                }
                filter = { vacancyId };
            } else {
                filter = { vacancyId: { $in: userVacancyIds } };
            }
        } else {
            if (vacancyId) filter = { vacancyId };
        }

        const applications = await JobApplication.find(filter)
            .populate('vacancyId', 'title')
            .sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
