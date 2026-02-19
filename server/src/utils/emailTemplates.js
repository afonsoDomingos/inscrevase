
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
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
            <p style="font-size: 14px; color: #333; font-weight: 700; margin-bottom: 15px;">Siga-nos nas redes sociais:</p>
            <div style="margin-bottom: 20px;">
                <a href="${socialLinks.facebook}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; height: 24px;">
                </a>
                <a href="${socialLinks.youtube}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="width: 24px; height: 24px;">
                </a>
                <a href="${socialLinks.linkedin}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 24px; height: 24px;">
                </a>
                <a href="${socialLinks.tiktok}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" style="width: 24px; height: 24px;">
                </a>
                <a href="${socialLinks.whatsapp}" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style="width: 24px; height: 24px;">
                </a>
            </div>
            <p style="margin-bottom: 15px;">
                <a href="${socialLinks.community}" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 13px; display: inline-block;">
                   💎 Entrar na Comunidade
                </a>
            </p>
            <p style="font-size: 12px; color: #999; margin-bottom: 5px;">&copy; ${new Date().getFullYear()} Inscreva-se. Todos os direitos reservados.</p>
        </div>
    `;
};

const generateWelcomeEmail = (name, verificationLink = null) => {
    const isSocial = !verificationLink;
    const dashboardUrl = 'https://inscreva-se.com/dashboard';

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="width: 100%; height: auto;">
                <img src="https://inscreva-se.com/Welcome.gif" alt="Bem-vindo ao Inscreva-se" style="width: 100%; height: auto; display: block;">
            </div>

            <div style="padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto;">
                    <h1 style="color: #000; font-size: 24px; font-weight: 800; margin-top: 15px; letter-spacing: 2px;">INSCREVA<span style="color: #D4AF37;">-SE</span></h1>
                </div>
                
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #D4AF37;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Olá, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6; font-weight: 600;">
                        O que é a Inscreva-se?
                    </p>
                    <p style="font-size: 15px; color: #666; line-height: 1.6;">
                        Somos a plataforma definitiva para mentores, especialistas e empresas que buscam transformar conhecimento em escala. Centralizamos suas inscrições, pagamentos e gestão de alunos em um único ambiente premium e automatizado.
                    </p>

                    ${isSocial ? `
                        <p style="font-size: 16px; color: #555; line-height: 1.6;">
                            Sua conta foi criada com sucesso via rede social e você já está pronto para começar.
                        </p>
                    ` : `
                        <p style="font-size: 16px; color: #555; line-height: 1.6;">
                            Para ativar sua conta e desbloquear todas as funcionalidades, clique no botão abaixo para confirmar seu e-mail:
                        </p>
                    `}
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationLink || dashboardUrl}" style="background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            ${isSocial ? 'Acessar Meu Painel' : 'Confirmar E-mail'}
                        </a>
                    </div>
                    
                    ${!isSocial ? `
                    <p style="font-size: 14px; color: #888; text-align: center; margin-top: 25px;">
                        Se o botão não funcionar, copie e cole este link no seu navegador:
                        <br>
                        <a href="${verificationLink}" style="color: #D4AF37; text-decoration: none; word-break: break-all;">${verificationLink}</a>
                    </p>
                    ` : ''}
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateBasicEmail = (title, name, content, buttonText, buttonUrl, color = "#D4AF37") => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 100px; height: auto;">
                <h1 style="color: #000; font-size: 24px; font-weight: 800; margin-top: 15px; letter-spacing: 2px;">INSCREVA<span style="color: ${color};">-SE</span></h1>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid ${color};">
                <h2 style="color: ${color}; margin-top: 0;">${title}</h2>
                <p style="font-size: 18px; color: #333;">Olá <strong>${name}</strong>,</p>
                <div style="font-size: 16px; color: #555; line-height: 1.6;">
                    ${content}
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${buttonUrl}" style="background: linear-gradient(135deg, ${color} 0%, #000 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px;">
                        ${buttonText}
                    </a>
                </div>
            </div>
            
            ${getSocialFooter()}
        </div>
    `;
};

const generatePendingApprovalEmail = (mentorName, participantName, eventTitle, dashboardUrl) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #000000 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Aprovação Pendente ⏳</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #D4AF37;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Olá, <strong>${mentorName}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Você tem uma nova inscrição aguardando sua análise para o evento: <br>
                        <strong style="color: #000; font-size: 18px;">${eventTitle}</strong>
                    </p>

                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #eee;">
                        <p style="margin: 5px 0; color: #666;"><strong>Participante:</strong> <span style="color: #333;">${participantName}</span></p>
                        <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: #D4AF37; font-weight: bold;">Aguardando Aprovação</span></p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.6;">
                        O sucesso do seu evento começa com uma gestão ágil! Recomendamos que valide esta inscrição o quanto antes para garantir a melhor experiência ao seu novo aluno.
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Acessar Painel e Aprovar
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #888; text-align: center;">
                        Ao aprovar, o participante receberá automaticamente o acesso ao Hub do Evento.
                    </p>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateReferralBonusEmail = (name, referrerName, points, dashboardUrl) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #000000 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Bónus de Boas-vindas! 🎁</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #D4AF37;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Parabéns, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Vimos que você se juntou à nossa elite através do convite de <strong>${referrerName}</strong>. 
                        Como presente de boas-vindas, acabamos de creditar na sua conta:
                    </p>

                    <div style="text-align: center; margin: 25px 0;">
                        <span style="font-size: 48px; font-weight: 900; color: #D4AF37;">+${points}</span>
                        <p style="font-size: 14px; color: #666; font-weight: bold; text-transform: uppercase; margin-top: 5px;">Pontos de Impacto</p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.6;">
                        Use seus pontos para desbloquear planos premium, recursos exclusivos e aumentar seu alcance. Sua jornada para o sucesso começou com o pé direito!
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
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
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #000000 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Nova Conquista de Impacto! 🚀</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #D4AF37;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Parabéns, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Seu impacto na comunidade continua a crescer! Recebemos uma nova indicação através do seu convite: <strong>${referredName}</strong> acaba de se juntar a nós.
                    </p>

                    <div style="text-align: center; margin: 25px 0;">
                        <span style="font-size: 48px; font-weight: 900; color: #D4AF37;">+${points}</span>
                        <p style="font-size: 14px; color: #666; font-weight: bold; text-transform: uppercase; margin-top: 5px;">Pontos Adicionados</p>
                    </div>

                    <p style="font-size: 16px; color: #333; text-align: center; font-weight: 700;">
                        Balanço Atual: <span style="color: #D4AF37;">${totalPoints} Pontos</span>
                    </p>

                    <p style="font-size: 15px; color: #666; line-height: 1.6; margin-top: 20px;">
                        Continue a partilhar o seu link e a transformar vidas. Cada indicação aproxima-o de novos níveis de influência e recompensas exclusivas na nossa plataforma. Estamos muito orgulhosos do seu percurso!
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
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
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #000000 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Missão Cumprida! 🎯</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #10b981;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Excelente trabalho, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Você completou com sucesso a missão: <strong>${missionName}</strong>. Sua dedicação é inspiradora!
                    </p>

                    <div style="text-align: center; margin: 25px 0;">
                        <span style="font-size: 48px; font-weight: 900; color: #10b981;">+${points}</span>
                        <p style="font-size: 14px; color: #666; font-weight: bold; text-transform: uppercase; margin-top: 5px;">Pontos Conquistados</p>
                    </div>

                    <p style="font-size: 16px; color: #333; text-align: center; font-weight: 700;">
                        Novo Saldo: <span style="color: #10b981;">${totalPoints} Pontos</span>
                    </p>

                    <p style="font-size: 15px; color: #666; line-height: 1.6; margin-top: 20px;">
                        Continue a participar nas nossas iniciativas. Cada ponto acumula para o seu crescimento pessoal e profissional dentro da Inscreva.se. Mantenha esse foco!
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Ir para o Ranking
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateSubscriptionConfirmationEmail = (name, planName, dashboardUrl) => {
    const isEnterprise = planName.toLowerCase() === 'enterprise';
    const accentColor = isEnterprise ? "#000000" : "#D4AF37";
    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Pagamento Confirmado! 💎</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #D4AF37;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Incrível, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Seu pagamento foi processado com sucesso e sua conta acaba de ser elevada ao status de elite. Bem-vindo ao plano: 
                        <br>
                        <strong style="color: #D4AF37; font-size: 20px;">Inscreva-se ${planLabel}</strong>
                    </p>

                    <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
                        <p style="margin: 0 0 15px 0; color: #666; font-weight: bold; font-size: 13px; text-transform: uppercase;">O que muda para você agora:</p>
                        <ul style="padding: 0; margin: 0; list-style: none;">
                            <li style="margin-bottom: 10px; color: #444; font-size: 14px; display: flex; align-items: center;">
                                <span style="color: #25D366; margin-right: 10px;">✓</span> Taxas reduzidas em todas as suas vendas.
                            </li>
                            <li style="margin-bottom: 10px; color: #444; font-size: 14px; display: flex; align-items: center;">
                                <span style="color: #25D366; margin-right: 10px;">✓</span> Criação ilimitada de eventos e formulários.
                            </li>
                            <li style="margin-bottom: 10px; color: #444; font-size: 14px; display: flex; align-items: center;">
                                <span style="color: #25D366; margin-right: 10px;">✓</span> Acesso completo a ferramentas de gestão e automação.
                            </li>
                        </ul>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.6;">
                        Estamos animados por fazer parte da sua jornada de crescimento. Seu painel já está configurado com todos os novos recursos.
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Explorar Novos Recursos
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
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #000000 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Comprovante Recebido 📦</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #D4AF37;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Olá, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Recebemos o seu comprovante de pagamento para o plano <strong>Inscreva-se ${planLabel}</strong>. 
                    </p>

                    <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee; text-align: center;">
                        <p style="margin: 0; color: #666; font-size: 15px;">
                            Nossa equipe financeira já está validando a transação. O prazo de processamento é de até <strong>24 horas úteis</strong>.
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.6;">
                        Assim que for confirmado, você receberá um novo e-mail e sua conta será atualizada automaticamente. Fique atento à sua caixa de entrada!
                    </p>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generatePaymentFailedEmail = (name, planName, dashboardUrl) => {
    const planLabel = planName.charAt(0).toUpperCase() + planName.slice(1);
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Ops! Houve um problema ⚠️</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #ff4b2b;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Olá, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Infelizmente, não conseguimos processar o pagamento para a sua assinatura do plano <strong>Inscreva-se ${planLabel}</strong>.
                    </p>

                    <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
                        <p style="margin: 0; color: #666; font-size: 15px;">
                            Não se preocupe, seus dados estão seguros. Isso pode ter acontecido por diversos motivos (limite do cartão, Expiração ou bloqueio de segurança do banco).
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.6;">
                        Recomendamos que você tente novamente ou utilize um método de pagamento diferente para não perder o acesso aos recursos premium.
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%); color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(255, 75, 43, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            Tentar Novamente
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
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">Pagamento Rejeitado ❌</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #000000;">
                    <p style="font-size: 18px; color: #333; margin-top: 0;">Olá, <strong>${name}</strong>!</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        O seu comprovante de pagamento para o plano <strong>Inscreva-se ${planLabel}</strong> foi analisado e, infelizmente, não pôde ser validado pela nossa equipa financeira.
                    </p>

                    <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
                        <p style="margin: 0; color: #666; font-size: 15px;">
                            Por favor, verifique se o valor transferido está correto ou se o comprovante enviado está legível e completo.
                        </p>
                    </div>

                    <p style="font-size: 15px; color: #666; line-height: 1.6;">
                        Você pode submeter um novo comprovante ou entrar em contacto com o nosso suporte para resolver esta situação.
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: #000000; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(0,0,0,0.2); text-transform: uppercase; letter-spacing: 1px;">
                            Ir para o Suporte
                        </a>
                    </div>
                </div>
                
                ${getSocialFooter()}
            </div>
        </div>
    `;
};

const generateAdminPointsNotificationEmail = (userName, userEmail, points, reason) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 100px; height: auto;">
                <h1 style="color: #000; font-size: 24px; font-weight: 800; margin-top: 15px; letter-spacing: 2px;">NOTIFICAÇÃO <span style="color: #D4AF37;">ADMIN</span></h1>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #000;">
                <h2 style="color: #333; margin-top: 0;">Pontos Atribuídos 💎</h2>
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                    Olá Admin, informamos que foram atribuídos pontos a um usuário:
                </p>
                
                <div style="background-color: #ffffff; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
                    <p style="margin: 5px 0; color: #666;"><strong>Usuário:</strong> <span style="color: #000; font-weight: bold;">${userName}</span> (${userEmail})</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Pontos:</strong> <span style="color: #D4AF37; font-weight: 900;">+${points}</span></p>
                    <p style="margin: 5px 0; color: #666;"><strong>Motivo:</strong> <span style="color: #333;">${reason}</span></p>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    Esta notificação é automática para fins de monitoramento e auditoria do sistema de recompensas. No dashboard administrativo, pode rever o histórico completo de convites e missões deste usuário.
                </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
                <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Inscreva-se Admin Panel.</p>
            </div>
        </div>
    `;
};

const generateAdminAdNotificationEmail = (advertiserName, advertiserEmail, adTitle, adCategory, duration, investment, currency, paymentMethod, dashboardUrl) => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 20px; text-align: center;">
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1);">
                <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 15px; letter-spacing: 2px; text-transform: uppercase;">🚀 Novo Anúncio Recebido</h1>
            </div>

            <div style="padding: 40px;">
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 15px; border-left: 4px solid #D4AF37;">
                    <p style="font-size: 16px; color: #333; margin-top: 0;">Olá Admin,</p>
                    
                    <p style="font-size: 15px; color: #555; line-height: 1.6;">
                        Um novo pedido de publicidade foi submetido na plataforma e aguarda a sua revisão.
                    </p>

                    <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #eee;">
                        <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Anunciante:</strong> <span style="color: #000;">${advertiserName} (${advertiserEmail})</span></p>
                        <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Título:</strong> <span style="color: #000; font-weight: bold;">${adTitle}</span></p>
                        <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Categoria:</strong> <span style="color: #000;">${adCategory.toUpperCase()}</span></p>
                        <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Duração:</strong> <span style="color: #000;">${duration} Semanas</span></p>
                        <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Investimento:</strong> <span style="color: #22c55e; font-weight: 800;">${investment} ${currency}</span></p>
                        <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>Pagamento:</strong> <span style="color: #3b82f6; font-weight: 800; text-transform: uppercase;">${paymentMethod}</span></p>
                    </div>

                    <p style="font-size: 14px; color: #666; line-height: 1.6;">
                        Por favor, aceda ao painel administrativo para validar o conteúdo da mídia e o status do pagamento antes de publicar.
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${dashboardUrl}" style="background: #000; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 10px 20px rgba(0,0,0,0.1); text-transform: uppercase; letter-spacing: 1px;">
                            Rever no Painel Admin
                        </a>
                    </div>
                </div>
                
                <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
                    <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Inscreva-se Admin Notifications.</p>
                </div>
            </div>
        </div>
    `;
};

module.exports = {
    generateWelcomeEmail,
    generateBasicEmail,
    generatePendingApprovalEmail,
    generateReferralBonusEmail,
    generateReferralPointsEarnedEmail,
    generateSocialPointsEmail,
    generateAdminPointsNotificationEmail,
    generateSubscriptionConfirmationEmail,
    generatePaymentProofReceivedEmail,
    generatePaymentFailedEmail,
    generatePaymentRejectedEmail,
    generateAdminAdNotificationEmail,
    getSocialFooter,
    socialLinks
};
