const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// Rota para obter o QR Code do WhatsApp
router.get('/test', (req, res) => res.send('Router WhatsApp Ativo! ✅'));

router.get('/qr', async (req, res) => {
    console.log('🔍 [WhatsApp Router] QR request received');
    try {
        const qrImage = await whatsappService.getQRImage();
        if (!qrImage) {
            if (whatsappService.isConnected) {
                return res.send('<div style="font-family:sans-serif;text-align:center;padding:50px"><meta http-equiv="refresh" content="5">✅ WhatsApp Conectado com Sucesso!</div>');
            }
            return res.send('<div style="font-family:sans-serif;text-align:center;padding:50px"><meta http-equiv="refresh" content="5">⏳ Gerando QR Code... Recarregue em 5 segundos.</div>');
        }
        res.send(`<div style="display:flex;flex-direction:column;align-items:center;padding:20px;font-family:sans-serif">
            <h1 style="font-size:1.2rem;margin-bottom:10px">Conectar WhatsApp</h1>
            <img src="${qrImage}" style="width:250px;height:250px;border:1px solid #ddd;padding:10px;border-radius:10px" />
            <p style="font-size:0.8rem;color:#666;margin-top:10px">Lê este código no teu WhatsApp.</p>
        </div>`);
    } catch (err) {
        console.error('Erro na rota de QR do WhatsApp:', err);
        res.status(500).send('Erro interno ao gerar QR');
    }
});

module.exports = router;
