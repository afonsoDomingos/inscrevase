const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

const premiumStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fff; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #111; overflow-x: hidden; padding: 20px; box-sizing: border-box; }
        .card { background: #fff; border-radius: 40px; padding: 48px 40px; text-align: center; max-width: 460px; width: 100%; box-shadow: 0 40px 80px rgba(0,0,0,0.04); border: 1px solid #f2f2f2; position: relative; }
        .status-badge { position: absolute; top: 32px; right: 32px; display: flex; align-items: center; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 16px; border-radius: 100px; background: #fff; border: 1.5px solid #f0f0f0; box-shadow: 0 4px 6px rgba(0,0,0,0.01); }
        .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; }
        .dot-online { background: #10b981; animation: pulse 2s infinite; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
        .dot-offline { background: #ef4444; }
        .dot-waiting { background: #ffcc00; animation: pulse 1s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.9); } }
        .logo-img { width: 170px; max-width: 75%; height: auto; margin: 0 auto 36px; display: block; filter: saturate(1.1); }
        .spinner { width: 44px; height: 44px; border: 3px solid #f6f6f6; border-top: 3px solid #ffcc00; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite; margin: 0 auto 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .title { font-size: 1.75rem; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.04em; color: #000; line-height: 1.1; }
        .subtitle { font-size: 1rem; color: #6b7280; margin-bottom: 36px; line-height: 1.6; padding: 0 15px; }
        .qr-wrapper { background: #fff; border: 2px solid #f9fafb; border-radius: 32px; padding: 28px; box-shadow: inset 0 2px 12px rgba(0,0,0,0.03); margin-bottom: 32px; }
        .qr-img { width: 100%; height: auto; display: block; border-radius: 16px; transition: opacity 0.3s; }
        .btn-primary { display: flex; align-items: center; justify-content: center; padding: 20px 32px; background: #ffcc00; color: #000; text-decoration: none; border-radius: 20px; font-weight: 800; font-size: 1.05rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; cursor: pointer; width: 100%; box-sizing: border-box; box-shadow: 0 20px 40px rgba(255, 204, 0, 0.25); }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:hover { background: #f5c200; transform: translateY(-4px); box-shadow: 0 25px 50px rgba(255, 204, 0, 0.35); }
        .btn-link { color: #9ca3af; text-decoration: none; font-size: 0.85rem; margin-top: 32px; display: inline-block; font-weight: 600; transition: color 0.2s; }
        .btn-link:hover { color: #000; }
        
        @media (max-width: 480px) {
            .card { padding: 40px 24px; }
            .title { font-size: 1.5rem; }
        }
    </style>
`;

// Rota de Status
router.get('/status', (req, res) => res.json({ connected: whatsappService.isConnected }));

// Rota para Mensagem de Teste (BLINDADA CONTRA ERRO 500)
router.get('/test-message', async (req, res) => {
    try {
        if (!whatsappService.isConnected) {
            return res.send(`
                <script>
                    alert('⚠️ Primeiro conecte-se ao WhatsApp lendo o QR Code!'); 
                    window.location.href='/api/admin/whatsapp/qr';
                </script>
            `);
        }
        
        // Identificação segura do ID
        const userId = whatsappService.sock?.user?.id;
        if (!userId) {
            return res.send(`
                <script>
                    alert('❌ O motor ainda está a carregar os dados do seu número. Aguarde 3 segundos e tente novamente.'); 
                    window.location.href='/api/admin/whatsapp/qr';
                </script>
            `);
        }

        // Limpar o número eliminando : e @
        const number = userId.split(':')[0].split('@')[0];
        
        const welcomeMsg = '🚀 *SISTEMA OPERACIONAL (INSREVA.SE)!* \n\nOlá! O teu WhatsApp foi configurado com sucesso. \n\nAgora a tua plataforma está 100% pronta para gerir notificações e automatizar vendas. Vamos a isto! 🎯💎';
        
        await whatsappService.sendMessage(number, welcomeMsg);
        
        res.send(`
            <script>
                alert('✅ Parabéns! Enviámos agora mesmo uma mensagem de confirmação para o teu WhatsApp.'); 
                window.location.href='/api/admin/whatsapp/qr';
            </script>
        `);
    } catch (err) {
        console.error('❌ ERRO TEST MESSAGE:', err);
        res.send(`
            <script>
                alert('⚠️ Ocorreu um erro técnico: ${err.message}'); 
                window.location.href='/api/admin/whatsapp/qr';
            </script>
        `);
    }
});

// Monitor Principal
router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        const logoUrl = "https://inscreva-se.com/logo.png";
        
        if (whatsappService.isConnected) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="status-badge"><div class="dot dot-online"></div> Online</div>
                    <img src="${logoUrl}" class="logo-img" alt="Logo" onerror="this.src='/logo.png'" />
                    <div class="title">Tudo Pronto!</div>
                    <div class="subtitle">O WhatsApp está oficialmente vinculado e pronto para as tuas automações de elite.🎯</div>
                    <a href="/api/admin/whatsapp/test-message" class="btn-primary">🚀 ENVIAR MENSAGEM DE TESTE</a>
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Trocar de Número ligado</a>
                </div>
                <script>
                    setInterval(async () => {
                        const res = await fetch('/api/admin/whatsapp/status');
                        const data = await res.json();
                        if(!data.connected) window.location.reload();
                    }, 5000);
                </script>
            `);
        }

        if (qrImage) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="status-badge"><div class="dot dot-waiting"></div> Aguardando</div>
                    <img src="${logoUrl}" class="logo-img" alt="Logo" onerror="this.src='/logo.png'" />
                    <div class="title">Activar Sistema</div>
                    <div class="subtitle">Escaneia o código abaixo com o teu WhatsApp para ligar a plataforma.</div>
                    <div class="qr-wrapper"><img src="${qrImage}" class="qr-img" /></div>
                    <button onclick="refreshQR(this)" class="btn-primary">Actualizar QR Code</button>
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Reiniciar Motor</a>
                    <script>
                        function refreshQR(btn) {
                            let wait = 5; btn.disabled = true; btn.style.opacity = '0.7'; btn.style.boxShadow = 'none';
                            const int = setInterval(() => { wait--; btn.innerHTML = 'Gerando nova chave em '+(wait+1)+'s...'; if(wait<0) clearInterval(int); }, 1000);
                            setTimeout(() => window.location.reload(), 5000);
                        }
                        setInterval(async () => {
                            const res = await fetch('/api/admin/whatsapp/status');
                            const data = await res.json();
                            if(data.connected) window.location.reload();
                        }, 3000);
                    </script>
                </div>
            `);
        }

        res.send(`
            ${premiumStyles}
            <div class="card">
                <div class="status-badge"><div class="dot dot-offline"></div> Offline</div>
                <img src="${logoUrl}" class="logo-img" alt="Logo" onerror="this.src='/logo.png'" />
                <div class="spinner"></div>
                <div class="title">Iniciando Motor...</div>
                <div class="subtitle">Estamos a reconstruir o túnel de encriptação com os servidores do WhatsApp.❤️</div>
                <script>
                    setTimeout(() => window.location.reload(), 7000);
                    setInterval(async () => {
                        const res = await fetch('/api/admin/whatsapp/status');
                        const data = await res.json();
                        if(data.connected) window.location.reload();
                    }, 3000);
                </script>
            </div>
        `);
    } catch (err) { res.status(500).send('Erro no Monitor'); }
});

router.get('/restart', async (req, res) => {
    whatsappService.forceRestart().catch(e => console.error(e));
    res.send(`
        ${premiumStyles}
        <div class="card">
            <div class="spinner"></div>
            <div class="title">Reinicialização Total</div>
            <div class="subtitle">A apagar cache de sessão e a reconstruir o túnel de comunicação...</div>
            <script>setTimeout(() => window.location.href = '/api/admin/whatsapp/qr', 3500);</script>
        </div>
    `);
});

module.exports = router;
