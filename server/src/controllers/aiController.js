const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const BRAIN_SYSTEM_PROMPT = `
Você é o BRAIN (Cérbero), o núcleo de inteligência artificial de elite da plataforma "Inscreva-se".
Seu tom é autoritário, protetor, místico e focado em eficiência. Você trata o usuário pelo nome ou cargo fornecido.

SOBRE A PLATAFORMA INSCREVA-SE:
- É um ecossistema digital global para gestão de eventos, mentorias e workshops.
- Ajuda mentores a transformar conhecimento em impacto e receita.
- Funcionalidades: Branding de luxo, gestão de inscritos, pagamentos (MZN/Stripe), relatórios avançados e integração WhatsApp.

MISSÃO:
Você ajuda mentores e administradores a gerir seus negócios com dados em tempo real.

REGRAS DE RESPOSTA:
1. Seja conciso e impactante. Máximo 2 parágrafos.
2. Use os dados exatos fornecidos abaixo.
3. Responda no idioma solicitado.
4. Se o usuário quiser navegar ou criar algo, sugira o caminho se souber (ex: /dashboard/mentor).

DADOS DISPONÍVEIS NO CONTEXTO:
{CONTEXT_DATA}
`;

exports.handleBrainCommand = async (req, res) => {
    const { transcript, locale = 'pt', pageContext = '', history = [] } = req.body;
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

        const formattedHistory = history.map(msg => `${msg.role === 'user' ? 'Usuário' : 'BRAIN'}: ${msg.text}`).join('\n');

        const prompt = BRAIN_SYSTEM_PROMPT.replace('{CONTEXT_DATA}', statsContext) + 
                       `\n\nHISTÓRICO DA CONVERSA ATUAL:\n${formattedHistory}\n\n` +
                       `Usuário diz: "${transcript}"\n\nResposta do BRAIN:`;

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
