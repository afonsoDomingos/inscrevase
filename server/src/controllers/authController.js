const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Submission = require('../models/Submission');

const register = async (req, res) => {
    try {
        const { name, email, password, businessName, country, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Validate role (security)
        const userRole = (role === 'participant') ? 'participant' : 'mentor';
        const canCreateEvents = userRole === 'mentor';

        user = new User({
            name,
            email,
            password,
            businessName,
            country,
            role: userRole,
            canCreateEvents
        });
        await user.save();

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
        res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
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
        res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
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
        const { name, businessName, bio, profilePhoto, whatsapp, socialLinks, country } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (businessName) user.businessName = businessName;
        if (country) user.country = country;
        if (bio) user.bio = bio;
        if (profilePhoto) user.profilePhoto = profilePhoto;
        if (whatsapp) user.whatsapp = whatsapp;
        if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

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
        const { name, email, role, status, plan, businessName, bio, profilePhoto, whatsapp, socialLinks, country, password, isPublic, canCreateEvents, badges, isVerified, verificationStatus } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
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
        const mentors = await User.find({ role: 'mentor', status: 'active', isPublic: true })
            .select('name businessName bio profilePhoto socialLinks country plan createdAt followers following profileVisits badges')
            .sort({ createdAt: -1 });
        res.json(mentors);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getPublicMentorById = async (req, res) => {
    try {
        const mentor = await User.findOne({ _id: req.params.id, role: 'mentor', status: 'active', isPublic: true })
            .select('name businessName bio profilePhoto socialLinks country plan createdAt followers following profileVisits badges');

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

module.exports = { register, login, getProfile, updateProfile, requestVerification, getUsers, updateByAdmin, deleteByAdmin, getPublicMentors, getPublicMentorById, toggleFollow, recordVisit, downgradeToParticipant, restoreMentorRole };
