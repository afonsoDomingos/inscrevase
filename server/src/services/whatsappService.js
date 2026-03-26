const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
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
        this.isReconnecting = false;
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
                browser: Browsers.ubuntu('Chrome') // Importante para o Pairing Code funcionar correctamente no Baileys!
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
                    this.qrCodeData = null; // Clean false QR codes from ghost sessions!
                    
                    if (statusCode !== DisconnectReason.loggedOut) {
                        this.isReconnecting = true;
                        console.log('🔄 [WA] Tentando reconectar em 10s...');
                        setTimeout(() => this.init(), 10000);
                    } else {
                        console.log('🚪 [WA] Logout explícito! Requer novo QR Code.');
                        this.isReconnecting = false;
                        this.forceRestart(); 
                    }
                } else if (connection === 'open') {
                    console.log('✅ [WA] LIGADO E PRONTO PARA ENVIAR MENSAGENS!');
                    this.isConnected = true;
                    this.qrCodeData = null;
                    this.isInitializing = false;
                    this.isReconnecting = false;
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

    async requestPairingCode(phoneNumber) {
        if (!this.sock) throw new Error('Servidor não está a escutar ligações.');
        if (this.isConnected) throw new Error('WhatsApp já está ligado.');
        
        const clean = phoneNumber.replace(/[^0-9]/g, '');
        if (clean.length < 9) throw new Error('Número de telefone muito curto.');
        
        console.log(`[WA] Requisitando código de vinculação para: ${clean}`);
        // Aguarda 1.5s antes do pedido conforme sugestões do próprio Baileys
        await new Promise(r => setTimeout(r, 1500));
        
        const code = await this.sock.requestPairingCode(clean);
        return code;
    }

    async sendMessage(to, text) {
        if (!this.isConnected || !this.sock) {
            throw new Error('WhatsApp não está conectado. Leia o QR Code primeiro.');
        }
        // Limpar o número: só dígitos, sem o 'to' completo do Baileys
        let clean = to.replace(/[^0-9]/g, '');
        
        // Se tem 9 dígitos e começa por 8 (ex: 84, 82...), assume que é Moçambique e adiciona o 258
        if (clean.length === 9 && clean.startsWith('8')) {
            console.log(`[WA] Auto-corrigindo número sem indicativo: ${clean} -> 258${clean}`);
            clean = `258${clean}`;
        }

        if (!clean || clean.length < 9) {
            throw new Error(`Número inválido: "${to}" → "${clean}"`);
        }
        const jid = `${clean}@s.whatsapp.net`;
        console.log(`[WA] A enviar mensagem para ${jid}...`);
        
        const WhatsAppLog = require('../models/WhatsAppLog');
        
        try {
            await this.sock.sendMessage(jid, { text });
            console.log(`✅ [WA] Mensagem enviada com sucesso para ${jid}`);
            
            // Gravação no log do MongoDB (Assíncrona / Non-blocking)
            WhatsAppLog.create({
                to: clean,
                message: text,
                status: 'success'
            }).catch(e => console.error('[WALog] Erro ao persistir:', e));

            return true;
        } catch (error) {
            console.error(`❌ [WA] Falha ao enviar para ${jid}:`, error);
            
            // Gravação do Erro no MongoDB
            WhatsAppLog.create({
                to: clean,
                message: text,
                status: 'error',
                errorReason: error.message
            }).catch(e => console.error('[WALog] Erro ao persistir falha:', e));
            
            throw error;
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
