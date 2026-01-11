# 🚀 Configuração de Email no Render (Produção)

## 📋 Visão Geral

Para que o formulário de suporte funcione em produção no Render, você precisa adicionar as variáveis de ambiente EMAIL_USER e EMAIL_PASSWORD.

---

## 🔧 Passo a Passo no Render

### 1. Acessar o Dashboard do Render

1. Acesse: https://dashboard.render.com
2. Faça login na sua conta
3. Selecione o serviço do **backend** (API/Server)

### 2. Adicionar Variáveis de Ambiente

1. No menu lateral, clique em **"Environment"**
2. Role até a seção **"Environment Variables"**
3. Clique em **"Add Environment Variable"**

### 3. Adicionar EMAIL_USER

- **Key:** `EMAIL_USER`
- **Value:** `karinganastudio23@gmail.com`
- Clique em **"Save"**

### 4. Adicionar EMAIL_PASSWORD

- **Key:** `EMAIL_PASSWORD`
- **Value:** `bplzonlswpehdron`
- Clique em **"Save"**

### 5. Variáveis Completas Necessárias

Certifique-se de que estas variáveis estão configuradas:

```
MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=seu_jwt_secret
EMAIL_USER=karinganastudio23@gmail.com
EMAIL_PASSWORD=bplzonlswpehdron
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
PORT=5000
NODE_ENV=production
CLIENT_URL=https://seu-frontend.onrender.com
```

### 6. Salvar e Fazer Deploy

1. Após adicionar as variáveis, clique em **"Save Changes"**
2. O Render irá **automaticamente fazer redeploy** do serviço
3. Aguarde o deploy terminar (geralmente 2-5 minutos)

---

## ✅ Verificar se Funcionou

### Teste 1: Verificar Logs
1. No Render, vá em **"Logs"**
2. Procure por mensagens de erro relacionadas a email
3. Se não houver erros, está funcionando!

### Teste 2: Testar o Formulário
1. Acesse sua aplicação em produção
2. Vá para `/suporte`
3. Preencha e envie o formulário
4. Verifique:
   - ✉️ Email em `karinganastudio23@gmail.com`
   - ✉️ Email de confirmação no endereço que você usou

---

## 🔒 Segurança no Render

### ✅ Boas Práticas

1. **Nunca commite o .env no Git**
   - O `.env` já está no `.gitignore`
   - Variáveis sensíveis só no Render

2. **Use Environment Variables do Render**
   - Mais seguro que hardcoded
   - Fácil de atualizar sem redeploy de código

3. **Senha de App do Gmail**
   - Use sempre App Password, não a senha real
   - Pode ser revogada sem afetar a conta

---

## 🚨 Troubleshooting

### Emails não estão sendo enviados?

**1. Verificar variáveis:**
```bash
# No Render, vá em Environment e confirme:
EMAIL_USER=karinganastudio23@gmail.com
EMAIL_PASSWORD=bplzonlswpehdron (sem espaços!)
```

**2. Verificar logs do Render:**
- Procure por erros como:
  - "Invalid login"
  - "Authentication failed"
  - "Connection timeout"

**3. Senha de App expirou?**
- Gere uma nova em: https://myaccount.google.com/apppasswords
- Atualize no Render
- Faça redeploy

**4. Gmail bloqueou?**
- Verifique se há alertas de segurança no Gmail
- Confirme que "Acesso de apps menos seguros" está permitido (se necessário)

### Deploy não está atualizando?

1. **Forçar redeploy:**
   - No Render, clique em **"Manual Deploy"** → **"Deploy latest commit"**

2. **Limpar cache:**
   - Em Settings → **"Clear build cache & deploy"**

---

## 📊 Monitoramento

### Ver mensagens recebidas

As mensagens ficam salvas no MongoDB. Para visualizar:

1. **Via MongoDB Atlas:**
   - Acesse seu cluster
   - Collections → `supportmessages`
   - Veja todas as mensagens

2. **Criar dashboard admin (futuro):**
   - Interface para ver e responder mensagens
   - Filtros por status, data, etc.

---

## 🎯 Checklist Final

- [ ] EMAIL_USER adicionado no Render
- [ ] EMAIL_PASSWORD adicionado no Render
- [ ] Deploy concluído com sucesso
- [ ] Logs sem erros
- [ ] Teste de formulário realizado
- [ ] Email recebido no Gmail
- [ ] Email de confirmação recebido

---

## 💡 Dicas Extras

### Limite de Emails do Gmail

- Gmail tem limite de ~500 emails/dia para contas gratuitas
- Se ultrapassar, considere:
  - SendGrid (2000 emails/mês grátis)
  - Mailgun (5000 emails/mês grátis)
  - AWS SES (muito barato)

### Melhorar Deliverability

1. **Configurar SPF/DKIM** (se usar domínio próprio)
2. **Evitar spam words** nos emails
3. **Manter lista limpa** (remover bounces)

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do Render
2. Teste localmente primeiro
3. Confirme que a senha de app está correta
4. Verifique se o MongoDB está conectado

**Tudo configurado?** Seu formulário de suporte está pronto para produção! 🎉
