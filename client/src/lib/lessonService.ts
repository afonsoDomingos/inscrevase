import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Lesson {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    category: 'basico' | 'intermediario' | 'avancado';
    isPublished: boolean;
    views: number;
    createdAt: string;
    order?: number;
    targetAudience?: 'mentors' | 'participants' | 'both';
    associatedEvents?: string[];
}

export const lessonService = {
    getManagedLessons: async () => {
        const token = Cookies.get('token');
        const response = await axios.get(`${API_URL}/lessons/manage/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getLessonsBySubmission: async (submissionId: string) => {
        const response = await axios.get(`${API_URL}/lessons/hub/${submissionId}`);
        return response.data;
    }
},

    getStudentProgress: async (submissionId: string) => {
        const token = Cookies.get('token');
        const response = await axios.get(`${API_URL}/lessons/submission/${submissionId}/progress`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
