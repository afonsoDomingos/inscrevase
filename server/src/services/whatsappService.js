const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const os = require('os');
const QRCode = require('qrcode');
const pino = require('pino');

// Directório de sessão automático com versão nova para evitar conflitos
const AUTH_PATH = path.join(os.tmpdir(), 'inscrevase_wa_v4');

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.qrCodeData = null;
        this.isConnected = false;
        this.isInitializing = false;
    }

    async init() {
        if (this.isInitializing) return;
        this.isInitializing = true;

        console.log('--- 🚀 WHATSAPP ENGINE STARTUP ---');

        try {
            // Garantir que a pasta existe e está limpa se houver erros
            if (!fs.existsSync(AUTH_PATH)) {
                fs.mkdirSync(AUTH_PATH, { recursive: true });
            }

            console.log('📂 [WA] Pasta de sessão ok:', AUTH_PATH);

            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`📡 [WA] Usando versão do WhatsApp v${version.join('.')} (Latest: ${isLatest})`);

            const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);

            this.sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: true, // Vamos forçar no terminal do Render também!
                logger: pino({ level: 'info' }), // Baixar de 'silent' para 'info' para vermos erros
                browser: ['Inscreva-Se Automations', 'Safari', '1.0.0']
            });

            console.log('📡 [WA] Socket criado e à escuta...');

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    console.log('🖼️ [WA] QR CODE GERADO E DISPONÍVEL! (Logar para capturar)');
                    this.qrCodeData = qr;
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    console.log('❌ [WA] Ligação parada. Código:', statusCode);
                    this.isConnected = false;
                    this.isInitializing = false;
                    
                    if (statusCode !== DisconnectReason.loggedOut) {
                        console.log('🔄 [WA] Tentando reconectar em 10s...');
                        setTimeout(() => this.init(), 10000);
                    }
                } else if (connection === 'open') {
                    console.log('✅ [WA] LIGADO E PRONTO PARA ENVIAR MENSAGENS!');
                    this.isConnected = true;
                    this.qrCodeData = null;
                    this.isInitializing = false;
                }
            });

        } catch (error) {
            console.error('💥 [WA] ERRO FATAL NO INÍCIO:', error);
            this.isInitializing = false;
        }
    }

    async getQRImage() {
        if (!this.qrCodeData) return null;
        try {
            return await QRCode.toDataURL(this.qrCodeData);
        } catch (err) {
            return null;
        }
    }

    async sendMessage(to, text) {
        if (!this.isConnected || !this.sock) {
            console.error('[WA] Tentativa de envio sem ligação activa.');
            return false;
        }
        try {
            const jid = `${to.replace(/\D/g, '')}@s.whatsapp.net`;
            await this.sock.sendMessage(jid, { text });
            console.log(`✅ [WA] Mensagem enviada para ${jid}`);
            return true;
        } catch (e) {
            console.error('[WA] Erro ao enviar mensagem:', e.message);
            return false;
        }
    }

    async forceRestart() {
        console.log('🛠️ [WA] REINÍCIO FORÇADO...');
        this.isConnected = false;
        this.isInitializing = false;
        this.qrCodeData = null;
        try {
            // Tentar apagar a pasta da sessão para começar do zero (pode resolver 90% dos problemas)
            if (fs.existsSync(AUTH_PATH)) {
                fs.rmSync(AUTH_PATH, { recursive: true, force: true });
                console.log('🧹 [WA] Pasta de sessão antiga eliminada.');
            }
        } catch (e) {
            console.warn('Não foi possível limpar a pasta de sessão:', e.message);
        }
        return await this.init();
    }
}

const whatsappService = new WhatsAppService();
module.exports = whatsappService;
