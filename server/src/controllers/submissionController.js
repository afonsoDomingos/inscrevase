const Submission = require('../models/Submission');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { PLANS } = require('../config/stripe');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const submitForm = async (req, res) => {
    try {
        const { formId, data, paymentProof } = req.body;

        const form = await Form.findById(formId);
        if (!form || !form.active) {
            return res.status(404).json({ message: 'Form not found or inactive' });
        }

        const submission = new Submission({
            form: formId,
            data,
            paymentProof
        });

        await submission.save();
        res.status(201).json({ message: 'Inscrição enviada com sucesso', submission });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getFormSubmissions = async (req, res) => {
    try {
        const form = await Form.findById(req.params.formId);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        // Check ownership
        if (form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ form: req.params.formId }).sort('-submittedAt');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const submission = await Submission.findById(req.params.id).populate('form');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        // Check ownership of the form
        if (submission.form.creator.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        submission.status = status;

        // --- NEW FINANCIAL LOGIC FOR MANUAL PAYMENTS ---
        if (status === 'approved' && submission.form.paymentConfig?.enabled) {
            // Check if transaction already exists (avoid duplicates)
            const existingTx = await Transaction.findOne({ submission: submission._id });

            if (!existingTx) {
                const mentor = await User.findById(submission.form.creator);
                if (mentor) {
                    const mentorPlan = mentor.plan || 'free';
                    const planConfig = PLANS[mentorPlan] || PLANS.free;
                    const amount = submission.form.paymentConfig.price || 0;
                    const platformFee = amount * planConfig.commissionRate;

                    // Create manual transaction (Status: pending until mentor pays platform)
                    const transaction = new Transaction({
                        user: mentor._id,
                        mentor: mentor._id,
                        form: submission.form._id,
                        submission: submission._id,
                        amount: amount,
                        currency: submission.form.paymentConfig.currency || 'MT',
                        platformFee: platformFee,
                        mentorEarnings: amount, // For manual, mentor already has 100% of money
                        status: 'pending', // Pending platform fee reconciliation
                        paymentMethod: 'manual'
                    });
                    await transaction.save();

                    // Also mark payment as paid in submission since it's approved
                    submission.paymentStatus = 'paid';
                }
            }
        }
        // -----------------------------------------------

        await submission.save();
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllSubmissionsAdmin = async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('form', 'title slug')
            .sort('-submittedAt')
            .limit(100);
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getMySubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const myForms = await Form.find({ creator: userId }).select('_id');
        const formIds = myForms.map(f => f._id);

        const submissions = await Submission.find({ form: { $in: formIds } })
            .populate('form', 'title slug')
            .sort('-submittedAt');

        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const analyzeReceipt = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);
        if (!submission || !submission.paymentProof) {
            return res.status(404).json({ message: 'Recibo não encontrado' });
        }

        // Gemini Vision API logic
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Você é um assistente financeiro moçambicano especializado em validar capturas de ecrã (screenshots) de pagamentos.
            Analise esta imagem e extraia as seguintes informações em formato JSON rigoroso:
            - transactionId: O código da transação (ex: MZN.... ou ID da transferência)
            - amount: O valor numérico (apenas o número)
            - currency: "MT" ou "USD"
            - date: A data da transação
            - isValid: true se parecer um recibo real e legível, false caso contrário
            - confidence: 0-100
            - warning: Qualquer suspeita de fraude ou edição de imagem.
            
            Se não for um recibo, retorne isValid: false.
            Resposta apenas em JSON.
        `;

        // Fetch image and convert to base64
        const response = await fetch(submission.paymentProof);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{.*\}/s);
        const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Falha na análise da IA" };

        submission.aiAnalysis = aiAnalysis;
        await submission.save();

        res.json({ success: true, analysis: aiAnalysis });
    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ message: "Erro na análise de IA", error: error.message });
    }
};

module.exports = {
    submitForm,
    getFormSubmissions,
    updateStatus,
    getAllSubmissionsAdmin,
    getMySubmissions,
    getSubmissionPublic,
    analyzeReceipt
};
