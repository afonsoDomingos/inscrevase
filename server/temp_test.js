const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🚀 Testando Gemini 1.5...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        const result = await model.generateContent("Olá! Estás a funcionar?");
        const response = await result.response;
        console.log("✅ RESPOSTA IA:", response.text());
    } catch (error) {
        console.error("❌ ERRO IA:", error.message);
    }
}
testGemini();
