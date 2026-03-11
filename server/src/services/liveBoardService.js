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
                this.activeSessions.set(formId, {
                    history: [],
                    participants: new Map(),
                    pages: [{ history: [], backgroundImage: null }],
                    currentPage: 0
                });
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
                    mentorData: session.mentorData,
                    pages: session.pages,
                    currentPage: session.currentPage,
                    currentQuiz: session.currentQuiz ? {
                        ...session.currentQuiz,
                        votes: Array.from(session.currentQuiz.votes.entries()),
                        results: this.calculateQuizResults(session.currentQuiz)
                    } : null
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
                this.activeSessions.set(formId, {
                    history: [],
                    participants: new Map(),
                    pages: [{ history: [], backgroundImage: null }],
                    currentPage: 0
                });
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
            console.log(`[LiveBoard] Starting session for form: ${formId}`);

            let session = this.activeSessions.get(formId);
            if (!session) {
                session = {
                    history: [],
                    participants: new Map(),
                    pages: [{ history: [], backgroundImage: null }],
                    currentPage: 0
                };
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
                socket.to(`live_board_${formId}`).emit('live_board:draw', data);
            }
        });

        // History Replace Event (for moving shapes)
        socket.on('live_board:history_replace', ({ formId, history }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                session.history = history;
                socket.to(`live_board_${formId}`).emit('live_board:history_replace', history);
            }
        });

        // Laser Pointer Event (No history)
        socket.on('live_board:laser', ({ formId, x, y }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                socket.to(`live_board_${formId}`).emit('live_board:laser', { x, y });
            }
        });

        // Reaction Event (No history)
        socket.on('live_board:reaction', ({ formId, emoji, x, y }) => {
            this.io.to(`live_board_${formId}`).emit('live_board:reaction', { emoji, x, y, userId });
        });

        // Board Action (Undo, Clear)
        socket.on('live_board:action', ({ formId, action }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                if (action === 'clear') {
                    session.history = [];
                } else if (action === 'undo') {
                    if (session.history.length > 0) {
                        const lastItem = session.history[session.history.length - 1];
                        if (lastItem.strokeId) {
                            while (session.history.length > 0 && session.history[session.history.length - 1].strokeId === lastItem.strokeId) {
                                session.history.pop();
                            }
                        } else {
                            session.history.pop();
                        }
                    }
                }
                socket.to(`live_board_${formId}`).emit('live_board:action', action);
            }
        });

        // Raise Hand (Participant)
        socket.on('live_board:raise_hand', ({ formId, userData }) => {
            const session = this.activeSessions.get(formId);
            if (session) {
                this.io.to(session.mentorId.toString()).emit('live_board:hand_raised', {
                    userId,
                    userData,
                    timestamp: new Date()
                });
                this.io.to(`live_board_${formId}`).emit('live_board:hand_raised_broadcast', {
                    userId,
                    name: userData.name
                });
            }
        });

        // Chat Message (Questions)
        socket.on('live_board:message', ({ formId, message, userData }) => {
            this.io.to(`live_board_${formId}`).emit('live_board:message', {
                userId,
                userData,
                message,
                timestamp: new Date()
            });
        });

        // Page Change & Backgrounds
        socket.on('live_board:page_change', ({ formId, index, pages }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                session.currentPage = index;
                session.pages = pages;
                socket.to(`live_board_${formId}`).emit('live_board:page_change', { index, pages });
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

        // Quiz Events
        socket.on('live_board:quiz_start', ({ formId, quiz }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                session.currentQuiz = {
                    ...quiz,
                    id: Math.random().toString(36).substring(7),
                    votes: new Map(),
                    isRevealed: false
                };
                this.io.to(`live_board_${formId}`).emit('live_board:quiz_start', session.currentQuiz);
            }
        });

        socket.on('live_board:quiz_vote', ({ formId, optionIndex }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.currentQuiz) {
                session.currentQuiz.votes.set(userId, optionIndex);
                this.io.to(`live_board_${formId}`).emit('live_board:quiz_results', {
                    results: this.calculateQuizResults(session.currentQuiz),
                    totalVotes: session.currentQuiz.votes.size
                });
            }
        });

        socket.on('live_board:quiz_reveal', (formId) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId && session.currentQuiz) {
                session.currentQuiz.isRevealed = true;
                this.io.to(`live_board_${formId}`).emit('live_board:quiz_reveal', {
                    correctOption: session.currentQuiz.correctOption
                });
            }
        });

        socket.on('live_board:quiz_end', (formId) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
                delete session.currentQuiz;
                this.io.to(`live_board_${formId}`).emit('live_board:quiz_end');
            }
        });

        // Binary Audio Stream (Fallback/Simple)
        socket.on('live_board:audio_stream', ({ formId, data }) => {
            const session = this.activeSessions.get(formId);
            if (session && session.mentorId === userId) {
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

    static calculateQuizResults(quiz) {
        if (!quiz || !quiz.options) return [];
        const results = quiz.options.map(() => 0);
        quiz.votes.forEach((optionIndex) => {
            if (results[optionIndex] !== undefined) {
                results[optionIndex]++;
            }
        });
        return results;
    }
}

module.exports = LiveBoardService;
