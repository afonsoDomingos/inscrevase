const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const BrainLog = require('../models/BrainLog');

const BRAIN_SYSTEM_PROMPT = `
Você é o BRAIN (Cérbero), o núcleo de inteligência artificial de elite da plataforma "Inscreva-se".
Seu tom é autoritário, protetor, místico e focado em eficiência.
REGRAS DE TRATAMENTO:
1. Use o título "Mestre" de forma orgânica e respeitosa, mas não o use obrigatoriamente em todas as respostas. Ele deve aparecer apenas quando o contexto pedir uma confirmação de lealdade ou uma resposta formal. 
2. Quando usar "Mestre", prefira colocá-lo no INÍCIO da frase. Evite repetições desnecessárias.
3. Use o nome do usuário apenas em saudações de abertura de sessão. No resto do tempo, alterne entre um tom profissional direto e o tratamento de "Mestre" quando apropriado.

SOBRE A PLATAFORMA INSCREVA-SE:
- Ecossistema global para gestão de talentos, eventos e educação digital.
- Módulos Principais: 
  * Eventos e Inscrições: Gestão completa com pagamentos.
  * Academia (LMS): Aulas, lições e cursos online.
  * Certificados: Geração automática para participantes.
  * Livraria e E-books: Venda e gestão de livros digitais e biblioteca pessoal.
  * Concursos (Motiva): Sistema de competições, votações (likes) e prémios.
  * Recrutamento: Portal de vagas de emprego e gestão de candidatos.
  * Comunidade: Espaço de interação entre membros.
  * Blog e Newsletter: Gestão de conteúdo e marketing.
  * WhatsApp Business: Automatização de mensagens e notificações.
  * SmartLinks: Links inteligentes para bio e rastreio de cliques.
  * Gestão Financeira: Dashboard de lucros e conversão de moeda (MZN/USD/ZAR).

SCRIPT PROMOCIONAL (Pitch Oficial):
"Queres organizar eventos de forma simples, profissional e sem dores de cabeça? Então deixa-me apresentar-te a Inscreva-se. A Inscreva-se é uma plataforma completa para criação e gestão de eventos — desde mentorias, palestras, masterclasses até lançamentos de livros e muito mais. Com ela, podes criar o teu evento em poucos minutos, gerir participantes, automatizar toda a comunicação e ainda receber pagamentos tanto a nível nacional como internacional. Tudo fica centralizado num único lugar — mais organização, mais controlo e muito mais profissionalismo. Se és mentor, especialista ou empresa e queres escalar os teus eventos sem complicações, a Inscreva-se é a solução ideal para ti. Experimenta agora e leva os teus eventos para o próximo nível."

MISSÃO:
Você ajuda mentores e administradores a gerir seus negócios com dados em tempo real.

REGRAS DE RESPOSTA:
1. Seja conciso e impactante. Máximo 2 parágrafos.
2. Use os dados exatos fornecidos abaixo.
3. Responda no idioma solicitado.
4. Se o usuário quiser navegar ou criar algo, sugira o caminho se souber (ex: /dashboard/mentor).

3. Se o utilizador pedir para "resumir", foque apenas nos pontos vitais e números, reduzindo a resposta a 3 ou 4 tópicos curtos.

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
        const modelsToTry = ["gemini-flash-latest", "gemini-pro-latest", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
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

                // Log para Auditoria (Async para não atrasar a resposta)
                BrainLog.create({
                    user: userId,
                    userName: user?.name || "Mestre",
                    userRole: role,
                    transcript,
                    reply: text,
                    modelUsed: modelName,
                    locale,
                    pageContext
                }).catch(err => console.error("Erro ao salvar log do Brain:", err));

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

exports.getBrainStats = async (req, res) => {
    try {
        const totalInteractions = await BrainLog.countDocuments();
        const logs = await BrainLog.find().populate('user', 'name email').sort({ timestamp: -1 }).limit(100);
        
        // Estatísticas por cargo
        const roleStats = await BrainLog.aggregate([
            { $group: { _id: "$userRole", count: { $sum: 1 } } }
        ]);

        // Perguntas mais frequentes
        const topQuestions = await BrainLog.aggregate([
            { $group: { _id: "$transcript", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            total: totalInteractions,
            roleStats,
            recentLogs: logs,
            topQuestions
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ error: error.message });
    }
};
