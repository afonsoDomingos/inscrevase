const PersonalFinance = require('../models/PersonalFinance');
const PersonalTask = require('../models/PersonalTask');
const PersonalProject = require('../models/PersonalProject');
const PersonalClient = require('../models/PersonalClient');
const PersonalSaving = require('../models/PersonalSaving');

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
        
        const task = new PersonalTask({
            user: req.user.id,
            title,
            description: description || undefined,
            deadline: deadline ? deadline : undefined,
            priority: priority || 'medium',
            project: project ? project : undefined
        });

        await task.save();
        res.status(201).json({ success: true, task });
    } catch (error) {
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

// --- AI ASSISTANT ---

exports.processAICommand = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Texto é obrigatório' });

        const prompt = text.toLowerCase();
        let action = null;
        let data = {};
        let message = '';

        // Simple Smart Parser (Can be replaced/extended with OpenAI/Gemini later)
        // Intent: Add Task
        if (prompt.includes('tarefa') || prompt.includes('fazer')) {
            action = 'add_task';
            let cleanTitle = text.replace(/adicionar|criar|nova/gi, '')
                                 .replace(/tarefa|fazer/gi, '')
                                 .replace(/\b(?:de|para|urgente|alta|média|baixa)\b/gi, ' ')
                                 .trim();
            
            cleanTitle = cleanTitle.replace(/\s+/g, ' '); // remove espaços duplos
            if (cleanTitle.length >= 2) {
                cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
            } else {
                cleanTitle = 'Nova Tarefa';
            }

            data = {
                title: cleanTitle,
                priority: prompt.includes('urgente') || prompt.includes('alta') ? 'high' : 'medium'
            };
            message = `Percebi que quer adicionar a tarefa: "${data.title}". Confirmar?`;
        }
        // Intent: Add Transaction
        else if (prompt.includes('ganhei') || prompt.includes('recebi') || prompt.includes('gastei') || prompt.includes('paguei')) {
            action = 'add_transaction';
            const isIncome = prompt.includes('ganhei') || prompt.includes('recebi');
            const amountMatch = text.match(/(\d+(?:[.,]\d+)?)/);
            
            // Extração de descrição limpa e sensata
            let cleanDesc = text;
            if (amountMatch) {
                cleanDesc = cleanDesc.replace(/ganhei|recebi|gastei|paguei/gi, '')
                                     .replace(amountMatch[0], '')
                                     .replace(/\b(?:mt|mzn|meticais)\b/gi, '')
                                     .replace(/\b(?:com|no|na|do|da|de|em|para)\b/gi, ' ')
                                     .trim();
            }
            
            cleanDesc = cleanDesc.replace(/\s+/g, ' '); // remove espaços duplos
            if (cleanDesc.length >= 2) {
                cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
            } else {
                cleanDesc = isIncome ? 'Receita Geral' : 'Despesa Geral';
            }

            data = {
                type: isIncome ? 'income' : 'expense',
                amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0,
                description: cleanDesc,
                category: 'Geral'
            };
            message = `Vou registar uma ${data.type === 'income' ? 'entrada' : 'saída'} de ${data.amount} MZN relativa a "${cleanDesc}". Confirmar?`;
        }
        // Intent: Add Client
        else if (prompt.includes('cliente') || prompt.includes('empresa') || prompt.includes('parceiro')) {
            action = 'add_client';
            let cleanName = text.replace(/adicionar|novo|nova|criar/gi, '')
                                .replace(/cliente|empresa|parceiro/gi, '')
                                .trim();
            
            cleanName = cleanName.replace(/\s+/g, ' ');
            if (cleanName.length >= 2) {
                cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            } else {
                cleanName = 'Novo Cliente';
            }

            data = {
                name: cleanName,
                type: prompt.includes('empresa') ? 'company' : 'individual'
            };
            message = `Deseja registar o cliente "${data.name}"?`;
        }
        // Intent: Add Saving (Poupança)
        else if (prompt.includes('poupança') || prompt.includes('guardar') || prompt.includes('poupar')) {
            action = 'add_saving';
            const amountMatch = text.match(/(\d+(?:[.,]\d+)?)/);
            
            let cleanDesc = text;
            if (amountMatch) {
                 cleanDesc = cleanDesc.replace(/adicionar|poupança|guardar|poupar/gi, '')
                                      .replace(amountMatch[0], '')
                                      .replace(/\b(?:mt|mzn|meticais)\b/gi, '')
                                      .replace(/\b(?:para|na|em|no|com|a)\b/gi, ' ')
                                      .trim();
            }
            
            cleanDesc = cleanDesc.replace(/\s+/g, ' ');
            if (cleanDesc.length >= 2) {
                cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
            } else {
                cleanDesc = 'Depósito';
            }
            
            data = {
                amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0,
                account: 'Principal',
                description: cleanDesc,
                date: new Date().toISOString().split('T')[0]
            };
            message = `Registar ${data.amount} MZN na Poupança com a descrição "${cleanDesc}"?`;
        }
        // Intent: Add Project
        else if (prompt.includes('projeto') || prompt.includes('projecto')) {
            action = 'add_project';
            let cleanName = text.replace(/adicionar|novo|criar|começar/gi, '')
                                .replace(/projeto|projecto/gi, '')
                                .replace(/\b(?:de|sobre|para)\b/gi, ' ')
                                .trim();
            
            cleanName = cleanName.replace(/\s+/g, ' ');
            if (cleanName.length >= 2) {
                cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            } else {
                cleanName = 'Novo Projeto';
            }

            data = {
                name: cleanName,
                totalBudget: 0,
                currency: 'MZN'
            };
            message = `Pretende iniciar o projeto "${data.name}"?`;
        }
        // Intent: Search
        else if (prompt.includes('procurar') || prompt.includes('buscar') || prompt.includes('pesquisar') || prompt.includes('onde')) {
            const query = text.replace(/procurar|buscar|pesquisar|onde está|onde esta/gi, '').trim();
            const userId = req.user.id;
            const regex = new RegExp(query, 'i');
            
            const [tasks, txs, clients, projects] = await Promise.all([
                PersonalTask.find({ user: userId, title: regex }).limit(3),
                PersonalFinance.find({ user: userId, description: regex }).limit(3),
                PersonalClient.find({ user: userId, name: regex }).limit(3),
                PersonalProject.find({ user: userId, name: regex }).limit(3)
            ]);

            let resultsMsg = `Aqui está o que encontrei sobre "${query}":\n`;
            let found = false;
            
            if (txs.length > 0) {
                found = true;
                resultsMsg += `\n💰 Finanças: ` + txs.map(t => `${t.description} (${t.amount} MZN)`).join(', ');
            }
            if (tasks.length > 0) {
                found = true;
                resultsMsg += `\n📌 Tarefas: ` + tasks.map(t => t.title).join(', ');
            }
            if (clients.length > 0) {
                found = true;
                resultsMsg += `\n👥 Clientes: ` + clients.map(c => c.name).join(', ');
            }
            if (projects.length > 0) {
                found = true;
                resultsMsg += `\n🚀 Projetos: ` + projects.map(p => p.name).join(', ');
            }
            
            if (!found) {
                resultsMsg = `Não encontrei registos relacionados a "${query}" no seu Módulo de Excelência.`;
            }
            
            message = resultsMsg;
            action = null; // No confirm button, just text
            data = null;
        }
        else {
            message = "Ainda estou a aprender! Tente algo como: 'Adicionar cliente Rádio Moçambique', 'Guardar 1000 para viagem' ou 'Pesquisar impostos'.";
        }

        res.status(200).json({ success: true, action, data, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
