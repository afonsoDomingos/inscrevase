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

        const prompt = text.toLowerCase();
        let action = null;
        let data = {};
        let message = '';
        let newContext = null;

        // Obter nome do utilizador para respostas personalizadas
        const userDoc = await User.findById(req.user.id).select('name');
        const firstName = userDoc ? userDoc.name.split(' ')[0] : 'Líder';

        // --- CONVERSATIONAL STATE MGMT ---
        if (context) {
            // Step: Ask Task Name
            if (context.step === 'ask_task_name') {
                const name = text.trim();
                const data = { title: name.charAt(0).toUpperCase() + name.slice(1), priority: 'medium' };
                return res.status(200).json({ success: true, action: 'add_task', data, message: `Entendido, ${firstName}. Quer registar a tarefa: "${data.title}"?` });
            }

            // Step: Ask Client Name
            if (context.step === 'ask_client_name') {
                const name = text.trim();
                const data = { name: name.charAt(0).toUpperCase() + name.slice(1) };
                newContext = { draftAction: 'add_client', draftData: data, step: 'ask_email' };
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Anotei o nome: "${data.name}". Deseja associar um e-mail a este cliente?` });
            }

            if (context.draftAction === 'add_client') {
            const currentData = context.draftData;

            // Handle Email Step
            if (context.step === 'ask_email') {
                if (prompt.includes('não') || prompt.includes('nao') || prompt.includes('pular') || prompt.includes('skip') || prompt.includes('nenhum')) {
                    newContext = { draftAction: 'add_client', draftData: currentData, step: 'ask_phone' };
                    return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: 'Tudo bem. Deseja adicionar o contacto telefônico deste cliente?' });
                } else {
                    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                    if (emailMatch) {
                        currentData.email = emailMatch[1];
                        newContext = { draftAction: 'add_client', draftData: currentData, step: 'ask_phone' };
                        return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `O e-mail ${currentData.email} foi salvo! Deseja adicionar o contacto telefônico também?` });
                    } else {
                        return res.status(200).json({ success: true, action: 'ask_info', context, message: 'Não entendi o endereço de e-mail. Por favor escreva um e-mail válido (exemplo@email.com) ou responda "não".' });
                    }
                }
            }
            
            // Handle Phone Step
            if (context.step === 'ask_phone') {
                const phoneMatch = text.match(/(\+?\d[\d\s-]{7,14}\d)/);
                if (phoneMatch) {
                    currentData.phone = phoneMatch[1].replace(/\s|-/g, '');
                }
                
                // If type is still missing, ask it. Otherwise final confirmation.
                if (!currentData.type || currentData.type === 'unknown') {
                    newContext = { draftAction: 'add_client', draftData: currentData, step: 'ask_type' };
                    return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message: `Guardado! Uma última coisa, ${firstName}: Este cliente é uma "Empresa" ou uma "Pessoa Individual"?` });
                }

                return res.status(200).json({ success: true, action: 'add_client', data: currentData, message: `As informações essenciais estão prontas, ${firstName}! Deseja confirmar o registo do cliente "${currentData.name}"?` });
            }

            // Handle Type Step
            if (context.step === 'ask_type') {
                if (prompt.includes('empresa') || prompt.includes('firma') || prompt.includes('companhia')) {
                    currentData.type = 'company';
                } else if (prompt.includes('pessoa') || prompt.includes('individual') || prompt.includes('particular')) {
                    currentData.type = 'individual';
                } else {
                    return res.status(200).json({ success: true, action: 'ask_info', context, message: 'Não percebi. Por favor diga se é "Empresa" ou "Individual".' });
                }
                return res.status(200).json({ success: true, action: 'add_client', data: currentData, message: `Entendido, ${firstName}! Deseja confirmar o registo do cliente "${currentData.name}" como ${currentData.type === 'company' ? 'Empresa' : 'Pessoa Individual'}?` });
            }
        }
        // ---------------------------------

        // Intent: Correction / Mistake Recognition
        if (prompt.includes('errado') || prompt.includes('erro') || prompt.includes('falhou') || prompt.includes('falhaste') || prompt.includes('corrigir') || prompt.includes('retificar') || prompt.includes('não é isso') || prompt.includes('engano')) {
            message = `Peço imensa desculpa, ${firstName}. Como assistente em evolução, às vezes posso falhar na interpretação. 🧠\n\nQual parte devo retificar? Pode reformular o comando de forma mais direta para que eu possa executar exatamente o que pretende.`;
            return res.status(200).json({ success: true, action: null, data: null, context: null, message });
        }

        // Simple Smart Parser (Can be replaced/extended with OpenAI/Gemini later)
        const entityFilter = /\b(ola|olá|chat|assistente|podes|pode|consegue|consegues|por|favor|adicionar|criar|novo|nova|regista|registar|registe|salvar|guarda|guardar|quero|queria|gostaria|vou|estou|faz|fazer|anotar|anota|chamar|chama|chamado|chame|ligar|liga|ligado|contactar|contacto|falar|com|este|esta|esse|essa|o|a|os|as|um|uma|no|na|do|da|em|para|será|que|preciso|me|ajuda|ajudar|de|sobre|seria|podes-me|podias|conseguias)\b/gi;

        if (prompt.includes('tarefa') || prompt.includes('fazer')) {
            action = 'add_task';
            let cleanTitle = text.replace(/tarefa|fazer/gi, '')
                                 .replace(entityFilter, ' ')
                                 .replace(/[?.,!]/g, '')
                                 .trim();
            
            cleanTitle = cleanTitle.replace(/\s+/g, ' ');

            // If no specific title was provided, ask for it
            if (!cleanTitle || cleanTitle.length < 3) {
                newContext = { step: 'ask_task_name' };
                message = `Com certeza, ${firstName}. Qual é o nome ou descrição da tarefa que deseja registar?`;
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message });
            }

            const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

            data = {
                title: cleanTitle,
                priority: prompt.includes('urgente') || prompt.includes('alta') ? 'high' : 'medium'
            };
            message = `Percebi, ${firstName}. Quer adicionar a tarefa: "${data.title}"?`;
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
                                     .replace(entityFilter, ' ')
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
                category: predictCategory(cleanDesc)
            };
            message = `${firstName}, vou registar uma ${data.type === 'income' ? 'entrada' : 'saída'} de ${data.amount} MZN em "${data.category}" relativa a "${cleanDesc}". Confirmar?`;
        }
        // Intent: Add Client
        else if (prompt.includes('cliente') || prompt.includes('empresa') || prompt.includes('parceiro')) {
            let cleanName = text.replace(/cliente|empresa|parceiro/gi, '')
                                .replace(entityFilter, ' ')
                                .replace(/\b(email|telefone|contacto|telefone:)\b/gi, '')
                                .replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, '')
                                .replace(/(\+?\d[\d\s-]{7,14}\d)/g, '')
                                .replace(/[?.,!]/g, '')
                                .trim();
            
            cleanName = cleanName.replace(/\s+/g, ' ');

            // If no name, ask for it
            if (!cleanName || cleanName.length < 3) {
                newContext = { step: 'ask_client_name' };
                message = `Certamente, ${firstName}. Qual é o nome do cliente ou empresa que deseja registar?`;
                return res.status(200).json({ success: true, action: 'ask_info', context: newContext, message });
            }

            cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            const phoneMatch = text.match(/(\+?\d[\d\s-]{7,14}\d)/);
            const isCompany = prompt.includes('empresa') || prompt.includes('firma') || prompt.includes('companhia');
            const isIndividual = prompt.includes('pessoa') || prompt.includes('individual') || prompt.includes('particular');
            
            data = {
                name: cleanName,
                type: isCompany ? 'company' : (isIndividual ? 'individual' : ''),
                email: emailMatch ? emailMatch[1] : '',
                phone: phoneMatch ? phoneMatch[1].replace(/\s|-/g, '') : '',
            };

            // Conversational triggers
            if (!data.email) {
                newContext = { draftAction: 'add_client', draftData: data, step: 'ask_email' };
                action = 'ask_info';
                message = `Certamente, ${firstName}. Deseja associar um e-mail ao cliente "${data.name}"?`;
            } else if (!data.phone) {
                newContext = { draftAction: 'add_client', draftData: data, step: 'ask_phone' };
                action = 'ask_info';
                message = `E-mail anotado. E o contacto telefónico de "${data.name}", deseja adicionar?`;
            } else if (!data.type) {
                newContext = { draftAction: 'add_client', draftData: data, step: 'ask_type' };
                action = 'ask_info';
                message = `Quase lá! "${data.name}" é uma Empresa ou Pessoa Individual?`;
            } else {
                action = 'add_client';
                message = `Tudo pronto, ${firstName}! Confirmar o registo de "${data.name}" (${data.type === 'company' ? 'Empresa' : 'Individual'})?`;
            }
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
            message = `Perfeito ${firstName}. Registar ${data.amount} MZN na Poupança com a descrição "${cleanDesc}"?`;
        }
        // Intent: Add Project
        else if (prompt.includes('projeto') || prompt.includes('projecto')) {
            action = 'add_project';
            let cleanName = text.replace(/projeto|projecto/gi, '')
                                .replace(entityFilter, ' ')
                                .replace(/[?.,!]/g, '')
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
            message = `Pretende iniciar o projeto "${data.name}", ${firstName}?`;
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
                resultsMsg = `Não encontrei registos relacionados a "${query}" no seu Módulo de Excelência, ${firstName}.`;
            }
            
            message = resultsMsg;
            action = null; 
            data = null;
        }
        // Intent: Insights (Consultant Mode)
        else if (prompt.includes('análise') || prompt.includes('como estou') || prompt.includes('insights') || prompt.includes('consultoria') || prompt.includes('dicas') || prompt.includes('estatísticas')) {
            const [transactions, tasks, projects] = await Promise.all([
                PersonalFinance.find({ user: req.user.id }),
                PersonalTask.find({ user: req.user.id }),
                PersonalProject.find({ user: req.user.id })
            ]);

            const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            const balance = totalIncome - totalExpense;
            
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            const efficiency = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            
            let statusEmoji = balance >= 0 ? '💰' : '⚠️';
            let advice = '';

            if (balance < 0) {
                advice = 'As suas despesas estão a superar os ganhos. Recomendo cortar em custos não essenciais imediatamente.';
            } else if (efficiency < 40 && tasks.length > 5) {
                advice = 'O seu fluxo financeiro está bom, mas a execução de tarefas está baixa. Cuidado para não acumular trabalho e comprometer prazos de clientes.';
            } else if (balance > 10000 && efficiency > 70) {
                advice = 'Excelente! Está no "Sweet Spot". Finanças saudáveis e alta produtividade. Talvez seja hora de investir num novo projeto ou expansão.';
            } else {
                advice = 'Mantenha o foco. O equilíbrio entre finanças e tarefas é o segredo para o crescimento sustentável.';
            }

            message = `### 📊 Modo Consultor Saúde Profissional - Relatório para ${firstName}\n\n` +
                      `${statusEmoji} **Saúde Financeira:** O seu balanço atual é de **${balance} MZN** (Receitas: ${totalIncome} | Despesas: ${totalExpense}).\n\n` +
                      `📈 **Eficiência Operacional:** Concluiu **${completedTasks} de ${tasks.length}** tarefas (${efficiency}% de eficácia).\n\n` +
                      `🚀 **Projetos Ativos:** Tem **${projects.length}** projetos em mãos.\n\n` +
                      `💡 **O meu conselho:** ${advice}`;
            
            action = null;
            data = null;
        }
        // Intent: Support Requests
        else if (prompt.startsWith('/') || prompt.includes('suporte') || (prompt.includes('ajuda') && !prompt.includes('como'))) {
            message = `Precisa de apoio técnico ou tem alguma dúvida sobre a plataforma, ${firstName}? 🛠️\n\nPode utilizar o menu de **Ajuda e Suporte** no seu Dashboard para abrir um ticket ou contactar-nos diretamente via WhatsApp. Estou aqui para garantir que a sua experiência seja de elite!`;
            action = 'open_support';
            data = null;
        }
        else {
            message = `Ainda estou a aprender, ${firstName}! Eis o que consigo fazer por si hoje no Dashboard:\n\n` +
                      `📌 Criar Tarefas (ex: "Nova tarefa urgente rever contrato")\n` +
                      `💰 Adicionar Finanças (ex: "Gastei 1500 em marketing" | "Recebi 5000 do projeto")\n` +
                      `👥 Registar Clientes (ex: "Adicionar parceiro ACME Corp")\n` +
                      `🚀 Iniciar Projetos (ex: "Criar projeto Website V2")\n` +
                      `🐷 Registar Poupança (ex: "Guardar 1000 MZN para portáteis")\n` +
                      `🔍 Pesquisar Tudo (ex: "Procurar ACME" ou "Buscar fatura")\n` +
                      `🛠️ Suporte (ex: "Preciso de suporte" ou "Como falo com a ajuda?")`;
        }

        res.status(200).json({ success: true, action, data, context: newContext, message });
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
