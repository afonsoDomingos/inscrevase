const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Submission = require('../models/Submission');
const Referral = require('../models/Referral');
const sendEmail = require('../utils/emailService');
const { generateWelcomeEmail, generateBasicEmail, generateReferralBonusEmail, generateReferralPointsEarnedEmail, generateAdminPointsNotificationEmail } = require('../utils/emailTemplates');

const register = async (req, res) => {
    try {
        const { name, email, password, businessName, country, role, referralCode } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Validate role (security)
        const allowedRoles = ['participant', 'mentor', 'company', 'specialist'];
        const userRole = allowedRoles.includes(role) ? role : 'mentor';
        const canCreateEvents = userRole !== 'participant';

        const emailToken = crypto.randomBytes(32).toString('hex');

        user = new User({
            name,
            email,
            password,
            businessName,
            country,
            role: userRole,
            canCreateEvents,
            emailToken,
            isEmailVerified: false,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        });

        // Initial registration save
        await user.save();

        // Handle Referral logic
        if (referralCode) {
            const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
            if (referrer) {
                user.referredBy = referrer._id;
                user.referralPoints = 10; // WIN-WIN: New user also gets points!

                // Track referral
                const newReferral = new Referral({
                    referrer: referrer._id,
                    referredUser: user._id,
                    pointsEarned: 10
                });
                await newReferral.save();

                // Update referrer stats
                referrer.referralPoints = (referrer.referralPoints || 0) + 10;
                referrer.referralCount = (referrer.referralCount || 0) + 1;
                await referrer.save();

                // Notify referrer
                const admin = await User.findOne({ role: { $in: ['admin', 'SuperAdmin'] } });
                const referralNotification = new Notification({
                    recipient: referrer._id,
                    sender: admin ? admin._id : referrer._id,
                    title: 'Nova Indicação de Sucesso! 🚀',
                    content: `Parabéns! ${name} juntou-se à elite da Inscreva.se através do seu convite. Ganhou 10 pontos de impacto!`,
                    type: 'referral'
                });
                await referralNotification.save();

                // Notify referrer via Email
                const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/referrals`;
                const referrerEmailHtml = generateReferralPointsEarnedEmail(referrer.name, name, 10, referrer.referralPoints, dashboardUrl);
                await sendEmail(referrer.email, 'Nova Indicação de Sucesso! 🚀 - Inscreva-se', referrerEmailHtml);

                // Notify Admin about the points awarded
                const adminUser = await User.findOne({ role: 'SuperAdmin' }) || admin;
                if (adminUser) {
                    const adminEmailHtml = generateAdminPointsNotificationEmail(referrer.name, referrer.email, 10, `Indicação de ${name}`);
                    await sendEmail(adminUser.email, 'Notificação de Recompensa: Indicação Premiada 💎', adminEmailHtml);
                }

                // Notify new user via Email about the bonus
                const bonusEmailHtml = generateReferralBonusEmail(name, referrer.name, 10, `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
                await sendEmail(email, '🎁 Bónus de Boas-vindas Creditado! - Inscreva-se', bonusEmailHtml);

                // Final save for the new user with points and referrer link
                await user.save();
            }
        }

        // Send Verification Email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationLink = `${frontendUrl}/confirmar-email?token=${emailToken}`;

        const welcomeHtml = generateWelcomeEmail(name, verificationLink);
        await sendEmail(email, 'Confirme seu endereço de e-mail - Inscreva-se', welcomeHtml);

        // Link existing submissions for this email to the new user account
        // We search for the email in common field names used in forms
        const emailRegex = new RegExp(`^${email}$`, 'i');
        await Submission.updateMany(
            {
                $or: [
                    { "data.email": emailRegex },
                    { "data.Email": emailRegex },
                    { "data.e-mail": emailRegex },
                    { "data.E-mail": emailRegex },
                    { "data.seu-email": emailRegex },
                    { "data.seu e-mail": emailRegex },
                    { "data.Seu E-mail": emailRegex }
                ],
                user: { $exists: false }
            },
            { $set: { user: user._id } }
        );

        // Send Welcome Notification
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            const welcomeNotification = new Notification({
                recipient: user._id,
                sender: admin._id,
                title: 'Seja bem-vindo à Elite da Mentoria! ✨',
                content: `Olá ${name}! É uma honra ter você na nossa comunidade exclusiva. O 'Inscreva-se' foi desenhado para mentores que buscam excelência e escala. Sua jornada para transformar conhecimento em impacto global começa agora. 🚀\n\nSugestão para começar: Complete seu perfil com uma foto de alta qualidade e crie seu primeiro formulário personalizado no dashboard. Estamos ansiosos para ver seu sucesso brilhar! 🌟`,
                type: 'welcome',
                actionUrl: '/dashboard/mentor'
            });
            await welcomeNotification.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: user._id, name, email, role: user.role, isEmailVerified: user.isEmailVerified } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Security Check: Blocked User
        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'Sua conta está suspensa. Entre em contato com o suporte.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Link existing submissions for this email (Retroactive fix for existing users)
        try {
            const emailRegex = new RegExp(`^${email}$`, 'i');
            await Submission.updateMany(
                {
                    $or: [
                        { "data.email": emailRegex },
                        { "data.Email": emailRegex },
                        { "data.e-mail": emailRegex },
                        { "data.E-mail": emailRegex },
                        { "data.seu-email": emailRegex },
                        { "data.seu e-mail": emailRegex },
                        { "data.Seu E-mail": emailRegex }
                    ],
                    user: { $exists: false }
                },
                { $set: { user: user._id } }
            );
        } catch (linkError) {
            console.error("Error auto-linking submissions on login:", linkError);
            // Non-blocking error
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email, role: user.role, isEmailVerified: user.isEmailVerified } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, businessName, bio, profilePhoto, whatsapp, socialLinks, country, facebookPixelId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (businessName) user.businessName = businessName;
        if (country) user.country = country;
        if (bio) user.bio = bio;
        if (profilePhoto) user.profilePhoto = profilePhoto;
        if (whatsapp) user.whatsapp = whatsapp;
        if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
        if (facebookPixelId !== undefined) user.facebookPixelId = facebookPixelId;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const requestVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.verificationStatus = 'pending';
        user.verificationRequestedAt = new Date();
        await user.save();

        res.json({ message: 'Verificação solicitada com sucesso', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        // Add authProvider for admin insights
        const usersWithProvider = users.map(user => ({
            ...user._doc,
            authProvider: user.linkedinId ? 'linkedin' : (user.googleId ? 'google' : 'native')
        }));

        res.json(usersWithProvider);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateByAdmin = async (req, res) => {
    try {
        const { name, email, role, status, plan, businessName, bio, profilePhoto, whatsapp, socialLinks, country, password, isPublic, canCreateEvents, badges, isVerified, verificationStatus, isEmailVerified } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Role-based security for Admin role
        if (req.user.role === 'admin') {
            // Admin cannot edit a SuperAdmin or another Admin
            if (user.role === 'SuperAdmin' || user.role === 'admin') {
                return res.status(403).json({ message: 'Apenas SuperAdmin pode editar outros administradores.' });
            }

            // Admin cannot promote someone to Admin or SuperAdmin
            if (role && (role === 'admin' || role === 'SuperAdmin')) {
                return res.status(403).json({ message: 'Apenas SuperAdmin pode atribuir funções de administrador.' });
            }
        }

        if (name) user.name = name;
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Este e-mail já está em uso por outro utilizador.' });
            }
            user.email = email;
        }
        if (role) user.role = role;
        if (status) user.status = status;
        if (plan) user.plan = plan;
        if (businessName) user.businessName = businessName;
        if (country) user.country = country;
        if (bio) user.bio = bio;
        if (profilePhoto) user.profilePhoto = profilePhoto;
        if (whatsapp) user.whatsapp = whatsapp;
        if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };
        if (isPublic !== undefined) user.isPublic = isPublic;
        if (canCreateEvents !== undefined) user.canCreateEvents = canCreateEvents;
        if (badges) user.badges = badges;
        if (isVerified !== undefined) user.isVerified = isVerified;
        if (verificationStatus) user.verificationStatus = verificationStatus;
        if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

        // Update password if provided
        if (password && password.trim() !== '') {
            user.password = password;
        }

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const deleteByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getPublicMentors = async (req, res) => {
    try {
        const mentors = await User.find({ role: { $in: ['mentor', 'specialist', 'company'] }, status: 'active', isPublic: true })
            .select('name businessName bio profilePhoto socialLinks country plan createdAt followers following profileVisits badges role')
            .sort({ createdAt: -1 });
        res.json(mentors);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getPublicMentorById = async (req, res) => {
    try {
        const mentor = await User.findOne({ _id: req.params.id, role: { $in: ['mentor', 'specialist', 'company'] }, status: 'active', isPublic: true })
            .select('name businessName bio profilePhoto socialLinks country plan createdAt followers following profileVisits badges role');

        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

        res.json(mentor);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const recordVisit = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { $inc: { profileVisits: 1 } });
        res.json({ message: 'Visit recorded' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const toggleFollow = async (req, res) => {
    try {
        const mentorId = req.params.id;
        const userId = req.user.id;

        if (mentorId === userId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const mentor = await User.findById(mentorId);
        const user = await User.findById(userId);

        if (!mentor || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = mentor.followers.includes(userId);

        if (isFollowing) {
            mentor.followers = mentor.followers.filter(id => id.toString() !== userId);
            user.following = user.following.filter(id => id.toString() !== mentorId);
        } else {
            mentor.followers.push(userId);
            user.following.push(mentorId);
        }

        await mentor.save();
        await user.save();

        res.json({
            message: isFollowing ? 'Unfollowed' : 'Followed',
            isFollowing: !isFollowing,
            followersCount: mentor.followers.length
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const downgradeToParticipant = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = 'participant';
        user.plan = 'free';
        user.canCreateEvents = false;

        await user.save();
        res.json({ message: 'Conta alterada para Participante com sucesso', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const restoreMentorRole = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.role = 'mentor';
        user.canCreateEvents = true;

        await user.save();
        res.json({ message: 'Modo Mentor restaurado com sucesso', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const searchMentors = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const mentors = await User.find({
            role: { $in: ['mentor', 'specialist', 'company'] },
            status: 'active',
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { businessName: { $regex: q, $options: 'i' } }
            ],
            _id: { $ne: req.user.id } // Exclude current user
        })
            .select('name email businessName profilePhoto')
            .limit(10);

        res.json(mentors);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token é obrigatório' });

        const user = await User.findOne({ emailToken: token });
        if (!user) return res.status(400).json({ message: 'Token inválido ou expirado' });

        user.isEmailVerified = true;
        user.emailToken = undefined;
        await user.save();

        // Send confirmation email after success
        const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
        const content = `Sua conta foi verificada com sucesso. Agora você tem acesso total a todas as funcionalidades da nossa plataforma de elite.`;
        const emailHtml = generateBasicEmail('E-mail Verificado com Sucesso! ✅', user.name, content, 'Ir para o Dashboard', dashboardUrl, '#22c55e');

        await sendEmail(user.email, 'Sua conta está verificada! - Inscreva-se', emailHtml);

        res.json({ message: 'E-mail confirmado com sucesso!', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
        if (user.isEmailVerified) return res.status(400).json({ message: 'E-mail já está verificado' });

        const emailToken = crypto.randomBytes(32).toString('hex');
        user.emailToken = emailToken;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationLink = `${frontendUrl}/confirmar-email?token=${emailToken}`;

        const emailHtml = generateWelcomeEmail(user.name, verificationLink);

        await sendEmail(user.email, 'Confirme seu endereço de e-mail - Inscreva-se', emailHtml);
        res.json({ message: 'E-mail de verificação enviado com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/redefinir-senha?token=${resetToken}`;

        const content = `Recebemos uma solicitação para redefinir a sua senha. Se você não solicitou esta alteração, ignore este e-mail. Caso contrário, clique no botão abaixo para prosseguir. <br><br> Este link expirará em 1 hora por motivos de segurança.`;
        const emailHtml = generateBasicEmail('Recuperação de Senha 💎', user.name, content, 'Redefinir Senha', resetLink);

        await sendEmail(email, 'Redefinição de Senha - Inscreva-se', emailHtml);
        res.json({ message: 'E-mail de recuperação enviado com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Token inválido ou expirado' });

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Senha redefinida com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro no servidor', error: err.message });
    }
};

const migrateVerifiedUsers = async (req, res) => {
    console.log('[Migration] Iniciando migração de usuários verificados...');
    try {
        const result = await User.updateMany(
            { isEmailVerified: { $ne: true } },
            { $set: { isEmailVerified: true } }
        );
        console.log('[Migration] Resultado:', result);
        const count = result.modifiedCount ?? result.nModified ?? 0;
        res.json({ message: `Migração concluída. ${count} usuários atualizados.` });
    } catch (err) {
        console.error('[Migration] Erro:', err);
        res.status(500).json({ message: 'Erro na migração', error: err.message });
    }
};

const migrationStatus = async (req, res) => {
    try {
        const total = await User.countDocuments();
        const verified = await User.countDocuments({ isEmailVerified: true });
        res.json({ total, verified, pending: total - verified });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao verificar status' });
    }
};

module.exports = { register, login, getProfile, updateProfile, requestVerification, getUsers, updateByAdmin, deleteByAdmin, getPublicMentors, getPublicMentorById, toggleFollow, recordVisit, downgradeToParticipant, restoreMentorRole, searchMentors, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, migrateVerifiedUsers, migrationStatus };
