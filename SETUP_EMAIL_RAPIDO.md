# 🔐 CONFIGURAÇÃO RÁPIDA - EMAIL

## Passo 1: Criar arquivo .env

No diretório `server/`, crie um arquivo chamado `.env` (se não existir)

## Passo 2: Adicionar estas linhas

```env
# Email Configuration
EMAIL_USER=karinganastudio23@gmail.com
EMAIL_PASSWORD=bplzonlswpehdron
```

## Passo 3: Reiniciar o servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente:
npm run dev
```

## ✅ Pronto!

Agora o formulário de suporte enviará emails automaticamente para:
- **Admin:** karinganastudio23@gmail.com (notificação de nova mensagem)
- **Usuário:** email que ele usar no formulário (confirmação)

## 🧪 Testar

1. Acesse: http://localhost:3000/suporte
2. Preencha o formulário com seu email
3. Envie
4. Verifique ambos os emails!

---

**Nota:** O arquivo `.env` não deve ser commitado no Git (já está no .gitignore)
