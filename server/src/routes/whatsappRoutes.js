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
                    <a href="/api/admin/whatsapp/qr" style="margin-top:20px;padding:8px 15px;background:#eee;border-radius:5px;text-decoration:none;color:#333;font-size:0.8rem">Recarregar QR</a>
                </div>
            `);
        }

        // Estado de Carregamento (Esta mensagem tem de aparecer para saberes que o código está actualizado!)
        res.send(`
            <div style="font-family:sans-serif;text-align:center;padding:50px">
                <meta http-equiv="refresh" content="7">
                <div style="margin-bottom:20px">📟 [CÓDIGO V2] Iniciando motor do WhatsApp...</div>
                <div style="font-size:0.8rem;color:#999">Se o motor não arrancar, use o botão abaixo:</div>
                <br/>
                <a href="/api/admin/whatsapp/restart" style="padding:10px;background:#ffcc00;border-radius:5px;text-decoration:none;color:#000;font-weight:bold;font-size:0.8rem">⚠️ FORÇAR REINÍCIO MANUAL</a>
            </div>
        `);
    } catch (err) {
        res.status(500).send('Erro no Monitor WhatsApp');
    }
});

// Forçar Reinício
router.get('/restart', async (req, res) => {
    console.log('🛠️ [WhatsApp Router] Manual restart triggered...');
    await whatsappService.forceRestart();
    res.send(`
        <div style="font-family:sans-serif;text-align:center;padding:50px">
            <h2>🔄 Reiniciando Motor...</h2>
            <p>O motor foi limpo. A voltar em 3 segundos...</p>
            <script>setTimeout(() => window.location.href = '/api/admin/whatsapp/qr', 3000);</script>
        </div>
    `);
});

module.exports = router;
