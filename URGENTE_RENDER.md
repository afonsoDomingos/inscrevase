# ⚡ AÇÃO URGENTE - Adicionar Variáveis no Render

## 🚨 O formulário está dando erro 500 porque faltam as variáveis de ambiente!

### Passos Rápidos (2 minutos):

1. **Acesse:** https://dashboard.render.com
2. **Clique** no serviço do backend (API)
3. **Menu lateral** → **Environment**
4. **Clique** em "Add Environment Variable"

### Adicione estas 2 variáveis:

**Variável 1:**
```
Key: EMAIL_USER
Value: karinganastudio23@gmail.com
```

**Variável 2:**
```
Key: EMAIL_PASSWORD
Value: bplzonlswpehdron
```

5. **Clique** em "Save Changes"
6. **Aguarde** o redeploy automático (2-3 minutos)

---

## ✅ Depois de adicionar:

O formulário vai funcionar assim:

### Se as variáveis ESTIVEREM configuradas:
- ✅ Mensagem salva no banco
- ✅ Email enviado para você
- ✅ Email de confirmação para o usuário
- ✅ Resposta: "Mensagem enviada com sucesso! Verifique seu email."

### Se as variáveis NÃO estiverem configuradas:
- ✅ Mensagem salva no banco (sempre funciona!)
- ⚠️ Email NÃO é enviado
- ✅ Resposta: "Mensagem recebida com sucesso! Entraremos em contato em breve."
- ℹ️ Você pode ver as mensagens no MongoDB

---

## 🔍 Como verificar se funcionou:

1. **Veja os logs do Render:**
   - Se aparecer: "Email credentials not configured" → Faltam as variáveis
   - Se aparecer: "Emails sent successfully" → Tudo OK!

2. **Teste o formulário:**
   - Acesse: https://seu-site.onrender.com/suporte
   - Preencha e envie
   - Verifique seu email

---

## 📊 Status Atual:

- ✅ Código corrigido e deployed
- ⚠️ Aguardando variáveis de ambiente
- ✅ Mensagens sempre são salvas (mesmo sem email)
- ✅ Não dá mais erro 500

**Adicione as variáveis AGORA para ativar os emails!** 🚀
