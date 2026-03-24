const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

// Estilo CSS Comum para Premium UI
const premiumStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fff; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; color: #1a1a1a; overflow: hidden; }
        .card { background: #fff; border-radius: 28px; padding: 40px; text-align: center; max-width: 420px; width: 92%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.006); }
        .spinner { width: 44px; height: 44px; border: 3px solid #f3f3f3; border-top: 3px solid #ffcc00; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .title { font-size: 1.4rem; font-weight: 700; margin-bottom: 12px; color: #111; letter-spacing: -0.02em; }
        .subtitle { font-size: 0.95rem; color: #666; margin-bottom: 32px; line-height: 1.6; }
        .qr-card { background: #fafafa; border: 1.5px solid #f0f0f0; border-radius: 20px; padding: 24px; margin-bottom: 24px; }
        .btn-primary { display: inline-block; padding: 14px 28px; background: #ffcc00; color: #000; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 0.95rem; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: none; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(255, 204, 0, 0.2); }
        .btn-primary:hover { background: #f5c200; transform: scale(1.02); box-shadow: 0 12px 20px -5px rgba(255, 204, 0, 0.3); }
        .btn-ghost { display: inline-block; padding: 12px 20px; background: transparent; color: #888; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 0.8rem; transition: all 0.2s; border: 1px solid #eee; margin-top: 24px; }
        .btn-ghost:hover { background: #fdfdfd; color: #333; border-color: #ddd; }
        .countdown { color: #ffcc00; font-weight: 800; font-variant-numeric: tabular-nums; }
        .loader-bar { width: 140px; height: 4px; background: #f0f0f0; margin: 0 auto 16px; border-radius: 10px; overflow: hidden; position: relative; }
        .loader-progress { width: 40%; height: 100%; background: #ffcc00; border-radius: 10px; position: absolute; animation: loading 1.5s ease-in-out infinite; }
        @keyframes loading { 0% { left: -40%; } 100% { left: 100%; } }
    </style>
`;

router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        
        if (whatsappService.isConnected) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div style="font-size: 3.5rem; margin-bottom: 16px">✨</div>
                    <div class="title">Sistema Ativo!</div>
                    <div class="subtitle">O WhatsApp está oficialmente conectado. Todas as notificações serão enviadas em tempo real.</div>
                    <a href="/api/admin/whatsapp/restart" class="btn-ghost">Desconectar e Ligar Outro</a>
                </div>
            `);
        }

        if (qrImage) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="title">Conectar WhatsApp</div>
                    <div class="subtitle">Leia o código abaixo com o WhatsApp do seu telemóvel para ativar a automação.</div>
                    <div class="qr-card">
                        <img src="${qrImage}" style="width: 100%; border-radius: 12px;" />
                    </div>
                    <a href="/api/admin/whatsapp/qr" class="btn-primary">Actualizar QR Code</a>
                    <br/>
                    <a href="/api/admin/whatsapp/restart" class="btn-ghost" style="margin-top:32px">Limpar e Reiniciar</a>
                </div>
            `);
        }

        res.send(`
            ${premiumStyles}
            <div class="card">
                <div class="spinner"></div>
                <div class="title">Iniciando Motor...</div>
                <div class="subtitle">A negociar a ligação segura entre o servidor e o motor do WhatsApp.</div>
                
                <div style="margin-top: 24px; font-size: 0.85rem; color: #999;">
                    Nova tentativa em <span id="countdown" class="countdown">7</span>s
                </div>
                
                <a href="/api/admin/whatsapp/restart" class="btn-primary" style="margin-top: 40px; width: 100%; box-sizing: border-box;">🚀 FORÇAR REINÍCIO DO MOTOR</a>
            </div>
            
            <script>
                let timeLeft = 7;
                let elem = document.getElementById('countdown');
                setInterval(() => {
                    timeLeft--;
                    if (elem) elem.innerText = timeLeft;
                    if (timeLeft <= 0) window.location.reload();
                }, 1000);
            </script>
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
            <div class="loader-bar"><div class="loader-progress"></div></div>
            <div class="title">Limpando Sessão</div>
            <div class="subtitle">A repor os estados de segurança e a criar uma nova pasta para o seu QR Code.</div>
            <script>setTimeout(() => window.location.href = '/api/admin/whatsapp/qr', 2500);</script>
        </div>
    `);
});

module.exports = router;
