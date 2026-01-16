# 🔧 TROUBLESHOOTING - Imagem do Hub não Atualiza

## ✅ Código Está Correto!

### Backend (submissionController.js):
```javascript
.populate({
    path: 'form',
    select: 'title description coverImage logo eventDate location onlineLink whatsappConfig theme creator',
    populate: {
        path: 'creator',
        select: 'name profilePhoto bio socialLinks'
    }
});
```

### Frontend (Hub page.tsx):
```typescript
interface SubmissionData {
    form: {
        coverImage: string;  // ✅ Definido
        // ...
    }
}

// Linha 178:
<Image
    src={form.coverImage || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
    alt={form.title}
    fill
    style={{ objectFit: 'cover' }}
    unoptimized={!form.coverImage}
/>
```

---

## 🔍 DIAGNÓSTICO

### 1. Verificar se o Servidor Reiniciou

**Abra o terminal do servidor** e procure por:
```
[nodemon] restarting due to changes...
[nodemon] starting `node src/index.js`
Server running on port 5000
--- Servidor Reiniciado (Audit Mode): 2026-01-12T...
```

Se NÃO aparecer, **reinicie manualmente**:
```bash
# No terminal do servidor (Ctrl+C para parar)
npm run dev
```

---

### 2. Limpar Cache do Navegador

#### Chrome/Edge:
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Clique em "Limpar dados"

#### Ou Hard Refresh:
- `Ctrl + F5` (Windows)
- `Ctrl + Shift + R` (Windows/Linux)
- `Cmd + Shift + R` (Mac)

---

### 3. Verificar se o Form tem coverImage

**Abra o MongoDB** ou use o dashboard admin e verifique:
```javascript
// O formulário DEVE ter coverImage preenchido
{
    _id: "...",
    title: "WorkShop GIS",
    coverImage: "https://res.cloudinary.com/..." // ← DEVE EXISTIR
}
```

**Se coverImage estiver vazio/null:**
- Vá ao dashboard do mentor
- Edite o evento
- Faça upload de uma imagem de capa
- Salve

---

### 4. Testar a API Diretamente

#### Obter um ID de Submission:
1. Vá para: `http://localhost:3000/hub/[ALGUM_ID]`
2. Copie o ID da URL

#### Testar no navegador:
```
http://localhost:5000/api/submissions/[ID_AQUI]
```

#### Verificar resposta JSON:
```json
{
    "form": {
        "title": "WorkShop GIS",
        "coverImage": "https://res.cloudinary.com/...",  // ← DEVE ESTAR AQUI
        "logo": "...",
        "creator": {
            "name": "...",
            "profilePhoto": "..."
        }
    }
}
```

**Se `coverImage` NÃO aparecer:**
- O formulário não tem imagem cadastrada
- Ou há erro no populate (improvável, código está correto)

---

### 5. Verificar Console do Navegador

Abra DevTools (F12) e vá para:
- **Console**: Procure por erros
- **Network**: Veja a requisição para `/api/submissions/[ID]`
  - Clique na requisição
  - Vá em "Response"
  - Verifique se `form.coverImage` está presente

---

### 6. Verificar se Next.js Precisa Rebuild

Às vezes o Next.js cache pode causar problemas:

```bash
# No terminal do client
# Ctrl+C para parar
rm -rf .next
npm run dev
```

---

## 🎯 SOLUÇÃO RÁPIDA (Passo a Passo)

### Passo 1: Reiniciar Servidor
```bash
cd server
# Ctrl+C
npm run dev
```

### Passo 2: Limpar Cache do Next.js
```bash
cd client
# Ctrl+C
rm -rf .next
npm run dev
```

### Passo 3: Limpar Cache do Navegador
- `Ctrl + Shift + Delete`
- Limpar "Imagens e arquivos em cache"

### Passo 4: Hard Refresh
- `Ctrl + F5`

### Passo 5: Verificar Form no MongoDB
- Certifique-se que o formulário TEM coverImage preenchido

---

## 🧪 TESTE MANUAL

Execute este script para testar:

```bash
cd server
node test-submission-api.js
```

**Antes de executar**, edite o arquivo e coloque um ID real de submission.

---

## ❓ AINDA NÃO FUNCIONA?

### Possíveis Causas:

1. **Form não tem coverImage**
   - Solução: Editar evento e fazer upload da imagem

2. **Cache muito agressivo**
   - Solução: Testar em aba anônima (Ctrl+Shift+N)

3. **Servidor não reiniciou**
   - Solução: Reiniciar manualmente

4. **Next.js cache**
   - Solução: Deletar pasta `.next` e reiniciar

---

## 📸 COMO DEVE FICAR

Quando funcionar, você verá:
- ✅ Imagem de capa do evento (coverImage) no topo do Hub
- ✅ Logo do evento (se houver)
- ✅ Foto do mentor
- ✅ Todas as informações do evento

---

## 🆘 DEBUG AVANÇADO

Se nada funcionar, me envie:

1. **URL do Hub** que você está acessando
2. **Screenshot** do que aparece
3. **Response da API** (F12 → Network → submissions/[ID] → Response)
4. **Console errors** (F12 → Console)

---

**Última atualização:** 12/01/2026 12:52
