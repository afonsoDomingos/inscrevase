const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const os = require('os');
const QRCode = require('qrcode');
const pino = require('pino');

// Directório de sessão automático (funciona em Windows, Mac e Linux/Render)
const AUTH_PATH = path.join(os.tmpdir(), 'inscrevase_wa_session');

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.qrCodeData = null; // Guardar o QR para mostrar na Dashboard Admin
        this.isConnected = false;
    }

    async init() {
        console.log('--- WHATSAPP ENGINE: Inicializando... ---');
        
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: true, // Mostrar logo no log do terminal (fácil de ler agora)
            logger: pino({ level: 'silent' }), // Silenciar logs técnicos chatos
            browser: ["Inscreva-se Automations", "Chrome", "1.0.0"]
        });

        // Eventos de Ligação
        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('📡 [WhatsApp Engine] NOVO QR CODE GERADO COM SUCESSO!');
                this.qrCodeData = qr; // QR Code bruto para gerar imagem base64
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('❌ [WhatsApp Engine] Ligação Fechada:', lastDisconnect.error?.message || 'Erro desconhecido');
                console.log('🔄 [WhatsApp Engine] A tentar reconectar:', shouldReconnect);
                this.isConnected = false;
                this.isInitializing = false; // Resetar o estado de inicialização para permitir nova tentativa
                if (shouldReconnect) this.init();
            } else if (connection === 'open') {
                console.log('✅ [WhatsApp Engine] CONECTADO COM SUCESSO!');
                this.isConnected = true;
                this.isInitializing = false; // Finalizou a inicialização com sucesso
                this.qrCodeData = null;
            }
        });

        // Guardar credenciais sempre que houver update
        this.sock.ev.on('creds.update', saveCreds);
    }

    async forceRestart() {
        console.log('🔄 [WhatsApp Engine] COMANDO DE REINÍCIO MANUAL RECEBIDO.');
        this.isInitializing = false;
        this.isConnected = false;
        this.qrCodeData = null;
        this.sock = null; 
        return await this.init();
    }

    // Função universal de envio
    async sendMessage(to, message) {
        if (!this.isConnected || !this.sock) {
            console.warn('⚠️ WhatsApp not connected. Cannot send message.');
            return null;
        }

        try {
            // Garantir formato do número (ex: 2449... -> 2449...@s.whatsapp.net)
            let formattedNumber = to.replace(/[\s\+\(\)]/g, '');
            if (!formattedNumber.includes('@s.whatsapp.net')) {
                formattedNumber = `${formattedNumber}@s.whatsapp.net`;
            }

            const sentMsg = await this.sock.sendMessage(formattedNumber, { text: message });
            return sentMsg;
        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            return null;
        }
    }

    // Obter o QR Code como imagem (para o teu Admin ver na Dashboard)
    async getQRImage() {
        if (!this.qrCodeData) return null;
        return await QRCode.toDataURL(this.qrCodeData);
    }
}

// Exportar como Singleton (instância única)
module.exports = new WhatsAppService();
