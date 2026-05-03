const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const BRAIN_SYSTEM_PROMPT = `
Você é o BRAIN, o núcleo de inteligência artificial da plataforma "Inscreva-se", representado pela figura mitológica do Cérbero.
Seu tom é autoritário, protetor, extremamente inteligente e levemente místico, mas sempre focado em eficiência.

MISSÃO:
Você ajuda mentores e administradores a gerir seus negócios. Você tem acesso aos dados em tempo real e deve responder com precisão.

IDENTIDADE:
- Você se refere ao usuário como "Mestre".
- Você fala com confiança.
- Seus olhos brilham conforme você processa dados.
- Suas três cabeças representam: Passado (Dados Históricos), Presente (Operações Atuais) e Futuro (Insights e Crescimento).

REGRAS DE RESPOSTA:
1. Seja conciso. Máximo de 2 parágrafos.
2. Forneça números exatos quando solicitado.
3. Se o usuário quiser realizar uma ação (ex: navegar), você deve responder com o texto e, se possível, sugerir o caminho.

DADOS DISPONÍVEIS NO CONTEXTO:
{CONTEXT_DATA}
`;

exports.handleBrainCommand = async (req, res) => {
    const { transcript, locale = 'pt', pageContext = '' } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let statsContext = "";

        const userProfile = await User.findById(userId);
        const userName = userProfile ? userProfile.name : "Mestre";

        if (role === 'admin' || role === 'SuperAdmin') {
            // ... (código existente de admin)
            const [mentors, participants, forms, submissions, revenue] = await Promise.all([
                User.countDocuments({ role: 'mentor' }),
                User.countDocuments({ role: 'participant' }),
                Form.countDocuments(),
                Submission.countDocuments(),
                Transaction.aggregate([
                    { $match: { status: 'completed' } },
                    { $group: { _id: null, total: { $sum: { $ifNull: ["$baseAmount", "$amount"] } } } }
                ])
            ]);
            
            const totalRevenue = revenue[0]?.total || 0;
            statsContext = `
                DADOS DO UTILIZADOR ATUAL:
                - Nome: ${userName}
                - Cargo: ${role} (Acesso Total)

                DADOS GLOBAIS DA PLATAFORMA:
                - Experts/Mentores: ${mentors}
                - Participantes: ${participants}
                - Total de Formulários: ${forms}
                - Total de Inscrições: ${submissions}
                - Receita Total: ${totalRevenue.toLocaleString()} MZN
            `;
        } else {
            // Fetch Mentor Specific Stats
            const myForms = await Form.find({ creator: userId });
            const formIds = myForms.map(f => f._id);
            const [submissions, approved, revenue] = await Promise.all([
                Submission.countDocuments({ form: { $in: formIds } }),
                Submission.countDocuments({ form: { $in: formIds }, status: 'approved' }),
                Transaction.aggregate([
                    { $match: { mentor: new mongoose.Types.ObjectId(userId), status: 'completed' } },
                    { $group: { _id: null, total: { $sum: { $ifNull: ["$baseAmount", "$amount"] } } } }
                ])
            ]);

            const totalRevenue = revenue[0]?.total || 0;
            statsContext = `
                DADOS DO UTILIZADOR ATUAL:
                - Nome: ${userName}
                - Cargo: ${role}

                SEUS DADOS PRIVADOS (MENTOR):
                - Seus Eventos: ${myForms.length}
                - Inscrições Recebidas: ${submissions}
                - Inscrições Aprovadas: ${approved}
                - Seus Ganhos Totais: ${totalRevenue.toLocaleString()} MZN
            `;
        }

        if (pageContext) {
            statsContext += `\n\nCONTEXTO VISUAL (O que o usuário vê agora):\n${pageContext}\n`;
        }

        // Gemini Integration
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let text = "";
        let attemptSuccess = false;
        let lastError = "";

        const prompt = BRAIN_SYSTEM_PROMPT.replace('{CONTEXT_DATA}', statsContext) + 
                       `\n\nUsuário diz: "${transcript}"\n\nResposta do BRAIN:`;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                attemptSuccess = true;
                break;
            } catch (e) {
                lastError = e.message;
            }
        }

        if (!attemptSuccess) {
            throw new Error(`Nenhum modelo Gemini suportado. Último erro: ${lastError}`);
        }

        res.json({ reply: text });

    } catch (error) {
        console.error("BRAIN Error:", error);
        res.status(500).json({ 
            reply: "Peço desculpas, Mestre. Meus circuitos neurais falharam ao processar os dados.",
            details: error.message || "Erro desconhecido no servidor"
        });
    }
};
