
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
                    <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 60px; height: auto;">
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
                <img src="https://inscreva-se.com/logo.png" alt="Inscreva-se" style="width: 80px; height: auto;">
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

module.exports = {
    generateWelcomeEmail,
    generateBasicEmail,
    getSocialFooter,
    socialLinks
};
