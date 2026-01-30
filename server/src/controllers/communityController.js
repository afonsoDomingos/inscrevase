const CommunityMessage = require('../models/CommunityMessage');
const Submission = require('../models/Submission');

exports.getMessages = async (req, res) => {
    try {
        const { formId } = req.params;

        // Ensure user is subscribed to this form
        const submission = await Submission.findOne({
            form: formId,
            user: req.user.id,
            status: 'approved'
        });

        if (!submission && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Você precisa estar inscrito e aprovado para acessar o chat.' });
        }

        const messages = await CommunityMessage.find({ formId })
            .populate('sender', 'name profilePhoto isVerified role')
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        console.error('Error fetching community messages:', error);
        res.status(500).json({ message: 'Erro ao buscar mensagens.' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { formId, text } = req.body;

        // Ensure user is subscribed
        const submission = await Submission.findOne({
            form: formId,
            user: req.user.id,
            status: 'approved'
        });

        if (!submission && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Apenas participantes inscritos podem enviar mensagens.' });
        }

        const newMessage = new CommunityMessage({
            formId,
            sender: req.user.id,
            text
        });

        await newMessage.save();

        const populatedMessage = await CommunityMessage.findById(newMessage._id)
            .populate('sender', 'name profilePhoto isVerified role');

        // Emit via socket (req.io)
        if (req.io) {
            req.io.to(`community_${formId}`).emit('community_message', populatedMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error sending community message:', error);
        res.status(500).json({ message: 'Erro ao enviar mensagem.' });
    }
};
