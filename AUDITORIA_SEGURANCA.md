# Relatório de Auditoria de Segurança: Inscreva-se

**Data:** 12/01/2026
**Responsável:** Antigravity AI

## 1. Visão Geral
A arquitetura de segurança do projeto "Inscreva-se" encontra-se em um **nível intermediário**. Existem boas práticas fundamentais implementadas (hash de senhas, validação de propriedade de recursos), mas faltam camadas de defesa em profundidade essenciais para um ambiente de produção (rate limiting, headers de segurança, controle estrito de CORS).

## 2. Pontos Fortes (O que está bom)
*   **Armazenamento de Senhas:** Uso correto de `bcryptjs` com salt automático para hashear senhas.
*   **Controle de Acesso (IDOR):** As rotas críticas de manipulação de formulários (`update`, `delete`) verificam explicitamente se `req.user.id` corresponde ao `creator` do recurso. Isso previne que um usuário malicioso delete o evento de outro.
*   **Autenticação JWT:** Implementação padrão de JWT para stateless auth.
*   **Separação de Privilégios:** Middlewares distintos para `authMiddleware` (usuário logado) e `adminMiddleware` (apenas admins).

## 3. Vulnerabilidades Críticas & Riscos Médios

### 3.1. Permissão de Acesso a Usuários Bloqueados (Crítico)
**Problema:** O endpoint de Login (`authController.js`) verifica apenas email e senha.
**Risco:** Um usuário que foi "Bloqueado" pelo administrador ainda consegue realizar login e gerar um novo token de acesso, contornando o bloqueio.
**Correção Recomendada:**
```javascript
// No authController.js - login function
if (user.status === 'blocked') {
    return res.status(403).json({ message: 'Sua conta foi bloqueada. Contate o suporte.' });
}
```

### 3.2. Ausência de Rate Limiting (Alto)
**Problema:** Não há limite de requisições por IP nas rotas de login e registro.
**Risco:** Ataques de força bruta (Brute Force) para descobrir senhas ou ataques de Negação de Serviço (DoS) sobrecarregando o banco de dados.
**Correção Recomendada:** Implementar `express-rate-limit`.

### 3.3. Configuração CORS Permissiva (Médio)
**Problema:** `app.use(cors())` habilita acesso de qualquer origem (`*`).
**Risco:** Qualquer site malicioso pode fazer requisições para sua API (embora sem o token do usuário, isso mitiga o risco, mas expõe endpoints públicos).
**Correção Recomendada:**
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL, // Ex: 'https://inscrevase.com'
    credentials: true
}));
```

### 3.4. Falta de Headers de Segurança (Médio)
**Problema:** Não utilização de headers HTTP de proteção (HSTS, No-Sniff, XSS-Protection).
**Risco:** Maior superfície de ataque para vulnerabilidades no navegador do cliente.
**Correção Recomendada:** Instalar e usar `helmet`.

### 3.5. Exposição de Tokens na URL (Médio)
**Problema:** O fluxo de callback do Google/LinkedIn redireciona para o frontend passando o token via query param (`?token=...`).
**Risco:** Tokens podem ficar salvos em histórico de navegador, logs de proxy ou servidores intermediários.
**Correção Recomendada:** Usar `window.opener.postMessage` (para popups) ou Cookies `HttpOnly` seguros para a troca de token.

## 4. Plano de Ação Imediato
Para elevar a segurança para o nível "Produção", recomenda-se aplicar as seguintes correções nesta ordem:

1.  [ ] **Bloquear Login de Usuários Banidos** (Backend).
2.  [ ] **Instalar `helmet` e `express-rate-limit`** (Backend).
3.  [ ] **Restringir CORS** para aceitar apenas o domínio do frontend (Backend).
4.  [ ] **Sanitização de Dados:** Garantir que inputs de usuário (como descrição do evento) sejam sanitizados para evitar XSS armazenado no frontend.

---
*Este relatório foi gerado automaticamente com base na análise estática do código fonte.*
