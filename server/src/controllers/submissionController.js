const Submission = require('../models/Submission');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { PLANS } = require('../config/stripe');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const SupportTicket = require('../models/SupportTicket');

const submitForm = async (req, res) => {
    console.log('[Submission] Starting submission process for form:', req.body.formId);
    try {
        const { formId, data, paymentProof } = req.body;

        if (!data || typeof data !== 'object') {
            console.error('[Submission] Invalid data provided:', data);
            return res.status(400).json({ message: 'Dados do formulário inválidos' });
        }

        const form = await Form.findById(formId);
        if (!form || !form.active) {
            console.error('[Submission] Form not found or inactive:', formId);
            return res.status(404).json({ message: 'Form not found or inactive' });
        }

        const submissionData = {
            form: formId,
            data,
            paymentProof
        };

        // Link the submission
        if (req.user) {
            console.log('[Submission] User is logged in, linking to:', req.user.id);
            submissionData.user = req.user.id;
        } else {
            // Try to find email in data and link to existing user
            const emailKeys = ['email', 'Email', 'e-mail', 'E-mail', 'seu-email', 'seu e-mail'];
            let foundEmail = null;

            for (const key of emailKeys) {
                if (data[key] && typeof data[key] === 'string') {
                    foundEmail = data[key];
                    break;
                }
            }

            if (!foundEmail) {
                // Try searching all keys for something that looks like an email if no common key found
                const allValues = Object.values(data);
                foundEmail = allValues.find(v => typeof v === 'string' && v.includes('@') && v.includes('.'));
            }

            if (foundEmail && typeof foundEmail === 'string') {
                console.log('[Submission] Found email in submission data:', foundEmail);
                try {
                    const existingUser = await User.findOne({ email: foundEmail.toLowerCase().trim() });
                    if (existingUser) {
                        console.log('[Submission] Linking submission to existing user:', existingUser._id);
                        submissionData.user = existingUser._id;
                    }
                } catch (linkError) {
                    console.error("Error linking submission to user:", linkError);
                }
            }
        }

        const submission = new Submission(submissionData);
        await submission.save();
        console.log('[Submission] Submission saved successfully:', submission._id);

        // Notify Mentor (Non-blocking)
        const participantName = data.nome || data.name || (req.user ? req.user.name : 'Um novo participante');
        try {
            console.log('[Submission] Sending notification to mentor:', form.creator);
            const notification = new Notification({
                recipient: form.creator,
                sender: req.user ? req.user.id : form.creator, // If guest, sender is self (or system)
                title: 'Nova Inscrição Recebida! 📩',
                content: `${participantName} acabou de se inscrever em seu evento "${form.title}".`,
                type: 'personal',
                actionUrl: '/dashboard/mentor'
            });
            await notification.save();
        } catch (notifErr) {
            console.error('[Submission] Error sending notification:', notifErr);
        }

        // AUTOMATIC WELCOME MESSAGE (Non-blocking)
        // Only if we have a user to reply to
        if (req.user && submissionData.user && req.user.id !== form.creator.toString()) {
            console.log('[Submission] Creating welcome support ticket for user:', submissionData.user);
            try {
                const welcomeText = form.welcomeMessage || `Olá ${participantName.split(' ')[0]}! Obrigado por se inscrever no evento "${form.title}". Se tiver alguma dúvida, pode mandar por aqui.`;

                await SupportTicket.create({
                    user: submissionData.user, // Use the linked user ID
                    mentor: form.creator,
                    subject: `Bem-vindo: ${form.title}`,
                    messages: [{
                        sender: 'mentor',
                        content: welcomeText
                    }],
                    unreadByUser: true
                });
            } catch (ticketErr) {
                console.error('[Submission] Error creating welcome ticket:', ticketErr);
            }
        } else if (!req.user && submissionData.user) {
            // If guest became linked user, we can still try to create ticket
            console.log('[Submission] Creating welcome support ticket for LINKED guest user:', submissionData.user);
            try {
                const welcomeText = form.welcomeMessage || `Olá ${participantName.split(' ')[0]}! Obrigado por se inscrever no evento "${form.title}". Se tiver alguma dúvida, pode mandar por aqui.`;

                await SupportTicket.create({
                    user: submissionData.user,
                    mentor: form.creator,
                    subject: `Bem-vindo: ${form.title}`,
                    messages: [{
                        sender: 'mentor',
                        content: welcomeText
                    }],
                    unreadByUser: true
                });
            } catch (ticketErr) {
                console.error('[Submission] Error creating welcome ticket (guest):', ticketErr);
            }
        }

        res.status(201).json({ message: 'Inscrição enviada com sucesso', submission });
    } catch (err) {
        console.error('[Submission] CRITICAL ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getFormSubmissions = async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Check ownership
        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ form: req.params.formId }).sort('-submittedAt');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const submission = await Submission.findById(req.params.id).populate('form');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        // Check ownership of the form
        if (submission.form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        submission.status = status;

        // --- NEW FINANCIAL LOGIC FOR MANUAL PAYMENTS ---
        if (status === 'approved' && submission.form.paymentConfig?.enabled) {
            // Check if transaction already exists (avoid duplicates)
            const existingTx = await Transaction.findOne({ submission: submission._id });

            if (!existingTx) {
                const mentor = await User.findById(submission.form.creator);
                if (mentor) {
                    const mentorPlan = mentor.plan || 'free';
                    const planConfig = PLANS[mentorPlan] || PLANS.free;
                    const amount = submission.form.paymentConfig.price || 0;
                    const platformFee = amount * planConfig.commissionRate;

                    // Create manual transaction (Status: pending until mentor pays platform)
                    const transaction = new Transaction({
                        user: mentor._id,
                        mentor: mentor._id,
                        form: submission.form._id,
                        submission: submission._id,
                        amount: amount,
                        currency: submission.form.paymentConfig.currency || 'MT',
                        platformFee: platformFee,
                        mentorEarnings: amount, // For manual, mentor already has 100% of money
                        status: 'pending', // Pending platform fee reconciliation
                        paymentMethod: 'manual'
                    });
                    await transaction.save();

                    // Also mark payment as paid in submission since it's approved
                    submission.paymentStatus = 'paid';
                }
            }
        }
        // -----------------------------------------------

        await submission.save();
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllSubmissionsAdmin = async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('form', 'title slug')
            .sort('-submittedAt')
            .limit(100);
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let query = {};

        if (userRole === 'participant') {
            // If participant, return submissions THEY made
            query = { user: userId };
        } else {
            // If mentor/admin, return submissions for forms THEY created
            const myForms = await Form.find({ creator: userId }).select('_id');
            const formIds = myForms.map(f => f._id);
            query = { form: { $in: formIds } };
        }

        const submissions = await Submission.find(query)
            .populate({
                path: 'form',
                select: 'title slug coverImage hubBackgroundImage eventDate eventTime location category creator',
                populate: {
                    path: 'creator',
                    select: 'name businessName'
                }
            })
            .sort('-submittedAt');

        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getSubmissionPublic = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate({
                path: 'form',
                select: 'title description coverImage hubBackgroundImage hubButtonColor showHubButton logo eventDate eventTime eventType location onlineLink waitingVideo showVideoOnStart whatsappConfig theme creator welcomeMessage welcomeVideo customFields agenda materials certificateConfig',
                populate: {
                    path: 'creator',
                    select: 'name profilePhoto bio socialLinks facebookPixelId'
                }
            });

        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const analyzeReceipt = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);
        if (!submission || !submission.paymentProof) {
            return res.status(404).json({ message: 'Recibo não encontrado' });
        }

        // Gemini Vision API logic
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Você é um assistente financeiro moçambicano especializado em validar capturas de ecrã (screenshots) de pagamentos.
            Analise esta imagem e extraia as seguintes informações em formato JSON rigoroso:
            - transactionId: O código da transação (ex: MZN.... ou ID da transferência)
            - amount: O valor numérico (apenas o número)
            - currency: "MT" ou "USD"
            - date: A data da transação
            - isValid: true se parecer um recibo real e legível, false caso contrário
            - confidence: 0-100
            - warning: Qualquer suspeita de fraude ou edição de imagem.
            
            Se não for um recibo, retorne isValid: false.
            Resposta apenas em JSON.
        `;

        // Fetch image and convert to base64
        const response = await fetch(submission.paymentProof);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{.*\}/s);
        const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Falha na análise da IA" };

        submission.aiAnalysis = aiAnalysis;
        await submission.save();

        res.json({ success: true, analysis: aiAnalysis });
    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ message: "Erro na análise de IA", error: error.message });
    }
};

const deleteSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate('form');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        // Check ownership (Mentor, Admin, or the Participant themselves)
        const isMentor = submission.form.creator.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';
        const isParticipant = submission.user && submission.user.toString() === req.user.id;

        if (!isMentor && !isAdmin && !isParticipant) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Submission.findByIdAndDelete(req.params.id);
        res.json({ message: 'Submission deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    submitForm,
    getFormSubmissions,
    updateStatus,
    getAllSubmissionsAdmin,
    getMySubmissions,
    getSubmissionPublic,
    analyzeReceipt,
    deleteSubmission
};
