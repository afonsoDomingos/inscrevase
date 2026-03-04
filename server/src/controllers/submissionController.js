const Submission = require('../models/Submission');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const { PLANS } = require('../config/stripe');
const { getDynamicPlanConfig } = require('../utils/planConfigs');
const { getLatestRate } = require('../utils/currencyUtils');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const SupportTicket = require('../models/SupportTicket');
const sendEmail = require('../utils/emailService');
const { logCommunication } = require('../utils/communicationLogger');
const { generateBasicEmail, generatePendingApprovalEmail, generateSignupIncentiveEmail, generateEventPaymentConfirmationEmail } = require('../utils/emailTemplates');

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

        // Capacity check
        if (form.capacity && form.capacity > 0) {
            const currentSubmissions = await Submission.countDocuments({ form: formId });
            const totalAllowed = form.capacity + (form.extraCapacity || 0);
            if (currentSubmissions >= totalAllowed) {
                console.warn(`[Submission] Capacity reached for form ${formId}: ${currentSubmissions}/${totalAllowed}`);
                return res.status(400).json({ message: 'Capacidade máxima atingida para este evento.' });
            }
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

        // Notify Creator and Partners (Non-blocking)
        // Try to find participant name in data with case-insensitive search
        let participantName = data.nome || data.name;
        if (!participantName) {
            const nameKey = Object.keys(data).find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('name'));
            if (nameKey) participantName = data[nameKey];
        }

        // Fallback to logged user name or default
        if (!participantName) {
            participantName = (req.user && req.user.name) ? req.user.name : 'Um novo participante';
        }
        try {
            console.log('[Submission] Sending notification to creator:', form.creator);
            const recipients = [form.creator, ...(form.partners || [])];

            await Promise.all(recipients.map(async (recipientId) => {
                await NotificationService.notify({
                    recipient: recipientId,
                    sender: req.user ? req.user.id : recipientId,
                    title: 'Nova Inscrição Recebida! 📩',
                    content: `${participantName} acabou de se inscrever em seu evento "${form.title}".`,
                    type: 'personal',
                    actionUrl: '/dashboard/mentor'
                });
            }));

            // Notify Creator via Email
            const mentor = await User.findById(form.creator);
            if (mentor && mentor.email) {
                const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentor`;

                // Use the new "Pending Approval" template if the form expects manual validation (default behavior)
                const emailHtml = generatePendingApprovalEmail(
                    mentor.name,
                    participantName,
                    form.title,
                    dashboardUrl
                );

                await sendEmail(mentor.email, `⏳ Aprovação Pendente: ${participantName} - ${form.title}`, emailHtml);

                await logCommunication({
                    recipientIds: [mentor._id],
                    recipientEmails: [mentor.email],
                    subject: `⏳ Aprovação Pendente: ${participantName} - ${form.title}`,
                    content: `Inscrição recebida para o evento "${form.title}".`,
                    status: 'sent'
                });

                // --- AUTOMATION: First Submission Ever ---
                if (!mentor.receivedFirstSubmissionNudge) {
                    const totalSubmissions = await Submission.countDocuments({
                        form: { $in: await Form.find({ creator: mentor._id }).distinct('_id') }
                    });

                    if (totalSubmissions === 1) {
                        const content = `Que momento fantástico! Acabamos de registar a <strong>primeira inscrição</strong> num evento criado por ti. Este é o início oficial da tua faturação e impacto através do teu conhecimento. O primeiro passo foi dado com sucesso!`;
                        const congratsHtml = generateBasicEmail(
                            '🎉 Parabéns! A tua PRIMEIRA inscrição chegou!',
                            mentor.name,
                            content,
                            'Ver Submissão',
                            dashboardUrl
                        );

                        await sendEmail(mentor.email, '🎉 Vitória! Recebeste a tua primeira inscrição! - Inscreva-se', congratsHtml);
                        await logCommunication({
                            recipientIds: [mentor._id],
                            recipientEmails: [mentor.email],
                            subject: '🎉 Vitória! Recebeste a tua primeira inscrição!',
                            content: `Parabéns pela sua primeira inscrição na plataforma!`,
                            status: 'sent'
                        });

                        // Mark as nudge sent
                        mentor.receivedFirstSubmissionNudge = true;
                        await mentor.save();
                    }
                }
                // ------------------------------------------
            }
        } catch (notifErr) {
            console.error('[Submission] Error sending notifications:', notifErr);
        }

        // ── SIGNUP INCENTIVE EMAIL (Non-blocking) ────────────────────────────
        // If the participant does NOT have a platform account, send an email
        // encouraging them to create one as a Participant.
        (async () => {
            try {
                // Only fire when the registrant is NOT a logged-in user
                if (!req.user) {
                    // Resolve the participant email from submission data
                    const emailKeys = ['email', 'Email', 'e-mail', 'E-mail', 'seu-email', 'seu e-mail'];
                    let participantEmail = null;
                    for (const key of emailKeys) {
                        if (data[key] && typeof data[key] === 'string') {
                            participantEmail = data[key].toLowerCase().trim();
                            break;
                        }
                    }
                    if (!participantEmail) {
                        const allValues = Object.values(data);
                        const found = allValues.find(v => typeof v === 'string' && v.includes('@') && v.includes('.'));
                        if (found) participantEmail = found.toLowerCase().trim();
                    }

                    if (participantEmail) {
                        // Check if an account already exists for this email
                        const existingUser = await User.findOne({ email: participantEmail }).select('_id').lean();
                        if (!existingUser) {
                            const signupUrl = `${process.env.FRONTEND_URL || 'https://inscreva-se.com'}/entrar?mode=register`;
                            const incentiveHtml = generateSignupIncentiveEmail(
                                participantName,
                                form.title,
                                signupUrl
                            );
                            await sendEmail(
                                participantEmail,
                                `💡 Cria a Tua Conta e Acompanha a Tua Inscrição em "${form.title}"`,
                                incentiveHtml
                            );
                            console.log('[Submission] Signup incentive email sent to:', participantEmail);
                        }
                    }
                }
            } catch (incentiveErr) {
                console.error('[Submission] Error sending signup incentive email:', incentiveErr);
            }
        })();
        // ─────────────────────────────────────────────────────────────────────

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

        // Check authorization (Creator, Partner, or Admin)
        const isCreator = form.creator.toString() === req.user.id;
        const isPartner = form.partners && form.partners.some(p => p.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        if (!isCreator && !isPartner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ form: req.params.formId }).sort('-submittedAt');

        // Fetch associated lessons for this form
        const lessons = await Lesson.find({ associatedEvents: req.params.formId }).select('_id');
        const lessonIds = lessons.map(l => l._id);

        // Enhance submissions with progress if lessons exist
        const submissionsWithProgress = await Promise.all(submissions.map(async (sub) => {
            const subObj = sub.toObject();
            if (lessonIds.length > 0 && sub.user) {
                const completedCount = await LessonProgress.countDocuments({
                    user: sub.user,
                    lesson: { $in: lessonIds },
                    completed: true
                });
                subObj.progress = {
                    total: lessonIds.length,
                    completed: completedCount,
                    percentage: Math.round((completedCount / lessonIds.length) * 100)
                };
            } else if (lessonIds.length > 0) {
                subObj.progress = { total: lessonIds.length, completed: 0, percentage: 0 };
            }
            return subObj;
        }));

        res.json(submissionsWithProgress);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`[Submission] Updating status of ${req.params.id} to ${status}`);

        const submission = await Submission.findById(req.params.id).populate('form');
        if (!submission) return res.status(404).json({ message: 'Inscrição não encontrada' });

        if (!submission.form) {
            console.error('[Submission] Submission exists but its associated form is missing');
            return res.status(400).json({ message: 'Erro de integridade: Formulário associado não encontrado' });
        }

        // Check authorization (Creator, Partner, or Admin)
        const isCreator = submission.form.creator.toString() === req.user.id;
        const isPartner = submission.form.partners && submission.form.partners.some(p => p.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        if (!isCreator && !isPartner && !isAdmin) {
            return res.status(403).json({ message: 'Acesso negado' });
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
                    const dynamicPlans = await getDynamicPlanConfig();
                    const planConfig = dynamicPlans[mentorPlan] || dynamicPlans.free || PLANS.free;
                    const amount = submission.form.paymentConfig.price || 0;
                    const platformFee = amount * planConfig.commissionRate;

                    const currency = submission.form.paymentConfig.currency || 'MZN';
                    const rate = currency.toUpperCase() === 'USD' ? await getLatestRate() : 1;

                    // Create manual transaction (Status: pending until mentor pays platform)
                    const transaction = new Transaction({
                        user: submission.user || mentor._id, // Use participant if exists, otherwise fallback to mentor or system
                        mentor: mentor._id,
                        form: submission.form._id,
                        submission: submission._id,
                        amount: amount,
                        currency: currency,
                        baseAmount: amount * rate,
                        exchangeRate: rate,
                        platformFee: platformFee,
                        basePlatformFee: platformFee * rate,
                        mentorEarnings: amount, // For manual, mentor already has 100% of money
                        baseMentorEarnings: amount * rate,
                        status: 'pending', // Pending platform fee reconciliation
                        paymentMethod: 'manual'
                    });

                    console.log('[Submission] Creating manual transaction for approved submission:', transaction._id);
                    await transaction.save();

                    // Also mark payment as paid in submission since it's approved
                    submission.paymentStatus = 'paid';
                }
            }
        }
        // -----------------------------------------------

        // --- NOTIFY PARTICIPANT OF APPROVAL ---
        if (status === 'approved') {
            try {
                // Find email in submission data if not linked to user
                let participantEmail = null;
                if (submission.user) {
                    const user = await User.findById(submission.user);
                    if (user) participantEmail = user.email;
                }

                if (!participantEmail) {
                    const dataObj = Object.fromEntries(submission.data);
                    const emailKeys = ['email', 'Email', 'e-mail', 'E-mail', 'seu-email', 'seu e-mail'];
                    for (const key of emailKeys) {
                        if (dataObj[key]) {
                            participantEmail = dataObj[key];
                            break;
                        }
                    }
                }

                if (participantEmail) {
                    const hubUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hub/${submission._id}`;
                    const signupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/entrar`;
                    const participantName = submission.data.get('nome') || submission.data.get('name') || 'Participante';

                    let emailHtml;

                    if (submission.form.paymentConfig?.enabled) {
                        const amount = submission.form.paymentConfig.price || 0;
                        const currency = submission.form.paymentConfig.currency || 'MZN';
                        emailHtml = generateEventPaymentConfirmationEmail(
                            participantName,
                            submission.form.title,
                            amount,
                            currency,
                            hubUrl
                        );
                    } else {
                        let content = `Olá ${participantName}! Temos ótimas notícias: a tua inscrição no evento "<strong>${submission.form.title}</strong>" foi aprovada com sucesso! Agora já tens acesso total ao Hub do Inscrito, onde poderás ver as aulas, descarregar materiais e (brevemente) obter o teu certificado.`;

                        // If participant doesn't have a linked account, add an incentive to create one
                        if (!submission.user) {
                            content += `<br><br>💡 **Dica Profissional:** Notamos que ainda não tens uma conta oficial no <strong>Inscreva-se</strong>. Sabias que ao criares uma conta gratuita (com o mesmo email desta inscrição), poderás gerir todos os teus eventos, cursos e certificados num único painel organizado? <a href="${signupUrl}">Clica aqui para criar a tua conta agora!</a>`;
                        }

                        emailHtml = generateBasicEmail(
                            '✅ Inscrição Confirmada!',
                            participantName,
                            content,
                            'Aceder ao Hub do Inscrito',
                            hubUrl,
                            '#28a745'
                        );
                    }

                    await sendEmail(participantEmail, `✅ Inscrição Confirmada: ${submission.form.title} - Inscreva-se`, emailHtml);

                    await logCommunication({
                        recipientIds: submission.user ? [submission.user] : [],
                        recipientEmails: [participantEmail],
                        subject: `✅ Inscrição Confirmada: ${submission.form.title}`,
                        content: `Inscrição aprovada para o evento "${submission.form.title}".`,
                        status: 'sent'
                    });
                    console.log('[Submission] Approval email sent to:', participantEmail);

                    // --- NEW: IN-APP NOTIFICATION FOR APPROVAL ---
                    if (submission.user) {
                        try {
                            await NotificationService.notify({
                                recipient: submission.user,
                                sender: submission.form.creator,
                                title: 'Inscrição Aprovada! 🎉',
                                content: `Sua inscrição no evento "${submission.form.title}" foi aprovada. Acesse agora o seu Hub!`,
                                type: 'personal',
                                actionUrl: `/hub/${submission._id}`
                            });
                        } catch (notifErr) {
                            console.error('[Submission] Error sending in-app approval notification:', notifErr);
                        }
                    }
                }
            } catch (emailErr) {
                console.error('[Submission] Error sending approval email:', emailErr);
            }
        } else if (status === 'rejected') {
            // --- NEW: NOTIFY PARTICIPANT OF REJECTION ---
            try {
                let participantEmail = null;
                if (submission.user) {
                    const user = await User.findById(submission.user);
                    if (user) participantEmail = user.email;
                }

                if (!participantEmail) {
                    const dataObj = Object.fromEntries(submission.data);
                    const emailKeys = ['email', 'Email', 'e-mail', 'E-mail', 'seu-email', 'seu e-mail'];
                    for (const key of emailKeys) {
                        if (dataObj[key]) {
                            participantEmail = dataObj[key];
                            break;
                        }
                    }
                }

                const participantName = submission.data.get('nome') || submission.data.get('name') || 'Participante';

                if (participantEmail) {
                    const content = `Olá ${participantName}. Informamos que sua inscrição no evento "<strong>${submission.form.title}</strong>" não pôde ser aprovada neste momento. <br><br>Se você acredita que houve um erro ou deseja fornecer mais informações (como um novo comprovativo), entre em contato diretamente com o mentor ou responda a este e-mail.`;

                    const emailHtml = generateBasicEmail(
                        '❌ Status da Inscrição',
                        participantName,
                        content,
                        'Contactar Suporte',
                        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/suporte`,
                        '#e02424' // Red color for rejection
                    );

                    await sendEmail(participantEmail, `⚠️ Atualização: Inscrição em ${submission.form.title}`, emailHtml);
                    await logCommunication({
                        recipientIds: submission.user ? [submission.user] : [],
                        recipientEmails: [participantEmail],
                        subject: `⚠️ Atualização: Inscrição em ${submission.form.title}`,
                        content: `Inscrição não pôde ser aprovada no momento.`,
                        status: 'sent'
                    });
                    console.log('[Submission] Rejection email sent to:', participantEmail);
                }

                // In-app notification
                if (submission.user) {
                    await NotificationService.notify({
                        recipient: submission.user,
                        sender: submission.form.creator,
                        title: 'Atualização na Inscrição ⚠️',
                        content: `Sua inscrição no evento "${submission.form.title}" não foi aprovada. Verifique seu e-mail para mais detalhes.`,
                        type: 'alert',
                        actionUrl: '/dashboard/participant'
                    });
                }
            } catch (rejErr) {
                console.error('[Submission] Error in rejection notification flow:', rejErr);
            }
        }
        // --------------------------------------

        await submission.save();
        res.json(submission);
    } catch (err) {
        console.error('[Submission] Error in updateStatus:', err);
        res.status(500).json({ message: 'Erro no servidor ao atualizar status', error: err.message });
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
        const isCreator = submission.form.creator.toString() === req.user.id;
        const isPartner = submission.form.partners && submission.form.partners.some(p => p.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';
        const isParticipant = submission.user && submission.user.toString() === req.user.id;

        if (!isCreator && !isPartner && !isAdmin && !isParticipant) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Submission.findByIdAndDelete(req.params.id);
        res.json({ message: 'Submission deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const requestCertificate = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Inscrição não encontrada' });

        // Ensure user is the one who made the submission
        if (submission.user && submission.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        if (submission.certificateStatus === 'approved') {
            return res.status(400).json({ message: 'Certificado já aprovado' });
        }

        submission.certificateStatus = 'requested';
        await submission.save();

        // Notify Mentor
        const form = await Form.findById(submission.form);
        if (form) {
            const dataMap = submission.data instanceof Map ? submission.data : new Map(Object.entries(submission.data || {}));
            const participantName = dataMap.get('nome') || dataMap.get('name') || (req.user ? req.user.name : 'Participante');

            await Notification.create({
                recipient: form.creator,
                sender: req.user.id,
                title: 'Solicitação de Certificado 🎓',
                content: `${participantName} solicitou o certificado para o evento "${form.title}".`,
                type: 'personal',
                actionUrl: `/dashboard/mentor`
            });
        }

        res.json({ message: 'Certificado solicitado com sucesso', submission });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao solicitar certificado', error: err.message });
    }
};

const updateCertificateStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'none' (rejected)
        const submission = await Submission.findById(req.params.id).populate('form');
        if (!submission) return res.status(404).json({ message: 'Inscrição não encontrada' });

        // Check authorization (Creator, Partner, or Admin)
        const isCreator = submission.form.creator.toString() === req.user.id;
        const isPartner = submission.form.partners && submission.form.partners.some(p => p.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        if (!isCreator && !isPartner && !isAdmin) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        submission.certificateStatus = status;
        if (status === 'approved') {
            submission.certificateIssuedAt = new Date();
        }

        await submission.save();

        // Notify Participant
        if (submission.user) {
            await Notification.create({
                recipient: submission.user,
                sender: req.user.id,
                title: status === 'approved' ? 'Certificado Liberado! 🎓' : 'Certificado não aprovado',
                content: status === 'approved'
                    ? `Seu certificado para o evento "${submission.form.title}" foi aprovado pelo mentor e já está disponível para download.`
                    : `Houve um problema com sua solicitação de certificado para "${submission.form.title}". Entre em contato com o mentor.`,
                type: 'personal',
                actionUrl: `/hub/${submission._id}`
            });
        }

        res.json({ message: 'Status do certificado atualizado', submission });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao atualizar status do certificado', error: err.message });
    }
};

const bulkUpdateSubmissions = async (req, res) => {
    try {
        const { submissionIds, status, action } = req.body;
        if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
            return res.status(400).json({ message: 'Nenhuma inscrição selecionada' });
        }

        console.log(`[Submission] Bulk ${action || 'status update'} for ${submissionIds.length} items to ${status}`);

        // Get all target submissions to verify ownership
        const submissions = await Submission.find({ _id: { $in: submissionIds } }).populate('form');

        // Filter those that the user is authorized to modify
        const authorizedSubmissions = submissions.filter(sub => {
            const isCreator = sub.form.creator.toString() === req.user.id;
            const isPartner = sub.form.partners && sub.form.partners.some(p => p.toString() === req.user.id);
            const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';
            return isCreator || isPartner || isAdmin;
        });

        if (authorizedSubmissions.length === 0) {
            return res.status(403).json({ message: 'Não autorizado para modificar estas inscrições' });
        }

        const authorizedIds = authorizedSubmissions.map(s => s._id);

        if (action === 'delete') {
            await Submission.deleteMany({ _id: { $in: authorizedIds } });
            return res.json({ success: true, message: `${authorizedIds.length} inscrições eliminadas com sucesso` });
        }

        // For status updates, we loop to trigger the notification and financial logic
        // This is safer than updateMany which bypasses middleware/hooks and manual logic
        const results = await Promise.all(authorizedSubmissions.map(async (sub) => {
            try {
                // Reuse existing updateStatus logic but locally
                sub.status = status;

                // Logic for notification & finance (simplified version of updateStatus)
                if (status === 'approved' && sub.form.paymentConfig?.enabled) {
                    const existingTx = await Transaction.findOne({ submission: sub._id });
                    if (!existingTx) {
                        const mentor = await User.findById(sub.form.creator);
                        if (mentor) {
                            const mentorPlan = mentor.plan || 'free';
                            const dynamicPlans = await getDynamicPlanConfig();
                            const planConfig = dynamicPlans[mentorPlan] || dynamicPlans.free || PLANS.free;
                            const amount = sub.form.paymentConfig.price || 0;
                            const platformFee = amount * planConfig.commissionRate;
                            const currency = sub.form.paymentConfig.currency || 'MZN';
                            const rate = currency.toUpperCase() === 'USD' ? await getLatestRate() : 1;

                            const transaction = new Transaction({
                                user: sub.user || mentor._id,
                                mentor: mentor._id,
                                form: sub.form._id,
                                submission: sub._id,
                                amount, currency,
                                baseAmount: amount * rate,
                                exchangeRate: rate,
                                platformFee,
                                basePlatformFee: platformFee * rate,
                                mentorEarnings: amount,
                                baseMentorEarnings: amount * rate,
                                status: 'pending', paymentMethod: 'manual'
                            });
                            await transaction.save();
                            sub.paymentStatus = 'paid';
                        }
                    }
                }

                // Notifications
                if (status === 'approved' || status === 'rejected') {
                    let participantEmail = null;
                    if (sub.user) {
                        const user = await User.findById(sub.user);
                        if (user) participantEmail = user.email;
                    }

                    if (!participantEmail) {
                        const dataObj = sub.data instanceof Map ? Object.fromEntries(sub.data) : (typeof sub.data === 'object' ? sub.data : {});
                        const emailKeys = ['email', 'Email', 'e-mail', 'E-mail', 'seu-email', 'seu e-mail'];
                        for (const key of emailKeys) {
                            if (dataObj[key]) { participantEmail = dataObj[key]; break; }
                        }
                    }

                    if (participantEmail) {
                        const participantName = (sub.data instanceof Map ? sub.data.get('nome') : sub.data.nome) || 'Participante';
                        const hubUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hub/${sub._id}`;

                        let content = status === 'approved'
                            ? `Olá ${participantName}! Temos ótimas notícias: a tua inscrição no evento "<strong>${sub.form.title}</strong>" foi aprovada com sucesso!`
                            : `Olá ${participantName}. Informamos que sua inscrição no evento "<strong>${sub.form.title}</strong>" não pôde ser aprovada neste momento.`;

                        const title = status === 'approved' ? '✅ Inscrição Confirmada!' : '❌ Status da Inscrição';
                        const color = status === 'approved' ? '#28a745' : '#e02424';

                        const emailHtml = generateBasicEmail(title, participantName, content, status === 'approved' ? 'Aceder ao Hub' : 'Contactar Suporte', status === 'approved' ? hubUrl : '/suporte', color);
                        sendEmail(participantEmail, `${title}: ${sub.form.title}`, emailHtml);
                    }

                    if (sub.user) {
                        await NotificationService.notify({
                            recipient: sub.user,
                            sender: sub.form.creator,
                            title: status === 'approved' ? 'Inscrição Aprovada! 🎉' : 'Atualização na Inscrição ⚠️',
                            content: status === 'approved' ? `Sua inscrição em "${sub.form.title}" foi aprovada.` : `Sua inscrição em "${sub.form.title}" não foi aprovada.`,
                            type: status === 'approved' ? 'personal' : 'alert',
                            actionUrl: status === 'approved' ? `/hub/${sub._id}` : '/dashboard/participant'
                        });
                    }
                }

                await sub.save();
                return { id: sub._id, success: true };
            } catch (err) {
                return { id: sub._id, success: false, error: err.message };
            }
        }));

        res.json({
            success: true,
            message: `${results.filter(r => r.success).length} inscrições atualizadas com sucesso`,
            results
        });

    } catch (err) {
        console.error('[Submission] Bulk error:', err);
        res.status(500).json({ message: 'Erro ao processar atualização em massa', error: err.message });
    }
};

module.exports = {
    submitForm,
    getFormSubmissions,
    updateStatus,
    bulkUpdateSubmissions,
    getAllSubmissionsAdmin,
    getMySubmissions,
    getSubmissionPublic,
    analyzeReceipt,
    deleteSubmission,
    requestCertificate,
    updateCertificateStatus
};
