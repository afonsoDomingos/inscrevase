# 📧 Configuração de Email para Formulário de Suporte

## ⚙️ Passo a Passo

### 1. Gerar Senha de App do Gmail

1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login com `karinganastudio23@gmail.com`
3. Clique em "Selecionar app" → Escolha "Outro (nome personalizado)"
4. Digite: "Inscreva-se Suporte"
5. Clique em "Gerar"
6. Copie a senha de 16 caracteres gerada

### 2. Configurar no Servidor

Edite o arquivo `server/.env` e adicione:

```env
EMAIL_USER=karinganastudio23@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_aqui
```

**Importante:** Use a senha de app gerada, NÃO a senha normal da conta!

### 3. Reiniciar o Servidor

```bash
cd server
npm run dev
```

## ✅ Testar

1. Acesse: http://localhost:3000/suporte
2. Preencha o formulário
3. Envie a mensagem
4. Verifique:
   - ✉️ Email no `karinganastudio23@gmail.com` (notificação)
   - ✉️ Email no endereço que você usou no formulário (confirmação)

## 📋 O que acontece quando alguém envia uma mensagem:

1. **Mensagem salva no banco de dados** com status "pending"
2. **Email enviado para você** com:
   - Nome do remetente
   - Email do remetente
   - Assunto
   - Mensagem completa
   - ID da mensagem
   - Data e hora

3. **Email de confirmação enviado para o usuário** com:
   - Confirmação de recebimento
   - Cópia da mensagem enviada
   - Número de protocolo
   - Tempo estimado de resposta (24h)

## 🔒 Segurança

- ✅ Senha de app é diferente da senha da conta
- ✅ Pode ser revogada a qualquer momento
- ✅ Não expõe a senha real do Gmail
- ✅ Mensagens armazenadas no banco de dados

## 🚨 Troubleshooting

### Email não está sendo enviado?

1. Verifique se `EMAIL_PASSWORD` está no `.env`
2. Confirme que é uma senha de app, não a senha normal
3. Verifique os logs do servidor para erros
4. Teste a conexão SMTP

### Emails indo para spam?

- Configure SPF e DKIM no domínio (se usar domínio próprio)
- Por enquanto, marque como "Não é spam" no Gmail

## 📞 Contatos Configurados

- **Telefone/WhatsApp:** +258 84 787 7405
- **Email:** karinganastudio23@gmail.com
- **WhatsApp Direto:** Link com mensagem pré-preenchida

## 🎯 Próximos Passos (Opcional)

1. **Dashboard Admin:** Criar interface para visualizar mensagens
2. **Responder pelo sistema:** Adicionar função de resposta
3. **Notificações:** Push notifications para novas mensagens
4. **Categorias:** Classificar mensagens por tipo
5. **Prioridade:** Sistema de priorização automática
