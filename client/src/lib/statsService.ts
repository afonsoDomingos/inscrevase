const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Service to fetch real-time platform statistics
export const statsService = {
    async getPlatformStats() {
        try {
            const response = await fetch(`${API_URL}/stats/platform`);
            if (!response.ok) {
                // Return fallback stats if API fails
                return {
                    totalEvents: 150,
                    totalParticipants: 2500,
                    totalMentors: 45,
                    averageRating: 4.8
                };
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching platform stats:', error);
            // Return default stats
            return {
                totalEvents: 150,
                totalParticipants: 2500,
                totalMentors: 45,
                averageRating: 4.8
            };
        }
    }
};
