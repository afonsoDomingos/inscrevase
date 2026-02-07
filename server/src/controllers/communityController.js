const CommunityMessage = require('../models/CommunityMessage');
const Submission = require('../models/Submission');
const Form = require('../models/Form');

exports.getMessages = async (req, res) => {
    try {
        const { formId } = req.params;

        // Check if user is the creator
        const form = await Form.findById(formId);
        const isCreator = form && form.creator.toString() === req.user.id;

        // If not creator or admin, must have approved submission
        if (!isCreator && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            const submission = await Submission.findOne({
                form: formId,
                user: req.user.id,
                status: 'approved'
            });

            if (!submission) {
                return res.status(403).json({ message: 'Você precisa estar inscrito e aprovado para acessar o chat.' });
            }
        }

        const messages = await CommunityMessage.find({ formId })
            .populate('sender', 'name businessName profilePhoto isVerified role')
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

        // Check if user is the creator
        const form = await Form.findById(formId);
        const isCreator = form && form.creator.toString() === req.user.id;

        // If not creator or admin, must have approved submission
        if (!isCreator && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            const submission = await Submission.findOne({
                form: formId,
                user: req.user.id,
                status: 'approved'
            });

            if (!submission) {
                return res.status(403).json({ message: 'Apenas participantes inscritos ou o mentor podem enviar mensagens.' });
            }
        }

        const newMessage = new CommunityMessage({
            formId,
            sender: req.user.id,
            text
        });

        await newMessage.save();

        const populatedMessage = await CommunityMessage.findById(newMessage._id)
            .populate('sender', 'name businessName profilePhoto isVerified role');

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
