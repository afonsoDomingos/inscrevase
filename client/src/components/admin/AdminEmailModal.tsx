import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Mail, Sparkles, Loader2, Search, Check, History, LayoutIcon, FileText, Calendar } from 'lucide-react';
import { adminCommunicationService } from '@/lib/adminCommunicationService';
import { aiService } from '@/lib/aiService';
import { toast } from 'sonner';
import { useTranslate } from '@/context/LanguageContext';
import { userService } from '@/lib/userService';
import { UserData } from '@/lib/authService';
import Tooltip from '../common/Tooltip';
import { formService, FormModel } from '@/lib/formService';


interface AdminEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId?: string;
    recipientName?: string;
    initialSubject?: string;
    initialContent?: string;
}

interface EmailLog {
    _id: string;
    subject: string;
    recipientEmails: string[];
    sentAt: string | Date;
    sender?: {
        name: string;
    };
}

const TEMPLATES = [
    {
        id: 'subscription_confirmed',
        category: 'Pagamentos',
        subject: '💎 Pagamento Confirmado: Bem-vindo ao Plano Premium!',
        content: 'Olá! Temos o prazer de informar que o seu pagamento foi processado e a sua assinatura foi ativada com sucesso. A sua conta já foi elevada ao status de Elite, desbloqueando todas as funcionalidades avançadas, taxas reduzidas e ferramentas exclusivas de gestão da Inscreva-se. Estamos entusiasmados por fazer parte do seu crescimento. Explore o seu novo dashboard agora!'
    },
    {
        id: 'event_payment_confirmed',
        category: 'Pagamentos',
        subject: '✅ Inscrição Confirmada: Pagamento Recebido!',
        content: 'Olá! Confirmamos a receção do seu pagamento para o evento. A sua inscrição está agora validada e o acesso ao Hub do Inscrito já está disponível. Lá encontrará todos os materiais, aulas e informações necessárias para aproveitar ao máximo esta experiência. Bem-vindo ao evento!'
    },
    {
        id: 'payment_received_proof',
        category: 'Pagamentos',
        subject: '📦 Comprovante Recebido: Em Processamento',
        content: 'Olá! Recebemos o seu comprovante de pagamento. A nossa equipa financeira já está a validar a transação (prazo de até 24h úteis). Assim que for confirmado, receberá um novo email com o acesso libertado. Obrigado pela sua paciência!'
    },
    {
        id: 'payment_rejected',
        category: 'Pagamentos',
        subject: '❌ Atualização: Problema na Validação do Pagamento',
        content: 'Olá. Infelizmente não conseguimos validar o comprovante de pagamento enviado. Por favor, verifique se o valor está correto ou se a imagem está legível. Pode submeter um novo comprovante através do seu painel ou entrar em contacto com o nosso suporte para ajudar.'
    },
    {
        id: 'first_event_congrats',
        category: 'Sucesso',
        subject: '🚀 Parabéns pela criação do seu 1º Evento!',
        content: 'Olá! Vimos que acabou de lançar o seu primeiro evento na Inscreva-se. Este é um marco importante na sua jornada como mentor de elite! Estamos aqui para garantir que a sua experiência seja extraordinária. Desejamos-lhe o maior sucesso e muitas conversões. Se precisar de qualquer suporte estratégico, a nossa equipa está ao seu lado!'
    },
    {
        id: 'recurring_event_congrats',
        category: 'Sucesso',
        subject: '🌟 Mais um Evento de Sucesso a Caminho!',
        content: 'Olá! É inspirador ver a sua consistência na plataforma. Acabamos de notar a criação de mais um evento no seu perfil. Mentores consistentes como você são os que mais escalam resultados a longo prazo. Desejamos que este novo projeto supere todas as expectativas e traga resultados incríveis para os seus alunos. Boa sorte no lançamento!'
    },
    {
        id: 'first_submission_congrats',
        category: 'Sucesso',
        subject: '🎉 Parabéns! Sua PRIMEIRA inscrição chegou!',
        content: 'Olá! Que momento fantástico! Acabamos de registar aprimeira inscrição num evento criado por si. Este é o início oficial da sua faturação e impacto através do seu conhecimento na plataforma. O primeiro passo foi dado com sucesso, e muitos outros alunos estão a caminho. Parabéns por esta conquista!'
    },
    {
        id: 'onboarding_nudge',
        category: 'Conversão',
        subject: '💡 Comece hoje: Transforme seu conhecimento em faturação!',
        content: 'Olá! Vimos que você se juntou à nossa comunidade de mentores de elite, mas ainda não deu o primeiro passo. O seu conhecimento tem um valor imenso e estamos aqui para ajudá-lo a monetizá-lo! Que tal criar o seu primeiro evento hoje? Leva menos de 5 minutos e você já pode começar a receber inscrições. Vamos colocar o seu projeto no ar?'
    },
    {
        id: 'low_visits_nudge',
        category: 'Estratégia',
        subject: '🚀 Dica: Aumente o alcance do seu evento!',
        content: 'Olá! Notamos que o seu evento foi lançado há 48 horas, mas ainda está com pouca visibilidade (menos de 10 visitas). O seu conteúdo é incrível e merece ser visto! Que tal partilhar o link do evento nos seus grupos de WhatsApp, Instagram ou LinkedIn? Pequenas ações de divulgação podem gerar as suas primeiras vendas hoje mesmo. Vamos impulsionar esse alcance?'
    },
    {
        id: 'high_performance_congrats',
        category: 'Sucesso',
        subject: '🔥 Fenomenal! O seu evento está a explodir!',
        content: 'Olá! Uau, que tração incrível! Notamos que o seu evento atingiu mais de 50 visitas em menos de 24 horas. Isso é um sinal claro de que o seu tema é de alto interesse e que a sua audiência está engajada. Parabéns pela excelente estratégia de lançamento! Continue assim, pois grandes resultados estão a caminho. Vamos rumo ao Sold Out?'
    },
    {
        id: 'pending_approvals',
        category: 'Gestão',
        subject: '⌛ Atenção: Há Inscrições Pendentes de Aprovação',
        content: 'Olá! Notamos que o seu evento tem participantes aguardando validação manual no seu dashboard. Recomendamos que valide estas inscrições o quanto antes para garantir a melhor experiência ao aluno. A agilidade na aprovação é o fator principal para manter o interesse do seu público ativo. Vamos liberar estes acessos?'
    },
    {
        id: 'congrats',
        category: 'Sucesso',
        subject: '🚀 Parabéns pelo seu Evento na Inscreva-se!',
        content: 'Olá! Passamos para parabenizar pela excelente organização do seu último evento. O feedback dos participantes tem sido incrível e o seu perfil está a ganhar muito destaque na nossa rede de Elite. Continue o excelente trabalho!'
    },
    {
        id: 'branding',
        category: 'Melhoria',
        subject: '🎨 Dica de Branding: Eleve o Nível do seu Formulário',
        content: 'Olá! Notamos o seu novo evento e temos uma sugestão para aumentar as suas conversões: que tal atualizar a imagem de capa para uma foto de alta resolução e ajustar as cores do tema para combinarem com a sua marca? Formulários com branding forte convertem até 40% mais. Se precisar de ajuda, a nossa equipa pode guiá-lo!'
    },
    {
        id: 'tiered_pricing_tip',
        category: 'Estratégia',
        subject: '📈 Dica de Vendas: Use Lotes para Criar Urgência',
        content: 'Olá! Notamos que o seu evento está a usar um preço único. Sabia que eventos que utilizam "Lote Early Bird" (Preço Antecipado) tendem a vender 30% mais nas primeiras 48 horas? No seu painel, pode configurar categorias de bilhetes com preços diferentes. Criar o sentimento de "quem chega primeiro paga menos" é uma das técnicas mais eficazes no marketing de eventos. Vamos testar?'
    },
    {
        id: 'whatsapp_community',
        category: 'Engajamento',
        subject: '📱 Dica: Crie uma Comunidade no WhatsApp para o seu Evento',
        content: 'Olá! Sabia que eventos com grupos de suporte no WhatsApp têm uma taxa de presença 60% maior? No seu painel de edição de evento, pode adicionar o link direto da sua comunidade. Assim, assim que o participante for aprovado, ele recebe o convite automaticamente. Vamos estreitar os laços com os seus alunos?'
    },
    {
        id: 'verification',
        category: 'Segurança',
        subject: '🛡️ Verificação de Perfil Profissional',
        content: 'Olá! Para manter o padrão de segurança e exclusividade da plataforma, solicitamos que complete a verificação do seu perfil. Isso trará o selo de "Expert Verificado", aumentando a confiança dos seus inscritos e permitindo o recebimento de pagamentos via Stripe de forma mais célere.'
    },
    {
        id: 'masterclass',
        category: 'Oportunidade',
        subject: '🌟 Convite: Destaque na Homepage',
        content: 'Olá! Estamos a selecionar os melhores especialistas para a nossa vitrine de Masterclasses na página principal. Vimos o seu potencial e gostaríamos de saber se tem interesse em criar um conteúdo exclusivo para este destaque. Vamos elevar o seu alcance?'
    },
    {
        id: 'impact_congrats',
        category: 'Impacto',
        subject: '💎 Reconhecimento: O seu impacto está a crescer!',
        content: 'Olá! Estamos a acompanhar as métricas da plataforma e o seu perfil destaca-se pelo engajamento. O seu conhecimento está a transformar vidas e queremos parabenizá-lo por ser um pilar fundamental na nossa rede de elite. Continue com esse foco – o sucesso é uma consequência do seu valor!'
    },
    {
        id: 'post_event_stats',
        category: 'Analytics',
        subject: '📊 Resumo de Performance: Veja os seus resultados',
        content: 'Olá! O seu evento acabou de terminar e os dados já estão disponíveis. Acesse o seu dashboard para ver o relatório de conversão, origem dos inscritos (redes sociais vs direto) e o volume de transações. Estes dados são ouro para planear a sua próxima Masterclass de forma ainda mais estratégica. O seu crescimento é o nosso sucesso!'
    },
    {
        id: 'referral_champion',
        category: 'Crescimento',
        subject: '🏆 Convite: Torne-se um Embaixador Inscreva-se',
        content: 'Olá! Você tem sido um dos usuários mais ativos da plataforma. Queremos convidá-lo para o nosso Programa de Embaixadores. Ao indicar outros mentores de elite, você não só ganha pontos de impacto, mas pode desbloquear o Plano Enterprise com Taxa Zero de comissão. Que tal transformar a sua influência em benefícios reais para a sua empresa?'
    },
    {
        id: 'remind_event',
        category: 'Engajamento',
        subject: '⏰ Lembrete: Seu evento começa em breve!',
        content: 'Olá! O seu evento está quase a começar e notamos que ainda restam algumas vagas. Sugerimos fazer um "último aviso" nas suas redes sociais para atrair os retardatários. Lembre-se que pode exportar a lista de participantes em formato Excel a qualquer momento no seu dashboard.'
    },
    {
        id: 'feature_update',
        category: 'Novidade',
        subject: '✨ Nova Funcionalidade: Certificados Automáticos',
        content: 'Olá! Acabamos de lançar a funcionalidade de Certificação Automática. Agora, assim que o seu evento terminar, os participantes podem baixar um certificado personalizado com a sua assinatura diretamente da plataforma. Isso adiciona um valor imenso para o seu público!'
    },
    {
        id: 'billing_stripe',
        category: 'Pagamentos',
        subject: '💳 Configuração de Checkout Global (Stripe)',
        content: 'Olá! Vimos que o seu evento está a atrair tráfego internacional. Recomendamos configurar a sua conta Stripe para aceitar pagamentos em USD/EUR, permitindo que participantes de fora de África comprem os seus bilhetes com cartão de crédito de forma instantânea. Vamos habilitar esta opção?'
    },
    {
        id: 'dormant',
        category: 'Retenção',
        subject: '👋 Sentimos sua falta no ecossistema!',
        content: 'Olá! Notamos que já faz algum tempo que não cria um evento na Inscreva-se. A plataforma evoluiu com novas ferramentas de IA e automação que podem facilitar muito a sua gestão. Gostaria de agendar uma breve chamada para vermos como podemos impulsionar os seus próximos projetos?'
    },
    {
        id: 'partnership',
        category: 'Parceria',
        subject: '🤝 Proposta de Parceria Estratégica',
        content: 'Olá! O Inscreva-se está a expandir a sua rede de parceiros institucionais. Dado o impacto dos seus eventos para a comunidade, gostaríamos de discutir um modelo de parceria onde poderíamos oferecer taxas reduzidas ou suporte de marketing dedicado para os seus futuros lançamentos.'
    },
    {
        id: 'support_tech',
        category: 'Suporte',
        subject: '🛠️ Atualização do Suporte Técnico',
        content: 'Olá! Identificamos o problema técnico que reportou no carregamento de ficheiros. A nossa equipa de engenharia já aplicou uma correção e tudo deve estar a funcionar normalmente agora. Pedimos desculpa pelo transtorno e agradecemos a sua paciência.'
    },
    {
        id: 'signup_incentive_participant',
        category: 'Conversão',
        subject: '💡 Cria a Tua Conta e Acompanha a Tua Inscrição!',
        content: 'Olá! A tua inscrição no evento foi recebida com sucesso. Notamos que ainda não tens uma conta na plataforma Inscreva-se. Com uma conta gratuita de Participante, podes acompanhar o estado da tua inscrição em tempo real, aceder às aulas e materiais do evento, solicitar e descarregar o teu certificado de participação, e comunicar diretamente com o organizador. Registo em menos de 1 minuto — usa o mesmo e-mail desta inscrição e serás automaticamente ligado ao teu evento!'
    },
    {
        id: 'new_feature_announcement',
        category: 'Broadcast',
        subject: '🚀 Nova Funcionalidade: [Nome da Funcionalidade]',
        content: 'Olá! Temos uma novidade incrível para partilhar consigo. Acabámos de lançar [Nome da Funcionalidade] — uma nova ferramenta que vai transformar a forma como gere os seus eventos e maximiza os seus resultados. Esta funcionalidade permite-lhe [descreva o benefício principal]. Já está disponível no seu painel, sem necessidade de configuração adicional. Explore agora e diga-nos o que acha!'
    },
    {
        id: 'new_integration_announcement',
        category: 'Broadcast',
        subject: '🔗 Nova Integração Disponível: [Nome da Integração]',
        content: 'Olá! A Inscreva-se acaba de integrar nativamente com [Nome da Integração]. Isto significa que agora pode [benefício principal da integração] diretamente a partir do seu painel, sem precisar de ferramentas de terceiros ou configurações técnicas complexas. A integração está ativa para todos os utilizadores a partir de hoje. Para começar, aceda ao seu painel e explore a nova opção disponível. Estamos sempre a trabalhar para trazer as melhores ferramentas para o seu sucesso!'
    },
    {
        id: 'maintenance_notice',
        category: 'Broadcast',
        subject: '🔧 Aviso de Manutenção Programada — [Data]',
        content: 'Olá! Informamos que a plataforma Inscreva-se passará por uma manutenção programada no dia [Data] às [Hora], com duração estimada de [Duração]. Durante este período, [liste os serviços afetados] poderão estar temporariamente indisponíveis. Esta manutenção é necessária para melhorar a performance e estabilidade da plataforma. Pedimos desculpa pela inconveniência e agradecemos a sua compreensão. Caso tenha urgências, contacte o nosso suporte antes da janela de manutenção.'
    },
    {
        id: 'promotional_campaign',
        category: 'Broadcast',
        subject: '✨ Oferta Especial: [Título da Campanha] — Válido até [Data]',
        content: 'Olá! Temos uma oferta exclusiva para si. [Descreva a promoção ou o desconto disponível]. Para aproveitar, utilize o código [CÓDIGO] no checkout — ou aceda diretamente ao link abaixo. Esta oferta é válida apenas até [Data de Expiração], por isso não deixe escapar esta oportunidade única. Foi desenvolvida especialmente para utilizadores como você, que já fazem parte da nossa comunidade de elite. Aproveite agora!'
    },
    {
        id: 'platform_milestone',
        category: 'Broadcast',
        subject: '🏆 Celebramos Juntos: [Número] [Unidade] na Inscreva-se!',
        content: 'Olá! Temos uma notícia fantástica para celebrar com toda a nossa comunidade. A Inscreva-se acabou de atingir [Número] [Unidade] — e isto só foi possível graças a utilizadores incríveis como você. Este marco representa o impacto coletivo que estamos a criar juntos. Como forma de celebração, [mencione benefício ou surpresa, se houver]. Obrigado por fazer parte desta jornada. O melhor ainda está por vir!'
    }
];

export default function AdminEmailModal({ isOpen, onClose, recipientId, recipientName, initialSubject, initialContent }: AdminEmailModalProps) {
    const { locale } = useTranslate();
    const [subject, setSubject] = useState(initialSubject || '');
    const [content, setContent] = useState(initialContent || '');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [leftTab, setLeftTab] = useState<'recipients' | 'history' | 'templates' | 'events'>('recipients');
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Bulk logic states
    const [isAllMentors, setIsAllMentors] = useState(!recipientId);
    const [isAllUsers, setIsAllUsers] = useState(false);
    const [isAllParticipants, setIsAllParticipants] = useState(false);
    const [selectedParticipantEventId, setSelectedParticipantEventId] = useState<string | null>(null);
    const [mentors, setMentors] = useState<UserData[]>([]);
    const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fetchingMentors, setFetchingMentors] = useState(false);

    // Events promotion states
    const [events, setEvents] = useState<FormModel[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [eventSearchTerm, setEventSearchTerm] = useState('');
    const [buttonText, setButtonText] = useState('');
    const [buttonUrl, setButtonUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (!recipientId) {
                loadMentors();
            }
            if (initialSubject) setSubject(initialSubject);
            if (initialContent) setContent(initialContent);
        }
    }, [isOpen, recipientId, initialSubject, initialContent]);

    const loadMentors = async () => {
        setFetchingMentors(true);
        try {
            const allUsers = await userService.getAllUsers();
            const mentorList = allUsers.filter(u => ['mentor', 'specialist', 'company'].includes(u.role || ''));
            setMentors(mentorList);
        } catch (error) {
            console.error('Error loading mentors:', error);
            toast.error('Erro ao carregar lista de mentores');
        } finally {
            setFetchingMentors(false);
        }
    };

    const loadLogs = async () => {
        setLogsLoading(true);
        try {
            const data = await adminCommunicationService.getLogs();
            setLogs(data);
        } catch {
            toast.error('Erro ao carregar histórico');
        } finally {
            setLogsLoading(false);
        }
    };

    const loadEvents = async () => {
        setEventsLoading(true);
        try {
            const allEvents = await formService.getAllFormsAdmin();
            setEvents(allEvents);
        } catch (error) {
            console.error('Error loading events:', error);
            toast.error('Erro ao carregar lista de eventos');
        } finally {
            setEventsLoading(false);
        }
    };

    const toggleMentorSelection = (id: string) => {
        setSelectedMentorIds(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.businessName && m.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAiGenerate = async () => {
        if (!subject.trim()) {
            toast.error("Por favor, insira um assunto para orientar a IA.");
            return;
        }

        setAiLoading(true);
        try {
            const prompt = `Crie um email profissional e direto para um mentor sobre o seguinte assunto: "${subject}". O objetivo é dar feedback sobre a criação de um evento na plataforma Inscreva-se. O tom deve ser prestativo, profissional e encorajador.`;
            const data = await aiService.chat(prompt, locale);
            setContent(data.reply);
            toast.success("Conteúdo gerado com IA!");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao gerar conteúdo";
            toast.error(errorMessage);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!recipientId && !isAllMentors && !isAllUsers && !isAllParticipants && selectedMentorIds.length === 0) {
                toast.error('Selecione pelo menos um mentor, grupo ou evento.');
                setLoading(false);
                return;
            }

            if (isAllParticipants && !selectedParticipantEventId) {
                toast.error('Selecione o evento cujos participantes irão receber o email.');
                setLoading(false);
                return;
            }

            await adminCommunicationService.sendEmail({
                recipientIds: recipientId ? [recipientId] : (isAllMentors || isAllUsers || isAllParticipants ? undefined : selectedMentorIds),
                subject,
                content,
                isAllMentors: !recipientId && isAllMentors,
                isAllUsers: !recipientId && isAllUsers,
                isAllParticipants: !recipientId && isAllParticipants,
                eventIdForParticipants: isAllParticipants ? (selectedParticipantEventId ?? undefined) : undefined,
                buttonText: buttonText || undefined,
                buttonUrl: buttonUrl || undefined
            });

            toast.success('Emails enviados com sucesso!');
            setSubject('');
            setContent('');
            setButtonText('');
            setButtonUrl('');
            setSelectedEventId(null);
            setSelectedParticipantEventId(null);
            setIsAllParticipants(false);
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar emails';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: '850px',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        height: '85vh'
                    }}
                >
                    {/* Left Panel: Selection & Controls */}
                    <div style={{
                        flex: '1.2',
                        padding: '2rem',
                        borderRight: '1px solid #eee',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B8860B', flexShrink: 0 }}>
                                <Mail size={window.innerWidth < 480 ? 20 : 24} />
                                <h2 style={{ fontSize: window.innerWidth < 480 ? '1.1rem' : '1.4rem', fontWeight: 900, margin: 0 }}>Comunicação</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Tooltip content="Promover eventos existentes">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLeftTab(leftTab === 'events' ? 'recipients' : 'events');
                                            if (leftTab !== 'events') loadEvents();
                                        }}
                                        style={{ background: leftTab === 'events' ? '#000' : '#f5f5f5', color: leftTab === 'events' ? '#FFD700' : '#666', border: 'none', padding: '8px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Calendar size={13} /> {window.innerWidth < 480 ? '' : 'Eventos'}
                                    </button>
                                </Tooltip>
                                <Tooltip content="Ver histórico de emails enviados">
                                    <button
                                        onClick={() => {
                                            setLeftTab(leftTab === 'history' ? 'recipients' : 'history');
                                            if (leftTab !== 'history') loadLogs();
                                        }}
                                        style={{ background: leftTab === 'history' ? '#000' : '#f5f5f5', color: leftTab === 'history' ? '#FFD700' : '#666', border: 'none', padding: '8px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <History size={14} /> Histórico
                                    </button>
                                </Tooltip>
                                <Tooltip content="Usar modelos pré-definidos">
                                    <button
                                        onClick={() => setLeftTab(leftTab === 'templates' ? 'recipients' : 'templates')}
                                        style={{ background: leftTab === 'templates' ? '#000' : '#f5f5f5', color: leftTab === 'templates' ? '#FFD700' : '#666', border: 'none', padding: '8px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <LayoutIcon size={13} /> {window.innerWidth < 480 ? '' : 'Modelos'}
                                    </button>
                                </Tooltip>

                            </div>
                        </div>

                        {leftTab === 'history' ? (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {logsLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>
                                ) : logs.length === 0 ? (
                                    <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>Nenhum log encontrado.</div>
                                ) : (
                                    logs.map((log) => (
                                        <div key={log._id} style={{ padding: '1rem', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '16px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{log.subject}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>
                                                Enviado por: <span style={{ color: '#0070f3', fontWeight: 800 }}>{log.sender?.name || 'Sistema'}</span> • Para: {log.recipientEmails?.length > 3
                                                    ? `${log.recipientEmails.slice(0, 3).join(', ')} e mais ${log.recipientEmails.length - 3}`
                                                    : log.recipientEmails?.join(', ') || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(log.sentAt).toLocaleString()}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : leftTab === 'templates' ? (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => {
                                            setSubject(tmpl.subject);
                                            setContent(tmpl.content);
                                            setLeftTab('recipients');
                                            toast.success('Modelo aplicado!');
                                        }}
                                        style={{
                                            textAlign: 'left',
                                            padding: '1.2rem',
                                            background: '#fff',
                                            border: '1px solid #eee',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#B8860B'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#eee'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: '#B8860B', background: 'rgba(184,134,11,0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                                                {tmpl.category}
                                            </span>
                                            <FileText size={14} color="#ccc" />
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111', marginBottom: '0.4rem', lineHeight: 1.2 }}>{tmpl.subject}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {tmpl.content}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : leftTab === 'events' ? (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <div style={{ position: 'relative', marginBottom: '10px' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                                    <input
                                        type="text"
                                        placeholder="Buscar evento..."
                                        value={eventSearchTerm}
                                        onChange={(e) => setEventSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '16px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'grid', gap: '12px' }}>
                                    {eventsLoading ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" /></div>
                                    ) : events.length === 0 ? (
                                        <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>Nenhum evento encontrado.</div>
                                    ) : (
                                        events
                                            .filter(evt => evt.title.toLowerCase().includes(eventSearchTerm.toLowerCase()) || (evt.creator?.name && evt.creator.name.toLowerCase().includes(eventSearchTerm.toLowerCase())))
                                            .map((evt) => (
                                                <button
                                                    key={evt._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEventId(evt._id);
                                                        setSubject(`🔥 Evento Imperdível: ${evt.title} - Inscreve-te Já!`);
                                                        
                                                        const eventDateStr = evt.eventDate 
                                                            ? new Date(evt.eventDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
                                                            : 'A definir';
                                                        
                                                        const detailText = `Olá, [name]!\n\nQueremos convidar-te a participar no evento "${evt.title}", organizado pelo mentor ${evt.creator?.name || 'inscreva-se'}.\n\n📅 Data: ${eventDateStr} às ${evt.eventTime || 'A definir'}\n📍 Local/Canal: ${evt.location || (evt.onlineLink ? 'Online (Link no Hub)' : 'Online')}\n\nSobre o Evento:\n${evt.description || 'Um evento exclusivo preparado para ti.'}\n\nClica no botão abaixo para garantires a tua vaga e fazeres a tua inscrição agora!`;
                                                        
                                                        setContent(detailText);
                                                        setButtonText('Garantir Bilhete');
                                                        setButtonUrl(`https://inscreva-se.com/f/${evt.slug}`);
                                                        setLeftTab('recipients');
                                                        toast.success('Evento selecionado para promoção!');
                                                    }}
                                                    style={{
                                                        textAlign: 'left',
                                                        padding: '1rem',
                                                        background: selectedEventId === evt._id ? 'rgba(184,134,11,0.05)' : '#fff',
                                                        border: '1px solid',
                                                        borderColor: selectedEventId === evt._id ? '#B8860B' : '#eee',
                                                        borderRadius: '20px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        gap: '12px',
                                                        alignItems: 'center',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={(e) => { if (selectedEventId !== evt._id) e.currentTarget.style.borderColor = '#B8860B'; }}
                                                    onMouseLeave={(e) => { if (selectedEventId !== evt._id) e.currentTarget.style.borderColor = '#eee'; }}
                                                >
                                                    <div style={{
                                                        background: '#B8860B15',
                                                        color: '#B8860B',
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Organizador: {evt.creator?.name || 'N/A'}</div>
                                                    </div>
                                                </button>
                                            ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                {!recipientId ? (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#999', letterSpacing: '1px', display: 'block', marginBottom: '1rem' }}>Destinatários</label>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                onClick={() => { setIsAllMentors(true); setIsAllUsers(false); setIsAllParticipants(false); }}
                                                style={{
                                                    flex: 1, padding: '10px 5px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 800,
                                                    background: isAllMentors ? '#000' : '#f5f5f5',
                                                    color: isAllMentors ? '#FFD700' : '#666',
                                                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Mentores
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsAllMentors(false); setIsAllUsers(true); setIsAllParticipants(false); }}
                                                style={{
                                                    flex: 1, padding: '10px 5px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 800,
                                                    background: isAllUsers ? '#000' : '#f5f5f5',
                                                    color: isAllUsers ? '#FFD700' : '#666',
                                                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Todos
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsAllMentors(false); setIsAllUsers(false); setIsAllParticipants(true); if (events.length === 0) loadEvents(); }}
                                                style={{
                                                    flex: 1, padding: '10px 5px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 800,
                                                    background: isAllParticipants ? '#1a6b3a' : '#f5f5f5',
                                                    color: isAllParticipants ? '#7CFC00' : '#666',
                                                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Participantes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsAllMentors(false); setIsAllUsers(false); setIsAllParticipants(false); }}
                                                style={{
                                                    flex: 1, padding: '10px 5px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 800,
                                                    background: (!isAllMentors && !isAllUsers && !isAllParticipants) ? '#000' : '#f5f5f5',
                                                    color: (!isAllMentors && !isAllUsers && !isAllParticipants) ? '#FFD700' : '#666',
                                                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Escolher
                                            </button>
                                        </div>

                                        {isAllParticipants && (
                                            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selecionar Evento</div>
                                                <div style={{ fontSize: '0.72rem', color: '#166534', marginBottom: '10px', opacity: 0.8 }}>O email será enviado apenas para os participantes aprovados do evento escolhido.</div>
                                                {eventsLoading ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.8rem' }}>
                                                        <Loader2 size={14} className="animate-spin" /> A carregar eventos...
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={selectedParticipantEventId || ''}
                                                        onChange={(e) => setSelectedParticipantEventId(e.target.value || null)}
                                                        style={{
                                                            width: '100%', padding: '10px 12px', borderRadius: '12px',
                                                            border: '1px solid #86efac', background: '#fff',
                                                            fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="">-- Escolha um evento --</option>
                                                        {events.map(evt => (
                                                            <option key={evt._id} value={evt._id}>{evt.title} ({evt.creator?.name || 'N/A'})</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        )}

                                        {!isAllMentors && !isAllUsers && !isAllParticipants && (
                                            <div style={{ display: 'grid', gap: '10px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar mentor..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '16px', border: '1px solid #eee', fontSize: '0.9rem', outline: 'none' }}
                                                    />
                                                </div>

                                                <div style={{ maxHeight: '30vh', overflowY: 'auto', border: '1px solid #eee', borderRadius: '20px', padding: '10px' }}>
                                                    {fetchingMentors ? <div style={{ textAlign: 'center', padding: '10px' }}><Loader2 size={20} className="animate-spin" /></div> : filteredMentors.map(m => (
                                                        <div
                                                            key={m.id || m._id}
                                                            onClick={() => toggleMentorSelection(m.id || m._id!)}
                                                            style={{
                                                                padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                                                background: selectedMentorIds.includes(m.id || m._id!) ? 'rgba(184,134,11,0.05)' : 'transparent'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '20px', height: '20px', borderRadius: '6px', border: '2px solid',
                                                                borderColor: selectedMentorIds.includes(m.id || m._id!) ? '#B8860B' : '#ddd',
                                                                background: selectedMentorIds.includes(m.id || m._id!) ? '#B8860B' : 'transparent',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                {selectedMentorIds.includes(m.id || m._id!) && <Check size={14} color="#fff" strokeWidth={4} />}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{m.name}</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#999' }}>{m.businessName || m.email}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '2rem', background: '#fcfcfc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #eee' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#999', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>Destinatário</label>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{recipientName}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#B8860B', fontWeight: 600 }}>Envio Individual via Email</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Panel: Editor */}
                    <div style={{
                        flex: '2',
                        padding: window.innerWidth < 480 ? '1.5rem' : '2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#fcfcfc',
                        borderTop: window.innerWidth < 768 ? '1px solid #eee' : 'none'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <Tooltip content="Fechar">
                                <button onClick={onClose} style={{ background: '#eee', border: 'none', color: '#666', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </Tooltip>

                        </div>

                        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#999', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>Assunto do Email</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Ex: Sugestões de melhoria para o seu evento"
                                    required
                                    style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #eee', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
                                />
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#999', letterSpacing: '1px' }}>Mensagem (Corpo)</label>
                                    <Tooltip content="Gerar conteúdo profissional com Inteligência Artificial">
                                        <button
                                            type="button"
                                            onClick={handleAiGenerate}
                                            disabled={aiLoading}
                                            style={{ background: 'rgba(184,134,11,0.1)', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#B8860B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            Gerar com IA
                                        </button>
                                    </Tooltip>

                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Escreva sua mensagem aqui..."
                                    required
                                    style={{ flex: 1, width: '100%', padding: '1.5rem', borderRadius: '24px', border: '1px solid #eee', fontSize: '1rem', outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 1, padding: '1.2rem', borderRadius: '18px', border: 'none',
                                        background: 'linear-gradient(135deg, #000 0%, #333 100%)', color: '#FFD700',
                                        fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                    }}
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} /> Enviar Emails</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
