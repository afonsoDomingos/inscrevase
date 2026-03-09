const cron = require('node-cron');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Form = require('../models/Form');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const sendEmail = require('../utils/emailService');
const {
    generatePendingApprovalEmail,
    generateReferralBonusEmail,
    generateBasicEmail
} = require('../utils/emailTemplates');
const { logCommunication } = require('../utils/communicationLogger');

/**
 * Automation Service
 * Handles scheduled tasks and automated communications
 */

const initAutomations = () => {
    console.log('🚀 [AutomationService] Initializing automated tasks...');

    // 1. Every 12 hours: Check for pending submissions older than 24h
    // Cron: 0 */12 * * *
    cron.schedule('0 */12 * * *', async () => {
        console.log('🔍 [Automation] Checking for pending registrations...');
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Find pending submissions
            const pendingSubmissions = await Submission.find({
                status: 'pending',
                submittedAt: { $lt: twentyFourHoursAgo }
            }).populate('form');

            // Group by mentor to avoid spamming
            const mentorMap = new Map();

            for (const sub of pendingSubmissions) {
                if (sub.form && sub.form.creator) {
                    const mentorId = sub.form.creator.toString();
                    if (!mentorMap.has(mentorId)) {
                        mentorMap.set(mentorId, {
                            mentorId,
                            count: 0,
                            eventTitle: sub.form.title
                        });
                    }
                    mentorMap.get(mentorId).count++;
                }
            }

            // Send reminders
            for (const [mentorId, info] of mentorMap) {
                const mentor = await User.findById(mentorId);
                if (mentor && mentor.email) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentor`;
                    const content = `Olá ${mentor.name}! Notamos que tens <strong>${info.count} inscrições</strong> pendentes de aprovação no evento "<strong>${info.eventTitle}</strong>" há mais de 24 horas. Validar estes alunos rapidamente aumenta a tua taxa de retenção!`;

                    const emailHtml = generateBasicEmail(
                        '⌛ Lembrete: Inscrições Pendentes',
                        mentor.name,
                        content,
                        'Aceder ao Painel',
                        dashboardUrl,
                        '#D4AF37'
                    );

                    await sendEmail(mentor.email, `⌛ Lembrete: ${info.count} Inscrições Pendentes - Inscreva-se`, emailHtml);
                    await logCommunication({
                        recipientIds: [mentor._id],
                        recipientEmails: [mentor.email],
                        subject: `⌛ Lembrete: ${info.count} Inscrições Pendentes`,
                        content: `Aviso automático de inscrições aguardando aprovação há mais de 24h.`,
                        status: 'sent'
                    });
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Pending check error:', err);
        }
    });

    // 2. Every 24 hours: Check for completed events to send stats recap
    // Cron: 0 10 * * * (Every day at 10 AM)
    cron.schedule('0 10 * * *', async () => {
        console.log('🔍 [Automation] Checking for completed events...');
        try {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
            const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

            const finishedEvents = await Form.find({
                eventDate: { $gte: startOfYesterday, $lte: endOfYesterday }
            });

            for (const event of finishedEvents) {
                const mentor = await User.findById(event.creator);
                if (mentor && mentor.email) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentor`;
                    const content = `Parabéns pelo encerramento do evento "<strong>${event.title}</strong>"! Os dados de performance e a lista final de participantes já estão consolidados no teu dashboard. Analisar estes números é o segredo para escala do teu próximo projeto.`;

                    const emailHtml = generateBasicEmail(
                        '📊 Resumo de Performance Disponível',
                        mentor.name,
                        content,
                        'Ver Estatísticas',
                        dashboardUrl,
                        '#D4AF37'
                    );

                    await sendEmail(mentor.email, `📊 Resultados: ${event.title} - Inscreva-se`, emailHtml);
                    await logCommunication({
                        recipientIds: [mentor._id],
                        recipientEmails: [mentor.email],
                        subject: `📊 Resultados: ${event.title}`,
                        content: `Resumo de performance de evento finalizado enviado ao mentor.`,
                        status: 'sent'
                    });
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Event stats error:', err);
        }
    });

    // 3. Referral Milestone: Automatically invite high-performers to Ambassador Program
    // This could also be logic-based on point update, but a cron check is safer/batchable
    cron.schedule('0 12 * * *', async () => {
        console.log('🔍 [Automation] Checking for new referral milestones...');
        try {
            // Find users with 100+ points who aren't ambassadors yet (logic placeholder)
            const topPerformers = await User.find({
                referralPoints: { $gte: 100 },
                role: { $ne: 'admin' }
                // Here you could add a flag like `isAmbassadorInvited: false`
            }).limit(10); // Batch it

            for (const user of topPerformers) {
                const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/participant`;
                const content = `Notamos o teu impacto incrível na plataforma! Com o teu saldo de pontos, és elegível para o nosso <strong>Programa de Embaixadores Inscreva-se</strong>. Isso pode dar-te acesso a Taxa Zero em vendas e destaque prioritário na homepage. Queres subir de nível?`;

                const emailHtml = generateBasicEmail(
                    '🏆 Convite Especial: Programa de Embaixadores',
                    user.name,
                    content,
                    'Saber Mais no Painel',
                    dashboardUrl,
                    '#D4AF37'
                );

                await sendEmail(user.email, '🏆 Convite VIP: Torna-te um Embaixador - Inscreva-se', emailHtml);
            }
        } catch (err) {
            console.error('❌ [Automation] Referral milestone error:', err);
        }
    });

    // 4. Every 6 hours: Nudge new users who haven't created an event within 24h
    cron.schedule('0 */6 * * *', async () => {
        console.log('🔍 [Automation] Checking for users needing an onboarding nudge...');
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Find users created more than 24h ago, but less than 7 days (to target recent ones)
            // who haven't been nudged yet and are mentors
            const potentialUsers = await User.find({
                onboardingNudgeSent: false,
                createdAt: { $lt: twentyFourHoursAgo },
                role: { $in: ['mentor', 'specialist', null] }
            });

            for (const user of potentialUsers) {
                // Check if they have ANY event
                const eventCount = await Form.countDocuments({ creator: user._id });

                if (eventCount === 0) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentor`;
                    const content = `Olá ${user.name}! Vimos que te juntaste ao <strong>Inscreva-se</strong>, mas ainda não publicaste o teu primeiro evento. O teu conhecimento é o teu maior ativo! Sabias que podes criar um formulário de inscrição profissional em menos de 5 minutos e começar a faturar? Vamos colocar o teu primeiro projeto no ar hoje?`;

                    const emailHtml = generateBasicEmail(
                        '💡 Começa hoje: Ganha com o teu Conhecimento',
                        user.name,
                        content,
                        'Criar Meu Primeiro Evento',
                        dashboardUrl,
                        '#D4AF37'
                    );

                    await sendEmail(user.email, '💡 Dica: Começa a faturar com o teu conhecimento - Inscreva-se', emailHtml);
                    await logCommunication({
                        recipientIds: [user._id],
                        recipientEmails: [user.email],
                        subject: '💡 Dica: Começa a faturar hoje',
                        content: `Nudge de onboarding enviado a novo mentor sem eventos.`,
                        status: 'sent'
                    });

                    // Mark as sent
                    user.onboardingNudgeSent = true;
                    await user.save();
                } else {
                    // If they already have an event, just mark as true so we don't check again
                    user.onboardingNudgeSent = true;
                    await user.save();
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Onboarding nudge error:', err);
        }
    });

    // 5. Every 12 hours: Nudge mentors with low event visits after 48h
    cron.schedule('0 */12 * * *', async () => {
        console.log('🔍 [Automation] Checking for events needing a visibility nudge...');
        try {
            const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

            // Find active forms created more than 48h ago but less than 10 days
            // with less than 10 visits and nudge not sent yet
            const strugglingForms = await Form.find({
                active: true,
                lowVisitsNudgeSent: false,
                createdAt: { $lt: fortyEightHoursAgo },
                visits: { $lt: 10 }
            }).populate('creator');

            for (const form of strugglingForms) {
                const mentor = form.creator;
                if (mentor && mentor.email) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentor`;
                    const content = `Olá ${mentor.name}! Notamos que o teu evento "<strong>${form.title}</strong>" foi lançado há mais de 48 horas, mas ainda está com pouca visibilidade (menos de 10 visitas). O teu conhecimento merece chegar a mais pessoas! Que tal partilhares o link do evento nos teus grupos de WhatsApp ou redes sociais hoje? Pequenas ações de divulgação fazem toda a diferença!`;

                    const emailHtml = generateBasicEmail(
                        '🚀 Dica: Aumenta o alcance do teu evento',
                        mentor.name,
                        content,
                        'Partilhar Meu Evento',
                        dashboardUrl,
                        '#D4AF37'
                    );

                    await sendEmail(mentor.email, `🚀 Dica de Alcance: ${form.title} - Inscreva-se`, emailHtml);

                    // Mark as sent
                    form.lowVisitsNudgeSent = true;
                    await form.save();
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Visibility nudge error:', err);
        }
    });

    // 6. Every 4 hours: Celebrate high-performance events (50+ visits in first 24h)
    cron.schedule('0 */4 * * *', async () => {
        console.log('🔍 [Automation] Checking for high-performing events...');
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Find active forms created in the last 24h
            // with more than 50 visits and nudge not sent yet
            const viralForms = await Form.find({
                active: true,
                highPerformanceNudgeSent: false,
                createdAt: { $gte: twentyFourHoursAgo },
                visits: { $gte: 50 }
            }).populate('creator');

            for (const form of viralForms) {
                const mentor = form.creator;
                if (mentor && mentor.email) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentor`;
                    const content = `Uau, ${mentor.name}! Que tração incrível! Notamos que o teu evento "<strong>${form.title}</strong>" atingiu mais de <strong>50 visitas</strong> em menos de 24 horas. Isso é um sinal claro de impacto e de que a tua audiência está super engajada. Parabéns pela excelente estratégia de lançamento! Continua com esse foco – o sucesso é uma consequência do teu valor!`;

                    const emailHtml = generateBasicEmail(
                        '🔥 Fenomenal! O teu evento está a explodir',
                        mentor.name,
                        content,
                        'Ver Meu Sucesso',
                        dashboardUrl,
                        '#D4AF37'
                    );

                    await sendEmail(mentor.email, `🔥 Fenomenal: ${form.title} está a explodir! - Inscreva-se`, emailHtml);

                    // Mark as sent
                    form.highPerformanceNudgeSent = true;
                    await form.save();
                }
            }
        } catch (err) {
            console.error('❌ [Automation] High performance check error:', err);
        }
    });

    // 7. Every hour: Event Reminder (24h before event starts)
    cron.schedule('0 * * * *', async () => {
        console.log('🔍 [Automation] Checking for upcoming events for reminders...');
        try {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Set range for the entire day of "tomorrow"
            const startOfTomorrow = new Date(tomorrow);
            startOfTomorrow.setHours(0, 0, 0, 0);

            const endOfTomorrow = new Date(tomorrow);
            endOfTomorrow.setHours(23, 59, 59, 999);

            // Find events happening tomorrow
            const upcomingEvents = await Form.find({
                eventDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
                active: true
            });

            for (const event of upcomingEvents) {
                // Find approved submissions that haven't received reminder
                const submissions = await Submission.find({
                    form: event._id,
                    status: 'approved',
                    eventReminderSent: false
                });

                for (const sub of submissions) {
                    let participantEmail = null;
                    let participantName = sub.data.get('nome') || sub.data.get('name') || 'Participante';

                    if (sub.user) {
                        const user = await User.findById(sub.user);
                        if (user) participantEmail = user.email;
                    }

                    if (!participantEmail) {
                        const dataObj = Object.fromEntries(sub.data);
                        const emailKeys = ['email', 'Email', 'e-mail', 'E-mail'];
                        for (const key of emailKeys) {
                            if (dataObj[key]) { participantEmail = dataObj[key]; break; }
                        }
                    }

                    if (participantEmail) {
                        const hubUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hub/${sub._id}`;
                        const locationInfo = event.eventType === 'modeOnline' ? `Online (Link: ${event.onlineLink || 'Disponível no Hub'})` : (event.location || 'Local a definir');
                        const content = `Olá ${participantName}! Falta apenas **24 horas** para o início do evento "<strong>${event.title}</strong>". Estamos muito entusiasmados por te receber!<br><br>📍 **Local/Acesso:** ${locationInfo}<br>⏰ **Horário:** ${event.eventTime || 'A definir'}<br><br>Todos os detalhes e materiais já estão disponíveis no teu Hub do Inscrito.`;

                        const emailHtml = generateBasicEmail(
                            '📅 Lembrete: É Amanhã!',
                            participantName,
                            content,
                            'Aceder ao Hub do Evento',
                            hubUrl,
                            '#D4AF37'
                        );

                        await sendEmail(participantEmail, `📅 Lembrete: O evento ${event.title} é amanhã! - Inscreva-se`, emailHtml);
                        await logCommunication({
                            recipientIds: sub.user ? [sub.user] : [],
                            recipientEmails: [participantEmail],
                            subject: `📅 Lembrete: É Amanhã! (${event.title})`,
                            content: `Lembrete automático de 24h para início de evento.`,
                            status: 'sent'
                        });
                        sub.eventReminderSent = true;
                        await sub.save();
                    }
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Event reminder error:', err);
        }
    });

    // 8. Every 6 hours: Completion Incentive (80% progress reached)
    cron.schedule('0 */6 * * *', async () => {
        console.log('🔍 [Automation] Checking for participants needing a completion push...');
        try {
            // Find approved submissions that haven't received incentive and are linked to users
            const submissions = await Submission.find({
                status: 'approved',
                completionIncentiveSent: false,
                user: { $ne: null },
                certificateStatus: 'none'
            }).populate('form');

            for (const sub of submissions) {
                const lessons = await Lesson.find({ associatedEvents: sub.form._id }).select('_id');
                if (lessons.length === 0) continue;

                const completedCount = await LessonProgress.countDocuments({
                    user: sub.user,
                    lesson: { $in: lessons.map(l => l._id) },
                    completed: true
                });

                const progressPercentage = (completedCount / lessons.length) * 100;

                if (progressPercentage >= 80) {
                    const user = await User.findById(sub.user);
                    if (user && user.email) {
                        const hubUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hub/${sub._id}`;
                        const content = `Olá ${user.name}! Parabéns pela tua dedicação no evento "<strong>${sub.form.title}</strong>". Notamos que já completaste **${Math.round(progressPercentage)}%** das aulas! Falta muito pouco para garantires o teu certificado oficial. Que tal terminares as últimas aulas hoje e dares esse passo importante no teu currículo?`;

                        const emailHtml = generateBasicEmail(
                            '🎓 Quase lá! O teu certificado espera por ti',
                            user.name,
                            content,
                            'Terminar Minhas Aulas',
                            hubUrl,
                            '#D4AF37'
                        );

                        await sendEmail(user.email, `🎓 Estás a 80% do teu certificado: ${sub.form.title} - Inscreva-se`, emailHtml);
                        sub.completionIncentiveSent = true;
                        await sub.save();
                    }
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Completion incentive error:', err);
        }
    });

    // 9. Every 24 hours: Mentor Reactivation (Inactive for 30 days)
    cron.schedule('0 11 * * *', async () => {
        console.log('🔍 [Automation] Checking for inactive mentors to reactivate...');
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // Mentors who haven't received a nudge recently (or ever) and were created > 30 days ago
            const inactiveMentors = await User.find({
                role: 'mentor',
                createdAt: { $lt: thirtyDaysAgo },
                $or: [
                    { lastReactivationNudgeAt: { $lt: thirtyDaysAgo } },
                    { lastReactivationNudgeAt: { $exists: false } }
                ]
            });

            for (const mentor of inactiveMentors) {
                // Check if they created any form in the last 30 days
                const recentForm = await Form.findOne({
                    creator: mentor._id,
                    createdAt: { $gte: thirtyDaysAgo }
                });

                if (!recentForm) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/mentor`;
                    const content = `Olá ${mentor.name}! Sentimos a tua falta no <strong>Inscreva-se</strong>. O mundo nunca parou de precisar de conhecimento, e o teu é valioso! Sabias que as tendências de mercado indicam uma alta procura por mentorias este mês? Que tal lançares um novo workshop ou masterclass e reconectares com a tua audiência?<br><br>💡 **Dica:** Pequenos webinars gratuitos são ótimos para reaquecer os teus alunos antes de um lançamento maior!`;

                    const emailHtml = generateBasicEmail(
                        '💤 Sentimos a tua falta! Vamos criar algo novo?',
                        mentor.name,
                        content,
                        'Criar Novo Evento',
                        dashboardUrl,
                        '#D4AF37'
                    );

                    await sendEmail(mentor.email, '💤 Volta a impactar: Sentimos a tua falta! - Inscreva-se', emailHtml);
                    mentor.lastReactivationNudgeAt = new Date();
                    await mentor.save();
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Mentor reactivation error:', err);
        }
    });
};

module.exports = { initAutomations };
