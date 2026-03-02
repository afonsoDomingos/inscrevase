
const socialLinks = {
    linkedin: "https://www.linkedin.com/company/inscreva-se/",
    youtube: "https://www.youtube.com/@Inscreva-se-events",
    facebook: "https://www.facebook.com/people/Inscreva-se/61586427553486/?locale=pt_BR",
    tiktok: "https://www.tiktok.com/@inscreva_se_events",
    whatsapp: "https://api.whatsapp.com/send/?phone=258856079576&text&type=phone_number&app_absent=0",
    community: "https://chat.whatsapp.com/Cn3tondmipgHTavIhr8zLi"
};

const getSocialFooter = () => {
    return `
        <div style="margin-top: 45px; text-align: center; padding-top: 40px; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 13px; color: #999; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">Conecte-se com a Elite</p>
            
            <div style="margin-bottom: 30px;">
                ${[
            ['facebook', 'https://cdn-icons-png.flaticon.com/512/733/733547.png'],
            ['youtube', 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png'],
            ['linkedin', 'https://cdn-icons-png.flaticon.com/512/174/174857.png'],
            ['tiktok', 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png'],
            ['whatsapp', 'https://cdn-icons-png.flaticon.com/512/733/733585.png']
        ].map(([platform, icon]) => `
                    <a href="${socialLinks[platform]}" style="display: inline-block; margin: 0 10px; transition: opacity 0.2s;">
                        <img src="${icon}" alt="${platform}" style="width: 22px; height: 22px; opacity: 0.8;">
                    </a>
                `).join('')}
            </div>

            <div style="margin-bottom: 35px;">
                <a href="${socialLinks.community}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 100px; font-weight: 800; font-size: 13px; display: inline-block; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 1px solid #eee;">
                   💎 Entrar na Comunidade VIP
                </a>
            </div>

            <p style="font-size: 11px; color: #ccc; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">&copy; ${new Date().getFullYear()} Inscreva-se Infrastructure. Excelência em Eventos.</p>
            <p style="font-size: 10px; color: #eee; line-height: 1.6;">Este é um e-mail transacional. Caso tenha dúvidas, responda a este e-mail ou contacte o nosso suporte oficial.</p>
        </div>
    `;
};


const generateWelcomeEmail = (name, verificationLink = null, role = 'mentor') => {
    const isSocial = !verificationLink;
    const dashboardUrl = 'https://inscreva-se.com/dashboard';

    // Role-specific configuration
    const roleConfig = {
        participant: {
            accentColor: '#3b82f6',        // Blue — learning & participation
            badge: '🎓 PARTICIPANTE',
            headline: 'A sua jornada de aprendizado começa agora',
            intro: `É um prazer recebê-lo na <strong>Inscreva-se</strong>! A nossa plataforma foi criada para conectar pessoas ao melhor conteúdo educativo e de desenvolvimento profissional da lusofonia.`,
            features: [
                ['📚', 'Acesso ao Hub do Inscrito', 'Aulas, materiais e certificados num só lugar.'],
                ['📜', 'Certificados de Participação', 'Descarregue automaticamente após cada evento.'],
                ['🗓️', 'Agenda Integrada', 'Todos os seus cursos e eventos organizados no seu painel.'],
                ['💬', 'Suporte Direto', 'Comunique com os mentores diretamente pela plataforma.'],
            ],
            ctaLabel: isSocial ? 'Explorar Eventos' : 'Confirmar O Meu E-mail',
            confirmNote: 'Para ativar a sua conta e aceder a todos os eventos e materiais, confirme o seu e-mail:',
            socialNote: 'A sua conta está ativa e pronta. Explore os eventos disponíveis e inscreva-se agora!',
        },
        mentor: {
            accentColor: '#D4AF37',        // Gold — prestige & creation
            badge: '🧠 MENTOR',
            headline: 'Transforme o seu conhecimento em impacto global',
            intro: `É um privilégio tê-lo connosco. A <strong>Inscreva-se</strong> é a plataforma definitiva para quem procura transformar conhecimento em escala através de um ecossistema premium e automatizado.`,
            features: [
                ['💎', 'Crie Eventos de Elite', 'Do webinar ao presencial em minutos.'],
                ['💰', 'Fature sem Barreiras', 'Pagamentos globais e locais integrados.'],
                ['⚡', 'IA Avançada', 'Otimizamos as suas conversões e gestão.'],
                ['📊', 'Analytics em Tempo Real', 'Acompanhe os seus inscritos e receita ao vivo.'],
            ],
            ctaLabel: isSocial ? 'Aceder ao Meu Painel' : 'Confirmar O Meu E-mail',
            confirmNote: 'Para ativar o seu acesso completo e desbloquear todas as ferramentas de gestão, confirme o seu e-mail:',
            socialNote: 'A sua conta está ativa e pronta para o próximo nível. O seu acesso via rede social foi configurado com sucesso.',
        },
        specialist: {
            accentColor: '#8b5cf6',        // Purple — expertise & collaboration
            badge: '⭐ ESPECIALISTA',
            headline: 'A sua expertise merece o palco certo',
            intro: `Bem-vindo à <strong>Inscreva-se</strong>! Como Especialista, a plataforma conecta a sua expertise técnica a mentores e empresas que precisam de colaboradores de alto nível.`,
            features: [
                ['⭐', 'Selo de Especialista Verificado', 'Seja encontrado por mentores e empresas de elite.'],
                ['🤝', 'Ferramentas de Co-organização', 'Colabore em eventos e partilhe a gestão.'],
                ['🌐', 'Rede de Conexões', 'Aceda à rede exclusiva de mentores e organizações.'],
                ['📈', 'Destaque no Showcase', 'Visibilidade premium no ecossistema da plataforma.'],
            ],
            ctaLabel: isSocial ? 'Ver o Meu Perfil' : 'Confirmar O Meu E-mail',
            confirmNote: 'Para ativar o seu perfil de Especialista e começar a receber convites, confirme o seu e-mail:',
            socialNote: 'O seu perfil de Especialista está ativo. Complete-o para aumentar a sua visibilidade na plataforma.',
        },
        company: {
            accentColor: '#0ea5e9',        // Sky blue — corporate & scale
            badge: '🏢 EMPRESA',
            headline: 'Escale os seus eventos corporativos com tecnologia',
            intro: `Bem-vindo à <strong>Inscreva-se</strong>! A plataforma ideal para empresas que querem profissionalizar a gestão dos seus eventos internos, treinamentos e conferências com total controlo e visibilidade.`,
            features: [
                ['🏢', 'Perfil Institucional Personalizado', 'Apresente a marca da sua empresa com excelência.'],
                ['👥', 'Gestão de Múltiplos Eventos', 'Organize treinamentos corporativos em escala.'],
                ['📊', 'Relatórios Consolidados', 'Dados completos por evento, equipa e período.'],
                ['🤝', 'Rede de Especialistas', 'Encontre palestrantes e instrutores verificados.'],
            ],
            ctaLabel: isSocial ? 'Aceder ao Painel Corporativo' : 'Confirmar O Meu E-mail',
            confirmNote: 'Para ativar o painel corporativo e começar a gerir os seus eventos, confirme o e-mail da empresa:',
            socialNote: 'O perfil da sua empresa está ativo. Configure os seus dados corporativos e comece a criar eventos.',
        },
    };

    const config = roleConfig[role] || roleConfig.mentor;
    const { accentColor, badge, headline, intro, features, ctaLabel, confirmNote, socialNote } = config;

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Role-aware Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <div style="display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 100px; padding: 6px 18px; margin-top: 16px; position: relative; z-index: 1;">
                    <span style="color: #fff; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">${badge}</span>
                </div>
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin-top: 14px; letter-spacing: 1px; position: relative; z-index: 1; line-height: 1.3;">${headline}</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 20px; color: #111; margin-top: 0; font-weight: 800;">Olá, ${name}! 👋</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7; margin-bottom: 25px;">
                        ${intro}
                    </p>

                    <div style="background: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #f5f5f5;">
                        <p style="margin: 0 0 15px 0; color: #111; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">O que pode fazer agora:</p>
                        <ul style="padding: 0; margin: 0; list-style: none;">
                            ${features.map(([icon, title, desc], i) => `
                            <li style="margin-bottom: ${i < features.length - 1 ? '14px' : '0'}; color: #555; font-size: 14px; display: flex; align-items: flex-start;">
                                <span style="color: ${accentColor}; margin-right: 12px; font-weight: bold; font-size: 18px; flex-shrink: 0;">${icon}</span>
                                <span><strong>${title}:</strong> ${desc}</span>
                            </li>`).join('')}
                        </ul>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        ${isSocial ? socialNote : confirmNote}
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${verificationLink || dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-transform: uppercase; letter-spacing: 1px;">
                            ${ctaLabel}
                        </a>
                    </div>
                    
                    ${!isSocial ? `
                    <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 30px; line-height: 1.6;">
                        Se o botão não responder, utilize o link abaixo directamente:<br>
                        <a href="${verificationLink}" style="color: ${accentColor}; text-decoration: none; word-break: break-all;">${verificationLink}</a>
                    </p>
                    ` : ''}
                </div>
                
                <!-- Social CTA Block -->
                <div style="margin-top: 30px; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border-radius: 20px; padding: 30px 25px; text-align: center; border: 1px solid #2a2a2a;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Siga-nos nas redes sociais</p>
                    <p style="margin: 0 0 20px 0; font-size: 17px; color: #ffffff; font-weight: 800; line-height: 1.4;">
                        Dicas exclusivas e novidades <span style="color: ${accentColor};">todos os dias</span> &#128293;
                    </p>
                    <div style="margin-bottom: 22px;">
                        <a href="https://www.instagram.com/inscreva_se_events" style="display: inline-block; margin: 0 5px; background: #833ab4; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 22px; height: 22px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.youtube}" style="display: inline-block; margin: 0 5px; background: #ff0000; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="width: 22px; height: 22px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.linkedin}" style="display: inline-block; margin: 0 5px; background: #0077b5; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 22px; height: 22px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.tiktok}" style="display: inline-block; margin: 0 5px; background: #111; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; text-decoration: none; border: 1px solid #333;">
                            <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" style="width: 22px; height: 22px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.facebook}" style="display: inline-block; margin: 0 5px; background: #1877f2; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 22px; height: 22px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.whatsapp}" style="display: inline-block; margin: 0 5px; background: #25d366; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style="width: 22px; height: 22px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                    </div>
                    <a href="${socialLinks.community}" style="display: inline-block; background: #25d366; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 13px; letter-spacing: 0.5px; box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);">
                        &#128172; Entrar na Comunidade VIP
                    </a>
                    <p style="margin: 12px 0 0 0; font-size: 11px; color: #666; line-height: 1.5;">
                        Networking, conte&#250;do exclusivo e suporte &mdash; gratuito para todos os membros.
                    </p>
                </div>

                ${getSocialFooter()}
            </div>
        </div>
    `;
};


const generateBasicEmail = (title, name, content, buttonText, buttonUrl, color = "#D4AF37") => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, ${color} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">${title}</h1>
            </div>
            
            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${color};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Olá, ${name}!</p>
                    <div style="font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 30px;">
                        ${content}
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${buttonUrl}" style="background: linear-gradient(135deg, ${color} 0%, #000 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 20px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px;">
                            ${buttonText}
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generatePendingApprovalEmail = (mentorName, participantName, eventTitle, dashboardUrl) => {
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Aprovação <span style="color: ${accentColor};">Pendente</span> ⏳</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Olá, ${mentorName}!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        Tem uma nova inscrição que requer a sua análise prioritária para o evento: <br>
                        <strong style="color: #000; font-size: 18px; display: block; margin-top: 8px;">${eventTitle}</strong>
                    </p>

                    <div style="background: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #f5f5f5;">
                        <p style="margin: 0 0 5px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Participante:</p>
                        <p style="margin: 0 0 15px 0; color: #000; font-weight: 800; font-size: 16px;">${participantName}</p>
                        
                        <div style="display: inline-block; padding: 6px 15px; border-radius: 30px; background: ${accentColor}15; color: ${accentColor}; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                            Estado: Aguardando Validação
                        </div>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        O sucesso do seu evento começa com uma gestão ágil. Recomendamos que valide esta inscrição o quanto antes para proporcionar a melhor experiência ao seu novo aluno.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Aceder ao Painel Admin
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateReferralBonusEmail = (name, referrerName, points, dashboardUrl) => {
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Bónus de <span style="color: ${accentColor};">Boas-vindas</span>! 🎁</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Parabéns, ${name}!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        Vimos que se juntou à nossa elite através do convite de <strong>${referrerName}</strong>. 
                        Como presente especial, acabamos de creditar na sua conta:
                    </p>

                    <div style="text-align: center; margin: 30px 0; padding: 25px; background: #ffffff; border-radius: 16px; border: 1px dashed ${accentColor};">
                        <span style="font-size: 48px; font-weight: 900; color: ${accentColor}; line-height: 1;">+${points}</span>
                        <p style="font-size: 13px; color: #666; font-weight: 800; text-transform: uppercase; margin-top: 8px; letter-spacing: 1px;">Pontos de Impacto</p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        Utilize os seus pontos para desbloquear planos premium, recursos exclusivos e escalar o seu alcance. A sua jornada de sucesso começou com o pé direito!
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Explorar Meu Dashboard
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateReferralPointsEarnedEmail = (name, referredName, points, totalPoints, dashboardUrl) => {
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Nova <span style="color: ${accentColor};">Conquista</span>! 🚀</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Parabéns, ${name}!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        O seu impacto na comunidade continua a crescer! Recebemos uma nova indicação através do seu convite: <strong>${referredName}</strong> acaba de se juntar a nós.
                    </p>

                    <div style="text-align: center; margin: 30px 0; padding: 25px; background: #ffffff; border-radius: 16px; border: 1px dashed ${accentColor};">
                        <span style="font-size: 48px; font-weight: 900; color: ${accentColor}; line-height: 1;">+${points}</span>
                        <p style="font-size: 13px; color: #666; font-weight: 800; text-transform: uppercase; margin-top: 8px; letter-spacing: 1px;">Pontos Adicionados</p>
                    </div>

                    <div style="background: #000; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
                        <p style="margin: 0; color: #fff; font-size: 14px; font-weight: 700;">
                            Balanço Atual: <span style="color: ${accentColor}; font-size: 16px;">${totalPoints} Pontos</span>
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        Continue a partilhar o seu link e a transformar vidas. Cada indicação aproxima-o de novos níveis de influência e recompensas exclusivas. Estamos muito orgulhosos do seu percurso!
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Ver Meu Ranking
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateSocialPointsEmail = (name, missionName, points, totalPoints, dashboardUrl) => {
    const accentColor = "#10b981";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Missão <span style="color: ${accentColor};">Cumprida</span>! 🎯</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Excelente trabalho, ${name}!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        Completou com sucesso a missão: <strong>${missionName}</strong>. A sua dedicação é inspiradora e ajuda a fortalecer a nossa comunidade!
                    </p>

                    <div style="text-align: center; margin: 30px 0; padding: 25px; background: #ffffff; border-radius: 16px; border: 1px dashed ${accentColor};">
                        <span style="font-size: 48px; font-weight: 900; color: ${accentColor}; line-height: 1;">+${points}</span>
                        <p style="font-size: 13px; color: #666; font-weight: 800; text-transform: uppercase; margin-top: 8px; letter-spacing: 1px;">Pontos Conquistados</p>
                    </div>

                    <div style="background: #000; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
                        <p style="margin: 0; color: #fff; font-size: 14px; font-weight: 700;">
                            Novo Saldo: <span style="color: ${accentColor}; font-size: 16px;">${totalPoints} Pontos</span>
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        Continue a participar nas nossas iniciativas. Cada ponto acumula para o seu crescimento pessoal e profissional dentro da plataforma. Mantenha esse foco!
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #059669 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Ir para o Ranking
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateSubscriptionConfirmationEmail = (name, planName, dashboardUrl, commissionRate = 0.10) => {
    const isEnterprise = planName.toLowerCase() === 'enterprise';
    const accentColor = isEnterprise ? "#000000" : "#D4AF37";
    const highlightColor = isEnterprise ? "#ffffff" : "#D4AF37";
    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);
    const rateText = (commissionRate * 100).toFixed(0);

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Premium Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin-top: 20px; letter-spacing: 3px; text-transform: uppercase; position: relative; z-index: 1;">Acesso Elite <span style="color: ${highlightColor};">Ativado</span></h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor === "#000000" ? "#555" : accentColor};">
                    <p style="font-size: 20px; color: #111; margin-top: 0; font-weight: 800;">Parabéns, ${name}! 💎</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        O seu pagamento foi processado com sucesso. É um prazer dar-lhe as boas-vindas ao nível mais alto da nossa plataforma. A sua conta foi atualizada para o plano:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fff; border-radius: 16px; border: 1px dashed ${isEnterprise ? "#000" : accentColor};">
                        <span style="font-size: 13px; color: #999; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Plano Atual</span>
                        <h2 style="color: ${isEnterprise ? "#000" : accentColor}; font-size: 28px; margin: 5px 0 0; font-weight: 900;">Inscreva-se ${planLabel}</h2>
                    </div>

                    <p style="font-size: 14px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">Privilégios Desbloqueados:</p>
                    
                    <div style="display: grid; gap: 15px;">
                        <div style="background: #ffffff; padding: 15px; border-radius: 12px; display: flex; align-items: center; border: 1px solid #f5f5f5;">
                            <span style="font-size: 20px; margin-right: 15px;">🚀</span>
                            <span style="color: #444; font-size: 14px; font-weight: 600;">
                                ${isEnterprise
            ? "<strong>TAXA 0% (Isenção Total)</strong> nas suas vendas."
            : `Taxa reduzida de <strong>${rateText}%</strong> em todas as inscrições.`}
                            </span>
                        </div>
                        <div style="background: #ffffff; padding: 15px; border-radius: 12px; display: flex; align-items: center; border: 1px solid #f5f5f5;">
                            <span style="font-size: 20px; margin-right: 15px;">${isEnterprise ? "💎" : "✨"}</span>
                            <span style="color: #444; font-size: 14px; font-weight: 600;">
                                ${isEnterprise
            ? "Suporte VIP 24/7 e Gestor de Conta dedicado."
            : "Destaque Premium no Showcase de Mentores."}
                            </span>
                        </div>
                        <div style="background: #ffffff; padding: 15px; border-radius: 12px; display: flex; align-items: center; border: 1px solid #f5f5f5;">
                            <span style="font-size: 20px; margin-right: 15px;">⚙️</span>
                            <span style="color: #444; font-size: 14px; font-weight: 600;">
                                ${isEnterprise
            ? "Customização Total de Branding e White-label."
            : "Analytics detalhado e Relatórios Financeiros Avançados."}
                            </span>
                        </div>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7; margin-top: 30px;">
                        O seu novo painel já está configurado com todos estes recursos. O nosso objetivo é ajudá-lo a escalar o seu conhecimento com o máximo de eficiência.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor === "#000000" ? "#333" : accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px;">
                            Explorar Novos Recursos
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateEventPaymentConfirmationEmail = (name, eventTitle, amount, currency, hubUrl) => {
    const accentColor = "#22c55e";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Success Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Inscrição <span style="color: ${accentColor};">Confirmada</span> ✅</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Olá, ${name}!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        Temos ótimas notícias! O seu pagamento para o evento <strong>${eventTitle}</strong> foi validado com sucesso. A sua vaga está garantida.
                    </p>

                    <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #f5f5f5;">
                        <p style="margin: 0 0 12px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Detalhes do Investimento:</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #444; font-weight: 600;">Valor Total</span>
                            <span style="color: ${accentColor}; font-size: 20px; font-weight: 900;">${amount} ${currency}</span>
                        </div>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f8f8f8; display: flex; align-items: center; gap: 8px;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${accentColor};"></div>
                            <span style="color: #666; font-size: 12px; font-weight: 700; text-transform: uppercase;">Status: Pago & Aprovado</span>
                        </div>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        O seu acesso ao <strong>Hub do Inscrito</strong> já está libertado. Lá encontrará todos os materiais, links de acesso, cronograma e poderá descarregar o seu certificado de participação após o evento.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${hubUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Aceder ao Hub do Inscrito
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};


const generatePaymentProofReceivedEmail = (name, planName) => {
    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Process Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Comprovante <span style="color: ${accentColor};">Recebido</span> 📦</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Recebemos tudo, ${name}!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        O seu comprovante de pagamento para o plano <strong>Inscreva-se ${planLabel}</strong> já está sob análise da nossa equipa financeira.
                    </p>

                    <div style="background: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px dashed ${accentColor}44; text-align: center;">
                        <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">SLA de Autenticação</span>
                        <p style="margin: 0; color: #444; font-size: 16px; font-weight: 800;">
                            Até <span style="color: ${accentColor};">24 horas úteis</span>
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        Assim que a transação for autenticada, a sua conta será elevada ao status de Elite automaticamente e enviaremos o seu guia de boas-vindas.
                    </p>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generatePaymentFailedEmail = (name, planName, dashboardUrl) => {
    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);
    const accentColor = "#ef4444";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Warning Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Atenção <span style="color: ${accentColor};">Obrigatória</span> ⚠️</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fffafb; padding: 35px; border-radius: 20px; border: 1px solid #fee2e2; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Olá, ${name}.</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        Infelizmente, o processamento automático da sua assinatura para o plano <strong>Inscreva-se ${planLabel}</strong> falhou.
                    </p>

                    <div style="background: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #f9f9f9; border-left: 4px solid ${accentColor}22;">
                        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                            Motivos comuns incluem limite excedido, data de validade ou bloqueio preventivo do emissor do cartão. A sua segurança é preservada em todos os momentos.
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        Recomendamos que realize uma nova tentativa com outro cartão ou utilize métodos locais (M-Pesa / Transferência) para garantir a continuidade dos seus recursos de Elite.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Resolver Agora
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generatePaymentRejectedEmail = (name, planName, dashboardUrl) => {
    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);
    const accentColor = "#1f2937";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Rejection Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Atualização de <span style="color: #9ca3af;">Status</span> ❌</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #f9fafb; padding: 35px; border-radius: 20px; border: 1px solid #f3f4f6; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Olá, ${name}.</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        O seu comprovante de pagamento para o plano <strong>Inscreva-se ${planLabel}</strong> foi analisado e, infelizmente, não pôde ser autenticado pela nossa equipa de auditoria.
                    </p>

                    <div style="background: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #f0f0f0; border-left: 4px solid #ef4444;">
                        <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.6;">
                            Motivo Principal: Divergência de dados, imagem ilegível ou transação não localizada nos nossos registos bancários.
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        Recomendamos que submeta um novo comprovante nítido através do seu painel ou contacte o suporte oficial para assistência personalizada imediata.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: #000000; color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px;">
                            Contactar Suporte VIP
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateAdminPointsNotificationEmail = (userName, userEmail, points, reason) => {
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Admin Header -->
            <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 70px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Notificação <span style="color: ${accentColor};">Admin</span></h1>
            </div>
            
            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid #000;">
                    <h2 style="color: #111; margin: 0 0 25px 0; font-size: 18px; font-weight: 800;">Pontos Atribuídos 💎</h2>
                    
                    <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; border: 1px solid #f5f5f5;">
                        <p style="margin: 0 0 12px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Dados da Transação:</p>
                        <ul style="padding: 0; margin: 0; list-style: none;">
                            <li style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f8f8f8;">
                                <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Utilizador</span>
                                <span style="color: #000; font-weight: 700;">${userName}</span>
                                <span style="display: block; font-size: 12px; color: #666;">${userEmail}</span>
                            </li>
                            <li style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f8f8f8;">
                                <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Valor</span>
                                <span style="color: ${accentColor}; font-weight: 900; font-size: 20px;">+${points} Pontos</span>
                            </li>
                            <li>
                                <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Motivo</span>
                                <span style="color: #444; font-style: italic;">"${reason}"</span>
                            </li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px; line-height: 1.6; text-align: center;">
                        Este e-mail é gerado automaticamente para fins de monitoramento e auditoria pela infraestrutura da Inscreva-se.
                    </p>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateAdminAdNotificationEmail = (advertiserName, advertiserEmail, adTitle, adCategory, duration, investment, currency, paymentMethod, dashboardUrl) => {
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Ad Header -->
            <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 70px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Solicitação de <span style="color: ${accentColor};">Publicidade</span> 🚀</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin: 0 0 25px 0; font-weight: 800;">Novo Anúncio Submetido</p>
                    
                    <div style="background-color: #ffffff; padding: 25px; border-radius: 16px; border: 1px solid #f5f5f5;">
                        <ul style="padding: 0; margin: 0; list-style: none;">
                            <li style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f8f8f8;">
                                <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Anunciante</span>
                                <span style="color: #000; font-weight: 700;">${advertiserName}</span>
                                <span style="display: block; font-size: 12px; color: #666;">${advertiserEmail}</span>
                            </li>
                            <li style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f8f8f8;">
                                <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Campanha</span>
                                <span style="color: #000; font-weight: 800; font-size: 16px;">${adTitle}</span>
                            </li>
                            <li style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f8f8f8; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Duração</span>
                                    <span style="color: #000; font-weight: 700;">${duration} Semanas</span>
                                </div>
                                <div>
                                    <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Categoria</span>
                                    <span style="color: #000; font-weight: 700; text-transform: uppercase;">${adCategory}</span>
                                </div>
                            </li>
                            <li>
                                <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; margin-bottom: 4px;">Investimento</span>
                                <span style="color: #22c55e; font-weight: 900; font-size: 18px;">${investment} ${currency}</span>
                                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #3b82f615; color: #3b82f6; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-left: 8px;">${paymentMethod}</span>
                            </li>
                        </ul>
                    </div>

                    <p style="font-size: 14px; color: #666; line-height: 1.7; margin-top: 30px;">
                        Aceda ao painel administrativo para validar a mídia e o comprovativo de pagamento antes de proceder com a publicação oficial.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: #000; color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px;">
                            Rever no Painel Admin
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateAdStatusUpdateEmail = (name, adTitle, status, dashboardUrl) => {
    const isApproved = status === 'approved';
    const accentColor = isApproved ? "#22c55e" : "#ef4444";
    const statusText = isApproved ? 'Aprovado & Ativo' : status === 'rejected' ? 'Rejeitado' : 'Suspenso';

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Ad Status Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin-top: 20px; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">Status do <span style="color: ${accentColor};">Anúncio</span> 📢</h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 18px; color: #111; margin-top: 0; font-weight: 700;">Olá, ${name}!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7;">
                        Temos uma atualização importante sobre a veiculação da sua campanha na rede <strong>Inscreva-se</strong>:
                    </p>

                    <div style="background-color: #ffffff; padding: 30px; border-radius: 16px; margin: 30px 0; border: 1px solid #f5f5f5; text-align: center;">
                        <span style="display: block; font-size: 11px; color: #aaa; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px;">Campanha</span>
                        <p style="margin: 0 0 20px 0; color: #000; font-size: 18px; font-weight: 800;">${adTitle}</p>
                        <div style="display: inline-block; padding: 10px 30px; border-radius: 100px; background: ${accentColor}; color: #fff; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px ${accentColor}33;">
                            ${statusText}
                        </div>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.7;">
                        ${isApproved
            ? 'Excelente! A sua campanha foi validada com sucesso e já está a gerar impressões e cliques qualificados no nosso ecossistema.'
            : 'Informamos que a sua campanha não pôde ser ativa neste momento. Por favor, reveja se o criativo cumpre as nossas políticas de publicidade ou contacte o suporte.'}
                    </p>

                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${dashboardUrl}" style="background: #000; color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px;">
                            Ver Performance no Painel
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateSignupIncentiveEmail = (participantName, eventTitle, signupUrl) => {
    const firstName = participantName ? participantName.split(' ')[0] : 'Olá';
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- Premium Dark Header -->
            <div style="background: linear-gradient(135deg, #0f172a 0%, #000000 100%); padding: 50px 40px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 70px; height: auto; filter: brightness(0) invert(1); margin-bottom: 20px; position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: 3px; text-transform: uppercase; position: relative; z-index: 1;">INSCREVA<span style="color: ${accentColor};">-SE</span></h1>
                <p style="color: rgba(255,255,255,0.5); margin: 10px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; position: relative; z-index: 1;">A Excelência em Gestão de Eventos</p>
            </div>

            <div style="padding: 45px;">
                <h2 style="font-size: 20px; color: #111; font-weight: 800; margin: 0 0 10px;">Olá, ${firstName}! 👋</h2>
                <p style="font-size: 16px; color: #555; line-height: 1.7; margin: 0 0 30px;">
                    A sua inscrição no evento <strong style="color: #000;">&ldquo;${eventTitle}&rdquo;</strong> foi recebida com sucesso. É um prazer tê-lo connosco!
                </p>

                <!-- Incentive Box -->
                <div style="background: linear-gradient(135deg, #fdfcf3 0%, #fff 100%); border: 1px solid ${accentColor}44; border-radius: 20px; padding: 30px; margin-bottom: 35px; position: relative;">
                    <p style="font-size: 13px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">⚡ Potencialize a sua Experiência</p>
                    <p style="font-size: 15px; color: #333; line-height: 1.7; margin: 0;">Reparámos que ainda não possui uma conta de Participante. Ao criar o seu acesso <strong>gratuito</strong> agora, terá privilégios imediatos:</p>
                </div>

                <!-- Modern Benefits List -->
                <div style="margin-bottom: 40px;">
                    ${[
            ['💎', '<strong>Acompanhamento VIP:</strong> Estado da sua inscrição em tempo real.'],
            ['📚', '<strong>Hub de Conteúdo:</strong> Acesso direto a materiais e aulas.'],
            ['📜', '<strong>Certificação Elite:</strong> Descarregue os seus certificados num clique.'],
            ['💬', '<strong>Suporte Direto:</strong> Comunique agilmente com o organizador.'],
            ['🗓️', '<strong>Agenda Integrada:</strong> Todos os seus eventos num painel único.'],
        ].map(([icon, text]) => `
                        <div style="display: flex; align-items: flex-start; gap: 15px; padding: 18px 0; border-bottom: 1px solid #f8f8f8;">
                            <span style="font-size: 20px; flex-shrink: 0; line-height: 1;">${icon}</span>
                            <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.6;">${text}</p>
                        </div>
                    `).join('')}
                </div>

                <!-- Premium CTA -->
                <div style="text-align: center; margin-bottom: 35px;">
                    <a href="${signupUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #B8860B 100%); color: #ffffff; padding: 22px 50px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 12px 30px rgba(212,175,55,0.4); text-transform: uppercase; letter-spacing: 1px;">
                        🚀 Criar Minha Conta Gratuita
                    </a>
                    <p style="font-size: 11px; color: #aaa; margin-top: 15px; font-weight: 600;">Registo instantâneo. Utilize o mesmo e-mail desta inscrição.</p>
                </div>

                <p style="font-size: 13px; color: #999; text-align: center; line-height: 1.7; margin: 0; font-style: italic;">Se já possui uma conta, basta iniciar sessão para a sua inscrição ser associada automaticamente.</p>
            </div>

            <div style="padding: 0 45px 45px;">
                ${getSocialFooter()}
            </div>
        </div>
    `;
};



// ─── FEATURE / INTEGRATION ANNOUNCEMENT (broadcast to all users) ────────────
const generateFeatureAnnouncementEmail = (
    userName,
    featureName,
    featureDescription,
    benefits = [],
    ctaUrl = 'https://inscreva-se.com/dashboard',
    ctaLabel = 'Explorar Agora',
    isIntegration = false
) => {
    const accentColor = '#D4AF37';
    const badgeText = isIntegration ? '🔗 NOVA INTEGRAÇÃO' : '🚀 NOVA FUNCIONALIDADE';
    const badgeBg = isIntegration ? '#0ea5e9' : '#7c3aed';

    const defaultBenefits = benefits.length > 0 ? benefits : [
        ['⚡', 'Produtividade ao Máximo', 'Poupe tempo e automatize mais processos na plataforma.'],
        ['🎯', 'Precisão Aumentada', 'Tome melhores decisões com dados mais completos e precisos.'],
        ['🔒', 'Segurança de Topo', 'Todas as novidades seguem os nossos padrões de segurança premium.'],
    ];

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1e1e2e 60%, #0a0a0a 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <!-- Dot pattern overlay -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.07; background-image: radial-gradient(circle at 2px 2px, ${accentColor} 1px, transparent 0); background-size: 20px 20px;"></div>
                <!-- Glow circle -->
                <div style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 200px; height: 200px; background: radial-gradient(circle, ${badgeBg}55 0%, transparent 70%);"></div>

                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 70px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1; margin-bottom: 20px;">

                <!-- Badge -->
                <div style="display: inline-block; background: ${badgeBg}; border-radius: 100px; padding: 7px 20px; margin-bottom: 18px; position: relative; z-index: 1; box-shadow: 0 4px 15px ${badgeBg}66;">
                    <span style="color: #ffffff; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">${badgeText}</span>
                </div>

                <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0 0 10px; line-height: 1.25; position: relative; z-index: 1;">
                    ${featureName}
                </h1>
                <p style="color: #888; font-size: 14px; margin: 0; position: relative; z-index: 1;">Disponível agora para todos os utilizadores</p>
            </div>

            <!-- Body -->
            <div style="padding: 45px;">

                <!-- Greeting -->
                <div style="background: #fcfcfc; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor}; padding: 30px; margin-bottom: 30px;">
                    <p style="font-size: 20px; color: #111; margin: 0 0 15px; font-weight: 800;">Olá, ${userName}! 👋</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.8; margin: 0;">
                        ${featureDescription}
                    </p>
                </div>

                <!-- Benefits list -->
                ${defaultBenefits.length > 0 ? `
                <div style="background: #fff; border: 1px solid #f0f0f0; border-radius: 20px; padding: 28px; margin-bottom: 30px;">
                    <p style="margin: 0 0 18px; color: #111; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">O que vai ganhar com isto:</p>
                    ${defaultBenefits.map(([icon, title, desc], i) => `
                    <div style="display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; ${i < defaultBenefits.length - 1 ? 'border-bottom: 1px solid #f8f8f8;' : ''}">
                        <span style="font-size: 22px; flex-shrink: 0; line-height: 1;">${icon}</span>
                        <div>
                            <p style="margin: 0 0 3px; font-size: 14px; font-weight: 800; color: #111;">${title}</p>
                            <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">${desc}</p>
                        </div>
                    </div>`).join('')}
                </div>
                ` : ''}

                ${isIntegration ? `
                <!-- Integration Badge -->
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 16px; padding: 22px; margin-bottom: 30px; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 900; color: #0ea5e9; text-transform: uppercase; letter-spacing: 2px;">🔗 Integração Nativa</p>
                    <p style="margin: 0; font-size: 13px; color: #0369a1; line-height: 1.6;">Esta integração está disponível nativamente na plataforma. Não é necessário instalar nenhuma extensão ou ferramenta de terceiros.</p>
                </div>
                ` : ''}

                <!-- CTA -->
                <div style="text-align: center; margin: 10px 0 30px;">
                    <a href="${ctaUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 50px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 10px 30px rgba(212,175,55,0.35); text-transform: uppercase; letter-spacing: 1px;">
                        ${ctaLabel} →
                    </a>
                    <p style="font-size: 12px; color: #bbb; margin-top: 14px;">Totalmente disponível no seu painel. Sem passos adicionais.</p>
                </div>

                <!-- Social CTA Block -->
                <div style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border-radius: 20px; padding: 28px 25px; text-align: center; border: 1px solid #2a2a2a;">
                    <p style="margin: 0 0 6px; font-size: 11px; color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Fique sempre a par</p>
                    <p style="margin: 0 0 18px; font-size: 15px; color: #fff; font-weight: 800; line-height: 1.4;">
                        Siga-nos para nunca perder uma <span style="color: ${accentColor};">novidade</span> 🔥
                    </p>
                    <div style="margin-bottom: 18px;">
                        <a href="https://www.instagram.com/inscreva_se_events" style="display: inline-block; margin: 0 5px; background: #833ab4; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.youtube}" style="display: inline-block; margin: 0 5px; background: #ff0000; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.linkedin}" style="display: inline-block; margin: 0 5px; background: #0077b5; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.tiktok}" style="display: inline-block; margin: 0 5px; background: #111; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none; border: 1px solid #333;">
                            <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.whatsapp}" style="display: inline-block; margin: 0 5px; background: #25d366; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                    </div>
                    <a href="${socialLinks.community}" style="display: inline-block; background: #25d366; color: #fff; padding: 12px 26px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 12px; box-shadow: 0 4px 15px rgba(37,211,102,0.35);">
                        💬 Comunidade VIP WhatsApp
                    </a>
                </div>

                ${getSocialFooter()}
            </div>
        </div>
    `;
};
// ─────────────────────────────────────────────────────────────────────────────



// ─── MAINTENANCE / SCHEDULED DOWNTIME NOTICE ─────────────────────────────────
const generateMaintenanceNoticeEmail = (
    userName,
    maintenanceDate,
    maintenanceTime,
    estimatedDuration,
    affectedFeatures = [],
    statusPageUrl = 'https://inscreva-se.com'
) => {
    const accentColor = '#f59e0b'; // Amber — warning without alarm

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.08); border: 1px solid #f0f0f0;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1c1a10 0%, #2d2706 100%); padding: 45px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.06; background-image: radial-gradient(circle at 2px 2px, ${accentColor} 1px, transparent 0); background-size: 20px 20px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 65px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1; margin-bottom: 18px;">
                <div style="display: inline-block; background: ${accentColor}22; border: 1px solid ${accentColor}55; border-radius: 100px; padding: 6px 18px; margin-bottom: 16px; position: relative; z-index: 1;">
                    <span style="color: ${accentColor}; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">🔧 MANUTENÇÃO PROGRAMADA</span>
                </div>
                <h1 style="color: #ffffff; font-size: 23px; font-weight: 900; margin: 0; line-height: 1.3; position: relative; z-index: 1;">Interrupção temporária agendada</h1>
            </div>

            <!-- Body -->
            <div style="padding: 45px;">
                <div style="background: #fcfcfc; border-radius: 18px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor}; padding: 28px; margin-bottom: 28px;">
                    <p style="font-size: 19px; color: #111; margin: 0 0 12px; font-weight: 800;">Olá, ${userName}! 👋</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.8; margin: 0;">
                        Realizaremos uma manutenção programada para melhoria da plataforma. Durante esse período, alguns serviços poderão estar temporariamente indisponíveis. Pedimos desculpa pela inconveniência.
                    </p>
                </div>

                <!-- Date/Time Box -->
                <div style="display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 130px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 22px; text-align: center;">
                        <p style="margin: 0 0 6px; font-size: 11px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px;">📅 Data</p>
                        <p style="margin: 0; font-size: 18px; font-weight: 900; color: #111;">${maintenanceDate}</p>
                    </div>
                    <div style="flex: 1; min-width: 130px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 22px; text-align: center;">
                        <p style="margin: 0 0 6px; font-size: 11px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px;">🕐 Hora</p>
                        <p style="margin: 0; font-size: 18px; font-weight: 900; color: #111;">${maintenanceTime}</p>
                    </div>
                    <div style="flex: 1; min-width: 130px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 22px; text-align: center;">
                        <p style="margin: 0 0 6px; font-size: 11px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px;">⏱️ Duração</p>
                        <p style="margin: 0; font-size: 18px; font-weight: 900; color: #111;">${estimatedDuration}</p>
                    </div>
                </div>

                ${affectedFeatures.length > 0 ? `
                <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 16px; padding: 22px; margin-bottom: 28px;">
                    <p style="margin: 0 0 14px; font-size: 13px; font-weight: 900; color: #c2410c; text-transform: uppercase; letter-spacing: 1px;">⚠️ Áreas afetadas</p>
                    ${affectedFeatures.map(f => `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #fed7aa22;">
                        <span style="color: ${accentColor}; font-size: 16px; flex-shrink: 0;">•</span>
                        <p style="margin: 0; font-size: 14px; color: #7c3100;">${f}</p>
                    </div>`).join('')}
                </div>
                ` : ''}

                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${statusPageUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #b45309 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 8px 20px rgba(245,158,11,0.3); text-transform: uppercase; letter-spacing: 1px;">
                        🔍 Ver Estado do Sistema
                    </a>
                </div>

                <p style="font-size: 13px; color: #999; text-align: center; line-height: 1.7; font-style: italic;">
                    Obrigado pela sua compreensão. Estamos a trabalhar para tornar o Inscreva-se ainda melhor para si.
                </p>

                ${getSocialFooter()}
            </div>
        </div>
    `;
};
// ─────────────────────────────────────────────────────────────────────────────


// ─── PROMOTIONAL CAMPAIGN (discount / offer / upgrade) ───────────────────────
const generatePromotionalCampaignEmail = (
    userName,
    campaignTitle,
    campaignDescription,
    discountCode = null,
    discountValue = null,
    ctaUrl = 'https://inscreva-se.com/planos',
    ctaLabel = 'Aproveitar Agora',
    expiryDate = null
) => {
    const accentColor = '#D4AF37';

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">

            <!-- Animated Header Strip -->
            <div style="background: linear-gradient(90deg, #D4AF37, #f5d769, #D4AF37, #b8860b); background-size: 300% 100%; padding: 8px; text-align: center;">
                <p style="margin: 0; font-size: 12px; font-weight: 900; color: #000; text-transform: uppercase; letter-spacing: 3px;">✨ Oferta Especial para Si ✨</p>
            </div>

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #000000 0%, #1a1100 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.08; background-image: radial-gradient(circle at 2px 2px, ${accentColor} 1px, transparent 0); background-size: 22px 22px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 65px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1; margin-bottom: 18px;">
                ${discountValue ? `
                <div style="position: relative; z-index: 1; margin-bottom: 16px;">
                    <div style="display: inline-block; background: ${accentColor}; border-radius: 50%; width: 90px; height: 90px; line-height: 90px; box-shadow: 0 0 40px ${accentColor}88;">
                        <span style="color: #000; font-size: 22px; font-weight: 900; display: block; line-height: 90px;">${discountValue}</span>
                    </div>
                </div>
                ` : ''}
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; line-height: 1.3; position: relative; z-index: 1;">${campaignTitle}</h1>
                ${expiryDate ? `<p style="color: #888; font-size: 13px; margin: 10px 0 0; position: relative; z-index: 1;">⏰ Válido até ${expiryDate}</p>` : ''}
            </div>

            <!-- Body -->
            <div style="padding: 45px;">
                <div style="background: #fcfcfc; border-radius: 18px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor}; padding: 28px; margin-bottom: 28px;">
                    <p style="font-size: 19px; color: #111; margin: 0 0 12px; font-weight: 800;">Olá, ${userName}! 🎉</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.8; margin: 0;">${campaignDescription}</p>
                </div>

                ${discountCode ? `
                <!-- Discount Code Box -->
                <div style="background: linear-gradient(135deg, #fffdf0 0%, #fff9d6 100%); border: 2px dashed ${accentColor}; border-radius: 18px; padding: 28px; margin-bottom: 28px; text-align: center;">
                    <p style="margin: 0 0 10px; font-size: 12px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 2px;">🎁 O seu código exclusivo</p>
                    <p style="margin: 0 0 10px; font-size: 32px; font-weight: 900; color: #000; letter-spacing: 6px; font-family: 'Courier New', monospace;">${discountCode}</p>
                    <p style="margin: 0; font-size: 12px; color: #aaa;">Copie o código e aplique no checkout</p>
                </div>
                ` : ''}

                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${ctaUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 22px 55px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 12px 35px rgba(212,175,55,0.4); text-transform: uppercase; letter-spacing: 1px;">
                        ${ctaLabel} →
                    </a>
                    ${expiryDate ? `<p style="font-size: 12px; color: #e74c3c; margin-top: 14px; font-weight: 700;">⏰ Expira em ${expiryDate}. Não perca!</p>` : ''}
                </div>

                <!-- Social CTA -->
                <div style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border-radius: 20px; padding: 28px 25px; text-align: center; border: 1px solid #2a2a2a;">
                    <p style="margin: 0 0 6px; font-size: 11px; color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Partilhe com amigos</p>
                    <p style="margin: 0 0 18px; font-size: 15px; color: #fff; font-weight: 800; line-height: 1.4;">
                        Partilhe a novidade — os seus amigos vão <span style="color: ${accentColor};">agradecer</span> 🙌
                    </p>
                    <a href="${socialLinks.community}" style="display: inline-block; background: #25d366; color: #fff; padding: 12px 26px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 12px; box-shadow: 0 4px 15px rgba(37,211,102,0.35);">
                        💬 Partilhar na Comunidade VIP
                    </a>
                </div>

                ${getSocialFooter()}
            </div>
        </div>
    `;
};
// ─────────────────────────────────────────────────────────────────────────────


// ─── PLATFORM MILESTONE CELEBRATION (shared with all users) ──────────────────
const generateMilestoneEmail = (
    userName,
    milestoneTitle,
    milestoneDescription,
    milestoneNumber,
    milestoneUnit,
    ctaUrl = 'https://inscreva-se.com/dashboard',
    ctaLabel = 'Celebrar Connosco'
) => {
    const accentColor = '#D4AF37';

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #000 0%, #1a1200 60%, #0a0800 100%); padding: 55px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.08; background-image: radial-gradient(circle at 2px 2px, ${accentColor} 1px, transparent 0); background-size: 18px 18px;"></div>
                <!-- Glow -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 280px; height: 280px; background: radial-gradient(circle, ${accentColor}22 0%, transparent 70%);"></div>

                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 65px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1; margin-bottom: 22px;">

                <!-- Big Number -->
                <div style="position: relative; z-index: 1; margin-bottom: 12px;">
                    <span style="font-size: 72px; font-weight: 900; color: ${accentColor}; line-height: 1; display: block;">${milestoneNumber}</span>
                    <span style="font-size: 18px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 3px;">${milestoneUnit}</span>
                </div>

                <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 12px 0 0; line-height: 1.3; position: relative; z-index: 1;">${milestoneTitle}</h1>
            </div>

            <!-- Body -->
            <div style="padding: 45px;">
                <div style="background: #fcfcfc; border-radius: 18px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor}; padding: 28px; margin-bottom: 28px;">
                    <p style="font-size: 19px; color: #111; margin: 0 0 12px; font-weight: 800;">Olá, ${userName}! 🎊</p>
                    <p style="font-size: 15px; color: #555; line-height: 1.8; margin: 0;">${milestoneDescription}</p>
                </div>

                <!-- Thank You Card -->
                <div style="background: linear-gradient(135deg, #fffdf0, #fff8d0); border: 1px solid ${accentColor}44; border-radius: 18px; padding: 28px; margin-bottom: 28px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 28px;">🏆</p>
                    <p style="margin: 0 0 8px; font-size: 16px; font-weight: 900; color: #111;">Obrigado por fazer parte disto.</p>
                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.7;">Cada utilizador como você é a razão pela qual continuamos a inovar. Este marco é tão seu quanto nosso.</p>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${ctaUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 50px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 10px 30px rgba(212,175,55,0.35); text-transform: uppercase; letter-spacing: 1px;">
                        ${ctaLabel} 🎉
                    </a>
                </div>

                <!-- Social Share -->
                <div style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border-radius: 20px; padding: 28px 25px; text-align: center; border: 1px solid #2a2a2a;">
                    <p style="margin: 0 0 6px; font-size: 11px; color: #888; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Partilhe este momento</p>
                    <p style="margin: 0 0 18px; font-size: 15px; color: #fff; font-weight: 800; line-height: 1.4;">
                        Ajude-nos a <span style="color: ${accentColor};">espalhar a notícia</span> pelas redes 🌍
                    </p>
                    <div style="margin-bottom: 18px;">
                        <a href="https://www.instagram.com/inscreva_se_events" style="display: inline-block; margin: 0 5px; background: #833ab4; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.facebook}" style="display: inline-block; margin: 0 5px; background: #1877f2; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.linkedin}" style="display: inline-block; margin: 0 5px; background: #0077b5; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                        <a href="${socialLinks.whatsapp}" style="display: inline-block; margin: 0 5px; background: #25d366; border-radius: 50%; width: 40px; height: 40px; line-height: 40px; text-align: center; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style="width: 20px; height: 20px; vertical-align: middle; filter: brightness(0) invert(1);">
                        </a>
                    </div>
                    <a href="${socialLinks.community}" style="display: inline-block; background: #25d366; color: #fff; padding: 12px 26px; text-decoration: none; border-radius: 100px; font-weight: 900; font-size: 12px; box-shadow: 0 4px 15px rgba(37,211,102,0.35);">
                        💬 Comunidade VIP WhatsApp
                    </a>
                </div>

                ${getSocialFooter()}
            </div>
        </div>
    `;
};
// ─────────────────────────────────────────────────────────────────────────────


module.exports = {
    generateWelcomeEmail,
    generateBasicEmail,
    generatePendingApprovalEmail,
    generateReferralBonusEmail,
    generateReferralPointsEarnedEmail,
    generateSocialPointsEmail,
    generateAdminPointsNotificationEmail,
    generateSubscriptionConfirmationEmail,
    generateEventPaymentConfirmationEmail,
    generatePaymentProofReceivedEmail,
    generatePaymentFailedEmail,
    generatePaymentRejectedEmail,
    generateAdminAdNotificationEmail,
    generateAdStatusUpdateEmail,
    generateSignupIncentiveEmail,
    generateFeatureAnnouncementEmail,
    generateMaintenanceNoticeEmail,
    generatePromotionalCampaignEmail,
    generateMilestoneEmail,
    getSocialFooter,
    socialLinks
};
