const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const whatsappService = require('../services/whatsappService');

// Lê o logo do disco e converte para base64 para garantir que aparece sempre
let logoBase64 = '';
try {
    const logoPath = path.join(__dirname, '../../../client/public/logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
} catch (e) {
    console.warn('[Monitor] Logo não encontrado:', e.message);
}

const premiumStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fff; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #111; padding: 20px; box-sizing: border-box; }
        .card { background: #fff; border-radius: 40px; padding: 48px 40px; text-align: center; max-width: 440px; width: 100%; box-shadow: 0 40px 80px rgba(0,0,0,0.04); border: 1px solid #eee; position: relative; }
        .logo-img { width: 180px; max-width: 80%; height: auto; margin: 0 auto 36px; display: block; filter: saturate(1.1); }
        .status-badge { position: absolute; top: 32px; right: 32px; display: flex; align-items: center; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 16px; border-radius: 100px; background: #fff; border: 1.5px solid #eee; }
        .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 10px; }
        .dot-online { background: #10b981; animation: pulse 2s infinite; }
        .dot-offline { background: #ef4444; }
        .dot-waiting { background: #ffcc00; animation: pulse 1s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .spinner { width: 44px; height: 44px; border: 3px solid #f6f6f6; border-top: 3px solid #ffcc00; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .title { font-size: 1.7rem; font-weight: 800; margin-bottom: 12px; color: #000; line-height: 1.1; }
        .subtitle { font-size: 0.95rem; color: #6b7280; margin-bottom: 36px; line-height: 1.6; }
        .qr-wrapper { background: #fff; border: 1px solid #eee; border-radius: 32px; padding: 28px; box-shadow: inset 0 2px 12px rgba(0,0,0,0.03); margin-bottom: 32px; }
        .qr-img { width: 100%; height: auto; display: block; border-radius: 16px; }
        .btn-primary { display: flex; align-items: center; justify-content: center; padding: 20px 32px; background: #ffcc00; color: #000; text-decoration: none; border-radius: 20px; font-weight: 800; font-size: 1rem; transition: all 0.2s; border: none; cursor: pointer; width: 100%; box-sizing: border-box; box-shadow: 0 15px 30px rgba(255, 204, 0, 0.2); }
        .btn-primary:hover { background: #f5c200; transform: translateY(-3px); box-shadow: 0 20px 40px rgba(255, 204, 0, 0.3); }
        .btn-link { color: #9ca3af; text-decoration: none; font-size: 0.85rem; margin-top: 32px; display: inline-block; font-weight: 600; }
    </style>
`;

router.get('/status', (req, res) => res.json({ connected: whatsappService.isConnected }));

router.get('/test-message', async (req, res) => {
    try {
        if (!whatsappService.isConnected) return res.send('<script>alert("Ligue o WhatsApp primeiro!"); window.location.href="/api/admin/whatsapp/qr";</script>');
        
        const fullId = whatsappService.sock?.user?.id;
        if (!fullId) return res.status(400).send('ID não encontrado. Aguarde conexão total.');

        const number = fullId.split(':')[0].split('@')[0];
        const text = '🚀 *TESTE INSREVA.SE*: O teu motor de automação está 100% operacional! 🎯';
        
        await whatsappService.sendMessage(number, text);
        res.send(`<script>alert('✅ Mensagem enviada!'); window.location.href='/api/admin/whatsapp/qr';</script>`);
    } catch (e) {
        console.error('ERRO TEST:', e);
        res.status(500).send('Erro no servidor: ' + e.message);
    }
});

router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        const logoUrl = logoBase64;

        if (whatsappService.isConnected) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="status-badge"><div class="dot dot-online"></div> Online</div>
                    <img src="${logoUrl}" class="logo-img" onerror="this.src='https://raw.githubusercontent.com/afonsoDomingos/inscrevase/main/client/public/logo.png'" />
                    <div class="title">Conexão Pronta!</div>
                    <div class="subtitle">O sistema está ativo e a monitorizar vendas.</div>
                    <a href="/api/admin/whatsapp/test-message" class="btn-primary">🚀 ENVIAR MENSAGEM DE TESTE</a>
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Trocar de Número</a>
                </div>
            `);
        }

        if (qrImage) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="status-badge"><div class="dot dot-waiting"></div> Aguardando</div>
                    <img src="${logoUrl}" class="logo-img" onerror="this.src='https://raw.githubusercontent.com/afonsoDomingos/inscrevase/main/client/public/logo.png'" />
                    <div class="title">Activar Automação</div>
                    <div class="subtitle">Leia o QR Code para ligar o sistema.</div>
                    <div class="qr-wrapper"><img src="${qrImage}" class="qr-img" /></div>
                    <button onclick="window.location.reload()" class="btn-primary">Actualizar QR Code</button>
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Reiniciar Motor</a>
                </div>
            `);
        }

        res.send(`
            ${premiumStyles}
            <div class="card">
                <div class="status-badge"><div class="dot dot-offline"></div> Offline</div>
                <div class="spinner"></div>
                <div class="title">Iniciando...</div>
                <div class="subtitle">A negociar ligação segura...</div>
            </div>
            <script>setTimeout(() => window.location.reload(), 5000);</script>
        `);
    } catch (err) { res.status(500).send('Erro'); }
});

router.get('/restart', async (req, res) => {
    whatsappService.forceRestart().catch(e => console.error(e));
    res.send('<script>window.location.href="/api/admin/whatsapp/qr";</script>');
});

module.exports = router;
