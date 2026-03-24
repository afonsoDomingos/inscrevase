const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// Estilo CSS Comum para Premium UI
const premiumStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fff; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; color: #1a1a1a; overflow: hidden; }
        .card { background: #fff; border-radius: 24px; padding: 40px; text-align: center; max-width: 400px; width: 90%; }
        .spinner { width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #ffcc00; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .title { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: #111; }
        .subtitle { font-size: 0.875rem; color: #666; margin-bottom: 24px; line-height: 1.5; }
        .qr-container { background: #fafafa; border: 2px dashed #eee; border-radius: 20px; padding: 20px; margin-bottom: 20px; position: relative; }
        .btn { display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 0.875rem; transition: all 0.2s; border: none; cursor: pointer; }
        .btn:hover { background: #333; transform: translateY(-1px); }
        .btn-secondary { background: #f4f4f4; color: #666; margin-top: 12px; }
        .countdown { font-weight: bold; color: #ffcc00; font-size: 1.1rem; }
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
        .status-online { background: #10b981; }
        .status-offline { background: #f59e0b; }
    </style>
`;

router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        
        if (whatsappService.isConnected) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div style="font-size: 3rem; margin-bottom: 10px">✅</div>
                    <div class="title">WhatsApp Conectado</div>
                    <div class="subtitle">A sua automação de mensagens está ativa e pronta para enviar notificações de vendas e inscrições.</div>
                    <a href="/api/admin/whatsapp/restart" class="btn btn-secondary">Alterar Número</a>
                </div>
            `);
        }

        if (qrImage) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="title">Ligar WhatsApp</div>
                    <div class="subtitle">Abra o WhatsApp no seu telemóvel, vá a "Aparelhos Conectados" e leia o código abaixo.</div>
                    <div class="qr-container">
                        <img src="${qrImage}" style="width: 100%; height: auto; display: block; border-radius: 12px;" />
                    </div>
                    <a href="/api/admin/whatsapp/qr" class="btn">Recarregar QR</a>
                    <br/>
                    <a href="/api/admin/whatsapp/restart" class="btn btn-secondary" style="font-size: 0.7rem">Limpar Sessão</a>
                </div>
            `);
        }

        res.send(`
            ${premiumStyles}
            <div class="card">
                <div class="spinner"></div>
                <div class="title">Iniciando Motor...</div>
                <div class="subtitle">A preparar o ambiente seguro para gerar o seu código de acesso.</div>
                <div style="font-size: 0.9rem; color: #999;">
                    Nova tentativa em <span id="countdown" class="countdown">7</span>s
                </div>
                <a href="/api/admin/whatsapp/restart" class="btn btn-secondary" style="margin-top: 40px; font-size: 0.75rem">Forçar Reinício do Motor</a>
                
                <script>
                    let timeLeft = 7;
                    let elem = document.getElementById('countdown');
                    setInterval(() => {
                        timeLeft--;
                        if (elem) elem.innerText = timeLeft;
                        if (timeLeft <= 0) window.location.reload();
                    }, 1000);
                </script>
            </div>
        `);
    } catch (err) {
        res.status(500).send('Erro no Monitor');
    }
});

router.get('/restart', async (req, res) => {
    await whatsappService.forceRestart();
    res.send(`
        ${premiumStyles}
        <div class="card">
            <div class="spinner"></div>
            <div class="title">Reiniciando o Sistema</div>
            <div class="subtitle">A limpar a memória e a criar uma nova sessão de segurança...</div>
            <script>setTimeout(() => window.location.href = '/api/admin/whatsapp/qr', 2500);</script>
        </div>
    `);
});

module.exports = router;
