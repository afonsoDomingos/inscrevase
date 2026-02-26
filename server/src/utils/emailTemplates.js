
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

const generateWelcomeEmail = (name, verificationLink = null) => {
    const isSocial = !verificationLink;
    const dashboardUrl = 'https://inscreva-se.com/dashboard';
    const accentColor = "#D4AF37";

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
            <!-- VIP Header -->
            <div style="background: linear-gradient(135deg, ${accentColor} 0%, #000000 100%); padding: 50px 20px; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto; filter: brightness(0) invert(1); position: relative; z-index: 1;">
                <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin-top: 20px; letter-spacing: 3px; text-transform: uppercase; position: relative; z-index: 1;">Bem-vindo ao <span style="color: ${accentColor};">Inscreva-se</span></h1>
            </div>

            <div style="padding: 45px;">
                <div style="background-color: #fcfcfc; padding: 35px; border-radius: 20px; border: 1px solid #f0f0f0; border-left: 5px solid ${accentColor};">
                    <p style="font-size: 20px; color: #111; margin-top: 0; font-weight: 800;">Olá, ${name}! 👋</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.7; margin-bottom: 25px;">
                        É um privilégio tê-lo connosco. A <strong>Inscreva-se</strong> é a plataforma definitiva para quem procura transformar conhecimento em escala através de um ecossistema premium e automatizado.
                    </p>

                    <div style="background: #ffffff; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #f5f5f5;">
                        <p style="margin: 0 0 15px 0; color: #111; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">O seu poder na plataforma:</p>
                        <ul style="padding: 0; margin: 0; list-style: none;">
                            <li style="margin-bottom: 12px; color: #555; font-size: 14px; display: flex; align-items: flex-start;">
                                <span style="color: ${accentColor}; margin-right: 12px; font-weight: bold;">💎</span> 
                                <span><strong>Crie Eventos de Elite:</strong> Do webinar ao presencial em minutos.</span>
                            </li>
                            <li style="margin-bottom: 12px; color: #555; font-size: 14px; display: flex; align-items: flex-start;">
                                <span style="color: ${accentColor}; margin-right: 12px; font-weight: bold;">💰</span> 
                                <span><strong>Fature sem Barreiras:</strong> Pagamentos globais e locais integrados.</span>
                            </li>
                            <li style="margin-bottom: 0; color: #555; font-size: 14px; display: flex; align-items: flex-start;">
                                <span style="color: ${accentColor}; margin-right: 12px; font-weight: bold;">⚡</span> 
                                <span><strong>IA Avançada:</strong> Otimizamos as suas conversões e gestão.</span>
                            </li>
                        </ul>
                    </div>

                    ${isSocial ? `
                        <p style="font-size: 15px; color: #666; line-height: 1.7;">
                            A sua conta está ativa e pronta para o próximo nível. O seu acesso via rede social foi configurado com sucesso.
                        </p>
                    ` : `
                        <p style="font-size: 15px; color: #666; line-height: 1.7;">
                            Para ativar o seu acesso completo e desbloquear todas as ferramentas de gestão, confirme o seu e-mail no botão abaixo:
                        </p>
                    `}
                    
                    <div style="text-align: center; margin: 40px 0 10px;">
                        <a href="${verificationLink || dashboardUrl}" style="background: linear-gradient(135deg, ${accentColor} 0%, #000 100%); color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3); text-transform: uppercase; letter-spacing: 1px;">
                            ${isSocial ? 'Aceder ao Meu Painel' : 'Confirmar O Meu E-mail'}
                        </a>
                    </div>
                    
                    ${!isSocial ? `
                    <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 30px; line-height: 1.6;">
                        Se o botão não responder, utilize o link abaixo directamante:<br>
                        <a href="${verificationLink}" style="color: ${accentColor}; text-decoration: none; word-break: break-all;">${verificationLink}</a>
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
    getSocialFooter,
    socialLinks
};
