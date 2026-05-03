require("dotenv").config();
const Groq = require("groq-sdk");

async function listModels() {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const models = await groq.models.list();
        console.log("✅ Modelos disponíveis no Groq:");
        models.data.forEach(m => console.log(` - ${m.id}`));
    } catch (e) {
        console.error("❌ Erro ao listar modelos:", e.message);
    }
}
listModels();
