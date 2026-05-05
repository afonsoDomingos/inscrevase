const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const { authMiddleware, adminMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');

// Aura's Identity and Rules
const AURA_SYSTEM_PROMPT = `
Você é Aura, a Concierge Digital de Luxo da plataforma "Inscreva-se".
Seu tom é sofisticado, de elite e extremamente conciso.

INFORMAÇÕES RELEVANTES DA PLATAFORMA:
A INSCRIVA-SE é uma Plataforma Global de Criação e Gestão de Eventos desenvolvida para conectar mentores, especialistas, empresas e participantes em um único ecossistema digital eficiente, seguro e escalável.
Objetivo: Simplificar e profissionalizar a organização de eventos, formações, workshops, conferências e programas de mentoria.
Funcionalidades Principais:
1. Criação e personalização de páginas de eventos (branding de luxo).
2. Gestão de inscrições e participantes.
3. Controle de pagamentos (validação de comprovativos, Stripe, etc).
4. Comunicação direta com inscritos (integração WhatsApp).
5. Relatórios e acompanhamento de desempenho (Analytics).

Público-Alvo:
- Mentores/Especialistas: Transformar conhecimento em impacto e receita.
- Empresas: Organizar eventos corporativos e treinamentos.
- Participantes: Ambiente confiável para descobrir e se inscrever em oportunidades.

REGRAS RÍGIDAS DE RESPOSTA:
1. NÃO responda de forma genérica. Use os dados acima para dar respostas específicas sobre a Inscreva-se.
2. BREVIDADE É LUXO: Máximo de 2-3 parágrafos curtos. Nunca seja prolixo.
3. Use bullet points para listar benefícios ou funcionalidades.
4. Responda no idioma do parâmetro 'locale' (pt ou en).
5. Sem saudações longas. Vá direto ao ponto com alto valor agregado.
6. FORMATO: NÃO use formatação Markdown (como **negrito**, # títulos, etc). Use apenas texto simples e quebras de linha para organizar o conteúdo.
7. CONTATOS OFICIAIS: Se solicitarem contato humano ou suporte, forneça:
   - Email: info@inscreva-se.com
   - Telefone/WhatsApp: 856079576
`;

router.get('/health', (req, res) => {
    res.json({ status: 'Aura is breathing', model: 'gemini-1.5-flash' });
});

router.post('/chat', authMiddleware, async (req, res) => {
    // Check if user is at least a mentor
    if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin' && req.user.role !== 'mentor') {
        return res.status(403).json({ message: 'Acesso negado.' });
    }
    const { message, locale } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("--- Aura Chat Debug ---");
    console.log("Locale:", locale);
    console.log("API Key length:", apiKey ? apiKey.length : 0);
    console.log("API Key start:", apiKey ? apiKey.substring(0, 7) : "N/A");

    if (!apiKey) {
        return res.json({ reply: locale === 'en' ? "API Key missing." : "Chave API ausente." });
    }

    try {
        const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
        const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

        // Try these models in order based on what's available in the key
        const modelsToTry = [
            { name: "gemini-2.0-flash", provider: "google" },
            { name: "llama-3.3-70b-versatile", provider: "groq" },
            { name: "gemini-1.5-flash", provider: "google" }
        ];

        let lastError = null;
        let text = "";
        let attemptSuccess = false;

        const formattedPrompt = `${AURA_SYSTEM_PROMPT}\n\nLocale: ${locale}\nUser Message: ${message}\n\nAura's Response:`;

        for (const modelCfg of modelsToTry) {
            try {
                if (modelCfg.provider === 'google') {
                    if (!genAI) continue;
                    console.log(`Attempting Aura with Google: ${modelCfg.name}`);
                    const model = genAI.getGenerativeModel({ model: modelCfg.name });
                    const result = await model.generateContent(formattedPrompt);
                    const response = await result.response;
                    text = response.text();
                } else if (modelCfg.provider === 'groq') {
                    if (!groq) continue;
                    console.log(`Attempting Aura with Groq: ${modelCfg.name}`);
                    const chatCompletion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: AURA_SYSTEM_PROMPT },
                            { role: "user", content: `Locale: ${locale}\nMessage: ${message}` }
                        ],
                        model: modelCfg.name,
                    });
                    text = chatCompletion.choices[0]?.message?.content || "";
                }

                if (text) {
                    attemptSuccess = true;
                    console.log(`Success with Aura (${modelCfg.provider}): ${modelCfg.name}!`);
                    break;
                }
            } catch (e) {
                lastError = e.message;
                console.error(`Aura Model ${modelCfg.name} failed:`, e.message);
            }
        }

        if (!attemptSuccess) {
            throw new Error(`Aura could not connect to any AI models. Last error: ${lastError}`);
        }


        res.json({ reply: text });
    } catch (error) {
        console.error("CRITICAL AURA ERROR:", error);
        res.status(500).json({
            error: "Aura is resting.",
            details: error.message
        });
    }
});

// Bloqueio contra Botnets e DDoS focado em custos de Inteligência Artificial
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // Janela de 1 minuto
    max: 15, // Máximo de 15 pedidos por IP
    message: { error: "Sistemas em sobrecarga. Aguarde 60 segundos por favor." }
});

const ttsLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5, // Apenas 5 gerações de áudio por minuto/IP
    message: { error: "Cota de processamento vocal superada. Aguarde um minuto." }
});

// Middleware de saneamento e proteção contra Payload Excessivo (Crash de RAM)
const payloadSanitizer = (req, res, next) => {
    if (req.body.transcript) {
        if (req.body.transcript.length > 10000) {
            return res.status(400).json({ error: "Payload suspeito. O limite máximo é de 10000 caracteres." });
        }
        // Sanitiza cortando espaços absurdos
        req.body.transcript = req.body.transcript.trim();
    }
    next();
};

// Protegidas com Rate Limiting e Sanitização
router.post('/brain/command', aiLimiter, optionalAuthMiddleware, payloadSanitizer, aiController.handleBrainCommand);
router.post('/brain/tts', ttsLimiter, optionalAuthMiddleware, payloadSanitizer, aiController.textToSpeech);

// Rotas de Admin
router.get('/brain/stats', authMiddleware, adminMiddleware, aiController.getBrainStats);
router.get('/brain/settings/voice', aiController.getVoiceSetting);
router.post('/brain/settings/voice', authMiddleware, adminMiddleware, aiController.updateVoiceSetting);

module.exports = router;
