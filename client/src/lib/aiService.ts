import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = Cookies.get('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const aiService = {
    chat: async (message: string, locale: string = 'pt') => {
        try {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ message, locale })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Aura está descansando no momento.');
            }

            return await response.json();
        } catch (error) {
            console.error("AI Service Error:", error);
            throw error;
        }
    }
};
