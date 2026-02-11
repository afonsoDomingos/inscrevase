const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️ [EmailService] Credentials not found. Email skipped.');
            return false;
        }

        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const info = await transporter.sendMail({
            from: `"Inscreva-se" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(`📧 [EmailService] Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('🔴 [EmailService] Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
