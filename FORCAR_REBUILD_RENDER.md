# 🚨 FORÇAR REBUILD NO RENDER

O Render está usando código antigo (SendGrid) em vez do novo (Resend).

## ⚡ Solução Rápida:

### **Opção 1: Clear Build Cache (RECOMENDADO)**

1. Acesse: https://dashboard.render.com
2. Selecione o serviço do **BACKEND**
3. Vá em **Settings** (menu lateral)
4. Role até **"Build & Deploy"**
5. Clique em **"Clear build cache & deploy"** (botão vermelho)
6. Confirme
7. Aguarde 3-5 minutos

---

### **Opção 2: Manual Deploy**

1. Acesse: https://dashboard.render.com
2. Selecione o serviço do **BACKEND**
3. Clique em **"Manual Deploy"** (canto superior direito)
4. Selecione **"Clear build cache & deploy"**
5. Confirme
6. Aguarde 3-5 minutos

---

### **Opção 3: Forçar Commit Vazio**

Se as opções acima não funcionarem:

```bash
git commit --allow-empty -m "chore: force rebuild"
git push origin main
```

---

## ✅ Como Saber que Funcionou:

### **Nos Logs do Render:**

**ANTES (errado):**
```
[Email] SendGrid error: Maximum credits exceeded
```

**DEPOIS (correto):**
```
[Email] Emails sent successfully via Resend
[Email] Admin email ID: [ID]
[Email] User email ID: [ID]
```

---

## 🔍 Verificar Variável de Ambiente:

Enquanto faz rebuild, verifique se tem:

```
RESEND_API_KEY = [sua chave do Resend]
```

**NÃO deve ter:**
```
SENDGRID_API_KEY (remova se existir)
```

---

## ⏱️ Timeline:

1. **Agora:** Clear build cache no Render
2. **3-5 min:** Rebuild completo
3. **Depois:** Testar formulário novamente
4. **Resultado:** Emails funcionando com Resend! 📧

---

**FAÇA ISSO AGORA!** 🚀

Depois me avise quando o rebuild terminar para testarmos juntos!
