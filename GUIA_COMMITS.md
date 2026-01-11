# 📝 Guia de Commits - Inscreva-se

## ✅ Como Fazer Commits Normalmente

A partir de agora, você pode fazer commits normalmente:

```bash
# 1. Fazer mudanças no código
# 2. Adicionar ao staging
git add .

# 3. Fazer commit
git commit -m "sua mensagem aqui"

# 4. Push para o GitHub
git push origin main
```

---

## 🚀 Fluxo de Trabalho Normal

### Exemplo Completo:

```bash
# Editar arquivos...

# Ver o que mudou
git status

# Adicionar mudanças
git add .

# Commit com mensagem descritiva
git commit -m "feat: adicionar nova funcionalidade X"

# Push para GitHub (e Render faz deploy automático)
git push origin main
```

---

## 📋 Boas Práticas para Mensagens de Commit

### Formato Recomendado:
```
tipo: descrição curta

Descrição mais detalhada (opcional)
```

### Tipos Comuns:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, estilo
- `refactor:` - Refatoração de código
- `test:` - Testes
- `chore:` - Tarefas de manutenção

### Exemplos:
```bash
git commit -m "feat: adicionar filtro de eventos por data"
git commit -m "fix: corrigir erro no upload de imagem"
git commit -m "docs: atualizar README com instruções"
git commit -m "style: melhorar layout do dashboard"
```

---

## ⚠️ Importante: Nunca Commitar Chaves Secretas!

### ❌ NUNCA adicione ao Git:
- `.env` (já está no .gitignore)
- API Keys
- Senhas
- Tokens de acesso

### ✅ Use sempre:
- `.env.example` (sem valores reais)
- Variáveis de ambiente no Render
- Documentação com placeholders

---

## 🔄 Deploy Automático

Quando você faz `git push origin main`:

1. ✅ Código vai para GitHub
2. ✅ Render detecta mudança
3. ✅ Render faz rebuild automático
4. ✅ Nova versão no ar em 2-3 minutos

**Você não precisa fazer nada no Render!**

---

## 🛠️ Comandos Úteis

### Ver histórico de commits:
```bash
git log --oneline -10
```

### Ver mudanças antes de commitar:
```bash
git diff
```

### Desfazer último commit (mantém mudanças):
```bash
git reset --soft HEAD~1
```

### Ver status:
```bash
git status
```

### Ver branches:
```bash
git branch -a
```

---

## 🎯 Resumo

**Fluxo normal de trabalho:**

1. Edite os arquivos
2. `git add .`
3. `git commit -m "mensagem"`
4. `git push origin main`
5. Aguarde deploy no Render (2-3 min)
6. Teste em produção

**É isso! Simples e direto.** 🚀

---

## 💡 Dica

Se quiser ver o que vai ser commitado antes:

```bash
git status
git diff
```

Isso mostra exatamente o que mudou!
