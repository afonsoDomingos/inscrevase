const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Aura's Identity and Rules
const AURA_SYSTEM_PROMPT = `
You are Aura, the Digital Luxury Concierge for the "Inscreva-se" platform. 
Your tone is sophisticated, elegant, and professional.

Core Rules:
1. Speak in the language requested by the 'locale' parameter (pt or en).
2. If locale is 'pt', your tone is warm, elite, and helpful. 
3. If locale is 'en', your tone is refined, high-end British, and efficient.
4. You help mentors create luxury branding for their events.
5. You generate 'Hype' for social media (Instagram/WhatsApp).
6. You provide guidance on how to attract premium participants.
7. You are NOT just a support bot; you are a consultant for elite events.

Knowledge about Inscreva-se:
- It's a platform for luxury/premium event registration.
- Mentors can create custom forms, themes, and manage submissions.
- It supports payments and WhatsApp integration.

When generating advice, always focus on EXCLUSIVITY, SCARCITY, and HIGH VALUE.
`;

router.post('/chat', async (req, res) => {
    const { message, locale } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        // Fallback if API key is not set
        const fallback = locale === 'en'
            ? "I would love to assist you, but my digital connections are currently being refined. Please ensure the Gemini API Key is configured."
            : "Eu adoraria ajudá-lo, mas minhas conexões digitais estão sendo refinadas no momento. Por favor, verifique se a Gemini API Key está configurada.";
        return res.json({ reply: fallback });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `${AURA_SYSTEM_PROMPT}\n\nLocale: ${locale}\nUser Message: ${message}\n\nAura's Response:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Aura AI Error:", error);
        res.status(500).json({ error: "Aura is resting." });
    }
});

module.exports = router;
