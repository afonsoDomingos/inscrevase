const cron = require('node-cron');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Form = require('../models/Form');
const SupportTicket = require('../models/SupportTicket');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const PersonalFinance = require('../models/PersonalFinance');
const sendEmail = require('../utils/emailService');
const whatsappService = require('./whatsappService');
const {
    generatePendingApprovalEmail,
    generateReferralBonusEmail,
    generateBasicEmail,
    generateSubscriptionExpiredEmail,
    generateSubscriptionWarningEmail,
    generateUpgradeSuggestionEmail,
    generateMonthlyFinancialReportEmail,
    generateFinancialHealthIncentiveEmail
} = require('../utils/emailTemplates');
const { logCommunication } = require('../utils/communicationLogger');
const AdminAlertService = require('./adminAlertService');

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
    
    // 10. Every 24 hours: Subscription Lifecycle Management
    // Checks for plan expiration, reverts to free, and sends warnings (3/7 days)
    cron.schedule('0 9 * * *', async () => {
        console.log('🔍 [Automation] Running Subscription Lifecycle check...');
        try {
            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // 10.1: Revert Expired Subscriptions
            const expiredUsers = await User.find({
                plan: { $ne: 'free' },
                planExpiresAt: { $lt: now }
            });

            for (const user of expiredUsers) {
                console.log(`⏳ [Automation] Reverting user ${user.email} to FREE (Expired at ${user.planExpiresAt})`);
                const oldPlan = user.plan;
                
                // Update User
                user.plan = 'free';
                user.subscriptionStatus = 'expired';
                user.lastExpirationEmailSentAt = new Date();
                await user.save();

                // Send Expiration Email
                const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/plans`;
                const emailHtml = generateSubscriptionExpiredEmail(user.name, oldPlan, dashboardUrl);
                
                await sendEmail(user.email, `⏳ O seu plano ${oldPlan.toUpperCase()} expirou - Inscreva-se`, emailHtml);
                
                // --- WHATSAPP NOTIFICATION ---
                if (user.whatsapp) {
                    const waMsg = `Olá *${user.name.split(' ')[0]}*! 👋\n\nA sua assinatura *Inscreva-se ${oldPlan.charAt(0).toUpperCase() + oldPlan.slice(1)}* terminou e a sua conta foi revertida para o plano Free.\n\nPara recuperar o acesso a todas as ferramentas elite e taxas reduzidas, podes reativar o seu plano aqui:\n🔗 https://inscreva-se.com/planos\n\nVamos voltar ao topo? 📈`;
                    whatsappService.sendMessage(user.whatsapp, waMsg).catch(e => console.error('WA Error (Expiration):', e.message));
                }
                
                await logCommunication({
                    recipientIds: [user._id],
                    recipientEmails: [user.email],
                    subject: `Aviso de Expiração: Plano ${oldPlan}`,
                    content: `Utilizador revertido para Free automaticamente por expiração do período pago.`,
                    status: 'sent'
                });
            }

            // 10.2: Send Warnings (Urgent: 1, 3, 7 Days)
            const warningsNeeded = await User.find({
                plan: { $ne: 'free' },
                planExpiresAt: { $gt: now, $lte: sevenDaysFromNow },
                // Only send if we haven't sent a warning in the last 23 hours (to avoid duplicate on same day if job runs twice)
                $or: [
                    { subscriptionWarningSentAt: { $lt: new Date(now.getTime() - 23 * 60 * 60 * 1000) } },
                    { subscriptionWarningSentAt: { $exists: false } }
                ]
            });

            for (const user of warningsNeeded) {
                const diffMs = user.planExpiresAt - now;
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                
                // Only send if it matches our targets: 7, 3 or 1 day
                if ([1, 3, 7].includes(diffDays)) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/plans`;
                    const emailHtml = generateSubscriptionWarningEmail(user.name, user.plan, diffDays, dashboardUrl);
                    
                    const subject = diffDays === 1 
                        ? `⏱️ ÚLTIMAS 24H: A sua assinatura expira amanhã - Inscreva-se`
                        : `⚠️ Atenção: A sua assinatura termina em ${diffDays} dias - Inscreva-se`;

                    await sendEmail(user.email, subject, emailHtml);
                    
                    // --- WHATSAPP NOTIFICATION ---
                    if (user.whatsapp) {
                        const timeText = diffDays === 1 ? 'amanhã' : `em ${diffDays} dias`;
                        const waMsg = `⚠️ *AVISO DE RENOVAÇÃO* - Inscreva-se\n\nOlá *${user.name.split(' ')[0]}*! Notamos que o seu plano *Pro* irá expirar *${timeText}*.\n\nPara evitar interrupções no seu perfil e nas suas taxas, garante que a sua renovação está em dia:\n🔗 https://inscreva-se.com/dashboard/plans\n\nContamos contigo! ⚡`;
                        whatsappService.sendMessage(user.whatsapp, waMsg).catch(e => console.error('WA Error (Warning):', e.message));
                    }
                    
                    user.subscriptionWarningSentAt = new Date();
                    await user.save();
                    console.log(`📡 [Automation] Sent ${diffDays}-day warning to ${user.email}`);
                }
            }

            // 10.3: Monthly Pro Incentive Nudge (Every 30 days for Free mentors)
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const freeMentorsToIncentivize = await User.find({
                plan: 'free',
                role: 'mentor',
                lastLoginAt: { $gt: sevenDaysAgo }, // Only target active users
                $or: [
                    { lastMonthlyNudgeSentAt: { $lt: thirtyDaysAgo } },
                    { lastMonthlyNudgeSentAt: { $exists: false } }
                ]
            }).limit(50); // Batch process for safety

            console.log(`🎯 [Automation] Found ${freeMentorsToIncentivize.length} free mentors for monthly Pro incentive.`);

            for (const user of freeMentorsToIncentivize) {
                const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/plans`;
                const emailHtml = generateUpgradeSuggestionEmail(user.name, dashboardUrl);
                
                await sendEmail(user.email, `📈 Leve os seus eventos ao próximo nível - Plano PRO Inscreva-se`, emailHtml);
                
                // --- WHATSAPP NOTIFICATION ---
                if (user.whatsapp) {
                    const waMsg = `🚀 *LEVE O SEU PERFIL AO PRÓXIMO NÍVEL*\n\nOlá *${user.name.split(' ')[0]}*! Sabia que os mentores *PRO* no Inscreva-se faturam, em média, *3x mais*?\n\nAtive agora o seu upgrade e ganhe taxas reduzidas e destaque prioritário:\n🔗 https://inscreva-se.com/planos\n\nVamos crescer juntos? 📈`;
                    whatsappService.sendMessage(user.whatsapp, waMsg).catch(e => console.error('WA Error (Incentive):', e.message));
                }
                
                user.lastMonthlyNudgeSentAt = new Date();
                await user.save();
                console.log(`📡 [Automation] Sent monthly Pro incentive to ${user.email}`);
            }

        } catch (err) {
            console.error('❌ [Automation] Subscription Lifecycle error:', err);
        }
    });
    
    // 11. End of Month: Monthly Financial Health Report
    // Cron: 0 8 1 * * (Every 1st day of month at 8 AM)
    cron.schedule('0 8 1 * *', async () => {
        console.log('📊 [Automation] Generating monthly financial health reports...');
        try {
            const now = new Date();
            // Get last month range
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            const monthName = startOfLastMonth.toLocaleString('pt-PT', { month: 'long', year: 'numeric' });

            // Find all users who have personal finance data this month
            const usersWithFinance = await PersonalFinance.distinct('user', {
                date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            });

            console.log(`📊 [Automation] Found ${usersWithFinance.length} users with financial data for ${monthName}.`);

            for (const userId of usersWithFinance) {
                const user = await User.findById(userId);
                if (!user || !user.email) continue;

                const transactions = await PersonalFinance.find({
                    user: userId,
                    date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                });

                let totalIncome = 0;
                let totalExpense = 0;
                const categoryMap = {};

                transactions.forEach(tx => {
                    if (tx.type === 'income') {
                        totalIncome += tx.amount;
                    } else if (tx.type === 'expense') {
                        totalExpense += tx.amount;
                        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
                    }
                });

                const balance = totalIncome - totalExpense;
                const topCategories = Object.entries(categoryMap)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3);

                // Simple AI-like insight
                let insight = "";
                if (balance > 0) {
                    insight = "Excelente trabalho! Fechou o mês com saldo positivo. Considere investir pelo menos 10% deste lucro para escalar o seu ecossistema no próximo trimestre.";
                } else if (balance < 0) {
                    insight = "Atenção necessária: As suas despesas superaram as receitas. Analise as categorias acima e tente reduzir custos fixos para equilibrar a sua saúde financeira.";
                } else {
                    insight = "Ponto de equilíbrio atingido. Para o próximo mês, foque em aumentar as suas fontes de receita (como novos eventos ou upsells) para gerar lucro.";
                }

                const dashboardUrl = `${process.env.FRONTEND_URL || 'https://inscreva-se.com'}/dashboard/mentor?tab=workspace`;
                const emailHtml = generateMonthlyFinancialReportEmail(user.name, monthName, {
                    totalIncome,
                    totalExpense,
                    balance,
                    topCategories,
                    insight
                }, dashboardUrl);

                await sendEmail(user.email, `📊 Relatório Mensal (${monthName}): Saúde Financeira - Inscreva-se`, emailHtml);
                
                await logCommunication({
                    recipientIds: [user._id],
                    recipientEmails: [user.email],
                    subject: `Relatório Financeiro: ${monthName}`,
                    content: `Envio automático do resumo mensal de saúde financeira. Saldo: ${balance} MZN`,
                    status: 'sent'
                });
            }
        } catch (err) {
            console.error('❌ [Automation] Monthly report error:', err);
        }
    });

    // 12. Monthly Incentive: Saúde Profissional Tool Nudge
    // Day 5 of each month at 9 AM
    // Cron: 0 9 5 * *
    cron.schedule('0 9 5 * *', async () => {
        console.log('💎 [Automation] Checking for users to nudge about Saúde Profissional...');
        try {
            const mentors = await User.find({ role: 'mentor', status: 'active' });
            const now = new Date();

            for (const user of mentors) {
                // Skip if already sent this month
                if (user.lastFinancialNudgeSentAt && 
                    user.lastFinancialNudgeSentAt.getMonth() === now.getMonth() && 
                    user.lastFinancialNudgeSentAt.getFullYear() === now.getFullYear()) {
                    continue;
                }

                // Check if they use the tool (if they have ANY record)
                const hasData = await PersonalFinance.exists({ user: user._id });
                
                if (!hasData) {
                    const dashboardUrl = `${process.env.FRONTEND_URL || 'https://inscreva-se.com'}/dashboard/mentor?tab=workspace`;
                    const html = generateFinancialHealthIncentiveEmail(user.name, dashboardUrl);
                    
                    await sendEmail(user.email, `💎 Domine o seu mercado: Ative a sua Saúde Profissional`, html);
                    
                    user.lastFinancialNudgeSentAt = now;
                    await user.save();
                    
                    console.log(`📡 [Automation] Sent financial health nudge to ${user.email}`);

                    await logCommunication({
                        recipientIds: [user._id],
                        recipientEmails: [user.email],
                        subject: `Incentivo Saúde Profissional`,
                        content: `Envio automático de incentivo para começar a usar a ferramenta financeira.`,
                        status: 'sent'
                    });
                }
            }
        } catch (err) {
            console.error('❌ [Automation] Financial nudge error:', err);
        }
    });

    // 13. Every hour: Support SLA alert for admin queue
    cron.schedule('0 * * * *', async () => {
        console.log('🔍 [Automation] Checking support SLA for admin queue...');
        try {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            const pendingCount = await SupportTicket.countDocuments({
                unreadByAdmin: true,
                createdAt: { $lte: twoHoursAgo }
            });

            if (pendingCount > 0) {
                await AdminAlertService.notifyAdmins({
                    title: 'SLA suporte em risco',
                    content: `${pendingCount} ticket(s) estao sem resposta admin ha mais de 2 horas.`,
                    actionUrl: '/dashboard/admin?tab=support',
                    type: 'alert',
                    cooldownKey: 'sla-support-admin-queue',
                    cooldownMs: 60 * 60 * 1000
                });
            }
        } catch (err) {
            console.error('❌ [Automation] Support SLA alert error:', err);
        }
    });
};

module.exports = { initAutomations };
