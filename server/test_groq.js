require("dotenv").config();
const Groq = require("groq-sdk");

async function testGroq() {
    if (!process.env.GROQ_API_KEY) {
        console.error("❌ GROQ_API_KEY não encontrada no .env");
        return;
    }
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        console.log("🔍 Testando Groq (Llama 3.1 70B)...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Olá, confirma que estás online." }],
            model: "llama-3.1-70b-versatile",
        });
        console.log("✅ GROQ ONLINE:", chatCompletion.choices[0]?.message?.content);
    } catch (e) {
        console.error("❌ Erro no Groq:", e.message);
    }
}
testGroq();
