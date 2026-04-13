const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        // Option 1: Try Resend if API key is present
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: 'Inscreva-se <noreply@inscreva-se.com>',
                to: [to],
                subject: subject,
                html: html,
            });

            if (!error) {
                console.log(`📧 [EmailService] Email sent via Resend: ${data.id}`);
                return true;
            }
            console.warn('⚠️ [EmailService] Resend failed, trying fallback...');
        }

        // Option 2: Fallback to Nodemailer (Gmail) if credentials are present
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: `"Inscreva-se" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: html
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`📧 [EmailService] Email sent via Nodemailer (Gmail): ${info.messageId}`);
            return true;
        }

        console.warn('⚠️ [EmailService] No email provider configured (Resend or Gmail). Email skipped.');
        return false;
    } catch (error) {
        console.error('🔴 [EmailService] Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
