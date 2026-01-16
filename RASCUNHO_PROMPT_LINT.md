# 🚀 Prompt de Segurança para Codificação (Zero Lint)

Sempre que solicitar uma nova funcionalidade ou alteração de código, anexe este prompt para garantir que o deploy no Vercel não falhe por erros de linting:

---

### 💡 Copie e envie isto:

"Ao realizar as alterações, aplique as Seguranças de Build (Zero Lint):
1. **Zero Imports Inúteis:** Remova qualquer importação ou ícone que não esteja sendo usado no código final.
2. **Tipagem Estrita:** Nunca use 'any'. Use tipos específicos do React ou 'unknown'.
3. **Variáveis Limpas:** Se não for usar o erro de um 'catch(error)', use '_error' para evitar avisos de variável não utilizada.
4. **Limpeza de Eventos:** Para eventos de mouse/clique, use a tipagem correta como 'React.MouseEvent<HTMLButtonElement>'.
5. **Clean Code:** Antes de terminar, revise o arquivo inteiro em busca de avisos amarelos ou erros do TypeScript."

---

### Por que usar isto?
O Vercel é extremamente rigoroso. Mesmo que o seu código funcione localmente, se houver um ícone importado mas não utilizado, ou uma variável 'any', ele interromperá o build e não colocará o site no ar. Este prompt me obriga a fazer a limpeza final automaticamente.
