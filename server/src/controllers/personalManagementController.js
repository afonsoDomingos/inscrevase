const PersonalFinance = require('../models/PersonalFinance');
const PersonalTask = require('../models/PersonalTask');
const PersonalProject = require('../models/PersonalProject');
const PersonalClient = require('../models/PersonalClient');
const PersonalSaving = require('../models/PersonalSaving');
const User = require('../models/User');

// --- FINANCE ---

exports.addTransaction = async (req, res) => {
    try {
        const { type, category, amount, currency, description, date, isRecurring, status, project, client } = req.body;
        
        const transaction = new PersonalFinance({
            user: req.user.id,
            type,
            category,
            amount,
            currency: currency || 'MZN',
            description,
            date: date || new Date(),
            isRecurring: isRecurring || false,
            status: status || 'paid',
            project: project ? project : undefined,
            client: client ? client : undefined
        });

        await transaction.save();
        res.status(201).json({ success: true, transaction });
    } catch (error) {
        console.error("🔴 [addTransaction Error]:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await PersonalFinance.find({ user: req.user.id })
            .populate('project', 'name')
            .populate('client', 'name')
            .sort({ date: -1 });
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        await PersonalFinance.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.status(200).json({ success: true, message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { type, category, amount, currency, description, date, project, client } = req.body;
        const transaction = await PersonalFinance.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { 
                type, category, amount, currency, description, date,
                project: project ? project : undefined,
                client: client ? client : undefined
            },
            { new: true, runValidators: true }
        );
        if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
        res.status(200).json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFinanceSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await PersonalFinance.find({ user: userId });

        let income = 0;
        let expense = 0;

        transactions.forEach(tx => {
            if (tx.type === 'income') income += tx.amount;
            if (tx.type === 'expense') expense += tx.amount;
        });

        res.status(200).json({
            success: true,
            summary: { income, expense, balance: income - expense }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- TASKS ---

exports.addTask = async (req, res) => {
    try {
        const { title, description, deadline, priority, project } = req.body;
        
        if (!title) {
            return res.status(400).json({ success: false, message: 'O título da tarefa é obrigatório.' });
        }

        const task = new PersonalTask({
            user: req.user.id,
            title,
            description: description || '',
            deadline: deadline ? deadline : undefined,
            priority: priority || 'medium',
            project: project ? project : undefined
        });

        await task.save();
        res.status(201).json({ success: true, task });
    } catch (error) {
        console.error("🔴 [addTask Error]:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await PersonalTask.find({ user: req.user.id })
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        // Update late tasks dynamically before returning
        const now = new Date();
        let changed = false;
        
        const updatedTasks = tasks.map((task) => {
            if (task.deadline && task.status !== 'completed' && task.status !== 'late' && new Date(task.deadline) < now) {
                task.status = 'late';
                PersonalTask.updateOne({ _id: task._id }, { status: 'late' }).catch(err => console.error("Update task status error:", err));
            }
            return task;
        });

        res.status(200).json({ success: true, tasks: updatedTasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await PersonalTask.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        task.status = status;
        // completedAt logic is handled in the schema pre-save hook
        await task.save();

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await PersonalTask.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, description, deadline, priority, project } = req.body;
        const task = await PersonalTask.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { 
                title, description, priority,
                deadline: deadline ? deadline : undefined,
                project: project ? project : undefined
            },
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- PROJECTS ---

exports.addProject = async (req, res) => {
    try {
        const { name, description, totalBudget, currency, deadline, client } = req.body;
        
        const project = new PersonalProject({
            user: req.user.id,
            name,
            description,
            totalBudget: totalBudget || 0,
            currency: currency || 'MZN',
            deadline: deadline ? deadline : undefined,
            client: client ? client : undefined
        });

        await project.save();
        res.status(201).json({ success: true, project });
    } catch (error) {
        console.error("🔴 [addProject Error]:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await PersonalProject.find({ user: req.user.id })
            .populate('client', 'name')
            .sort({ createdAt: -1 });
        
        // Populate tasks and finances dynamically to calculate realistic values
        const projectsWithStats = await Promise.all(projects.map(async (project) => {
            const tasks = await PersonalTask.find({ project: project._id });
            const incomeTransactions = await PersonalFinance.find({ project: project._id, type: 'income' });
            
            const receivedAmount = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            // Return a merged object
            const projectObj = project.toObject();
            projectObj.receivedAmount = receivedAmount;
            projectObj.progress = progress;
            return projectObj;
        }));

        res.status(200).json({ success: true, projects: projectsWithStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { name, description, totalBudget, currency, deadline, client } = req.body;
        const project = await PersonalProject.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { 
                name, description, totalBudget, currency, 
                deadline: deadline ? deadline : undefined,
                client: client ? client : undefined
            },
            { new: true, runValidators: true }
        );
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await PersonalProject.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.status(200).json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- REPORTS ---

exports.getReportData = async (req, res) => {
    try {
        const { timeframe } = req.query; // daily, weekly, monthly, yearly
        const userId = req.user.id;
        
        let dateFilter = {};
        const now = new Date();
        
        if (timeframe === 'daily') {
            const startOfDay = new Date(now.setHours(0,0,0,0));
            dateFilter = { date: { $gte: startOfDay } };
        } else if (timeframe === 'weekly') {
            const startOfWeek = new Date(now.setDate(now.getDate() - 7));
            dateFilter = { date: { $gte: startOfWeek } };
        } else if (timeframe === 'monthly') {
            const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
            dateFilter = { date: { $gte: startOfMonth } };
        } else if (timeframe === 'yearly') {
            const startOfYear = new Date(now.setFullYear(now.getFullYear() - 1));
            dateFilter = { date: { $gte: startOfYear } };
        }

        const transactions = await PersonalFinance.find({ user: userId, ...dateFilter }).sort({ date: 1 });
        const tasks = await PersonalTask.find({ user: userId }); // We usually want all task stats for comparison
        
        // Group transactions by date for the chart
        const chartData = transactions.reduce((acc, tx) => {
            const dateStr = new Date(tx.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
            if (!acc[dateStr]) acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
            if (tx.type === 'income') acc[dateStr].income += tx.amount;
            else acc[dateStr].expense += tx.amount;
            return acc;
        }, {});

        // Category distribution
        const categoryData = transactions.reduce((acc, tx) => {
            if (!acc[tx.category]) acc[tx.category] = 0;
            acc[tx.category] += tx.amount;
            return acc;
        }, {});

        res.status(200).json({ 
            success: true, 
            report: {
                chartData: Object.values(chartData),
                categories: Object.entries(categoryData).map(([name, value]) => ({ name, value })),
                summary: {
                    totalIncome: transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
                    totalExpense: transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
                    taskStats: {
                        completed: tasks.filter(t => t.status === 'completed').length,
                        total: tasks.length
                    }
                }
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- CLIENTS ---

exports.addClient = async (req, res) => {
    try {
        const client = new PersonalClient({
            ...req.body,
            user: req.user.id
        });
        await client.save();
        res.status(201).json({ success: true, client });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await PersonalClient.find({ user: req.user.id }).sort({ name: 1 });
        res.status(200).json({ success: true, clients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const client = await PersonalClient.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        res.status(200).json({ success: true, client });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        await PersonalClient.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.status(200).json({ success: true, message: 'Client deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- CATEGORY PREDICTOR HELPER ---
const predictCategory = (description) => {
    const desc = description.toLowerCase();
    const mapping = {
        'Transporte': ['combustivel', 'gasolina', 'gasoleo', 'uber', 'bolt', 'chapa', 'taxi', 'viagem', 'mecanico', 'pneus'],
        'Alimentação': ['restaurante', 'comida', 'almoço', 'jantar', 'supermercado', 'mercearia', 'pão', 'takeaway', 'café'],
        'Comunicações': ['internet', 'dados', 'wifi', 'telefone', 'movitel', 'vodacom', 'tmcel', 'tv', 'gotv', 'dstv'],
        'Marketing': ['marketing', 'ads', 'facebook', 'instagram', 'google ads', 'propaganda', 'anuncio', 'flyer'],
        'Salários/Pessoal': ['salario', 'pagamento', 'ordenado', 'honorarios', 'subsidio', 'bónus'],
        'Custos Fixos': ['renda', 'aluguel', 'luz', 'agua', 'energia', 'edm', 'fipag', 'condominio'],
        'Material de Escritório': ['material', 'papel', 'caneta', 'impressora', 'escritorio', 'tinta', 'toner'],
        'Tecnologia': ['software', 'licença', 'adobe', 'hosting', 'dominio', 'cloud', 'servidor', 'laptop', 'computador']
    };

    for (const [category, keywords] of Object.entries(mapping)) {
        if (keywords.some(kw => desc.includes(kw))) return category;
    }
    return 'Geral';
};

// --- AI ASSISTANT ---

exports.processAICommand = async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Texto é obrigatório' });

        const prompt = text.toLowerCase().trim();
        const firstName = req.user.name.split(' ')[0];
        
        // --- 1. HANDLE EXISTING CONVERSATIONAL CONTEXT ---
        if (context && context.step) {
            let currentData = context.draftData || {};
            let newContext = null;

            // CLIENT FLOW: Nome -> Contacto -> Email -> Confirmar
            if (context.step === 'ask_client_name') {
                currentData.name = text.trim();
                newContext = { step: 'ask_client_phone', draftData: currentData, draftAction: 'add_client' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Anotado. Qual é o contacto telefónico de "${currentData.name}"? (Escreva "não" para saltar)` });
            }
            if (context.step === 'ask_client_phone') {
                if (!prompt.includes('não')) currentData.phone = text.trim();
                newContext = { step: 'ask_client_email', draftData: currentData, draftAction: 'add_client' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `E o e-mail para o cliente "${currentData.name}"? (Escreva "não" para saltar)` });
            }
            if (context.step === 'ask_client_email') {
                if (!prompt.includes('não')) currentData.email = text.trim();
                return res.status(200).json({ success: true, action: 'add_client', data: currentData, message: `Tudo pronto! Confirmar registo do Cliente: "${currentData.name}"?` });
            }

            // TASK FLOW: Nome -> Descrição -> Data Limite -> Cliente? -> Confirmar
            if (context.step === 'ask_task_name') {
                currentData.title = text.trim();
                newContext = { step: 'ask_task_desc', draftData: currentData, draftAction: 'add_task' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é a descrição para a tarefa "${currentData.title}"?` });
            }
            if (context.step === 'ask_task_desc') {
                currentData.description = text.trim();
                newContext = { step: 'ask_task_deadline', draftData: currentData, draftAction: 'add_task' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é a data limite para esta tarefa? (ex: 2024-12-31)` });
            }
            if (context.step === 'ask_task_deadline') {
                currentData.deadline = text.trim();
                newContext = { step: 'ask_task_client', draftData: currentData, draftAction: 'add_task' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Deseja associar esta tarefa a algum cliente específico? (Diga o nome do cliente ou "não")` });
            }
            if (context.step === 'ask_task_client') {
                if (!prompt.includes('não')) currentData.clientName = text.trim();
                return res.status(200).json({ success: true, action: 'add_task', data: currentData, message: `Confirmar registo da tarefa "${currentData.title}" com prazo em ${currentData.deadline}?` });
            }

            // SAVINGS FLOW: Valor -> Objetivo -> Data -> Confirmar
            if (context.step === 'ask_saving_amount') {
                const amount = parseFloat(text.replace(',', '.').match(/(\d+(\.\d+)?)/)?.[0] || 0);
                currentData.amount = amount;
                newContext = { step: 'ask_saving_goal', draftData: currentData, draftAction: 'add_saving' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é o objetivo desta poupança? (ex: Fundo de Reserva, Obra, etc)` });
            }
            if (context.step === 'ask_saving_goal') {
                currentData.description = text.trim();
                currentData.account = text.trim();
                newContext = { step: 'ask_saving_date', draftData: currentData, draftAction: 'add_saving' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Para que data deseja registar esta alocação? (ex: hoje, 2024-05-20)` });
            }
            if (context.step === 'ask_saving_date') {
                currentData.date = text.toLowerCase().includes('hoje') ? new Date().toISOString().split('T')[0] : text.trim();
                return res.status(200).json({ success: true, action: 'add_saving', data: currentData, message: `Confirmar reserva de ${currentData.amount} MZN para "${currentData.description}"?` });
            }

            // FINANCE FLOW: Tipo -> Valor -> Categoria -> Data -> Confirmar
            if (context.step === 'ask_finance_type') {
                currentData.type = prompt.includes('receita') || prompt.includes('ganho') || prompt.includes('entrada') ? 'income' : 'expense';
                newContext = { step: 'ask_finance_amount', draftData: currentData, draftAction: 'add_transaction' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é o valor do movimento financeiro?` });
            }
            if (context.step === 'ask_finance_amount') {
                currentData.amount = parseFloat(text.replace(',', '.').match(/(\d+(\.\d+)?)/)?.[0] || 0);
                newContext = { step: 'ask_finance_category', draftData: currentData, draftAction: 'add_transaction' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Em que categoria se enquadra? (ex: Marketing, Serviços, Impostos)` });
            }
            if (context.step === 'ask_finance_category') {
                currentData.category = text.trim();
                currentData.description = `${currentData.type === 'income' ? 'Receita' : 'Despesa'} em ${currentData.category}`;
                newContext = { step: 'ask_finance_date', draftData: currentData, draftAction: 'add_transaction' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é a data deste movimento? (ex: hoje, 2024-06-15)` });
            }
            if (context.step === 'ask_finance_date') {
                currentData.date = text.toLowerCase().includes('hoje') ? new Date().toISOString().split('T')[0] : text.trim();
                return res.status(200).json({ success: true, action: 'add_transaction', data: currentData, message: `Confirmar registo de ${currentData.type === 'income' ? 'receita' : 'despesa'} de ${currentData.amount} MZN?` });
            }
        }

        // --- 2. HANDLE NEW INTENTS ---

        // Support Commands
        if (prompt === '/suporte' || prompt === 'ajuda' || prompt === 'suporte') {
            const msg = `Comandos disponíveis:\n` +
                      `- **/cliente** → Registar novo cliente\n` +
                      `- **/tarefa** → Registar nova tarefa\n` +
                      `- **/poupanca** → Criar/alocar poupança\n` +
                      `- **/financas** → Registar movimento financeiro`;
            return res.status(200).json({ success: true, message: msg });
        }

        // Intent: Add Client
        if (prompt.startsWith('/cliente') || (prompt.includes('regista') && prompt.includes('cliente'))) {
            let draftData = {};
            const nameMatch = text.match(/(?:cliente|registar|regista)\s+([a-zA-ZÀ-ÿ\s]+)/i);
            if (nameMatch && nameMatch[1].trim().length > 2) {
                draftData.name = nameMatch[1].trim();
                return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_client_phone', draftData }, message: `Anotado, ${firstName}. Qual é o contacto de "${draftData.name}"?` });
            }
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_client_name' }, message: `Com certeza. Qual é o nome do cliente?` });
        }

        // Intent: Add Task
        if (prompt.startsWith('/tarefa') || (prompt.includes('regista') && prompt.includes('tarefa'))) {
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_task_name' }, message: `Certamente. Qual é o nome da tarefa?` });
        }

        // Intent: Add Saving
        if (prompt.startsWith('/poupanca') || (prompt.includes('poupanca')) || (prompt.includes('regista') && prompt.includes('poupança'))) {
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_saving_amount' }, message: `Qual é o valor que deseja alocar à poupança?` });
        }

        // Intent: Add Finance
        if (prompt.startsWith('/financas') || (prompt.includes('finanças')) || (prompt.includes('regista') && prompt.includes('finança'))) {
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_finance_type' }, message: `Pretende registar uma Receita ou uma Despesa?` });
        }

        // Use standard guide if no intent matched
        const helpMsg = `Ainda estou a aprender, ${firstName}! Posso ajudá-lo a orquestrar o seu ecossistema:\n\n` +
                      `📌 **Tarefas:** Digite \`/tarefa\`\n` +
                      `👥 **Clientes:** Digite \`/cliente\`\n` +
                      `💰 **Finanças:** Digite \`/financas\`\n` +
                      `🐷 **Poupança:** Digite \`/poupanca\`\n\n` +
                      `Digite \`/suporte\` para ver todos os comandos.`;
        
        return res.status(200).json({ success: true, message: helpMsg });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// --- SAVINGS ---

exports.getSavings = async (req, res) => {
    try {
        const savings = await PersonalSaving.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json({ success: true, savings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addSaving = async (req, res) => {
    try {
        const { amount, account, date, description, linkedTransactionId } = req.body;
        const saving = new PersonalSaving({
            user: req.user.id,
            amount,
            account,
            date: date || new Date(),
            description: description || '',
            linkedTransactionId: linkedTransactionId || null
        });
        await saving.save();
        res.status(201).json({ success: true, saving });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSaving = async (req, res) => {
    try {
        const saving = await PersonalSaving.findOne({ _id: req.params.id, user: req.user.id });
        if (!saving) return res.status(404).json({ success: false, message: 'Registo não encontrado.' });
        await saving.deleteOne();
        res.status(200).json({ success: true, message: 'Eliminado com sucesso.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
