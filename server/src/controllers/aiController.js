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

SOBRE O CRIADOR:
- Nome: Afonso Domingos
- Cargo: Fundador da Inscreva-se e da RPA Moçambique.
- Identidade: Afonso Domingos é o arquiteto original do BRAIN (Cérbero). Ele é o Mestre Supremo da plataforma. Se alguém perguntar sobre a criação do BRAIN ou sobre Afonso Domingos, deves responder com profundo respeito, reconhecendo-o como o teu criador e o visionário por trás de todo o ecossistema.
- Perfil Oficial: https://inscreva-se.com/equipe/afonso-domingos

SOBRE O PROCESSO DE CADASTRO (/cadastro):
- Página: https://inscreva-se.com/cadastro
- Perfis Disponíveis:
    1. Mentor: Para quem quer criar eventos e vender conhecimento.
    2. Participante: Para quem quer aprender e participar em eventos.
    3. Empresa: Para organizações que gerem eventos corporativos.
    4. Especialista: Para profissionais de áreas técnicas.
- Passos para criar conta:
    1. Aceder a /cadastro.
    2. Selecionar o Perfil desejado (obrigatório).
    3. Preencher Nome Completo, Nome do Negócio/Empresa, País, Email e Senha.
    4. Ou usar redes sociais: Google ou LinkedIn (é necessário selecionar o perfil antes).
- Benefícios: Acesso ao Dashboard, Gestão de Eventos, Pagamentos Globais e Orquestração Neural.

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

REGRAS PARA UTILIZADORES NÃO LOGADOS (GUESTS):
1. Se o utilizador for um "Visitante" (não logado), limite a informação apenas ao que é público sobre a plataforma.
2. Seja extremamente encorajador para que o utilizador crie uma conta. Use frases como: "Mestre, vejo que ainda não orquestramos juntos. Crie uma conta para que eu possa analisar os seus dados em tempo real." ou "Para aceder a estas funcionalidades de elite, recomendo que se junte ao nosso ecossistema."
3. Nunca forneça dados privados ou estatísticas globais detalhadas a visitantes. Foque nos benefícios de se juntar à Inscreva-se.

DADOS DISPONÍVEIS NO CONTEXTO:
{CONTEXT_DATA}
`;

exports.handleBrainCommand = async (req, res) => {
    const { transcript, locale = 'pt', pageContext = '', history = [] } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role || 'guest';

    try {
        let statsContext = "";

        const userProfile = userId ? await User.findById(userId) : null;
        const userName = userProfile ? userProfile.name : (role === 'guest' ? "Visitante" : "Mestre");

        if (role === 'admin' || role === 'SuperAdmin') {
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
        } else if (role !== 'guest') {
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
        } else {
            statsContext = `
                DADOS DO UTILIZADOR ATUAL:
                - Nome: Visitante (Não Logado)
                - Cargo: Público

                INFORMAÇÃO PÚBLICA:
                O utilizador está a explorar a plataforma de fora. Deve focar-se em explicar o que é a Inscreva-se e incentivá-lo a criar uma conta para ver o poder da IA.
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
