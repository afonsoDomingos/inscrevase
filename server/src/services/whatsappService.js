const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const os = require('os');
const QRCode = require('qrcode');
const pino = require('pino');

// Directório de sessão automático (funciona em Windows, Mac e Linux/Render)
const AUTH_PATH = path.join(os.tmpdir(), 'inscrevase_wa_session_v3');
console.log('📦 [WA] Local de Sessão Definido:', AUTH_PATH);

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.qrCodeData = null;
        this.isConnected = false;
        this.isInitializing = false;
        console.log('🏗️ [WA] WhatsAppService Construído.');
    }

    async init() {
        if (this.isInitializing) {
            console.log('⏳ [WA] Motor já está a inicializar. Ignorando pedido duplicado.');
            return;
        }
        this.isInitializing = true;

        console.log('🚀 [WA] A INICIAR MOTOR (PASSO 1)...');

        try {
            console.log('📂 [WA] Passo 2: Verificando Pasta de Sessão...');
            if (!fs.existsSync(AUTH_PATH)) {
                fs.mkdirSync(AUTH_PATH, { recursive: true });
                console.log('📁 [WA] Pasta Criada!');
            }

            console.log('🔑 [WA] Passo 3: Carregando useMultiFileAuthState...');
            const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
            console.log('✅ [WA] Estado de Autenticação Carregado!');

            console.log('📡 [WA] Passo 4: Chamando makeWASocket...');
            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'debug' }), // Logs de baixa-nível para vermos tudo no terminal
                browser: ['Inscreva-Se Automations', 'Chrome', '1.2.0'],
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000
            });

            console.log('🚀 [WA] Passo 5: Socket Criado com Sucesso!');

            // Eventos de Credenciais
            this.sock.ev.on('creds.update', async () => {
                console.log('💾 [WA] Credenciais Actualizadas (saveCreds)...');
                await saveCreds();
            });

            // Eventos de Ligação
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    console.log('🖼️ [WA] QR CODE RECEBIDO!');
                    this.qrCodeData = qr;
                    this.isConnected = false;
                }

                if (connection === 'close') {
                    const status = lastDisconnect?.error?.output?.statusCode;
                    const message = lastDisconnect?.error?.message;
                    console.log(`❌ [WA] LIGAÇÃO FECHADA (Status: ${status}) - Motivo: ${message}`);
                    
                    this.isConnected = false;
                    this.isInitializing = false;
                    
                    const shouldReconnect = status !== DisconnectReason.loggedOut;
                    if (shouldReconnect) {
                        console.log('🔄 [WA] Reiniciando em 5 segundos...');
                        setTimeout(() => this.init(), 5000);
                    }
                } else if (connection === 'open') {
                    console.log('✅ [WA] LIGAÇÃO TOTALMENTE ESTABELECIDA!');
                    this.isConnected = true;
                    this.qrCodeData = null;
                }
            });

        } catch (error) {
            console.error('💥 [WA] ERRO CRÍTICO NO INIT:', error.message);
            console.error('Stack:', error.stack);
            this.isInitializing = false;
        }
    }

    async getQRImage() {
        if (!this.qrCodeData) return null;
        try {
            return await QRCode.toDataURL(this.qrCodeData);
        } catch (err) {
            console.error('Erro ao converter QR para base64:', err);
            return null;
        }
    }

    async forceRestart() {
        console.log('🔄 [WA] REINÍCIO MANUAL SOLICITADO (Limpando Estados)...');
        this.isInitializing = false;
        this.isConnected = false;
        this.qrCodeData = null;
        this.sock = null; 
        console.log('🧹 [WA] Estados limpos. A chamar init()...');
        return await this.init();
    }
}

const whatsappService = new WhatsAppService();
module.exports = whatsappService;
