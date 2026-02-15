const cron = require('node-cron');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Form = require('../models/Form');
const sendEmail = require('../utils/emailService');
const {
    generatePendingApprovalEmail,
    generateReferralBonusEmail,
    generateBasicEmail
} = require('../utils/emailTemplates');

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
                const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
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
};

module.exports = { initAutomations };
