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
        socket.on('live_board:join', async (formId) => {
            socket.join(`live_board_${formId}`);

            // Try to get user data from User model if not in socket
            let userData = socket.userData;
            if (!userData && userId) {
                try {
                    const User = require('../models/User');
                    const user = await User.findById(userId).select('name profilePhoto role');
                    if (user) {
                        userData = {
                            id: userId,
                            name: user.name,
                            photo: user.profilePhoto,
                            role: user.role
                        };
                    }
                } catch (err) {
                    console.error('[LiveBoard] Error fetching user for presence:', err);
                }
            }

            console.log(`[LiveBoard] User ${userData?.name || userId} joined room: live_board_${formId}`);

            if (!this.activeSessions.has(formId)) {
                this.activeSessions.set(formId, { history: [], participants: new Map() });
            }

            const session = this.activeSessions.get(formId);

            if (userData) {
                session.participants.set(userId.toString(), {
                    ...userData,
                    isMentor: session.mentorId === userId
                });

                // Broadcast updated list
                this.io.to(`live_board_${formId}`).emit('live_board:participants', Array.from(session.participants.values()));
            }

            // If session is active, send status and current board state
            if (session.mentorId) {
                socket.emit('live_board:status', {
                    active: true,
                    mentorId: session.mentorId,
                    mentorData: session.mentorData
                });
                socket.emit('live_board:history', session.history);
            } else if (session.countdown) {
                // If countdown is active, send remaining time
                const elapsedSeconds = Math.floor((new Date() - new Date(session.countdown.startTime)) / 1000);
                const timeLeft = Math.max(0, session.countdown.duration - elapsedSeconds);
                if (timeLeft > 0) {
                    socket.emit('live_board:countdown', {
                        ...session.countdown,
                        duration: timeLeft
                    });
                }
            }
        });

        // Start Countdown (Mentor Only)
        socket.on('live_board:countdown', ({ formId, duration, mentorData }) => {
            console.log(`[LiveBoard] Countdown started for form ${formId}: ${duration}s`);

            if (!this.activeSessions.has(formId)) {
                this.activeSessions.set(formId, { history: [], participants: new Map() });
            }
            const session = this.activeSessions.get(formId);

            session.countdown = {
                duration,
                mentorData,
                startTime: new Date()
            };

            this.io.to(`live_board_${formId}`).emit('live_board:countdown', session.countdown);
        });

        // Start Live Board (Mentor Only)
        socket.on('live_board:start', ({ formId, mentorData }) => {
            // In a real app, we'd verify if the user IS the creator of the form here
            // For now we assume the frontend only shows the button to the mentor
            console.log(`[LiveBoard] Starting session for form: ${formId}`);

            let session = this.activeSessions.get(formId);
            if (!session) {
                session = { history: [], participants: new Map() };
                this.activeSessions.set(formId, session);
            }

            session.mentorId = userId;
            session.mentorData = mentorData;
            session.startTime = new Date();
            delete session.countdown;

            // Update participant list to highlight mentor
            if (session.participants && session.participants.has(userId.toString())) {
                const p = session.participants.get(userId.toString());
                p.isMentor = true;
                this.io.to(`live_board_${formId}`).emit('live_board:participants', Array.from(session.participants.values()));
            }

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

        // Handle disconnect for presence
        socket.on('disconnecting', () => {
            for (const room of socket.rooms) {
                if (room.startsWith('live_board_')) {
                    const formId = room.replace('live_board_', '');
                    const session = this.activeSessions.get(formId);
                    if (session && session.participants) {
                        session.participants.delete(userId.toString());
                        this.io.to(room).emit('live_board:participants', Array.from(session.participants.values()));
                    }
                }
            }
        });
    }
}

module.exports = LiveBoardService;
