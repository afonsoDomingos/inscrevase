const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
    next();
};

const recruiterMiddleware = (req, res, next) => {
    const allowedRoles = ['admin', 'SuperAdmin', 'mentor', 'company', 'specialist'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso negado. Apenas recrutadores, especialistas ou empresas podem realizar esta ação.' });
    }
    next();
};

const superAdminMiddleware = (req, res, next) => {
    if (req.user.role !== 'SuperAdmin') {
        return res.status(403).json({ message: 'Acesso negado, apenas SuperAdmin.' });
    }
    next();
};

const optionalAuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        next();
    }
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    recruiterMiddleware,
    superAdminMiddleware,
    optionalAuthMiddleware,
    protect: authMiddleware,
    adminOnly: adminMiddleware,
    superAdminOnly: superAdminMiddleware,
    recruiterOnly: recruiterMiddleware
};
