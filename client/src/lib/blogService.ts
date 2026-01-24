import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: 'guide' | 'marketing' | 'mentoring' | 'engagement';
    coverImage: string;
    author: {
        name: string;
        avatar: string;
    };
    readTime: number;
    tags: string[];
    published: boolean;
    publishedAt?: string;
    likes?: string[];
    comments?: {
        user: {
            id: string;
            name: string;
            avatar: string;
        };
        text: string;
        createdAt: string;
    }[];
    views: number;
    createdAt: string;
    updatedAt: string;
}

export const blogService = {
    // Get all published posts (public)
    async getPublishedPosts(): Promise<BlogPost[]> {
        const response = await axios.get(`${API_URL}/blog`);
        return response.data;
    },

    // Get all posts including drafts (admin only)
    async getAllPosts(token: string): Promise<BlogPost[]> {
        const response = await axios.get(`${API_URL}/blog/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Get single post by slug
    async getPostBySlug(slug: string): Promise<BlogPost> {
        const response = await axios.get(`${API_URL}/blog/${slug}`);
        return response.data;
    },

    // Create new post (admin only)
    async createPost(token: string, postData: Partial<BlogPost>): Promise<BlogPost> {
        const response = await axios.post(`${API_URL}/blog`, postData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Update post (admin only)
    async updatePost(token: string, id: string, postData: Partial<BlogPost>): Promise<BlogPost> {
        const response = await axios.put(`${API_URL}/blog/${id}`, postData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Delete post (admin only)
    async deletePost(token: string, id: string): Promise<void> {
        await axios.delete(`${API_URL}/blog/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    // Upload image (admin only)
    async uploadImage(token: string, file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_URL}/blog/upload-image`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Like/Unlike a post
    async likePost(token: string, id: string): Promise<{ likes: string[] }> {
        const response = await axios.post(`${API_URL}/blog/${id}/like`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Add comment to a post
    async addComment(token: string, id: string, commentData: { text: string; userName?: string; userAvatar?: string }): Promise<any> {
        const response = await axios.post(`${API_URL}/blog/${id}/comment`, commentData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },
};
