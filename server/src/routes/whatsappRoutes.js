const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

const premiumStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fff; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; color: #1a1a1a; overflow: hidden; }
        .card { background: #fff; border-radius: 32px; padding: 48px; text-align: center; max-width: 440px; width: 92%; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; position: relative; }
        .status-badge { position: absolute; top: 24px; right: 24px; display: flex; align-items: center; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 12px; border-radius: 100px; background: #fafafa; border: 1px solid #eee; }
        .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
        .dot-online { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); animation: pulse 2s infinite; }
        .dot-offline { background: #ef4444; }
        .dot-waiting { background: #ffcc00; animation: pulse 1s infinite; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        .spinner { width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #ffcc00; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite; margin: 0 auto 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .title { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em; }
        .subtitle { font-size: 1rem; color: #666; margin-bottom: 32px; line-height: 1.6; }
        .qr-card { background: #fff; border: 1px solid #eee; border-radius: 24px; padding: 24px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 24px; }
        .btn-primary { display: inline-block; padding: 16px 32px; background: #111; color: #fff; text-decoration: none; border-radius: 16px; font-weight: 600; font-size: 1rem; transition: all 0.2s; border: none; cursor: pointer; width: 100%; box-sizing: border-box; }
        .btn-primary:hover { background: #333; transform: translateY(-2px); }
        .btn-success { background: #ffcc00; color: #000; font-weight: 700; }
        .btn-success:hover { background: #f5c200; }
        .btn-link { color: #888; text-decoration: none; font-size: 0.85rem; margin-top: 24px; display: inline-block; font-weight: 500; }
        .btn-link:hover { color: #111; }
    </style>
`;

router.get('/status', (req, res) => {
    res.json({ connected: whatsappService.isConnected });
});

router.get('/test-message', async (req, res) => {
    if (!whatsappService.isConnected) return res.send('WhatsApp não conectado.');
    // Pegar o número conectado da própria sessão do Baileys
    const number = whatsappService.sock?.user?.id.split(':')[0];
    if (number) {
        await whatsappService.sendMessage(number, '🚀 *SISTEMA OPERACIONAL!* \n\nOlá! Este é um teste da tua plataforma *Inscreva-se*. \n\nO teu WhatsApp está agora oficialmente ligado e pronto para automatizar as tuas vendas. Parabéns! 🎯');
        res.send(`<script>alert('Mensagem de teste enviada para o teu próprio WhatsApp!'); window.location.href='/api/admin/whatsapp/qr';</script>`);
    } else {
        res.send('Erro ao identificar o número ligado.');
    }
});

router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        
        if (whatsappService.isConnected) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="status-badge"><div class="dot dot-online"></div> Online</div>
                    <img src="https://res.cloudinary.com/dly8m6clv/image/upload/v1711186545/logo-inscrevase_zjx7y5.png" style="width: 160px; margin-bottom: 24px" alt="Logo Inscreva-se" />
                    <div class="title">Conexão Pronta!</div>
                    <div class="subtitle">O WhatsApp está oficialmente vinculado à sua plataforma e pronto para enviar mensagens.</div>
                    
                    <a href="/api/admin/whatsapp/test-message" class="btn-primary btn-success">🚀 ENVIAR MENSAGEM DE TESTE</a>
                    
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Trocar de Número de WhatsApp</a>
                </div>
            `);
        }

        if (qrImage) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="status-badge"><div class="dot dot-waiting"></div> Aguardando</div>
                    <div class="title">Activar Automação</div>
                    <div class="subtitle">Leia o QR Code abaixo com o seu telemóvel para ligar o sistema.</div>
                    <div class="qr-card">
                        <img src="${qrImage}" style="width: 100%; border-radius: 12px;" />
                    </div>
                    <button onclick="refreshQR(this)" id="refreshBtn" class="btn-primary">Actualizar QR Code</button>
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Reiniciar Motor</a>
                    <script>
                        async function refreshQR(btn) {
                            let wait = 5; btn.disabled = true; btn.style.opacity = '1';
                            const int = setInterval(() => { wait--; btn.innerText = 'Actualizando em '+(wait+1)+'s...';  if(wait < 0) clearInterval(int); }, 1000);
                            setTimeout(() => window.location.reload(), 5000);
                        }
                        setInterval(async () => {
                          const res = await fetch('/api/admin/whatsapp/status');
                          const data = await res.json();
                          if (data.connected) window.location.reload();
                        }, 2500);
                    </script>
                </div>
            `);
        }

        res.send(`
            ${premiumStyles}
            <div class="card">
                <div class="status-badge"><div class="dot dot-offline"></div> Desconectado</div>
                <div class="spinner"></div>
                <div class="title">A preparar o Motor...</div>
                <div class="subtitle">Estamos a criar uma ligação encriptada com os servidores do WhatsApp.</div>
                <div id="status" style="font-size: 0.85rem; color: #999; font-weight: 500;">Próxima tentativa em <span id="countdown">7</span>s</div>
                <script>
                    let timeLeft = 7;
                    setInterval(() => {
                        timeLeft--;
                        document.getElementById('countdown').innerText = timeLeft;
                        if (timeLeft <= 0) window.location.reload();
                    }, 1000);
                    setInterval(async () => {
                        const res = await fetch('/api/admin/whatsapp/status');
                        const data = await res.json();
                        if (data.connected) window.location.reload();
                    }, 2500);
                </script>
            </div>
        `);
    } catch (err) {
        res.status(500).send('Erro no Monitor');
    }
});

router.get('/restart', async (req, res) => {
    whatsappService.forceRestart().catch(e => console.error(e));
    res.send(`
        ${premiumStyles}
        <div class="card">
            <div class="spinner"></div>
            <div class="title">Reinicialização Total</div>
            <div class="subtitle">A apagar cache de sessão e a reconstruir o túnel de comunicação...</div>
            <script>setTimeout(() => window.location.href = '/api/admin/whatsapp/qr', 3000);</script>
        </div>
    `);
});

module.exports = router;
