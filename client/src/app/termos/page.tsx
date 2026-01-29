"use client";

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Shield, Users, CreditCard, AlertTriangle, Scale, Clock, Mail } from 'lucide-react';

export default function TermosDeUso() {
    const sections = [
        {
            icon: <FileText size={24} />,
            title: "1. Aceitação dos Termos",
            content: `Ao aceder e utilizar a plataforma Inscreva-se ("Plataforma", "nós", "nosso"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se não concordar com qualquer parte destes termos, não deverá utilizar a nossa Plataforma.

Estes termos aplicam-se a todos os utilizadores da Plataforma, incluindo, sem limitação, utilizadores que são organizadores de eventos ("Mentores"), participantes ("Participantes") e visitantes.

Reservamo-nos o direito de atualizar ou modificar estes Termos a qualquer momento, sem aviso prévio. A continuação do uso da Plataforma após quaisquer alterações constitui a sua aceitação dos novos Termos.`
        },
        {
            icon: <Users size={24} />,
            title: "2. Descrição do Serviço",
            content: `O Inscreva-se é uma plataforma de gestão de eventos que permite:

• Criação de formulários de inscrição personalizados para eventos
• Venda de bilhetes e gestão de pagamentos
• Gestão de participantes e check-in
• Emissão de certificados e comunicações
• Análise de dados e relatórios de eventos

A Plataforma atua como intermediária entre Mentores (organizadores de eventos) e Participantes, facilitando o processo de inscrição e pagamento. Não somos responsáveis pela qualidade, segurança ou legalidade dos eventos organizados através da nossa Plataforma.`
        },
        {
            icon: <Shield size={24} />,
            title: "3. Registo e Conta de Utilizador",
            content: `Para utilizar determinadas funcionalidades da Plataforma, deverá criar uma conta. Ao registar-se, concorda em:

• Fornecer informações verdadeiras, precisas, atuais e completas
• Manter e atualizar prontamente os seus dados de registo
• Manter a confidencialidade da sua senha e conta
• Notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta
• Assumir total responsabilidade por todas as atividades que ocorram na sua conta

Reservamo-nos o direito de suspender ou encerrar a sua conta se violar estes Termos ou se forneceu informações falsas durante o registo.`
        },
        {
            icon: <CreditCard size={24} />,
            title: "4. Pagamentos e Taxas",
            content: `4.1. Taxas de Serviço
A Plataforma cobra uma taxa de serviço sobre as transações realizadas. As taxas atuais estão disponíveis na página de Planos e podem ser alteradas mediante aviso prévio de 30 dias.

4.2. Processamento de Pagamentos
Os pagamentos são processados através de parceiros de pagamento terceiros (incluindo Multicaixa Express, M-Pesa, entre outros). Não armazenamos dados de cartão de crédito ou outras informações financeiras sensíveis.

4.3. Reembolsos
A política de reembolso é definida por cada Mentor para os seus eventos. O Inscreva-se não é responsável por aprovar ou processar reembolsos, sendo esta responsabilidade exclusiva do Mentor.

4.4. Repasse aos Mentores
Os valores das inscrições são repassados aos Mentores de acordo com os prazos e condições estabelecidos no momento do registo, deduzidas as taxas aplicáveis.`
        },
        {
            icon: <AlertTriangle size={24} />,
            title: "5. Responsabilidades e Limitações",
            content: `5.1. Responsabilidade dos Mentores
Os Mentores são exclusivamente responsáveis por:
• A veracidade das informações dos seus eventos
• A realização e qualidade dos eventos
• O cumprimento de todas as leis e regulamentos aplicáveis
• A gestão de reclamações e reembolsos dos participantes
• A obtenção de todas as licenças e autorizações necessárias

5.2. Responsabilidade dos Participantes
Os Participantes são responsáveis por:
• Verificar todas as informações do evento antes da inscrição
• Comparecer aos eventos conforme as condições estabelecidas
• Cumprir as regras definidas pelo Mentor

5.3. Limitação de Responsabilidade
O Inscreva-se não será responsável por:
• Eventos cancelados, adiados ou alterados pelos Mentores
• Qualidade ou conteúdo dos eventos
• Danos diretos, indiretos, incidentais ou consequenciais
• Perda de dados ou interrupção do serviço
• Ações de terceiros que utilizem a Plataforma`
        },
        {
            icon: <Scale size={24} />,
            title: "6. Propriedade Intelectual",
            content: `6.1. Direitos do Inscreva-se
Todo o conteúdo da Plataforma, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, clips de áudio, downloads digitais e compilações de dados, é propriedade do Inscreva-se ou dos seus fornecedores de conteúdo e está protegido pelas leis de propriedade intelectual aplicáveis.

6.2. Conteúdo do Utilizador
Ao submeter, publicar ou exibir conteúdo na Plataforma, você concede ao Inscreva-se uma licença mundial, não exclusiva, isenta de royalties para usar, reproduzir, modificar, publicar e distribuir tal conteúdo para fins de operação e promoção da Plataforma.

6.3. Uso Proibido
É proibido copiar, modificar, distribuir, vender ou alugar qualquer parte da Plataforma ou do seu conteúdo sem autorização prévia por escrito.`
        },
        {
            icon: <AlertTriangle size={24} />,
            title: "7. Conduta Proibida",
            content: `Ao utilizar a Plataforma, concorda em NÃO:

• Violar quaisquer leis ou regulamentos aplicáveis
• Publicar conteúdo falso, difamatório, obsceno ou ilegal
• Infringir direitos de propriedade intelectual de terceiros
• Transmitir vírus, malware ou outro código malicioso
• Tentar obter acesso não autorizado a sistemas ou contas
• Interferir com a operação normal da Plataforma
• Criar eventos fraudulentos ou enganosos
• Utilizar a Plataforma para spam ou comunicações não solicitadas
• Coletar dados de outros utilizadores sem consentimento
• Contornar medidas de segurança ou limitações técnicas

A violação destas regras pode resultar na suspensão ou encerramento imediato da sua conta.`
        },
        {
            icon: <Shield size={24} />,
            title: "8. Privacidade e Proteção de Dados",
            content: `O tratamento dos seus dados pessoais é regido pela nossa Política de Privacidade, que faz parte integrante destes Termos de Uso.

Ao utilizar a Plataforma, consente com:
• A recolha e processamento dos seus dados conforme descrito na Política de Privacidade
• O uso de cookies e tecnologias similares
• A partilha de dados com parceiros de pagamento para processamento de transações
• O envio de comunicações relacionadas com o serviço

Para exercer os seus direitos de proteção de dados, contacte-nos através dos canais disponíveis na página de Suporte.`
        },
        {
            icon: <Clock size={24} />,
            title: "9. Rescisão",
            content: `9.1. Rescisão pelo Utilizador
Pode encerrar a sua conta a qualquer momento, contactando o nosso suporte. O encerramento não afeta obrigações previamente assumidas ou transações em curso.

9.2. Rescisão pelo Inscreva-se
Reservamo-nos o direito de suspender ou encerrar a sua conta imediatamente, sem aviso prévio, caso:
• Viole estes Termos de Uso
• Utilize a Plataforma de forma fraudulenta
• Cause danos à Plataforma ou a outros utilizadores
• Esteja inativo por período prolongado

9.3. Efeitos da Rescisão
Após a rescisão, perderá acesso à sua conta e a todos os dados associados. Algumas disposições destes Termos sobreviverão à rescisão.`
        },
        {
            icon: <Scale size={24} />,
            title: "10. Disposições Gerais",
            content: `10.1. Lei Aplicável
Estes Termos são regidos e interpretados de acordo com as leis da República de Angola, sem consideração aos seus princípios de conflito de leis.

10.2. Resolução de Disputas
Qualquer disputa resultante destes Termos será resolvida preferencialmente por negociação amigável. Em caso de insucesso, as partes submetem-se à jurisdição exclusiva dos tribunais competentes de Luanda, Angola.

10.3. Integralidade do Acordo
Estes Termos, juntamente com a Política de Privacidade, constituem o acordo integral entre você e o Inscreva-se relativamente ao uso da Plataforma.

10.4. Renúncia
A falha do Inscreva-se em exercer qualquer direito previsto nestes Termos não constitui renúncia a esse direito.

10.5. Separabilidade
Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.`
        }
    ];

    return (
        <main style={{ background: '#fff', minHeight: '100vh' }}>
            <Navbar />

            {/* Header Section */}
            <section style={{
                position: 'relative',
                background: '#000',
                color: '#fff',
                padding: '160px 20px 100px',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                {/* Background Effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(20, 82, 173, 0.3) 0%, #000 70%)',
                    zIndex: 0
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.5,
                    backgroundImage: 'url("/header-bg-new.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}
                >
                    <Scale size={70} color="#FFD700" style={{ marginBottom: '25px', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.3))' }} />
                    <h1 style={{
                        fontSize: 'clamp(3rem, 6vw, 5rem)',
                        fontWeight: 900,
                        marginBottom: '25px',
                        fontFamily: 'var(--font-playfair, serif)',
                        textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        lineHeight: 1.1,
                        color: '#60a5fa'
                    }}>
                        Termos de <span style={{
                            color: '#FFD700',
                            textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                        }}>Uso</span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1.2rem, 2vw, 1.4rem)',
                        color: '#f0f0f0',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        Leia atentamente os termos e condições que regem o uso da plataforma Inscreva-se com transparência total.
                    </p>
                </motion.div>
            </section>

            {/* Quick Info */}
            <section style={{
                background: '#f8fafc',
                padding: '30px 20px',
                borderBottom: '1px solid #eee'
            }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '30px',
                    textAlign: 'center'
                }}>
                    <div>
                        <div style={{ fontWeight: 700, color: '#0a0a0a' }}>Última Atualização</div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>29 de Janeiro de 2026</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#0a0a0a' }}>Versão</div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>2.0</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#0a0a0a' }}>Vigência</div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>Imediata</div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px' }}>

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(20, 82, 173, 0.1), rgba(20, 82, 173, 0.05))',
                        border: '1px solid rgba(20, 82, 173, 0.2)',
                        borderRadius: '20px',
                        padding: '30px',
                        marginBottom: '50px'
                    }}
                >
                    <p style={{ color: '#333', lineHeight: 1.8, margin: 0 }}>
                        <strong>Bem-vindo ao Inscreva-se!</strong> Estes Termos de Uso (&quot;Termos&quot;) estabelecem as regras
                        e condições para a utilização da nossa plataforma de gestão de eventos. Ao criar uma conta
                        ou utilizar qualquer serviço do Inscreva-se, você concorda integralmente com estes Termos.
                    </p>
                </motion.div>

                {/* Sections */}
                <div style={{ display: 'grid', gap: '40px' }}>
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                background: '#fff',
                                borderRadius: '20px',
                                padding: '35px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                border: '1px solid #eee'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #1452AD, #0d3a7d)',
                                    color: '#fff',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {section.icon}
                                </div>
                                <h2 style={{
                                    fontSize: '1.4rem',
                                    fontWeight: 800,
                                    color: '#0a0a0a',
                                    margin: 0
                                }}>
                                    {section.title}
                                </h2>
                            </div>
                            <div style={{
                                color: '#555',
                                lineHeight: 1.9,
                                whiteSpace: 'pre-line',
                                fontSize: '0.98rem'
                            }}>
                                {section.content}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                        color: '#fff',
                        borderRadius: '24px',
                        padding: '50px',
                        marginTop: '60px',
                        textAlign: 'center'
                    }}
                >
                    <Mail size={40} style={{ marginBottom: '20px', opacity: 0.9 }} />
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '15px' }}>
                        Dúvidas sobre os Termos?
                    </h3>
                    <p style={{
                        fontSize: '1.1rem',
                        opacity: 0.8,
                        marginBottom: '25px',
                        maxWidth: '500px',
                        margin: '0 auto 25px'
                    }}>
                        Se tiver alguma questão sobre estes Termos de Uso, não hesite em contactar-nos.
                    </p>
                    <a
                        href="/suporte"
                        style={{
                            display: 'inline-block',
                            background: '#1452AD',
                            color: '#fff',
                            padding: '14px 35px',
                            borderRadius: '50px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'transform 0.3s'
                        }}
                    >
                        Contactar Suporte
                    </a>
                </motion.div>

                {/* Last Update */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '50px',
                    padding: '20px',
                    borderTop: '1px solid #eee'
                }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Última atualização: 29 de Janeiro de 2026 | Versão 2.0
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '10px' }}>
                        © 2026 Inscreva-se. Todos os direitos reservados.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
