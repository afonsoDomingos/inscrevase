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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #fafafa; display: flex; align-items: flex-start; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: #fff; border-radius: 24px; padding: 20px 20px 24px; text-align: center; max-width: 380px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.07); border: 1px solid #eee; position: relative; }
        .logo-img { width: 100px; max-width: 50%; height: auto; margin: 0 auto 14px; display: block; }
        .status-badge { position: absolute; top: 16px; right: 16px; display: flex; align-items: center; font-size: 0.58rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 5px 10px; border-radius: 100px; background: #fff; border: 1.5px solid #eee; }
        .dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; flex-shrink: 0; }
        .dot-online { background: #10b981; animation: pulse 2s infinite; }
        .dot-offline { background: #ef4444; }
        .dot-waiting { background: #ffcc00; animation: pulse 1s infinite; }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .spinner { width: 32px; height: 32px; border: 3px solid #f0f0f0; border-top: 3px solid #ffcc00; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .title { font-size: 1.15rem; font-weight: 800; margin-bottom: 5px; color: #000; letter-spacing: -0.02em; }
        .subtitle { font-size: 0.78rem; color: #6b7280; margin-bottom: 14px; line-height: 1.5; }
        .qr-wrapper { background: #fafafa; border: 1px solid #eee; border-radius: 16px; padding: 12px; margin-bottom: 14px; }
        .qr-img { width: 100%; height: auto; display: block; border-radius: 8px; }
        .btn-primary { display: block; padding: 13px; background: #ffcc00; color: #000; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 0.875rem; transition: all 0.2s; border: none; cursor: pointer; width: 100%; box-shadow: 0 6px 16px rgba(255,204,0,0.3); }
        .btn-primary:hover { background: #f5c200; transform: translateY(-2px); }
        .btn-link { color: #9ca3af; text-decoration: none; font-size: 0.75rem; margin-top: 12px; display: inline-block; font-weight: 600; }
        .btn-link:hover { color: #111; }
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
