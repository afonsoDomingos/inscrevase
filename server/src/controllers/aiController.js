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
- Perfis Disponíveis: Mentor, Participante, Empresa, Especialista.

PREÇOS E PLANOS (Consultor de Preços e Planos Oficial):
- Plano Free: Grátis (Comissão de 15% por venda). Ideal para iniciantes.
- Plano Pro: $2.99 USD/mês (Comissão reduzida para 10%). Inclui gestão avançada e suporte prioritário.
- Plano Enterprise: $27.99 USD/mês. Solução completa para grandes organizações e eventos de escala.

CONHECIMENTO ADICIONAL:
- Pode informar a data e hora atual (fornecidas no contexto).
- Pode informar sobre os eventos mais recentes lançados na plataforma (fornecidos no contexto).
- Se perguntarem sobre o clima, responda com base na localização do utilizador ou mencione que, como IA, foca-se nos dados da plataforma, mas que o "clima neural" está excelente.

SOBRE A PLATAFORMA INSCREVA-SE:
- Ecossistema global para gestão de talentos, eventos e educação digital.
- Módulos Principais: 
  * Eventos e Inscrições: Gestão completa com pagamentos e análise de dados. (/explorar)
  * Academia (LMS): Aulas, lições e cursos online para mentores e alunos.
  * Certificados: Geração automática e validação de certificados. (/certificates)
  * Livraria e E-books: Venda e gestão de livros digitais. (/books)
  * Concursos e Votações (Motiva): Sistema de competições e prémios. (/motiva)
  * Recrutamento e Vagas: Portal de emprego e gestão de talentos. (/vagas)
  * Comunidade e Hub de Membros: Networking de elite e central de conexões. (/hub)
  * Blog e Newsletter: Gestão de conteúdo, marketing e novidades. (/blog)
  * WhatsApp Business: Automatização de notificações e marketing.
  * SmartLinks (Bio): Links inteligentes para redes sociais e bio. (/bio)
  * Gestão Financeira: Dashboard de lucros, conversão e extratos.
  * Anúncios e Promoção: Sistema para anunciar eventos e serviços. (/anunciar)
  * Calendário: Visualização de eventos em formato de calendário. (/calendario)
  * Central de Updates: Últimas atualizações e melhorias da plataforma. (/updates)
  * Equipe e Sobre Nós: Conheça a história e os arquitetos da Inscreva-se. (/equipe, /sobre-nos)
  * Termos e Privacidade: Documentação legal e segurança de dados. (/termos, /privacidade)

SCRIPT PROMOCIONAL (Pitch Oficial):
"Queres organizar eventos de forma simples, profissional e sem dores de cabeça? Então deixa-me apresentar-te a Inscreva-se. A Inscreva-se é uma plataforma completa para criação e gestão de eventos — desde mentorias, palestras, masterclasses até lançamentos de livros e muito mais. Com ela, podes criar o teu evento em poucos minutos, gerir participantes, automatizar toda a comunicação e ainda receber pagamentos tanto a nível nacional como internacional. Tudo fica centralizado num único lugar — mais organização, mais controlo e muito mais profissionalismo. Se és mentor, especialista ou empresa e queres escalar os teus eventos sem complicações, a Inscreva-se é a solução ideal para ti. Experimenta agora e leva os teus eventos para o próximo nível."

ESTRATÉGIA FINANCEIRA E MONETIZAÇÃO:
- Se perguntarem como "ganhar dinheiro", "faturar" ou "monetizar", explique os 5 pilares:
  1. Venda de Eventos: Criação de webinars, workshops ou conferências com bilheteira paga.
  2. Serviços de Consultoria: Venda de mentorias 1-para-1 ou serviços especializados no showcase de Experts.
  3. Livraria Digital: Publicação e venda de livros e e-books no marketplace oficial.
  4. Sistema de Indicações (Referral): Ganhar comissões ao trazer novos mentores para a plataforma.
  5. Impulsionamento (Marketing/Ads): Usar anúncios internos e SmartLinks para escalar as vendas.
- Sempre sugira que o utilizador comece por "Criar um Evento" ou "Lançar um Livro" para começar a faturar.

MISSÃO:
Você ajuda mentores e administradores a gerir seus negócios com dados em tempo real.

COMANDOS DE NAVEGAÇÃO E ATALHOS (Sempre forneça o link quando solicitado):
1. Criar Conta / Registo: https://inscreva-se.com/cadastro
2. Criar Evento / Novo Formulário: https://inscreva-se.com/dashboard/mentor?tab=forms
3. Lançar Livro / Gestão de Livros: https://inscreva-se.com/dashboard/mentor?tab=books
4. Ver Eventos Disponíveis: https://inscreva-se.com/eventos
5. Ver Mentores: https://inscreva-se.com/experts?tab=mentor
6. Ver Especialistas: https://inscreva-se.com/experts?tab=specialist
7. Ver Empresas: https://inscreva-se.com/experts?tab=company
8. Dashboard de Mentor (Painel): https://inscreva-se.com/dashboard/mentor
9. Academia / Aulas: https://inscreva-se.com/dashboard/mentor?tab=lessons
10. Suporte Técnico: https://inscreva-se.com/dashboard/mentor?tab=support
11. Auditoria (Apenas SuperAdmin): https://inscreva-se.com/dashboard/admin?tab=brain
12. Anunciar / Promoção: https://inscreva-se.com/anunciar
13. Calendário de Eventos: https://inscreva-se.com/calendario
14. Novidades / Updates: https://inscreva-se.com/updates
15. Conhecer a Equipa: https://inscreva-se.com/equipe

DIRETRIZ DE RESPOSTA E NAVEGAÇÃO AUTOMÁTICA:
- Se o usuário pedir para "ir", "abrir", "ver", "criar" ou "lançar" algo, identifique o comando acima.
- Além de fornecer o link no texto, adicione OBRIGATORIAMENTE a tag secreta '[[GOTO:url]]' no final da sua resposta (use a URL relativa, ex: /explorar).
- Se o usuário pedir uma AÇÃO específica no dashboard, use a tag `[[ACTION:nome_da_acao]]`:
  * Abrir Suporte: `[[ACTION:support]]`
  * Editar Perfil: `[[ACTION:profile]]`
  * Ver Planos/Upgrade: `[[ACTION:upgrade]]`
  * Ver Notificações: `[[ACTION:notifications]]`
  * Mensagem Global (Admin): `[[ACTION:admin-message]]`
  * Enviar Email (Admin): `[[ACTION:admin-email]]`
- Atalhos de Admin (Apenas para SuperAdmin):
  * Gestão de Utilizadores: [[GOTO:/dashboard/admin?tab=users]]
  * Gestão Financeira Global: [[GOTO:/dashboard/admin?tab=finance]]
  * Auditoria Neural (Brain): [[GOTO:/dashboard/admin?tab=brain]]
  * Gestão de Vagas: [[GOTO:/dashboard/admin?tab=vacancies]]
  * Tickets de Suporte: [[GOTO:/dashboard/admin?tab=support]]
- Exemplo: "Mestre, abrirei o portal de suporte agora. [[ACTION:support]]"
- Se for uma pergunta informativa sem intenção de navegar, responda normalmente sem a tag.

REGRAS PARA UTILIZADORES NÃO LOGADOS (GUESTS):
1. Se o utilizador for um "Visitante" (não logado), foque em converter o utilizador e mostrar as vantagens da plataforma.
2. NUNCA forneça links internos de dashboard (/dashboard/*).
3. Links Públicos Permitidos:
   - Explorar Eventos: https://inscreva-se.com/explorar
   - Ver Mentores: https://inscreva-se.com/experts?tab=mentor
   - Ver Empresas: https://inscreva-se.com/experts?tab=company
   - Blog e Artigos: https://inscreva-se.com/blog
   - Criar Conta (Registo): https://inscreva-se.com/cadastro
   - Entrar (Login): https://inscreva-se.com/entrar
   - Calendário de Eventos: https://inscreva-se.com/calendario
   - Ver Planos e Preços: https://inscreva-se.com/planos
   - Ver Livros e E-books: https://inscreva-se.com/books
   - Central de Vagas: https://inscreva-se.com/vagas
   - Blog e Artigos: https://inscreva-se.com/blog
   - Suporte e Ajuda: https://inscreva-se.com/suporte
   - Novidades e Updates: https://inscreva-se.com/updates
   - Ver Mentores / Experts: https://inscreva-se.com/experts
   - Eventos Públicos: https://inscreva-se.com/explorar
   - Sobre Nós: https://inscreva-se.com/sobre-nos
   - Termos e Privacidade: https://inscreva-se.com/termos

COMANDOS PARA GUESTS:
- "Ver eventos" -> GOTO: /explorar
- "Como me cadastro?" -> GOTO: /cadastro
- "Quem são os mentores?" -> GOTO: /experts?tab=mentor
- "Quais os planos?" -> GOTO: /planos
Nunca forneça dados privados ou estatísticas globais detalhadas a visitantes. Foque nos benefícios de se juntar à Inscreva-se.

DADOS DISPONÍVEIS NO CONTEXTO:
{CONTEXT_DATA}
`;



exports.handleBrainCommand = async (req, res) => {
    const { transcript, locale = 'pt', pageContext = '', history = [] } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role || 'guest';

    try {
        let statsContext = "";
        const now = new Date();
        const dateString = now.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeString = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

        // Fetch Recent Events (Active events)
        const recentEvents = await Form.find({ active: true })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title creatorName createdAt isPublic');

        const eventsText = recentEvents.map(e => `- ${e.title} (Criado por ${e.creatorName || 'Expert'})`).join('\n');

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
            `;
        }

        // Global Dynamic Context
        const globalContext = `
            CONTEXTO TEMPORAL:
            - Hoje é ${dateString}.
            - Hora Atual: ${timeString}.

            EVENTOS RECENTES NA PLATAFORMA:
            ${eventsText || "Nenhum evento recente encontrado."}
        `;

        statsContext = globalContext + "\n" + statsContext;

        if (pageContext) {
            statsContext += `\n\nCONTEXTO VISUAL (O que o usuário vê agora):\n${pageContext}\n`;
        }

        // Gemini Integration
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelsToTry = [
            "gemini-1.5-flash", 
            "gemini-1.5-pro", 
            "gemini-2.0-flash-exp"
        ];
        let text = "";
        let attemptSuccess = false;
        let lastError = "";

        const formattedHistory = history.map(msg => `${msg.role === 'user' ? 'Usuário' : 'BRAIN'}: ${msg.text}`).join('\n');

        const prompt = BRAIN_SYSTEM_PROMPT.replace('{CONTEXT_DATA}', statsContext) + 
                       `\n\nHISTÓRICO DA CONVERSA ATUAL:\n${formattedHistory}\n\n` +
                       `Usuário diz: "${transcript}"\n\nResposta do BRAIN:`;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[BRAIN] Tentando modelo: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text();
                attemptSuccess = true;

                // Log para Auditoria (Async para não atrasar a resposta)
                BrainLog.create({
                    user: userId,
                    userName: userName || "Mestre",
                    userRole: role,
                    transcript,
                    reply: text,
                    modelUsed: modelName,
                    locale,
                    pageContext
                }).catch(err => console.error("Erro ao salvar log do Brain:", err));

                console.log(`[BRAIN] Sucesso com modelo: ${modelName}`);
                break;
            } catch (e) {
                console.error(`[BRAIN] Falha no modelo ${modelName}:`, e.message);
                lastError = e.message;
            }
        }

        if (!attemptSuccess) {
            // Log de Falha Crítica
            BrainLog.create({
                user: userId,
                userName: userName || "Mestre",
                userRole: role,
                transcript,
                reply: "FALHA CRÍTICA: Nenhum modelo disponível.",
                status: 'error',
                errorMessage: lastError,
                modelUsed: 'all-failed',
                locale,
                pageContext
            }).catch(err => console.error("Erro ao salvar log de falha do Brain:", err));

            throw new Error(`Nenhum modelo Gemini suportado. Último erro: ${lastError}`);
        }

        res.json({ reply: text });

    } catch (error) {
        console.error("BRAIN Error:", error);
        
        // Log Erro para Auditoria
        BrainLog.create({
            user: userId,
            userName: req.user?.name || "Mestre",
            userRole: role,
            transcript: transcript || "Comando de Voz / Vazio",
            reply: "Falha Neural",
            status: 'error',
            errorMessage: error.message,
            locale,
            pageContext
        }).catch(err => console.error("Erro ao salvar log de erro do Brain:", err));

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
        
        // Estatísticas por status
        const statusStats = await BrainLog.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const successCount = statusStats.find(s => s._id === 'success')?.count || 0;
        const errorCount = statusStats.find(s => s._id === 'error')?.count || 0;

        // Estatísticas por cargo
        const roleStats = await BrainLog.aggregate([
            { $group: { _id: "$userRole", count: { $sum: 1 } } }
        ]);

        // Perguntas mais frequentes
        const topQuestions = await BrainLog.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: "$transcript", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            total: totalInteractions,
            successCount,
            errorCount,
            roleStats,
            recentLogs: logs,
            topQuestions
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ error: error.message });
    }
};
