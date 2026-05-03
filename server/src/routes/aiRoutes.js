const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { authMiddleware, adminMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');

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
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try these models in order based on what's available in the key
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
        let lastError = null;
        let text = "";
        let attemptSuccess = false;

        const formattedPrompt = `${AURA_SYSTEM_PROMPT}\n\nLocale: ${locale}\nUser Message: ${message}\n\nAura's Response:`;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting Aura with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(formattedPrompt);
                const response = await result.response;
                text = response.text();
                attemptSuccess = true;
                console.log(`Success with model: ${modelName}! Response length:`, text.length);
                break;
            } catch (e) {
                lastError = e.message;
                console.error(`Model ${modelName} failed:`, e.message);
                // Log full error for critical issues like 403/401
                if (e.message.includes('403') || e.message.includes('401') || e.message.includes('permission')) {
                    console.error("PERMISSION ERROR DETECTED:", e);
                }
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

const aiController = require('../controllers/aiController');

router.post('/brain/command', optionalAuthMiddleware, aiController.handleBrainCommand);
router.get('/brain/stats', authMiddleware, adminMiddleware, aiController.getBrainStats);

module.exports = router;
