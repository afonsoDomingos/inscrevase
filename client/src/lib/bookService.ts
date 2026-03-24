import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BookModel {
    _id: string;
    title: string;
    author: string;
    description?: string;
    coverImage?: string;
    affiliateLink: string;
    category: string;
    price?: string;
    rating: number;
    isActive: boolean;
    clicks: number;
    status: 'pending' | 'approved' | 'rejected';
    isUserSubmission: boolean;
    pdfUrl?: string;
    sellerPaypalEmail?: string;
}

export const bookService = {
    async getAllBooks(): Promise<BookModel[]> {
        const response = await fetch(`${API_URL}/books`);
        if (!response.ok) throw new Error('Erro ao carregar livros');
        return response.json();
    },

    async adminGetAllBooks(): Promise<BookModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/books/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao carregar livros (Admin)');
        return response.json();
    },

    async createBook(bookData: Partial<BookModel>): Promise<BookModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookData)
        });
        if (!response.ok) throw new Error('Erro ao criar livro');
        return response.json();
    },

    async updateBook(id: string, bookData: Partial<BookModel>): Promise<BookModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookData)
        });
        if (!response.ok) throw new Error('Erro ao atualizar livro');
        return response.json();
    },

    async deleteBook(id: string): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao remover livro');
    },

    async recordClick(id: string): Promise<void> {
        await fetch(`${API_URL}/books/click/${id}`, { method: 'POST' });
    },

    async submitBook(bookData: Partial<BookModel>): Promise<BookModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/books/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookData)
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao submeter livro');
        }
        return data;
    },

    async getMySubmissions(): Promise<BookModel[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/books/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao carregar as suas submissões');
        return response.json();
    },

    async updateBookStatus(id: string, status: string): Promise<BookModel> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/books/admin/status/${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Erro ao atualizar estado do livro');
        return response.json();
    }
};
