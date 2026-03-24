const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

const premiumStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background: #fff; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; color: #1a1a1a; overflow: hidden; }
        .card { background: #fff; border-radius: 32px; padding: 48px; text-align: center; max-width: 440px; width: 92%; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; }
        .spinner { width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #ffcc00; border-radius: 50%; animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite; margin: 0 auto 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .title { font-size: 1.5rem; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em; }
        .subtitle { font-size: 1rem; color: #666; margin-bottom: 32px; line-height: 1.6; }
        .qr-card { background: #fff; border: 1px solid #eee; border-radius: 24px; padding: 24px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 24px; }
        .btn-primary { display: inline-block; padding: 16px 32px; background: #111; color: #fff; text-decoration: none; border-radius: 16px; font-weight: 600; font-size: 1rem; transition: all 0.2s; border: none; cursor: pointer; width: 100%; box-sizing: border-box; }
        .btn-primary:hover { background: #333; transform: translateY(-2px); }
        .btn-link { color: #888; text-decoration: none; font-size: 0.85rem; margin-top: 24px; display: inline-block; font-weight: 500; }
        .btn-link:hover { color: #111; }
        .step-container { text-align: left; margin-top: 32px; padding: 20px; background: #fafafa; border-radius: 16px; border: 1px solid #f0f0f0; }
        .step { display: flex; align-items: center; margin-bottom: 12px; font-size: 0.85rem; color: #888; }
        .step.active { color: #111; font-weight: 600; }
        .step-dot { width: 6px; height: 6px; border-radius: 50%; background: #ddd; margin-right: 12px; }
        .step.active .step-dot { background: #ffcc00; box-shadow: 0 0 10px #ffcc00; }
    </style>
`;

router.get('/qr', async (req, res) => {
    try {
        const qrImage = await whatsappService.getQRImage();
        
        if (whatsappService.isConnected) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div style="font-size: 4rem; margin-bottom: 20px">🌟</div>
                    <div class="title">Conexão Pronta!</div>
                    <div class="subtitle">O WhatsApp está agora vinculado à sua plataforma e pronto para automatizar as suas vendas.</div>
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Trocar de Número de WhatsApp</a>
                </div>
            `);
        }

        if (qrImage) {
            return res.send(`
                ${premiumStyles}
                <div class="card">
                    <div class="title">Activar Automação</div>
                    <div class="subtitle">Leia o QR Code abaixo com o seu telemóvel para ligar o sistema.</div>
                    <div class="qr-card">
                        <img src="${qrImage}" style="width: 100%; border-radius: 12px;" />
                    </div>
                    <a href="/api/admin/whatsapp/qr" class="btn-primary">Actualizar QR Code</a>
                    <a href="/api/admin/whatsapp/restart" class="btn-link">Reiniciar Motor de Ligação</a>
                    <script>
                        console.log('🖼️ [WA Monitor] QR Code Carregado com Sucesso.');
                        // Autorefresh a cada 20 segundos para manter o QR vivo
                        setTimeout(() => window.location.reload(), 20000);
                    </script>
                </div>
            `);
        }

        res.send(`
            ${premiumStyles}
            <div class="card">
                <div class="spinner"></div>
                <div class="title">A preparar o Motor...</div>
                <div class="subtitle">Estamos a criar uma ligação encriptada com os servidores do WhatsApp.</div>
                <div id="status" style="font-size: 0.85rem; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Aguardando Resposta (7s)</div>
                <div class="step-container">
                    <div class="step active"><div class="step-dot"></div> A carregar módulos do motor...</div>
                    <div class="step"><div class="step-dot"></div> A negociar versão segura...</div>
                    <div class="step"><div class="step-dot"></div> A gerar par de chaves QR...</div>
                </div>
                <script>
                    console.log('⏳ [WA Monitor] Iniciando motor...');
                    let timeLeft = 7;
                    setInterval(() => {
                        timeLeft--;
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
    whatsappService.forceRestart().catch(e => console.error(e));
    res.send(`
        ${premiumStyles}
        <div class="card">
            <div class="spinner" style="border-top-color: #111"></div>
            <div class="title">Reinicialização Total</div>
            <div class="subtitle">A apagar cache de sessão e a reconstruir o túnel de comunicação...</div>
            
            <div class="step-container">
                <div id="s1" class="step active"><div class="step-dot"></div> A limpar ficheiros temporários...</div>
                <div id="s2" class="step"><div class="step-dot"></div> A renovar tokens de segurança...</div>
                <div id="s3" class="step"><div class="step-dot"></div> A reiniciar socket do servidor...</div>
            </div>

            <script>
                console.log('🧹 [WA Monitor] Reiniciando sistema...');
                setTimeout(() => { document.getElementById('s1').classList.remove('active'); document.getElementById('s2').classList.add('active'); }, 800);
                setTimeout(() => { document.getElementById('s2').classList.remove('active'); document.getElementById('s3').classList.add('active'); }, 1600);
                setTimeout(() => window.location.href = '/api/admin/whatsapp/qr', 3000);
            </script>
        </div>
    `);
});

module.exports = router;
