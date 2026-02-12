
const generateWelcomeEmail = (name, verificationLink = null) => {
    const isSocial = !verificationLink;
    const dashboardUrl = 'https://inscreva-se.com/dashboard';

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <!-- Header Image -->
            <div style="width: 100%; height: auto;">
                <img src="https://inscreva-se.com/welcome.png" alt="Bem-vindo ao Inscreva-se" style="width: 100%; height: auto; display: block;">
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
                
                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
                    <p style="font-size: 12px; color: #999; margin-bottom: 5px;">Seja bem-vindo à elite da mentoria digital.</p>
                    <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Inscreva-se. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    `;
};

module.exports = { generateWelcomeEmail };
