# 🔧 Forçar Rebuild Limpo no Render

## 🚨 Problema: nodemailer.createTransporter is not a function

Isso significa que o Render não instalou o `nodemailer` corretamente.

---

## ✅ Solução Rápida (2 minutos)

### Opção 1: Limpar Cache e Rebuild (RECOMENDADO)

1. **Acesse:** https://dashboard.render.com
2. **Selecione** o serviço do backend
3. **Vá em:** Settings (menu lateral)
4. **Role até:** Build & Deploy
5. **Clique em:** "Clear build cache & deploy"
6. **Confirme** a ação
7. **Aguarde** 3-5 minutos para o rebuild completo

### Opção 2: Manual Deploy

1. No Render, vá em **Manual Deploy**
2. Clique em **"Deploy latest commit"**
3. Aguarde o build terminar

### Opção 3: Trigger Deploy via Git

Já foi feito! O commit acabou de ser pushed.
O Render deve estar fazendo rebuild agora.

---

## 🔍 Verificar se Funcionou

### 1. Ver os Logs do Build

No Render, vá em **Logs** e procure por:

```
✅ Bom sinal:
npm install
...
added 100 packages
...
nodemailer@7.0.12
```

```
❌ Sinal de problema:
Using cached dependencies
(sem instalar nodemailer)
```

### 2. Testar o Endpoint

Depois do deploy, teste novamente:
- Acesse: https://seu-site.onrender.com/suporte
- Envie uma mensagem
- Veja os logs em tempo real

---

## 📋 Checklist Completo

- [ ] Limpar cache do Render
- [ ] Fazer rebuild limpo
- [ ] Verificar logs de build
- [ ] Confirmar que nodemailer foi instalado
- [ ] Adicionar variáveis EMAIL_USER e EMAIL_PASSWORD
- [ ] Testar formulário
- [ ] Verificar email no Gmail (inclusive SPAM)

---

## 🎯 O que foi feito

1. ✅ Adicionado `.nvmrc` (especifica Node 22.16.0)
2. ✅ Commit e push para trigger rebuild
3. ✅ Código já está correto
4. ⏳ Aguardando Render fazer rebuild limpo

---

## 💡 Se ainda não funcionar

### Última opção: Reinstalar Dependências Manualmente

No Render, você pode adicionar um **Build Command** customizado:

1. Settings → Build & Deploy
2. Build Command: `rm -rf node_modules && npm install && npm run build`
3. Save Changes
4. Manual Deploy

---

## ⏱️ Tempo Estimado

- **Rebuild automático:** 3-5 minutos (já iniciado)
- **Clear cache manual:** 5-7 minutos
- **Reinstalação completa:** 7-10 minutos

---

## ✅ Como Saber que Funcionou

Nos logs do Render, você verá:

```
✅ Emails sent successfully for message: [ID]
```

Em vez de:

```
❌ Erro ao enviar email: nodemailer.createTransporter is not a function
```

---

**Aguarde o rebuild terminar e teste novamente!** 🚀
