const PersonalFinance = require('../models/PersonalFinance');
const PersonalTask = require('../models/PersonalTask');
const PersonalProject = require('../models/PersonalProject');
const PersonalClient = require('../models/PersonalClient');

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
        const updatedTasks = await Promise.all(tasks.map(async (task) => {
            if (task.deadline && task.status !== 'completed' && task.status !== 'late' && new Date(task.deadline) < now) {
                task.status = 'late';
                await task.save();
            }
            return task;
        }));

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
        const projects = await PersonalProject.find({ user: req.user.id }).sort({ createdAt: -1 });
        
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
        // NOTE: we are not cascading deletion, might want to if required, but usually keeping finances/tasks isolated is ok or manually deleted.
        res.status(200).json({ success: true, message: 'Project deleted' });
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
