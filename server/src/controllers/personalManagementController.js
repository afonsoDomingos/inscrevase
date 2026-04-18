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
        
        // Get user first name safely
        const firstName = req.user && req.user.name ? req.user.name.split(' ')[0] : 'Líder';
        
        // --- 1. HANDLE EXISTING CONVERSATIONAL CONTEXT ---
        if (context && context.step) {
            let currentData = context.draftData || {};
            let newContext = null;

            // CLIENT FLOW: Nome (Principal) -> Tipo (Principal) -> Contacto (Opcional) -> Email (Opcional)
            if (context.step === 'ask_client_name') {
                const nameValue = text.trim();
                if (nameValue.length < 2) {
                    return res.status(200).json({ success: true, action: 'ask_info', context, message: `⚠️ O nome parece ser demasiado curto. Por favor, insira o nome completo do cliente.` });
                }
                currentData.name = nameValue;
                newContext = { step: 'ask_client_type', draftData: currentData, draftAction: 'add_client' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Individual', 'Empresa'],
                    message: `Anotado. O cliente "${currentData.name}" é uma Pessoa Individual ou uma Empresa?` 
                });
            }
            if (context.step === 'ask_client_type') {
                currentData.type = (prompt.includes('empresa') || prompt.includes('firma') || prompt.includes('entidade')) ? 'company' : 'individual';
                newContext = { step: 'ask_client_phone', draftData: currentData, draftAction: 'add_client' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Saltar'],
                    message: `Qual é o contacto telefónico para este cliente ${currentData.type === 'company' ? 'empresa' : 'individual'}? (Ou clique em "Saltar")` 
                });
            }
            if (context.step === 'ask_client_phone') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) {
                    const phoneValue = text.trim();
                    if (!/^[\d\s\+\-\(\)]+$/.test(phoneValue) || phoneValue.length < 5) {
                        return res.status(200).json({ 
                            success: true, action: 'ask_info', context, options: ['Saltar'],
                            message: `⚠️ O formato do telefone parece ser inválido. Por favor, insira números válidos ou clique em "Saltar".` 
                        });
                    }
                    currentData.phone = phoneValue;
                }
                newContext = { step: 'ask_client_email', draftData: currentData, draftAction: 'add_client' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Saltar'],
                    message: `E o e-mail para o cliente "${currentData.name}"? (Ou clique em "Saltar")` 
                });
            }
            if (context.step === 'ask_client_email') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) {
                    const emailValue = text.trim();
                    if (!emailValue.includes('@') || !emailValue.includes('.')) {
                        return res.status(200).json({ 
                            success: true, action: 'ask_info', context, options: ['Saltar'],
                            message: `⚠️ Este e-mail não parece ser válido (está sem '@' ou um domínio correto). Por favor, corrija ou clique em "Saltar".` 
                        });
                    }
                    currentData.email = emailValue;
                }
                const summary = `Nome: ${currentData.name} (${currentData.type === 'company' ? 'Empresa' : 'Individual'})${currentData.phone ? ` | Tel: ${currentData.phone}` : ''}${currentData.email ? ` | Email: ${currentData.email}` : ''}`;
                return res.status(200).json({ success: true, action: 'add_client', data: currentData, message: `Excelente! Confirmar registo do Cliente?\n\n📁 Resumo: ${summary}` });
            }

            // TASK FLOW: Nome (Principal) -> Prioridade (Principal) -> Descrição (Opcional) -> Data Limite (Opcional) -> Cliente (Opcional)
            if (context.step === 'ask_task_name') {
                const titleValue = text.trim();
                if (titleValue.length < 2) {
                    return res.status(200).json({ success: true, action: 'ask_info', context, message: `⚠️ O título da tarefa parece ser demasiado curto. Por favor, forneça um título mais descritivo.` });
                }
                currentData.title = titleValue;
                newContext = { step: 'ask_task_priority', draftData: currentData, draftAction: 'add_task' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Alta', 'Média', 'Baixa'],
                    message: `Qual é a prioridade para "${currentData.title}"? (Escolha abaixo)` 
                });
            }
            if (context.step === 'ask_task_priority') {
                currentData.priority = (prompt.includes('alta') || prompt.includes('urgente')) ? 'high' : (prompt.includes('baixa') ? 'low' : 'medium');
                newContext = { step: 'ask_task_desc', draftData: currentData, draftAction: 'add_task' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Saltar'],
                    message: `Deseja adicionar uma descrição curta? (Ou clique em "Saltar")` 
                });
            }
            if (context.step === 'ask_task_desc') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) currentData.description = text.trim();
                newContext = { step: 'ask_task_deadline', draftData: currentData, draftAction: 'add_task' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Hoje', 'Amanhã', 'Saltar'],
                    message: `Qual é a data limite para esta tarefa? (Ex: data exata, ou escolha abaixo)` 
                });
            }
            if (context.step === 'ask_task_deadline') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) {
                    if (prompt.includes('hoje')) currentData.deadline = new Date().toISOString().split('T')[0];
                    else if (prompt.includes('amanhã')) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        currentData.deadline = tomorrow.toISOString().split('T')[0];
                    }
                    else {
                        const dateValue = text.trim();
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue) && dateValue.length < 4) {
                            return res.status(200).json({ success: true, action: 'ask_info', context, options: ['Hoje', 'Amanhã', 'Saltar'], message: `⚠️ A data parece ter um formato inválido. Use um formato como 2026-12-31 ou escolha uma das opções:` });
                        }
                        currentData.deadline = dateValue;
                    }
                }
                newContext = { step: 'ask_task_client', draftData: currentData, draftAction: 'add_task' };
                const userClients = await PersonalClient.find({ user: req.user.id }).select('name').limit(4);
                const clientOptions = [...userClients.map(c => c.name), 'Saltar'];
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: clientOptions,
                    message: `Deseja associar a algum cliente? (Escolha abaixo, indique um nome ou clique em "Saltar")` 
                });
            }
            if (context.step === 'ask_task_client') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) currentData.clientName = text.trim();
                const prioLabel = currentData.priority === 'high' ? 'Alta' : currentData.priority === 'low' ? 'Baixa' : 'Média';
                const summary = `Tarefa: ${currentData.title} | Prioridade: ${prioLabel}${currentData.deadline ? ` | Prazo: ${currentData.deadline}` : ''}${currentData.clientName ? ` | Cliente: ${currentData.clientName}` : ''}`;
                return res.status(200).json({ success: true, action: 'add_task', data: currentData, message: `Tudo orquestrado! Confirmar registo da tarefa?\n\n📌 Resumo: ${summary}` });
            }

            // SAVINGS FLOW: Valor (Principal) -> Objetivo (Principal) -> Data (Opcional)
            if (context.step === 'ask_saving_amount') {
                const amountStr = text.replace(',', '.').match(/(\d+(\.\d+)?)/)?.[0];
                if (!amountStr) {
                    return res.status(200).json({ success: true, action: 'ask_info', context, message: `⚠️ O valor digitado parece inválido. Por favor, indique um valor numérico para a poupança (ex: 500 ou 1.250,50).` });
                }
                currentData.amount = parseFloat(amountStr);
                newContext = { step: 'ask_saving_goal', draftData: currentData, draftAction: 'add_saving' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é o objetivo desta poupança? (Principal, ex: Fundo de Reserva, Obra, etc)` });
            }
            if (context.step === 'ask_saving_goal') {
                currentData.description = text.trim();
                currentData.account = text.trim();
                newContext = { step: 'ask_saving_date', draftData: currentData, draftAction: 'add_saving' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Hoje'],
                    message: `Data do registo? (Escolha "Hoje" ou escreva outra data)` 
                });
            }
            if (context.step === 'ask_saving_date') {
                if (prompt.includes('hoje') || prompt.includes('não') || prompt.includes('saltar')) {
                    currentData.date = new Date().toISOString().split('T')[0];
                } else {
                    const dateValue = text.trim();
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue) && dateValue.length < 4) {
                        return res.status(200).json({ success: true, action: 'ask_info', context, options: ['Hoje'], message: `⚠️ Formato de data inválido. Use 2026-12-31 ou clique em "Hoje".` });
                    }
                    currentData.date = dateValue;
                }
                return res.status(200).json({ success: true, action: 'add_saving', data: currentData, message: `Confirmar alocação de ${currentData.amount} MZN para o objetivo "${currentData.account}"?` });
            }

            // PROJECT FLOW: Nome (Principal) -> Descrição (Opcional) -> Orçamento (Principal) -> Data Limite (Opcional) -> Cliente (Opcional)
            if (context.step === 'ask_project_name') {
                const nameValue = text.trim();
                if (nameValue.length < 2) {
                    return res.status(200).json({ success: true, action: 'ask_info', context, message: `⚠️ O nome do projeto parece ser muito curto. Por favor, insira um nome mais descritivo.` });
                }
                currentData.name = nameValue;
                newContext = { step: 'ask_project_desc', draftData: currentData, draftAction: 'add_project' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Saltar'],
                    message: `Deseja adicionar um breve contexto ou descrição para "${currentData.name}"? (Ou clique em "Saltar")` 
                });
            }
            if (context.step === 'ask_project_desc') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) currentData.description = text.trim();
                newContext = { step: 'ask_project_budget', draftData: currentData, draftAction: 'add_project' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é o orçamento total para o projeto "${currentData.name}"? (Campo Principal)` });
            }
            if (context.step === 'ask_project_budget') {
                const amountStr = text.replace(',', '.').match(/(\d+(\.\d+)?)/)?.[0];
                if (!amountStr) {
                    return res.status(200).json({ success: true, action: 'ask_info', context, message: `⚠️ Não consegui identificar o orçamento. Por favor, digite apenas números (ex: 50000).` });
                }
                currentData.totalBudget = parseFloat(amountStr);
                newContext = { step: 'ask_project_deadline', draftData: currentData, draftAction: 'add_project' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Hoje', 'Amanhã', 'Saltar'],
                    message: `Qual é a data prevista para entrega? (Escolha abaixo ou escreva a data)` 
                });
            }
            if (context.step === 'ask_project_deadline') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) {
                    if (prompt.includes('hoje')) currentData.deadline = new Date().toISOString().split('T')[0];
                    else if (prompt.includes('amanhã')) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        currentData.deadline = tomorrow.toISOString().split('T')[0];
                    }
                    else {
                        const dateValue = text.trim();
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue) && dateValue.length < 4) {
                            return res.status(200).json({ success: true, action: 'ask_info', context, options: ['Hoje', 'Amanhã', 'Saltar'], message: `⚠️ Formato de data inválido. Use 2026-12-31 ou uma das opções:` });
                        }
                        currentData.deadline = dateValue;
                    }
                }
                newContext = { step: 'ask_project_client', draftData: currentData, draftAction: 'add_project' };
                const userClients = await PersonalClient.find({ user: req.user.id }).select('name').limit(4);
                const clientOptions = [...userClients.map(c => c.name), 'Saltar'];
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: clientOptions,
                    message: `Deseja associar este projeto a um cliente? (Escolha abaixo, indique um nome ou clique em "Saltar")` 
                });
            }
            if (context.step === 'ask_project_client') {
                if (!prompt.includes('não') && !prompt.includes('saltar')) currentData.clientName = text.trim();
                const summary = `Projeto: ${currentData.name} | Orçamento: ${currentData.totalBudget} MZN | Cliente: ${currentData.clientName || 'N/A'}`;
                return res.status(200).json({ success: true, action: 'add_project', data: currentData, message: `Projeto orquestrado com sucesso! Confirmar criação?\n\nResumo: ${summary}` });
            }

            // FINANCE FLOW: Tipo (Principal) -> Valor (Principal) -> Categoria (Principal) -> Data (Opcional)
            if (context.step === 'ask_finance_type') {
                currentData.type = (prompt.includes('receita') || prompt.includes('ganho') || prompt.includes('entrada')) ? 'income' : 'expense';
                newContext = { step: 'ask_finance_amount', draftData: currentData, draftAction: 'add_transaction' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Qual é o valor da transação? (Campo Principal)` });
            }
            if (context.step === 'ask_finance_amount') {
                const amountStr = text.replace(',', '.').match(/(\d+(\.\d+)?)/)?.[0];
                if (!amountStr) {
                    return res.status(200).json({ success: true, action: 'ask_info', context, message: `⚠️ Valor inválido. Preciso de um número para registar a transação. Quanto foi o montante?` });
                }
                currentData.amount = parseFloat(amountStr);
                newContext = { step: 'ask_finance_category', draftData: currentData, draftAction: 'add_transaction' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Em que categoria se enquadra? (Campo Principal, ex: Marketing, Tecnologia, Renda)` });
            }
            if (context.step === 'ask_finance_category') {
                currentData.category = text.trim();
                currentData.description = `${currentData.type === 'income' ? 'Receita' : 'Despesa'} em ${currentData.category}`;
                newContext = { step: 'ask_finance_date', draftData: currentData, draftAction: 'add_transaction' };
                return res.status(200).json({ 
                    success: true, 
                    action: 'ask_info', 
                    context: newContext, 
                    options: ['Hoje'],
                    message: `Data do movimento? (Escolha "Hoje" ou escreva outra data)` 
                });
            }
            if (context.step === 'ask_finance_date') {
                if (prompt.includes('hoje') || prompt.includes('não') || prompt.includes('saltar')) {
                    currentData.date = new Date().toISOString().split('T')[0];
                } else {
                    const dateValue = text.trim();
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) && !/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue) && dateValue.length < 4) {
                        return res.status(200).json({ success: true, action: 'ask_info', context, options: ['Hoje'], message: `⚠️ Formato de data inválido. Use 2026-12-31 ou clique em "Hoje".` });
                    }
                    currentData.date = dateValue;
                }
                const summary = `${currentData.type === 'income' ? 'Receita' : 'Despesa'} | Valor: ${currentData.amount} MZN | Categoria: ${currentData.category}`;
                return res.status(200).json({ success: true, action: 'add_transaction', data: currentData, message: `Confirmar registo financeiro?\n\nResumo: ${summary}` });
            }
        }

        // --- 2. HANDLE NEW INTENTS ---

        // Support Commands
        if (prompt === '/suporte' || prompt === 'ajuda' || prompt === 'suporte') {
            const msg = `Central de Orquestração: Selecione uma das ações rápidas abaixo para começar.`;
            const commands = [
                { id: '/Registar-Cliente', label: 'Registar Cliente', sub: 'Gestão de base de clientes' },
                { id: '/Cria-Tarefa', label: 'Criar Tarefa', sub: 'Organização de tarefas' },
                { id: '/Registar-Transação', label: 'Lançar Finanças', sub: 'Controlo de caixa' },
                { id: '/Nova-Alocação', label: 'Nova Poupança', sub: 'Gestão de capital' },
                { id: '/Novo-Projecto', label: 'Iniciar Projeto', sub: 'Gestão de empreitadas' }
            ];
            return res.status(200).json({ success: true, message: msg, action: 'show_commands', data: commands });
        }

        // Intent detection (simplified for speed)
        if (prompt.startsWith('/registar-cliente') || prompt.startsWith('/cliente')) {
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_client_name' }, message: `Com certeza. Qual é o nome do cliente? (Campo Principal)` });
        }
        if (prompt.startsWith('/cria-tarefa') || prompt.startsWith('/tarefa')) {
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_task_name' }, message: `Certamente. Qual é o nome da tarefa? (Campo Principal)` });
        }
        if (prompt.startsWith('/nova-alocação') || prompt.startsWith('/poupanca')) {
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_saving_amount' }, message: `Qual é o valor que deseja alocar à poupança? (Campo Principal)` });
        }
        if (prompt.startsWith('/registar-transação') || prompt.startsWith('/financas')) {
            return res.status(200).json({ 
                success: true, 
                action: 'ask_info', 
                context: { step: 'ask_finance_type' }, 
                options: ['Receita', 'Despesa'],
                message: `Pretende registar uma Receita ou uma Despesa? (Escolha abaixo)` 
            });
        }
        if (prompt.startsWith('/novo-projecto') || prompt.startsWith('/projeto')) {
            return res.status(200).json({ success: true, action: 'ask_info', context: { step: 'ask_project_name' }, message: `Excelente iniciativa. Qual é o nome do novo projeto? (Campo Principal)` });
        }

        const helpMsg = `Olá de novo, ${firstName}! Para orquestrar o seu ecossistema rapidamente, pode utilizar os seguintes comandos:\n\n` +
                      `/Cria-Tarefa - /Registar-Cliente - /Registar-Transação - /Nova-Alocação - /Novo-Projecto\n\n` +
                      `Dica: Digite /suporte para aceder ao menu de botões interativos.`;
        
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

exports.updateSaving = async (req, res) => {
    try {
        const { amount, account, date, description, linkedTransactionId } = req.body;
        const saving = await PersonalSaving.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { amount, account, date, description, linkedTransactionId },
            { new: true, runValidators: true }
        );
        if (!saving) return res.status(404).json({ success: false, message: 'Registo não encontrado.' });
        res.status(200).json({ success: true, saving });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
