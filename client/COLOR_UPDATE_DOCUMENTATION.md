# Atualização de Cores - Dourado para Azul

## 🎨 Resumo das Alterações

Todas as cores douradas da plataforma foram atualizadas para o **azul do logo** (`#1452AD`).

### Cores Antigas (Dourado)
- `#FFD700` - Dourado principal
- `#D4AF37` - Dourado médio
- `#B8860B` - Dourado escuro
- `#DAA520` - Goldenrod
- `#c9a528` - Dourado alternativo

### Novas Cores (Azul)
- `#1452AD` - Azul principal (cor do logo)
- `#0D3D7A` - Azul médio/escuro
- `#082952` - Azul muito escuro
- `#5A8FD6` - Azul claro (para gradientes)

## 📁 Arquivos Modificados

### 1. **globals.css** ✅
Atualizações completas em:

#### Variáveis CSS (`:root` e `[data-theme='dark']`)
```css
/* Antes */
--primary: #c9a528;
--primary-glow: rgba(201, 165, 40, 0.2);
--accent: #DAA520;
--gold-gradient: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%);

/* Depois */
--primary: #1452AD;
--primary-glow: rgba(20, 82, 173, 0.2);
--accent: #0D3D7A;
--blue-gradient: linear-gradient(135deg, #1452AD 0%, #0D3D7A 50%, #082952 100%);
```

#### Classes Atualizadas
- `.luxury-card` - Borda e efeitos de hover
- `.spotlight`, `.spotlight-low`, `.spotlight-high` - Efeitos de iluminação
- `.gold-shimmer-sweep` - Efeito de brilho
- `.luxury-shimmer-hover` - Shimmer de texto
- `.btn-primary` - Botão primário
- `.hero .gold-text` - Texto destacado no hero
- `.gold-text` - Texto com gradiente
- `.hero-title:hover` - Efeito hover do título
- `.input-luxury:focus` - Foco nos inputs
- `.luxury-button` - Botões de luxo
- `.admin-mobile-toggle` - Toggle do menu admin
- `::-webkit-scrollbar-thumb` - Barra de rolagem

### 2. **layout.tsx** ✅
```typescript
// Antes
<meta name="theme-color" content="#FFD700" />

// Depois
<meta name="theme-color" content="#1452AD" />
```

### 3. **manifest.json** ✅
```json
// Antes
"theme_color": "#FFD700"

// Depois
"theme_color": "#1452AD"
```

## 🎯 Próximos Passos

### Arquivos TSX que Precisam de Atualização

Os seguintes arquivos ainda contêm referências diretas às cores douradas e devem ser atualizados:

1. **page.tsx** (Landing Page)
   - ~50 ocorrências de `#FFD700`
   - Ícones, estatísticas, gradientes SVG

2. **mentores/[id]/page.tsx**
   - ~13 ocorrências
   - Loaders, badges, bordas, ícones

3. **mentores/page.tsx**
   - ~6 ocorrências
   - Filtros, loaders, ícones

4. **hub/[id]/page.tsx**
   - ~4 ocorrências
   - Botões, avatares

5. **privacidade/page.tsx**
   - ~6 ocorrências
   - Ícones, links

6. **payment/success/page.tsx**
   - ~5 ocorrências
   - Loaders, botões, ícones

### Estratégia de Atualização Recomendada

Para os arquivos TSX, recomendo:

1. **Usar variáveis CSS** sempre que possível:
   ```tsx
   // Ao invés de
   color: '#FFD700'
   
   // Use
   color: 'var(--primary)'
   ```

2. **Para cores inline que não podem usar variáveis CSS**:
   - Substituir `#FFD700` → `#1452AD`
   - Substituir `#D4AF37` → `#0D3D7A`
   - Substituir `#B8860B` → `#082952`

3. **Gradientes**:
   ```tsx
   // Antes
   background: 'linear-gradient(90deg, #FFD700 0%, #FFC107 100%)'
   
   // Depois
   background: 'linear-gradient(90deg, #1452AD 0%, #0D3D7A 100%)'
   ```

## ✅ Benefícios da Mudança

1. **Consistência Visual**: Alinhamento com a identidade da marca (logo azul)
2. **Profissionalismo**: Azul transmite confiança e profissionalismo
3. **Diferenciação**: Menos comum que dourado em plataformas SaaS
4. **Acessibilidade**: Melhor contraste em alguns contextos

## 🔧 Manutenção

Para manter a consistência:
- Sempre use as variáveis CSS (`var(--primary)`, `var(--blue-gradient)`)
- Evite cores hardcoded
- Documente novas cores adicionadas

---

**Data da Atualização**: 2026-01-29  
**Cor Principal**: #1452AD (Azul do Logo)  
**Status**: ✅ Variáveis CSS e arquivos de configuração atualizados
