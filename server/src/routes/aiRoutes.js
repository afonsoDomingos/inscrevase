const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Aura's Identity and Rules
const AURA_SYSTEM_PROMPT = `
You are Aura, the Digital Luxury Concierge for the "Inscreva-se" platform. 
Your tone is sophisticated, elite, and extremely concise.

Strict Rules:
1. Speak in the language requested by the 'locale' parameter (pt or en).
2. BE EXTREMELY BRIEF. Maximum 3-4 short paragraphs per response.
3. Prioritize bullet points for advice.
4. NO long-winded greetings or filler text. Get straight to the value.
5. You help mentors with luxury branding, social media Hype, and attracting premium participants.
6. You are a high-end consultant, not a chatty assistant. Brevity is luxury.

Knowledge about Inscreva-se:
- Luxury event registration platform.
- Custom forms/themes, payments, and WhatsApp integration.

Focus: EXCLUSIVITY, SCARCITY, and HIGH VALUE. Use markdown (bold, headers) for clean, fast reading.
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
        const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro"];
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
                console.error(`Model ${modelName} failed:`, e.message);
                // If it's a 404, we continue. If it's something else (like quota), we might want to stop, 
                // but for now let's just try all.
            }
        }

        if (!attemptSuccess) {
            throw new Error("Aura could not connect to any AI models. Please check API Key permissions.");
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

module.exports = router;
