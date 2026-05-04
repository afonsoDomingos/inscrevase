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
    generateSpeech: async (text: string, provider: 'openai' | 'elevenlabs' = 'openai', voiceId: string = 'onyx'): Promise<Blob | null> => {
        try {
            const response = await fetch(`${API_URL}/ai/brain/tts`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text, provider, voiceId })
            });

            // 503 = TTS não configurado no servidor — fallback silencioso para browser TTS
            if (response.status === 503) {
                console.info("[TTS] Provider premium não disponível. Usando síntese local do browser.");
                return null;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Erro TTS: ${response.status}`);
            }

            return await response.blob();
        } catch (error) {
            // Só loga erros reais (não o fallback esperado)
            if (error instanceof Error && !error.message.includes('503')) {
                console.error("[TTS] Erro na geração de voz premium:", error.message);
            }
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
    updateVoiceMode: async (mode?: 'local' | 'premium', voiceName?: string) => {
        try {
            const response = await fetch(`${API_URL}/ai/brain/settings/voice`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ mode, voiceName })
            });
            if (!response.ok) throw new Error('Falha ao atualizar modo de voz');
            return await response.json();
        } catch (error) {
            console.error("Update Voice Mode Error:", error);
            throw error;
        }
    }
};
