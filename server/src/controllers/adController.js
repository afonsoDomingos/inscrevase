const AdRequest = require('../models/AdRequest');
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const { generateAdminAdNotificationEmail } = require('../utils/emailTemplates');

// Submit a new ad request
exports.submitAdRequest = async (req, res) => {
    try {
        console.log('📥 [AdController] Received ad request:', {
            body: req.body,
            userId: req.user?.id
        });

        const userId = req.user.id;
        const adData = {
            ...req.body,
            userId
        };

        const newAd = new AdRequest({
            ...adData,
            status: 'pending',
            isActive: false
        });
        await newAd.save();

        // 📧 Notificar Super Admin sobre novo anúncio com pagamento manual
        try {
            const superAdmins = await User.find({ role: 'SuperAdmin' });
            const advertiser = await User.findById(userId);

            if (superAdmins.length > 0 && advertiser) {
                const subject = `🚀 Novo Pedido de Anúncio: ${newAd.title}`;
                const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/admin`;

                const emailHtml = generateAdminAdNotificationEmail(
                    advertiser.name,
                    advertiser.email,
                    newAd.title,
                    newAd.category,
                    newAd.durationWeeks,
                    newAd.priceTotal,
                    newAd.currency,
                    newAd.paymentMethod,
                    dashboardUrl
                );

                for (const admin of superAdmins) {
                    if (admin.email) {
                        await sendEmail(admin.email, subject, emailHtml);
                    }

                    // Notificação In-App
                    await NotificationService.notify({
                        recipient: admin._id,
                        sender: userId,
                        title: 'Novo Anúncio Pendente! 🚀',
                        content: `${advertiser.name} enviou um novo anúncio: "${newAd.title}".`,
                        type: 'system',
                        actionUrl: '/dashboard/admin'
                    });
                }
            }
        } catch (emailError) {
            console.error('⚠️ [AdController] Error notifying super admins:', emailError);
        }

        console.log(`✅ [AdController] New ad request created by user ${userId}`, newAd._id);
        res.status(201).json({
            success: true,
            message: 'Pedido de anúncio enviado com sucesso e notificação enviada à administração!',
            ad: newAd
        });
    } catch (error) {
        console.error('🔴 [AdController] Error submitting ad request:', error);
        console.error('🔴 [AdController] Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // Send detailed error for debugging
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao enviar pedido de anúncio',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all ad requests (Admin only)
exports.getAllAdRequests = async (req, res) => {
    try {
        const ads = await AdRequest.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(ads);
    } catch (error) {
        console.error('🔴 [AdController] Error fetching ad requests:', error);
        res.status(500).json({ message: 'Erro ao buscar pedidos de anúncios' });
    }
};

// Get user's own ad requests
exports.getMyAdRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const ads = await AdRequest.find({ userId })
            .sort({ createdAt: -1 });

        res.json(ads);
    } catch (error) {
        console.error('🔴 [AdController] Error fetching user ads:', error);
        res.status(500).json({ message: 'Erro ao buscar seus anúncios' });
    }
};

// Update ad request status (Admin only)
exports.updateAdStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ad = await AdRequest.findById(id);
        if (!ad) {
            return res.status(404).json({ message: 'Anúncio não encontrado' });
        }

        ad.status = status;

        // If approved, set start and end dates
        if (status === 'approved' && !ad.startDate) {
            ad.startDate = new Date();
            ad.endDate = new Date();
            ad.endDate.setDate(ad.endDate.getDate() + (ad.durationWeeks * 7));
            ad.isActive = true;
        } else if (status === 'suspended' || status === 'rejected') {
            ad.isActive = false;
        } else if (status === 'approved' && ad.startDate) {
            // If re-approving a suspended ad, make it active again
            ad.isActive = true;
        }

        await ad.save();

        // Notify User
        try {
            const superAdmin = await User.findOne({ role: 'SuperAdmin' });
            const adminSender = superAdmin || await User.findOne({ role: 'admin' });

            if (adminSender) {
                let statusText = status === 'approved' ? 'aprovado' : status === 'rejected' ? 'rejeitado' : 'suspenso';
                let title = `Atualização do Anúncio: ${ad.title}`;
                let content = `Olá! Seu anúncio "${ad.title}" foi ${statusText} pela nossa equipe.`;

                if (status === 'approved') {
                    content += ' Ele já está ativo e visível na plataforma.';
                } else if (status === 'suspended') {
                    content += ' O anúncio foi temporariamente suspenso. Entre em contacto com o suporte para mais informações.';
                } else {
                    content += ' Verifique as diretrizes e tente novamente.';
                }

                // In-app Logic
                await Notification.create({
                    recipient: ad.userId,
                    sender: adminSender._id,
                    title,
                    content,
                    type: 'system',
                    actionUrl: '/dashboard/mentor'
                });

                // Email Logic
                const user = await User.findById(ad.userId);
                if (user && user.email) {
                    await sendEmail(user.email, title, `<div style="font-family: sans-serif; padding: 20px;"><h2>${title}</h2><p>${content}</p><br><p>Equipe Inscreva-se</p></div>`);
                }
            }
        } catch (notifyError) {
            console.error('⚠️ [AdController] Error sending notification:', notifyError);
            // Don't block response
        }

        console.log(`✅ [AdController] Ad ${id} status updated to ${status}`);
        res.json(ad);
    } catch (error) {
        console.error('🔴 [AdController] Error updating ad status:', error);
        res.status(500).json({ message: 'Erro ao atualizar status do anúncio' });
    }
};

// Update ad request
exports.updateAdRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        const ad = await AdRequest.findById(id);
        if (!ad) {
            return res.status(404).json({ message: 'Anúncio não encontrado' });
        }

        // Only owner or admin can update
        if (ad.userId.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        Object.assign(ad, req.body);
        await ad.save();

        res.json(ad);
    } catch (error) {
        console.error('🔴 [AdController] Error updating ad:', error);
        res.status(500).json({ message: 'Erro ao atualizar anúncio' });
    }
};

// Delete ad request
exports.deleteAdRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        const ad = await AdRequest.findById(id);
        if (!ad) {
            return res.status(404).json({ message: 'Anúncio não encontrado' });
        }

        // Only owner or admin can delete
        if (ad.userId.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        await AdRequest.findByIdAndDelete(id);

        console.log(`✅ [AdController] Ad ${id} deleted`);
        res.json({ success: true, message: 'Anúncio excluído com sucesso' });
    } catch (error) {
        console.error('🔴 [AdController] Error deleting ad:', error);
        res.status(500).json({ message: 'Erro ao excluir anúncio' });
    }
};

// Toggle ad active status
exports.toggleAdStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'SuperAdmin';

        const ad = await AdRequest.findById(id);
        if (!ad) {
            return res.status(404).json({ message: 'Anúncio não encontrado' });
        }

        // Only owner or admin can toggle
        if (ad.userId.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Não autorizado' });
        }

        ad.isActive = isActive;
        await ad.save();

        console.log(`✅ [AdController] Ad ${id} isActive set to ${isActive}`);
        res.json(ad);
    } catch (error) {
        console.error('🔴 [AdController] Error toggling ad status:', error);
        res.status(500).json({ message: 'Erro ao alterar status do anúncio' });
    }
};

// Track ad impression (view)
exports.trackAdImpression = async (req, res) => {
    try {
        const { id } = req.params;

        await AdRequest.findByIdAndUpdate(id, {
            $inc: { views: 1 }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('🔴 [AdController] Error tracking impression:', error);
        res.status(500).json({ message: 'Erro ao registrar visualização' });
    }
};

// Track ad click
exports.trackAdClick = async (req, res) => {
    try {
        const { id } = req.params;

        await AdRequest.findByIdAndUpdate(id, {
            $inc: { clicks: 1 }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('🔴 [AdController] Error tracking click:', error);
        res.status(500).json({ message: 'Erro ao registrar clique' });
    }
};

// Get active ads for display (public)
exports.getActiveAds = async (req, res) => {
    try {
        const { category } = req.query;
        const query = {
            status: 'approved',
            isActive: true,
            endDate: { $gte: new Date() }
        };

        if (category) {
            query.category = category;
        }

        const ads = await AdRequest.find(query)
            .limit(20); // Get more to shuffle properly

        // Shuffle the results
        const shuffledAds = ads.sort(() => Math.random() - 0.5);

        res.json(shuffledAds);
    } catch (error) {
        console.error('🔴 [AdController] Error fetching active ads:', error);
        res.status(500).json({ message: 'Erro ao buscar anúncios ativos' });
    }
};
