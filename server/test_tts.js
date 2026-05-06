require('dotenv').config();
const OpenAI = require("openai");

async function test() {
    console.log("Key:", process.env.OPENAI_API_KEY ? "Existe (Length: " + process.env.OPENAI_API_KEY.length + ")" : "Ausente");
    if(!process.env.OPENAI_API_KEY) return;
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "onyx",
            input: "teste",
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        console.log("Sucesso! Buffer gerado com", buffer.length, "bytes.");
    } catch(e) {
        console.error("Falha na API da OpenAI:", e.message);
    }
}
test();
