import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PersonalTransaction {
    _id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    currency: string;
    description: string;
    date: string;
    isRecurring: boolean;
    status: 'paid' | 'pending';
    project?: string | { _id: string; name: string };
    client?: string | { _id: string; name: string };
}

export interface PersonalTask {
    _id: string;
    title: string;
    description?: string;
    deadline?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'late';
    priority: 'low' | 'medium' | 'high';
    project?: string | { _id: string; name: string };
}

export interface PersonalProject {
    _id: string;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'on_hold' | 'cancelled';
    totalBudget: number;
    receivedAmount: number;
    currency: string;
    deadline?: string;
    progress?: number;
    client?: string | PersonalClient;
}

export interface PersonalClient {
    _id: string;
    name: string;
    type: 'individual' | 'company';
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    notes?: string;
}

export interface PersonalSaving {
    _id: string;
    amount: number;
    account: string;
    date: string;
    description?: string;
    linkedTransactionId?: string;
}

export const personalService = {
    // --- FINANCE ---
    getFinanceSummary: async () => {
        const token = authService.getToken();
        const res = await axios.get(`${API_URL}/personal/finance/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.summary;
    },
    getTransactions: async (): Promise<PersonalTransaction[]> => {
        const token = authService.getToken();
        const res = await axios.get(`${API_URL}/personal/finance`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.transactions;
    },
    addTransaction: async (data: Partial<PersonalTransaction>) => {
        const token = authService.getToken();
        const res = await axios.post(`${API_URL}/personal/finance`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.transaction;
    },
    // ... rest of finance ...

    // --- SAVINGS ---
    getSavings: async (): Promise<PersonalSaving[]> => {
        const token = authService.getToken();
        const res = await axios.get(`${API_URL}/personal/savings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.savings;
    },
    addSaving: async (data: Partial<PersonalSaving>) => {
        const token = authService.getToken();
        const res = await axios.post(`${API_URL}/personal/savings`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.saving;
    },
    deleteSaving: async (id: string) => {
        const token = authService.getToken();
        await axios.delete(`${API_URL}/personal/savings/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // --- TASKS ---
    getTasks: async (): Promise<PersonalTask[]> => {
        const token = authService.getToken();
        const res = await axios.get(`${API_URL}/personal/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.tasks;
    },
    // ... earlier methods ...
    updateTransaction: async (id: string, data: Partial<PersonalTransaction>) => {
        const token = authService.getToken();
        const res = await axios.patch(`${API_URL}/personal/finance/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.transaction;
    },
    deleteTransaction: async (id: string) => {
        const token = authService.getToken();
        const res = await axios.delete(`${API_URL}/personal/finance/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // --- TASKS ---
    addTask: async (data: Partial<PersonalTask>) => {
        const token = authService.getToken();
        const res = await axios.post(`${API_URL}/personal/tasks`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.task;
    },
    updateTask: async (id: string, data: Partial<PersonalTask>) => {
        const token = authService.getToken();
        const res = await axios.patch(`${API_URL}/personal/tasks/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.task;
    },
    updateTaskStatus: async (id: string, status: string) => {
        const token = authService.getToken();
        const res = await axios.patch(`${API_URL}/personal/tasks/${id}/status`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.task;
    },
    deleteTask: async (id: string) => {
        const token = authService.getToken();
        const res = await axios.delete(`${API_URL}/personal/tasks/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // --- PROJECTS ---
    getProjects: async (): Promise<PersonalProject[]> => {
        const token = authService.getToken();
        const res = await axios.get(`${API_URL}/personal/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.projects;
    },
    addProject: async (data: Partial<PersonalProject>) => {
        const token = authService.getToken();
        const res = await axios.post(`${API_URL}/personal/projects`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.project;
    },
    updateProject: async (id: string, data: Partial<PersonalProject>) => {
        const token = authService.getToken();
        const res = await axios.patch(`${API_URL}/personal/projects/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.project;
    },
    deleteProject: async (id: string) => {
        const token = authService.getToken();
        const res = await axios.delete(`${API_URL}/personal/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // --- CLIENTS ---
    getClients: async (): Promise<PersonalClient[]> => {
        const token = authService.getToken();
        const res = await axios.get(`${API_URL}/personal/clients`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.clients;
    },
    addClient: async (data: Partial<PersonalClient>) => {
        const token = authService.getToken();
        const res = await axios.post(`${API_URL}/personal/clients`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.client;
    },
    updateClient: async (id: string, data: Partial<PersonalClient>) => {
        const token = authService.getToken();
        const res = await axios.patch(`${API_URL}/personal/clients/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.client;
    },
    deleteClient: async (id: string) => {
        const token = authService.getToken();
        const res = await axios.delete(`${API_URL}/personal/clients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // --- REPORTS ---
    getReportData: async (timeframe: string) => {
        const token = authService.getToken();
        const res = await axios.get(`${API_URL}/personal/reports?timeframe=${timeframe}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.report;
    },
    processAICommand: async (text: string, context?: any) => {
        const token = authService.getToken();
        const res = await axios.post(`${API_URL}/personal/ai/process`, { text, context }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
