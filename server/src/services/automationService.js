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
};

module.exports = { initAutomations };
