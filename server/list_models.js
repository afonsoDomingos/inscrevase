const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔍 Listando modelos disponíveis...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log("📦 Modelos encontrados:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ ERRO AO LISTAR:", error.message);
    }
}
listModels();
