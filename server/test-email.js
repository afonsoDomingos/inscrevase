// Script de teste para verificar se o email está funcionando
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🧪 Testando configuração de email...\n');

    // Verificar variáveis
    console.log('📋 Verificando variáveis de ambiente:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ NÃO configurado');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ NÃO configurado');
    console.log('');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('❌ ERRO: Variáveis de ambiente não configuradas!');
        console.log('Configure EMAIL_USER e EMAIL_PASSWORD no arquivo .env');
        process.exit(1);
    }

    try {
        // Criar transporter
        console.log('🔧 Criando transporter...');
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verificar conexão
        console.log('🔌 Verificando conexão com Gmail...');
        await transporter.verify();
        console.log('✅ Conexão estabelecida com sucesso!\n');

        // Enviar email de teste
        console.log('📧 Enviando email de teste...');
        const info = await transporter.sendMail({
            from: `"Inscreva-se Teste" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Envia para você mesmo
            subject: '✅ Teste de Email - Inscreva-se',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10b981;">✅ Email Funcionando!</h2>
                    <p>Se você está vendo este email, significa que:</p>
                    <ul>
                        <li>✅ As variáveis de ambiente estão corretas</li>
                        <li>✅ A senha de app está válida</li>
                        <li>✅ O Gmail está aceitando os emails</li>
                        <li>✅ O nodemailer está configurado corretamente</li>
                    </ul>
                    <p><strong>Tudo pronto para produção!</strong></p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">
                        Data: ${new Date().toLocaleString('pt-BR')}<br>
                        Message ID: ${info.messageId || 'N/A'}
                    </p>
                </div>
            `
        });

        console.log('✅ Email enviado com sucesso!');
        console.log('📬 Message ID:', info.messageId);
        console.log('📧 Destinatário:', process.env.EMAIL_USER);
        console.log('\n🎉 TUDO FUNCIONANDO! Verifique sua caixa de entrada.');
        console.log('⚠️  Se não chegou, verifique a pasta SPAM!\n');

    } catch (error) {
        console.log('\n❌ ERRO ao enviar email:');
        console.log('Tipo:', error.code || 'Desconhecido');
        console.log('Mensagem:', error.message);
        console.log('\n🔧 Possíveis soluções:');

        if (error.code === 'EAUTH') {
            console.log('- Senha de app incorreta ou expirada');
            console.log('- Gere uma nova em: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ECONNECTION') {
            console.log('- Problema de conexão com a internet');
            console.log('- Firewall bloqueando porta 587/465');
        } else {
            console.log('- Verifique as credenciais no .env');
            console.log('- Confirme que EMAIL_USER e EMAIL_PASSWORD estão corretos');
        }

        process.exit(1);
    }
}

// Executar teste
testEmail();
