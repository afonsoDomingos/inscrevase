# 💳 Sistema de Pagamentos - Inscreva-se

## 📋 Visão Geral

O **Inscreva-se** possui um sistema de pagamentos completo e robusto que suporta tanto **métodos locais (Moçambique)** quanto **pagamentos internacionais via Stripe**.

---

## 🌍 Métodos de Pagamento Disponíveis

### **1. Métodos Locais (Moçambique)** 🇲🇿

#### **M-Pesa (Vodacom)**
- ✅ Upload de comprovativo de pagamento
- ✅ Validação manual pelo mentor
- ✅ **Validação automática por IA** (Gemini Vision)

#### **E-Mola (Movitel)**
- ✅ Upload de comprovativo de pagamento
- ✅ Validação manual pelo mentor
- ✅ **Validação automática por IA** (Gemini Vision)

#### **Transferência Bancária**
- ✅ Upload de comprovativo de pagamento
- ✅ Validação manual pelo mentor
- ✅ **Validação automática por IA** (Gemini Vision)

### **2. Stripe (Internacional)** 💳
- ✅ Pagamentos com cartão de crédito/débito
- ✅ Checkout seguro
- ✅ Stripe Connect para mentores
- ✅ Webhooks para confirmação automática
- ✅ Gestão de transações

---

## 🤖 Validação de Recibos por IA (Gemini Vision)

### **Como Funciona**

O sistema utiliza o **Google Gemini Vision AI** para analisar automaticamente os comprovativos de pagamento enviados pelos participantes.

#### **Endpoint:**
```
POST /api/submissions/:submissionId/analyze-receipt
```

#### **Autenticação:**
- Requer token JWT (authMiddleware)

#### **Processo de Análise:**

1. **Busca do Comprovativo**
   - Sistema busca a submission pelo ID
   - Verifica se existe `paymentProof` (URL do Cloudinary)

2. **Download da Imagem**
   - Faz fetch da imagem do Cloudinary
   - Converte para base64

3. **Análise por IA**
   - Envia para Gemini Vision com prompt especializado
   - IA extrai informações do recibo

4. **Dados Extraídos:**
   ```json
   {
     "transactionId": "MZN123456789",
     "amount": 500.00,
     "currency": "MT",
     "date": "12/01/2026",
     "isValid": true,
     "confidence": 95,
     "warning": "Nenhuma suspeita detectada"
   }
   ```

5. **Armazenamento**
   - Resultado salvo no campo `aiAnalysis` da submission
   - Disponível para o mentor revisar

### **Prompt da IA:**

```javascript
`Você é um assistente financeiro moçambicano especializado em validar capturas de ecrã (screenshots) de pagamentos.
Analise esta imagem e extraia as seguintes informações em formato JSON rigoroso:
- transactionId: O código da transação (ex: MZN.... ou ID da transferência)
- amount: O valor numérico (apenas o número)
- currency: "MT" ou "USD"
- date: A data da transação
- isValid: true se parecer um recibo real e legível, false caso contrário
- confidence: 0-100
- warning: Qualquer suspeita de fraude ou edição de imagem.

Se não for um recibo, retorne isValid: false.
Resposta apenas em JSON.`
```

### **Código da Função:**

```javascript
const analyzeReceipt = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);
        
        if (!submission || !submission.paymentProof) {
            return res.status(404).json({ message: 'Recibo não encontrado' });
        }

        // Gemini Vision API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Fetch e converte imagem para base64
        const response = await fetch(submission.paymentProof);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');

        // Análise
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{.*\}/s);
        const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Falha na análise da IA" };

        // Salva resultado
        submission.aiAnalysis = aiAnalysis;
        await submission.save();

        res.json({ success: true, analysis: aiAnalysis });
    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ message: "Erro na análise de IA", error: error.message });
    }
};
```

### **Configuração Necessária:**

No arquivo `.env`:
```env
GOOGLE_API_KEY=sua_chave_gemini_aqui
```

### **Interface do Mentor:**

No dashboard do mentor, há um botão **"Analisar IA"** que:
1. Chama o endpoint de análise
2. Exibe modal com resultados
3. Mostra:
   - ✅ ID da transação
   - ✅ Valor extraído
   - ✅ Data
   - ✅ Nível de confiança
   - ⚠️ Avisos (se houver)

---

## 💰 Sistema Stripe

### **Arquitetura**

O sistema usa **Stripe Connect** para permitir que mentores recebam pagamentos diretamente.

#### **Fluxo de Onboarding do Mentor:**

1. **Criar Conta Connect**
   ```
   POST /api/stripe/connect/create
   ```
   - Cria conta Express no Stripe
   - Salva `stripeAccountId` no User

2. **Obter Link de Onboarding**
   ```
   GET /api/stripe/connect/onboarding
   ```
   - Gera link para mentor completar cadastro
   - Redireciona para Stripe

3. **Verificar Status**
   ```
   GET /api/stripe/connect/status
   ```
   - Verifica se onboarding está completo
   - Atualiza `stripeOnboardingComplete`

#### **Fluxo de Pagamento do Participante:**

1. **Criar Checkout Session**
   ```
   POST /api/stripe/checkout/create
   ```
   - Cria sessão de checkout
   - Calcula taxa da plataforma baseada no plano do mentor
   - Configura split payment (mentor + plataforma)

2. **Participante Paga**
   - Redirecionado para Stripe Checkout
   - Paga com cartão

3. **Webhook Confirma**
   ```
   POST /api/stripe/webhook
   ```
   - Stripe envia evento `checkout.session.completed`
   - Sistema cria Submission automaticamente
   - Cria Transaction para o mentor

4. **Verificação Manual (Fallback)**
   ```
   POST /api/stripe/payment/verify
   ```
   - Caso webhook falhe, frontend pode verificar manualmente

### **Taxas da Plataforma (PLANS):**

```javascript
const PLANS = {
    free: {
        commissionRate: 0.15, // 15%
    },
    pro: {
        commissionRate: 0.10, // 10%
        prices: {
            MZN: 17500,  // 175.00 MT/mês
            USD: 299     // 2.99 USD/mês
        }
    },
    enterprise: {
        commissionRate: 0.00, // 0% - TAXA ZERO!
        prices: {
            MZN: 175000, // 1.750.00 MT/mês
            USD: 2799    // 27.99 USD/mês
        }
    }
};
```

### **Cálculo de Split Payment:**

```javascript
const applicationFeeAmount = Math.round(
    form.paymentConfig.price * 100 * planConfig.commissionRate
);

// Exemplo: Evento de 1000 MT, mentor no plano Pro (10%)
// applicationFeeAmount = 1000 * 100 * 0.10 = 10000 centavos = 100 MT
// Mentor recebe: 900 MT
// Plataforma recebe: 100 MT
```

### **Webhooks Configurados:**

1. **checkout.session.completed**
   - Pagamento de inscrição concluído
   - Cria submission e transaction

2. **account.updated**
   - Status do Connect Account mudou
   - Atualiza `stripeOnboardingComplete`

### **Variáveis de Ambiente Necessárias:**

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
```

---

## 📊 Gestão de Transações

### **Modelo Transaction:**

```javascript
{
    user: ObjectId,              // Mentor
    mentor: ObjectId,            // Mesmo que user
    form: ObjectId,              // Evento
    submission: ObjectId,        // Inscrição
    amount: Number,              // Valor total
    currency: String,            // MT, USD
    platformFee: Number,         // Taxa da plataforma
    mentorEarnings: Number,      // Ganho do mentor
    status: String,              // pending, completed
    paymentMethod: String,       // stripe, manual
    stripePaymentIntentId: String,
    stripeSessionId: String,
    createdAt: Date
}
```

### **Endpoints Admin:**

#### **Listar Transações**
```
GET /api/stripe/admin/transactions?status=pending&paymentMethod=manual
```

#### **Resumo Financeiro**
```
GET /api/stripe/admin/summary
```
Retorna:
```json
{
    "collectedFees": 5000,     // Taxas coletadas
    "pendingFees": 1200,       // Taxas pendentes
    "totalRevenue": 50000      // Receita total
}
```

#### **Confirmar Pagamento Manual**
```
PATCH /api/stripe/admin/confirm-payment/:transactionId
```
- Marca transação manual como `completed`
- Usado quando mentor paga a taxa da plataforma

---

## 🔄 Fluxo Completo de Pagamento

### **Método Local (M-Pesa/E-Mola/Banco):**

1. **Participante preenche formulário**
2. **Upload de comprovativo** (Cloudinary)
3. **Submission criada** com status `pending`
4. **Mentor recebe notificação**
5. **Mentor clica "Analisar IA"**
   - IA extrai dados do recibo
   - Mentor vê resultado
6. **Mentor aprova/rejeita**
   - Se aprovar: status → `approved`, paymentStatus → `paid`
   - **Transaction criada** automaticamente (status: `pending`)
7. **Mentor paga taxa da plataforma**
8. **Admin confirma** → Transaction status → `completed`

### **Método Stripe:**

1. **Participante preenche formulário**
2. **Clica "Pagar com Cartão"**
3. **Redirecionado para Stripe Checkout**
4. **Paga com cartão**
5. **Webhook recebe confirmação**
6. **Sistema cria automaticamente:**
   - Submission (status: `approved`, paymentStatus: `paid`)
   - Transaction (status: `completed`)
7. **Mentor recebe dinheiro** (menos taxa da plataforma)
8. **Participante recebe acesso ao Hub**

---

## 🎯 Status e Estados

### **Submission Status:**
- `pending` - Aguardando aprovação
- `approved` - Aprovado
- `rejected` - Rejeitado

### **Payment Status:**
- `unpaid` - Não pago
- `pending` - Pagamento em análise
- `paid` - Pago e confirmado

### **Transaction Status:**
- `pending` - Aguardando pagamento da taxa
- `completed` - Concluído

---

## 🛡️ Segurança

### **Validações:**

1. **Ownership Check**
   - Apenas mentor dono do formulário pode aprovar
   - Admins têm acesso total

2. **Stripe Signature Verification**
   - Webhooks validados com `STRIPE_WEBHOOK_SECRET`

3. **IA Anti-Fraude**
   - Gemini Vision detecta edições de imagem
   - Retorna `warning` se suspeito

4. **Duplicate Prevention**
   - Verifica se transaction já existe antes de criar
   - Usa `stripePaymentIntentId` como chave única

---

## 📈 Dashboard do Mentor

### **Endpoint de Earnings:**
```
GET /api/stripe/earnings
```

Retorna:
```json
{
    "summary": {
        "totalRevenue": 10000,
        "totalEarnings": 9000,
        "totalFees": 1000,
        "pendingFees": 500
    },
    "chartData": [
        { "date": "10/01", "revenue": 500 },
        { "date": "11/01", "revenue": 1200 },
        { "date": "12/01", "revenue": 800 }
    ],
    "transactions": [...]
}
```

### **Gráfico de Receita:**
- Últimos 30 dias
- Agrupado por dia
- Apenas transações `completed`
- Renderizado com **Recharts**

---

## ✅ Checklist de Configuração

### **Backend:**
- [x] GOOGLE_API_KEY configurada
- [x] STRIPE_SECRET_KEY configurada
- [x] STRIPE_WEBHOOK_SECRET configurada
- [x] CLIENT_URL configurada
- [x] Cloudinary configurado

### **Stripe Dashboard:**
- [x] Webhook endpoint configurado
- [x] Connect habilitado
- [x] Eventos monitorados:
  - `checkout.session.completed`
  - `account.updated`

### **Funcionalidades:**
- [x] IA de validação de recibos
- [x] Stripe Connect onboarding
- [x] Split payments
- [x] Webhooks funcionando
- [x] Dashboard de earnings
- [x] Gestão admin de transações

---

## 🚀 Status Atual

**✅ 100% FUNCIONAL**

- ✅ Pagamentos locais com IA
- ✅ Stripe Connect integrado
- ✅ Webhooks configurados
- ✅ Dashboard de earnings
- ✅ Gestão admin completa
- ✅ Anti-fraude por IA

---

## 📝 Notas Importantes

1. **Modo de Teste**: Usar chaves `sk_test_` do Stripe para testes
2. **Produção**: Trocar para `sk_live_` e configurar webhooks em produção
3. **IA**: Gemini Vision tem limite de requisições gratuitas
4. **Moeda**: Sistema suporta MT (Metical) e USD
5. **Taxa Zero**: Plano Enterprise tem 0% de comissão (estratégia de atração)

---

**Desenvolvido com 💛 por Vibe**
