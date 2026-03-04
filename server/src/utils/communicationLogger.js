const CommunicationLog = require('../models/CommunicationLog');

/**
 * Utility to log automated communications in the history
 * @param {Object} params 
 * @param {string} params.senderId - ID of the sender (usually an admin)
 * @param {Array<string>} [params.recipientIds] - List of recipient User IDs
 * @param {Array<string>} params.recipientEmails - List of recipient email addresses
 * @param {string} params.subject - Email subject
 * @param {string} params.content - Email content / body preview
 * @param {string} [params.type='email'] - Type of communication
 * @param {string} [params.status='sent'] - Status of the communication
 */
const logCommunication = async ({ senderId, recipientIds, recipientEmails, subject, content, type = 'email', status = 'sent' }) => {
    try {
        if (!senderId) {
            // If No sender (System automation), find a default Admin or just use a placeholder
            // This is a business decision - usually, these should be linked to an admin ID for the UI
            // to show it in the history fetched by `adminOnly` routes.
            // Let's assume we can pass null and update the UI/models if needed.
            // But CommunicationLog requires a sender.
        }

        await CommunicationLog.create({
            sender: senderId,
            recipients: recipientIds || [],
            recipientEmails: recipientEmails || [],
            subject,
            content: content || '',
            type,
            status,
            sentAt: new Date()
        });
    } catch (err) {
        console.error('❌ [CommunicationLogger] Failed to create log:', err.message);
    }
};

module.exports = { logCommunication };
