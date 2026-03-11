/**
 * Service to handle Live Board real-time logic
 */
class LiveBoardService {
    static io = null;
    static activeSessions = new Map(); // formId -> sessionData { mentorId, startTime, history: [] }

    static init(io) {
        this.io = io;
        console.log('[LiveBoardService] Initialized with Socket.io');
    }

    static handleSocket(socket) {
        const userId = socket.userId;

        // Join Live Board Room
        socket.on('live_board:join', (formId) => {
            socket.join(`live_board_${formId}`);
            console.log(`[LiveBoard] User ${userId} joined room: live_board_${formId}`);

            // If session is active, send status and current board state
            if (this.activeSessions.has(formId)) {
                const session = this.activeSessions.get(formId);
                socket.emit('live_board:status', {
                    active: true,
                    mentorId: session.mentorId,
                    mentorData: session.mentorData
                });
                socket.emit('live_board:history', session.history);
            }
        });

        // Start Live Board (Mentor Only)
        socket.on('live_board:start', ({ formId, mentorData }) => {
            // In a real app, we'd verify if the user IS the creator of the form here
            // For now we assume the frontend only shows the button to the mentor
            const session = {
                mentorId: userId,
                mentorData: mentorData,
                startTime: new Date(),
                history: []
            };
            this.activeSessions.set(formId, session);

            this.io.to(`live_board_${formId}`).emit('live_board:status', {
                active: true,
                mentorId: userId,
                mentorData: mentorData
            });
            console.log(`[LiveBoard] Session started for form ${formId} by user ${userId}`);
        });

        // End Live Board (Mentor Only)
        socket.on('live_board:end', (formId) => {
            if (this.activeSessions.has(formId)) {
                this.activeSessions.delete(formId);
                this.io.to(`live_board_${formId}`).emit('live_board:status', { active: false });
                console.log(`[LiveBoard] Session ended for form ${formId}`);
            }
        });

        // Drawing Event
        socket.on('live_board:draw', ({ formId, data }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                session.history.push(data);
                // Broadcast to all participants in the room except sender
                socket.to(`live_board_${formId}`).emit('live_board:draw', data);
            }
        });

        // Board Action (Undo, Clear)
        socket.on('live_board:action', ({ formId, action }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                if (action === 'clear') {
                    session.history = [];
                } else if (action === 'undo') {
                    session.history.pop();
                }
                socket.to(`live_board_${formId}`).emit('live_board:action', action);
            }
        });

        // Raise Hand (Participant)
        socket.on('live_board:raise_hand', ({ formId, userData }) => {
            const session = this.activeSessions.get(formId);
            if (session) {
                // Send notification to the mentor's private room or specific board event
                this.io.to(session.mentorId.toString()).emit('live_board:hand_raised', {
                    userId,
                    userData,
                    timestamp: new Date()
                });
                // Also broadcast to the board room so others might see (optional)
                this.io.to(`live_board_${formId}`).emit('live_board:hand_raised_broadcast', {
                    userId,
                    name: userData.name
                });
            }
        });

        // Audio Signaling (WebRTC)
        socket.on('live_board:audio_signal', ({ formId, signal, targetId }) => {
            if (targetId) {
                this.io.to(targetId.toString()).emit('live_board:audio_signal', { signal, from: userId });
            } else {
                socket.to(`live_board_${formId}`).emit('live_board:audio_signal', { signal, from: userId });
            }
        });

        // Binary Audio Stream (Fallback/Simple)
        socket.on('live_board:audio_stream', ({ formId, data }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                // Broadcast binary data to participants
                socket.to(`live_board_${formId}`).emit('live_board:audio_data', data);
            }
        });
    }
}

module.exports = LiveBoardService;
