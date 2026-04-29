"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, X, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CerberusVisual from './CerberusVisual';
import { useSpeechRecognition } from './useSpeechRecognition';

export default function Brain() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [lastCommand, setLastCommand] = useState("");
    // const [isProcessing, setIsProcessing] = useState(false);

    const handleCommand = (transcript: string) => {
        setLastCommand(transcript);
        // setIsProcessing(true);

        const lowerTranscript = transcript.toLowerCase();

        // Mapeamento Abrangente de Rotas (Submenus Completos)
        const routes: Record<string, string[]> = {
            // Mentor Dashboard Routes
            '/dashboard/mentor?tab=overview': ['visão geral', 'resumo', 'dashboard mentor', 'painel mentor'],
            '/dashboard/mentor?tab=workspace': ['saúde profissional', 'workspace', 'espaço de trabalho'],
            '/dashboard/mentor?tab=forms': ['meus eventos', 'meus formulários', 'ver eventos'],
            '/dashboard/mentor?tab=submissions': ['ver inscrições', 'participantes', 'lista de inscritos'],
            '/dashboard/mentor?tab=lessons': ['aulas', 'meus cursos', 'conteúdo', 'tutoriais'],
            '/dashboard/mentor?tab=earnings': ['meus ganhos', 'finanças mentor', 'dinheiro', 'receita'],
            '/dashboard/mentor?tab=reports': ['relatórios', 'estatísticas de vendas'],
            '/dashboard/mentor?tab=ads': ['meus anúncios', 'publicidade'],
            '/dashboard/mentor?tab=smartlinks': ['meus smartlinks', 'links inteligentes'],
            '/dashboard/mentor?tab=marketing': ['impulsionar vendas', 'marketing'],
            '/dashboard/mentor?tab=services': ['meus serviços', 'gestão de serviços'],
            '/dashboard/mentor?tab=referral': ['indicações', 'impacto', 'referência'],
            '/dashboard/mentor?tab=library': ['meus livros', 'biblioteca'],
            '/dashboard/mentor?tab=mysales': ['minhas vendas', 'histórico de vendas'],
            '/dashboard/mentor?tab=plans': ['ver planos', 'mudar plano', 'upgrade'],
            '/dashboard/mentor?tab=settings': ['minha conta', 'definições mentor', 'ajustes'],
            '/dashboard/mentor?tab=liveboard': ['sala de eventos', 'liveboard', 'lab'],
            '/dashboard/mentor?tab=vacancies': ['vagas mentor', 'gestão de vagas'],
            
            // Admin Dashboard Routes
            '/dashboard/admin?tab=overview': ['painel admin', 'dashboard admin', 'estatísticas globais'],
            '/dashboard/admin?tab=users': ['gestão de usuários', 'ver utilizadores', 'lista de pessoas'],
            '/dashboard/admin?tab=finance': ['financeiro global', 'receita da plataforma', 'caixa'],
            '/dashboard/admin?tab=payouts': ['pagamentos', 'payouts'],
            '/dashboard/admin?tab=support': ['suporte técnico', 'tickets', 'ajuda', 'mensagens de suporte'],
            '/dashboard/admin?tab=blog': ['gerenciar blog', 'postagens', 'artigos'],
            '/dashboard/admin?tab=newsletter': ['e-mail marketing', 'newsletter'],
            '/dashboard/admin?tab=vacancies': ['vagas admin', 'gestão de vagas global'],
            '/dashboard/admin?tab=whatsapp': ['automação whatsapp', 'logs whatsapp', 'mensagens whatsapp'],
            '/dashboard/admin?tab=motiva': ['prémio motiva', 'motiva'],
            '/dashboard/admin?tab=settings': ['definições do sistema', 'ajustes admin', 'configurações'],
            
            // Shared/Common
            '/dashboard/perfil': ['meu perfil', 'perfil profissional'],
            '/': ['ir para home', 'sair da dashboard', 'página inicial', 'site']
        };

        let foundRoute = "";
        for (const [route, keywords] of Object.entries(routes)) {
            if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
                foundRoute = route;
                break;
            }
        }

        setTimeout(() => {
            if (foundRoute) {
                router.push(foundRoute);
                toast.success(`Navegando para: ${foundRoute.split('tab=')[1] || 'Início'}`);
            } else if (lowerTranscript.includes('evento') || lowerTranscript.includes('criar')) {
                toast.info("Abrindo interface de criação de evento...");
                // Aqui poderíamos disparar um evento customizado
                window.dispatchEvent(new Event('open-create-event-modal'));
            } else {
                toast.error(`Não entendi o comando: "${transcript}". Tente algo como "Ver Inscritos" ou "Painel Admin".`);
            }
            // setIsProcessing(false);
        }, 800);
    };

    const { isListening, startListening, hasSupport } = useSpeechRecognition(handleCommand);

    if (!hasSupport) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
            {/* Modal de Feedback do Brain */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-black/90 backdrop-blur-xl border border-yellow-500/30 p-6 rounded-3xl shadow-2xl w-80 mb-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-yellow-500 font-bold tracking-widest text-xs uppercase">
                                <Command size={14} />
                                Neural Interface
                            </div>
                            <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <CerberusVisual isListening={isListening} />
                            
                            <div className="text-center">
                                <h3 className="text-white font-medium mb-1">
                                    {isListening ? "O Cérbero está ouvindo..." : "Interface Adormecida"}
                                </h3>
                                <p className="text-gray-500 text-xs px-4">
                                    Diga comandos como &quot;Ir para Dashboard&quot; ou &quot;Ver Inscritos&quot;
                                </p>
                            </div>

                            {lastCommand && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-yellow-500/10 border border-yellow-500/20 py-2 px-4 rounded-full flex items-center gap-2"
                                >
                                    <Terminal size={12} className="text-yellow-500" />
                                    <span className="text-yellow-500 text-xs font-mono">{lastCommand}</span>
                                </motion.div>
                            )}

                            <button
                                onClick={startListening}
                                disabled={isListening}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                                    isListening 
                                    ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' 
                                    : 'bg-yellow-500 text-black font-bold hover:bg-yellow-400'
                                }`}
                            >
                                {isListening ? (
                                    <>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: [4, 12, 4] }}
                                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                    className="w-1 bg-yellow-500 rounded-full"
                                                />
                                            ))}
                                        </div>
                                        <span>Ouvindo...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mic size={20} />
                                        <span>Falar Comando</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button (O Cérebro) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVisible(!isVisible)}
                className={`relative group p-1 rounded-full bg-black border-2 transition-colors duration-500 ${
                    isVisible ? 'border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.4)]' : 'border-gray-800'
                }`}
            >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                    <div className="relative">
                         {/* Mini Cérbero / Brain Icon */}
                        <div className={`w-8 h-8 rounded-full border-2 transition-all duration-700 ${
                            isVisible ? 'border-yellow-500 scale-110' : 'border-gray-700'
                        }`} />
                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
                            isVisible ? 'text-yellow-500' : 'text-gray-700'
                        }`}>
                            <Command size={18} />
                        </div>
                    </div>
                </div>

                {/* Pulse Effect */}
                {!isVisible && (
                    <span className="absolute inset-0 rounded-full border border-yellow-500/50 animate-ping" />
                )}
            </motion.button>
        </div>
    );
}
