# 📧 Checklist - Email Não Chegou

## 🔍 Onde verificar no Gmail:

### 1. Caixa de Entrada Principal
- Procure por: "Nova Mensagem de Suporte"
- Remetente: "Inscreva-se Suporte"

### 2. Pasta SPAM/Lixo Eletrônico ⚠️
**MUITO IMPORTANTE!**
- Vá em: Gmail → Spam
- Procure por emails de "Inscreva-se Suporte"
- Se encontrar, marque como "Não é spam"

### 3. Todas as Mensagens
- Clique em "Todas as mensagens" no menu lateral
- Use a busca: `from:karinganastudio23@gmail.com`

### 4. Promoções/Social
- Verifique as abas Promoções e Social

---

## 🔧 Verificar Configuração no Render

### Passo 1: Ver os Logs
1. Acesse: https://dashboard.render.com
2. Selecione o serviço do backend
3. Clique em "Logs"
4. Procure por:
   - ✅ "Emails sent successfully" → Email foi enviado!
   - ⚠️ "Email credentials not configured" → Faltam variáveis
   - ❌ "Erro ao enviar email" → Problema de autenticação

### Passo 2: Verificar Variáveis
1. No Render → Environment
2. Confirme que existem:
   ```
   EMAIL_USER = karinganastudio23@gmail.com
   EMAIL_PASSWORD = bplzonlswpehdron
   ```
3. Se não existirem, adicione agora!

---

## 🧪 Teste Local

Vamos testar localmente para ver se funciona:

### No seu computador:

1. **Abra o terminal no servidor:**
   ```bash
   cd "c:\Users\LENOVO\Documents\Inscreva se\server"
   ```

2. **Verifique se o .env existe:**
   ```bash
   cat .env
   ```
   Deve mostrar:
   ```
   EMAIL_USER=karinganastudio23@gmail.com
   EMAIL_PASSWORD=bplzonlswpehdron
   ```

3. **Teste o formulário localmente:**
   - Acesse: http://localhost:3000/suporte
   - Preencha com SEU email
   - Envie
   - Verifique se chega no SEU email

---

## 🔐 Verificar Senha de App

A senha pode ter expirado ou sido revogada:

1. Acesse: https://myaccount.google.com/apppasswords
2. Veja se a senha "Inscreva-se Suporte" ainda existe
3. Se não existir, gere uma nova:
   - Clique em "Gerar"
   - Nome: "Inscreva-se Suporte"
   - Copie a nova senha
   - Atualize no Render (Environment Variables)
   - Atualize no .env local

---

## 🚨 Possíveis Causas

### 1. Variáveis não configuradas no Render
- **Solução:** Adicionar EMAIL_USER e EMAIL_PASSWORD

### 2. Email foi para SPAM
- **Solução:** Verificar pasta Spam e marcar como "Não é spam"

### 3. Senha de App expirou
- **Solução:** Gerar nova senha de app

### 4. Gmail bloqueou o envio
- **Solução:** Verificar alertas de segurança no Gmail

### 5. Delay no envio
- **Solução:** Aguardar alguns minutos (pode demorar até 5 min)

---

## ✅ Próximos Passos

1. **Verificar SPAM** (mais provável!)
2. **Ver logs do Render** para confirmar envio
3. **Testar localmente** para isolar o problema
4. **Gerar nova senha de app** se necessário

---

## 💡 Dica Rápida

Execute este comando no terminal do servidor para ver se há erros:

```bash
# Ver últimas linhas do log
npm run dev
```

Depois envie uma mensagem pelo formulário e veja o que aparece no console!
