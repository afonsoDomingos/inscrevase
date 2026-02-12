const { Resend } = require('resend');

const sendEmail = async (to, subject, html) => {
    try {
        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️ [EmailService] RESEND_API_KEY not found. Email skipped.');
            return false;
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'Inscreva-se <onboarding@resend.dev>', // Use your verified domain
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('🔴 [EmailService] Resend error:', error);
            return false;
        }

        console.log(`📧 [EmailService] Email sent via Resend: ${data.id}`);
        return true;
    } catch (error) {
        console.error('🔴 [EmailService] Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
