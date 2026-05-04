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
    },
    brainCommand: async (transcript: string, pageContext?: string, history: { role: string; text: string }[] = []) => {
        try {
            const response = await fetch(`${API_URL}/ai/brain/command`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ transcript, pageContext, history })
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorDetails = 'Falha neural no BRAIN';
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.details || errorJson.error) {
                        errorDetails = errorJson.details || errorJson.error;
                    }
                } catch {
                    errorDetails = errorText || errorDetails;
                }
                throw new Error(errorDetails);
            }

            return await response.json();
        } catch (error) {
            console.error("Brain Service Error:", error);
            throw error;
        }
    },
    getBrainStats: async () => {
        try {
            const response = await fetch(`${API_URL}/ai/brain/stats`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Falha ao buscar estatísticas.');
            }

            return await response.json();
        } catch (error) {
            console.error("Brain Stats Error:", error);
            throw error;
        }
    },
    generateSpeech: async (text: string, provider: 'openai' | 'elevenlabs' = 'openai') => {
        try {
            const response = await fetch(`${API_URL}/ai/brain/tts`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text, provider })
            });

            if (!response.ok) {
                throw new Error('Falha ao gerar voz premium.');
            }

            return await response.blob();
        } catch (error) {
            console.error("Speech Generation Error:", error);
            throw error;
        }
    },
    getVoiceMode: async () => {
        try {
            const response = await fetch(`${API_URL}/ai/brain/settings/voice`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Falha ao buscar modo de voz');
            return await response.json();
        } catch (error) {
            console.error("Get Voice Mode Error:", error);
            throw error;
        }
    },
    updateVoiceMode: async (mode: 'local' | 'premium') => {
        try {
            const response = await fetch(`${API_URL}/ai/brain/settings/voice`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ mode })
            });
            if (!response.ok) throw new Error('Falha ao atualizar modo de voz');
            return await response.json();
        } catch (error) {
            console.error("Update Voice Mode Error:", error);
            throw error;
        }
    }
};
