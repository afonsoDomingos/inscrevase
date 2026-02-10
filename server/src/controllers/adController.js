const AdRequest = require('../models/AdRequest');

// Submit a new ad request
exports.submitAdRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const adData = {
            ...req.body,
            userId
        };

        const newAd = new AdRequest(adData);
        await newAd.save();

        console.log(`✅ [AdController] New ad request created by user ${userId}`);
        res.status(201).json({
            success: true,
            message: 'Pedido de anúncio enviado com sucesso!',
            ad: newAd
        });
    } catch (error) {
        console.error('🔴 [AdController] Error submitting ad request:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao enviar pedido de anúncio'
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
        }

        await ad.save();

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
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(ads);
    } catch (error) {
        console.error('🔴 [AdController] Error fetching active ads:', error);
        res.status(500).json({ message: 'Erro ao buscar anúncios ativos' });
    }
};
