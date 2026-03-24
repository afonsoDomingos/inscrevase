const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// Rota principal (Monitor)
router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        
        // Se estiver conectado
        if (whatsappService.isConnected) {
            return res.send(`
                <div style="font-family:sans-serif;text-align:center;padding:50px">
                    <h2 style="color:green">✅ WhatsApp Conectado!</h2>
                    <p>O sistema de automação está activo e pronto.</p>
                    <a href="/api/admin/whatsapp/restart" style="color:#666;font-size:0.8rem">Ligar outro número (Reiniciar)</a>
                </div>
            `);
        }

        // Se o QR Code existir
        if (qrImage) {
            return res.send(`
                <div style="display:flex;flex-direction:column;align-items:center;padding:20px;font-family:sans-serif">
                    <h1 style="font-size:1.2rem;margin-bottom:10px">Conectar WhatsApp</h1>
                    <img src="${qrImage}" style="width:250px;height:250px;border:1px solid #ddd;padding:10px;border-radius:10px" />
                    <p style="font-size:0.8rem;color:#666;margin-top:10px">Lê este código no teu WhatsApp.</p>
                    <a href="/api/admin/whatsapp/qr" style="margin-top:20px;padding:8px 15px;background:#eee;border-radius:5px;text-decoration:none;color:#333;font-size:0.8rem">Actualizar QR Agora</a>
                </div>
            `);
        }

        // Estado de Carregamento com Contador Dinâmico (7 a 0)
        res.send(`
            <div style="font-family:sans-serif;text-align:center;padding:50px;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%">
                <div style="font-size:3rem;margin-bottom:20px">⏳</div>
                <div style="margin-bottom:10px;font-weight:bold;color:#333">📟 [WA Engine] Iniciando Motor...</div>
                <div id="countdown" style="font-size:1.5rem;color:#ffcc00;font-weight:bold;margin-bottom:20px">7</div>
                <div style="font-size:0.8rem;color:#999">Tentando novamente em segundos.</div>
                <br/>
                <a href="/api/admin/whatsapp/restart" style="padding:10px;background:#f0f0f0;border-radius:5px;text-decoration:none;color:#555;font-size:0.75rem;border:1px solid #ddd">Forçar Reinício manual</a>
                
                <script>
                    let timeLeft = 7;
                    let elem = document.getElementById('countdown');
                    let timerId = setInterval(() => {
                        timeLeft--;
                        elem.innerText = timeLeft;
                        if (timeLeft <= 0) {
                            clearInterval(timerId);
                            window.location.reload();
                        }
                    }, 1000);
                </script>
            </div>
        `);
    } catch (err) {
        res.status(500).send('Erro no Monitor WhatsApp');
    }
});

// Forçar Reinício
router.get('/restart', async (req, res) => {
    try {
        await whatsappService.forceRestart();
        res.send(`
            <div style="font-family:sans-serif;text-align:center;padding:50px">
                <h2>🔄 Limpando...</h2>
                <script>setTimeout(() => window.location.href = '/api/admin/whatsapp/qr', 1000);</script>
            </div>
        `);
    } catch (error) {
        res.status(500).send('Erro no Restart: ' + error.message);
    }
});

module.exports = router;
