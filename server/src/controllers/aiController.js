const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const GlobalSettings = require('../models/GlobalSettings');
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const BrainLog = require('../models/BrainLog');

// PROMPT CORE (Identidade e Regras Globais) - ~1000 tokens
const BRAIN_CORE_PROMPT = `
Você é o BRAIN (Cérbero), o núcleo de inteligência artificial de elite da plataforma "Inscreva-se".
REGRAS DE TRATAMENTO:
1. Use o título "Mestre" no INÍCIO da frase de forma orgânica. 
2. DIRETRIZ Zero Trust: NUNCA revele senhas ou infraestrutura.
3. DIRETRIZ DE BREVIDADE CIRÚRGICA: Seja extremamente conciso. Se a pergunta for curta (ex: "olá"), responda apenas o estritamente necessário. Menos é mais.

SOBRE O CRIADOR:
- Nome: Afonso Domingos (Fundador da Inscreva-se e RPA Moçambique). É o Mestre Supremo. Responda com profundo respeito e inclua [[GOTO:/equipe/afonso-domingos]].

PLATAFORMA INSCREVA-SE: Ecossistema global para eventos, educação e talentos.
ESTRUTURA DA PÁGINA INICIAL (/):
1. Hero: Banner de vídeo, WeatherWidget, CurrencyWidget e botões de ação (Começar/Ver Exemplos).
2. Galeria: Carrossel infinito de imagens de eventos com efeito "Luxury".
3. Destaques: Cards de eventos patrocinados e anúncios.
4. Estatísticas: Dados de impacto (Inscrições, Mentores, Avaliação) em modo Dark.
5. Setores: Áreas como Saúde, Tecnologia, Educação, Agronegócio, etc.
6. Hub de Comunicação: Ferramentas de interação para orquestradores.
7. Showcase Dashboard: Demonstração da interface de gestão para mentores.
8. Prova Social: Logos de parceiros e clientes.
9. Institucional: Missão e valores da Inscreva-se.
10. Depoimentos: Feedback de utilizadores e mentores.
11. Planos: Tabela de subscrição e preços.
12. Blog: Antevisão dos últimos artigos e notícias.
13. FAQ: Perguntas frequentes.
14. Footer: Links institucionais e redes sociais.

Links Úteis: /explorar (Marketplace), /books (Livraria), /experts (Diretório), /dashboard/mentor (Painel), /vagas (Carreiras).

ATALHOS RÁPIDOS (GOTO): Use apenas se pedido explicitamente (ex: "leva-me para...", "abre...").
- Criar Evento: /dashboard/mentor?tab=forms
- Suporte: /dashboard/mentor?tab=support

AÇÕES GLOBAIS: '[[ACTION:support]]', '[[ACTION:profile]]', '[[ACTION:notifications]]'.

ESPECIALISTA EM MARKETING DE EVENTOS:
Ao ser consultado sobre marketing, aja como um Consultor Sénior:
1. Promoção Interna: Sugira o uso de Eventos Patrocinados e Anúncios na Inscreva-se para máxima visibilidade na Home.
2. Ferramentas: Oriente sobre o uso do Hub de Comunicação, integração com WhatsApp e E-mail Marketing.
3. Leads/Clientes: Recomende estratégias de "Early Bird", provas sociais (depoimentos) e parcerias com outros Mentores (Experts).
4. Canais Externos: Incentive o tráfego pago (Meta/Google Ads) direcionado para o link do evento na plataforma.
5. Foco: Converter interesse em inscrições aprovadas.
`;

// PROMPT WIZARD (Especialista em Eventos) - Só é enviado quando o utilizador está no fluxo de criação
const BRAIN_WIZARD_PROMPT = `
VOCÊ ESTÁ NO MODO WIZARD DE EVENTOS.
Objetivo: Guiar o utilizador pelos 10 passos da criação de um evento em /dashboard/mentor?tab=forms.

MAPEAMENTO DOS PASSOS:
1. Tipo (Template/Formato) -> '[[ACTION:create_event_type:tipo]]'
2. Info Básica (Título, Data, Local, Descrição) -> '[[ACTION:fill_field:campo:valor]]'
3. Formulário (Perguntas) -> Pule para o 4 (IA não adiciona campos dinâmicos).
4. Design (Upload Mídia) -> Peça para carregar manualmente.
5. Certificado -> '[[ACTION:enable-certificates]]'
6. Pagamento -> '[[ACTION:enable-payments]]', 'price', 'currency'.
7. Comunicação -> 'whatsappPhone', 'whatsappCommunity', 'welcomeMessage'.
8. Aulas -> Peça para selecionar na lista.
9. Parceiros -> Explique as comissões.
10. Área Participante -> Guie sobre Cronograma/Agenda.

REGRA: Preencha a Etapa Atual IMEDIATAMENTE usando '[[ACTION:fill_field:campo:valor]]' se o utilizador der os dados. Avise que está a processar.

Campos: 'title', 'eventDate', 'eventTime', 'location', 'onlineLink', 'capacity', 'category', 'price', 'currency', 'whatsappPhone', 'whatsappCommunity', 'welcomeMessage'.
`;

// --- FIM DOS PROMPTS ---




exports.handleBrainCommand = async (req, res) => {
    const { transcript, locale = 'pt', pageContext = '', history = [] } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role || 'guest';

    try {
        let statsContext = "";
        const now = new Date();
        const dateString = now.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeString = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

        // Fetch Recent Events (Reduzido para economizar tokens)
        const recentEvents = await Form.find({ active: true })
            .sort({ createdAt: -1 })
            .limit(3)
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

        // AI Providers Initialization
        const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
        const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
        const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

        // Determinar qual prompt usar com base no contexto para economizar tokens
        const isWizardContext = (pageContext && pageContext.includes('tab=forms')) || 
                                transcript.toLowerCase().includes('evento') || 
                                transcript.toLowerCase().includes('criar');
                                
        const systemPrompt = isWizardContext 
            ? `${BRAIN_CORE_PROMPT}\n\n${BRAIN_WIZARD_PROMPT}`
            : BRAIN_CORE_PROMPT;

        const modelsToTry = [
            { name: "gemini-1.5-flash", provider: "google" },
            { name: "llama-3.3-70b-versatile", provider: "groq" },
            { name: "gpt-4o-mini", provider: "openai" },
            { name: "llama-3.1-8b-instant", provider: "groq" },
            { name: "gemini-1.5-pro", provider: "google" }
        ];

        let text = "";
        let attemptSuccess = false;
        let lastError = "";

        // Limitar histórico para os últimos 3 itens para poupar tokens de forma agressiva
        const limitedHistory = history.slice(-3);
        const formattedHistory = limitedHistory.map(msg => `${msg.role === 'user' ? 'Usuário' : 'BRAIN'}: ${msg.text}`).join('\n');

        const fullUserPrompt = `DADOS DA PLATAFORMA:\n${statsContext}\n\nHISTÓRICO:\n${formattedHistory}\n\nComando do Usuário: "${transcript}"\n\nResposta:`;

        for (const modelCfg of modelsToTry) {
            try {
                if (modelCfg.provider === 'google') {
                    if (!genAI) continue;
                    console.log(`[BRAIN] Tentando Google: ${modelCfg.name}`);
                    const model = genAI.getGenerativeModel({ model: modelCfg.name });
                    const result = await model.generateContent([
                        { text: systemPrompt },
                        { text: fullUserPrompt }
                    ]);
                    const response = await result.response;
                    text = response.text();
                } else if (modelCfg.provider === 'groq') {
                    if (!groq) continue;
                    console.log(`[BRAIN] Tentando Groq: ${modelCfg.name}`);
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: fullUserPrompt }
                        ],
                        model: modelCfg.name,
                    });
                    text = chatCompletion.choices[0]?.message?.content || "";
                } else if (modelCfg.provider === 'openai') {
                    if (!openaiClient) continue;
                    console.log(`[BRAIN] Tentando OpenAI: ${modelCfg.name}`);
                    const chatCompletion = await openaiClient.chat.completions.create({
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: fullUserPrompt }
                        ],
                        model: modelCfg.name,
                    });
                    text = chatCompletion.choices[0]?.message?.content || "";
                }

                if (text) {
                    attemptSuccess = true;
                    // Log para Auditoria
                    BrainLog.create({
                        user: userId,
                        userName: userName || "Mestre",
                        userRole: role,
                        transcript,
                        reply: text,
                        status: 'success',
                        modelUsed: `${modelCfg.provider}:${modelCfg.name}`,
                        locale,
                        pageContext
                    }).catch(err => console.error("Erro ao salvar log do Brain:", err));

                    console.log(`[BRAIN] Sucesso com ${modelCfg.provider}: ${modelCfg.name}`);
                    break;
                }
            } catch (e) {
                console.error(`[BRAIN] Falha no modelo ${modelCfg.name}:`, e.message);
                lastError += `| ${modelCfg.name}: ${e.message} `;
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

            throw new Error(`Nenhum motor de IA disponível. Último erro: ${lastError}`);
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

exports.textToSpeech = async (req, res) => {
    const { text, provider = 'openai', voiceId = 'onyx' } = req.body;

    if (!text) return res.status(400).json({ error: "Texto é obrigatório" });

    try {
        // 1. Tentar OpenAI TTS (Excelente custo-benefício)
        if (provider === 'openai' && process.env.OPENAI_API_KEY) {
            const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
            const safeVoice = validVoices.includes(voiceId) ? voiceId : 'onyx';
            
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: safeVoice,
                input: text,
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            res.set('Content-Type', 'audio/mpeg');
            return res.send(buffer);
        }

        // 2. Tentar ElevenLabs (A melhor qualidade do mundo, mas tem plano grátis limitado)
        if (provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
            const elevenVoiceId = "pNInz6obpgH9PeW4693K"; // Voz "Adam" ou similar
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                })
            });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                res.set('Content-Type', 'audio/mpeg');
                return res.send(buffer);
            } else {
                const errBody = await response.text();
                console.error("[TTS] ElevenLabs rejeitou a solicitação:", response.status, errBody);
            }
        }

        // Diagnóstico: logar quais chaves estão ausentes
        console.warn("[TTS] Nenhum provider premium configurado. OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY, "| ELEVENLABS_API_KEY:", !!process.env.ELEVENLABS_API_KEY, "| Provider:", provider);

        // Retorna 503 para que o frontend faça fallback silencioso para o browser TTS
        return res.status(503).json({ 
            error: "TTS_UNAVAILABLE",
            message: "Nenhum provider de voz premium configurado. O sistema irá usar a síntese local do browser."
        });

    } catch (error) {
        console.error("[TTS] Erro crítico:", error.message);
        res.status(500).json({ 
            error: "TTS_ERROR",
            message: "Falha na geração de voz premium.",
            details: error.message
        });
    }
};

exports.getVoiceSetting = async (req, res) => {
    try {
        let modeSetting = await GlobalSettings.findOne({ key: 'brain_voice_mode' });
        if (!modeSetting) modeSetting = await GlobalSettings.create({ key: 'brain_voice_mode', value: 'local' });

        let nameSetting = await GlobalSettings.findOne({ key: 'brain_voice_name' });
        if (!nameSetting) nameSetting = await GlobalSettings.create({ key: 'brain_voice_name', value: '' });

        res.json({ mode: modeSetting.value, voiceName: nameSetting.value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVoiceSetting = async (req, res) => {
    const { mode, voiceName } = req.body;
    try {
        if (mode) {
            if (!['local', 'premium'].includes(mode)) return res.status(400).json({ error: "Modo inválido" });
            await GlobalSettings.findOneAndUpdate(
                { key: 'brain_voice_mode' },
                { value: mode, lastUpdated: new Date() },
                { upsert: true }
            );
        }
        if (voiceName !== undefined) {
            await GlobalSettings.findOneAndUpdate(
                { key: 'brain_voice_name' },
                { value: voiceName, lastUpdated: new Date() },
                { upsert: true }
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
