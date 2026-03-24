const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const whatsappService = require('../services/whatsappService');

// Lê o logo do disco em base64
let logoBase64 = '';
try {
    const logoPath = path.join(__dirname, '../../../client/public/logo.png');
    logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
} catch (e) {
    console.warn('[Monitor] Logo não encontrado:', e.message);
}

const styles = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    body {
        font-family: 'Inter', sans-serif;
        background: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 12px;
        gap: 8px;
    }
    .logo { width: 80px; height: auto; display: block; }
    .badge {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.08em; padding: 4px 10px; border-radius: 99px;
        border: 1.5px solid #eee; background: #fff; color: #374151;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .dot-online { background: #10b981; animation: pulse 2s infinite; }
    .dot-offline { background: #ef4444; }
    .dot-waiting { background: #ffcc00; animation: blink 1s infinite; }
    @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
    @keyframes blink { 0%,100%{opacity:.5} 50%{opacity:1} }
    .title { font-size: 1rem; font-weight: 800; color: #111; text-align: center; }
    .sub { font-size: 0.72rem; color: #6b7280; text-align: center; }
    .qr-img { width: 160px; height: 160px; border-radius: 10px; border: 1px solid #eee; display: block; }
    .spinner {
        width: 28px; height: 28px;
        border: 3px solid #f0f0f0; border-top-color: #ffcc00;
        border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn {
        display: block; width: 200px; padding: 11px 0;
        background: #ffcc00; color: #000; font-weight: 800;
        font-size: 0.8rem; border: none; border-radius: 12px;
        cursor: pointer; text-decoration: none; text-align: center;
        box-shadow: 0 4px 14px rgba(255,204,0,0.35);
        transition: transform 0.15s;
    }
    .btn:hover { transform: translateY(-2px); background: #f5c200; }
    .link { font-size: 0.68rem; color: #9ca3af; text-decoration: none; font-weight: 600; }
    .link:hover { color: #111; }
</style>
`;

router.get('/status', (req, res) => res.json({ connected: whatsappService.isConnected }));

router.get('/test-message', async (req, res) => {
    const toastPage = (icon, color, title, msg, redirect='/api/admin/whatsapp/qr') => `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:'Inter',sans-serif; background:#fff; display:flex; align-items:center; justify-content:center; height:100vh; }
            .toast {
                background:#fff; border-radius:20px; padding:28px 32px; text-align:center;
                box-shadow:0 8px 30px rgba(0,0,0,0.08); border:1.5px solid #f0f0f0;
                max-width:320px; width:90%; animation:pop .3s cubic-bezier(.175,.885,.32,1.275);
            }
            @keyframes pop { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
            .icon { font-size:2.5rem; margin-bottom:14px; }
            .title { font-size:1.1rem; font-weight:800; color:#111; margin-bottom:6px; }
            .msg { font-size:0.82rem; color:#6b7280; margin-bottom:20px; line-height:1.5; }
            .btn { display:inline-block; padding:11px 28px; background:${color}; color:#fff; border-radius:12px; font-weight:800; font-size:0.85rem; text-decoration:none; border:none; cursor:pointer; }
        </style>
        <div class="toast">
            <div class="icon">${icon}</div>
            <div class="title">${title}</div>
            <div class="msg">${msg}</div>
            <a href="${redirect}" class="btn">OK</a>
        </div>`;

    try {
        if (!whatsappService.isConnected || !whatsappService.sock) {
            return res.send(toastPage('⚠️','#f59e0b','WhatsApp Desligado','Ligue o WhatsApp antes de enviar mensagens de teste.'));
        }
        const fullId = whatsappService.sock?.user?.id;
        if (!fullId) {
            return res.send(toastPage('⏳','#6366f1','A Conectar...','O número ainda está a ser identificado. Aguarde uns segundos e tente novamente.'));
        }

        // Para auto-mensagem no Baileys, usar o número limpo com @s.whatsapp.net
        // O fullId tem formato "258847877405:5@s.whatsapp.net"
        const number = fullId.split(':')[0]; // "258847877405"
        const jid = `${number}@s.whatsapp.net`;
        console.log(`[TEST] Enviando auto-teste para JID: ${jid}`);

        // Enviar directamente via sock para garantir formato correcto
        await whatsappService.sock.sendMessage(jid, { 
            text: '🚀 *TESTE INSCREVA.SE*\n\nAutomação 100% operacional! ✅\n\nEste é o número ligado ao motor de notificações.' 
        });

        res.send(toastPage('✅','#10b981','Mensagem Enviada!',
            `Enviada para +${number}. Verifique o chat "Mensagens Guardadas" (ícone de estrela) no seu WhatsApp.`
        ));
    } catch (e) {
        console.error('ERRO TEST:', e);
        res.send(toastPage('❌','#ef4444','Erro no Envio', e.message));
    }
});

router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        const logo = logoBase64 ? `<img src="${logoBase64}" class="logo" />` : '';

        if (whatsappService.isConnected) {
            return res.send(`${styles}${logo}
                <div class="badge"><div class="dot dot-online"></div>Online</div>
                <div class="title">WhatsApp Ligado ✅</div>
                <div class="sub">Sistema activo e a monitorizar.</div>
                <a href="/api/admin/whatsapp/test-message" class="btn">🚀 Enviar Mensagem Teste</a>
                <a href="/api/admin/whatsapp/restart" class="link">Trocar de número</a>`);
        }

        if (qrImage) {
            return res.send(`${styles}${logo}
                <div class="badge"><div class="dot dot-waiting"></div>Aguardando</div>
                <div class="title">Leia o QR Code</div>
                <div class="sub">Abra o WhatsApp → Dispositivos → Ligar.</div>
                <img src="${qrImage}" class="qr-img" />
                <button onclick="window.location.reload()" class="btn">↻ Actualizar QR</button>
                <a href="/api/admin/whatsapp/restart" class="link">Reiniciar motor</a>
                <script>setInterval(async()=>{const r=await fetch('/api/admin/whatsapp/status');const d=await r.json();if(d.connected)window.location.reload();},4000);</script>`);
        }

        // A iniciar
        res.send(`${styles}${logo}
            <div class="badge"><div class="dot dot-offline"></div>Offline</div>
            <div class="spinner"></div>
            <div class="title">A iniciar...</div>
            <div class="sub">A conectar ao servidor WhatsApp.</div>
            <script>setTimeout(()=>window.location.reload(),5000);</script>`);

    } catch (err) {
        res.status(500).send('Erro interno');
    }
});

router.get('/restart', async (req, res) => {
    whatsappService.forceRestart().catch(e => console.error(e));
    res.send('<script>window.location.href="/api/admin/whatsapp/qr";</script>');
});

module.exports = router;
