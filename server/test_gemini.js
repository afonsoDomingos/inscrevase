require('dotenv').config({ path: '.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    const key = 'AIzaSyCYl_leiNnQ06wNOGwApRwETGVzxviQevY';
    console.log("Using key:", key.substring(0, 10));
    const genAI = new GoogleGenerativeAI(key);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Oi");
        console.log("gemini-1.5-flash works:", result.response.text());
    } catch(e) {
        console.log("Error 1.5-flash:", e.message);
    }
}
run();
