# 🚨 AÇÃO URGENTE - Limpar Cache do Render

## O problema persiste porque o Render está usando cache antigo!

### ⚡ Solução em 3 Passos (FAÇA AGORA):

---

## Passo 1: Acessar o Render

1. Abra: https://dashboard.render.com
2. Faça login
3. Clique no serviço do **BACKEND** (não o frontend!)

---

## Passo 2: Limpar Cache

1. No menu lateral esquerdo, clique em **"Settings"** (ícone de engrenagem)
2. Role a página para baixo até encontrar a seção **"Build & Deploy"**
3. Procure o botão vermelho **"Clear build cache & deploy"**
4. **CLIQUE** nesse botão
5. Confirme a ação quando pedir

---

## Passo 3: Aguardar Rebuild

1. Você será redirecionado para a página de Logs
2. Aguarde 5-7 minutos
3. Veja o progresso nos logs
4. Procure por:
   ```
   ✅ npm install
   ✅ added XXX packages
   ✅ nodemailer@7.0.12
   ```

---

## ✅ Como Saber que Funcionou

Depois do rebuild, nos logs você verá:

```
[Email] Nodemailer loaded successfully
```

Em vez de:

```
Erro ao enviar email: nodemailer.createTransporter is not a function
```

---

## 🧪 Testar

1. Acesse: https://seu-site.onrender.com/suporte
2. Preencha o formulário
3. Envie
4. Verifique os logs em tempo real
5. Procure por: `[Email] Nodemailer loaded successfully`

---

## 📸 Guia Visual

### Onde encontrar "Clear build cache":

```
Dashboard → Seu Serviço → Settings (menu lateral)
↓
Role para baixo
↓
Seção "Build & Deploy"
↓
Botão "Clear build cache & deploy" (vermelho)
↓
CLIQUE AQUI!
```

---

## ⚠️ IMPORTANTE

- **NÃO** use "Manual Deploy" - isso não limpa o cache!
- **USE** "Clear build cache & deploy" - isso força reinstalação completa!
- Aguarde o rebuild terminar COMPLETAMENTE antes de testar

---

## 🔍 Verificar Logs Durante Build

Procure por estas linhas nos logs:

```bash
# Início do build
==> Building...

# Instalação de dependências
npm install
npm WARN deprecated...
added 150 packages

# Procure especificamente por:
nodemailer@7.0.12

# Depois do build:
[Email] Nodemailer loaded successfully
```

---

## 💡 Se AINDA não funcionar

Tente esta sequência:

1. **Settings** → **Environment**
2. Adicione uma variável temporária qualquer:
   - Key: `FORCE_REBUILD`
   - Value: `true`
3. Save
4. Aguarde rebuild
5. Delete essa variável
6. Save novamente

Isso força 2 rebuilds seguidos, garantindo limpeza total.

---

**FAÇA ISSO AGORA e me avise quando o rebuild terminar!** 🚀
