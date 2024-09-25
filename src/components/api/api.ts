// src/services/authService.ts
import axios from 'axios';
import { BACKEND_ROOT_URL } from '../constants';

interface LoginPayload {
    identifier: string;
    password: string;
}

interface SignupPayload {
    username: string;
    email: string;
    password: string;
}

export interface Article {
    id: string;
    headline: string;
    link: string;
    website: string;
    created_at: string;
    upvote_count: number;
}

export interface PaginatedResponse {
    articles: Article[] | null;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export const login = async (payload: LoginPayload) => {
    const response = await axios.post(`${BACKEND_ROOT_URL}/users/login`, payload);
    return response.data;
};

export const signup = async (payload: SignupPayload) => {
    const response = await axios.post(`${BACKEND_ROOT_URL}/users/signup`, payload);
    return response.data;
};

export const fetchArticles = async (
    page: number,
    query: string,
    websiteFilter: string | null,
    setArticles: React.Dispatch<React.SetStateAction<Article[]>>,
    setTotalPages: React.Dispatch<React.SetStateAction<number>>,
    onLoadingChange: (isLoading: boolean) => void,
    onErrorChange: (error: string | null) => void
) => {
    onLoadingChange(true);
    try {
        let url = `${BACKEND_ROOT_URL}/articles?page=${page}&pageSize=20`;

        if (query) {
            url = `${url}&keyword=${query}`;
        }

        if (websiteFilter) {
            url = `${url}&website=${websiteFilter}`;
        }

        const response = await axios.get<PaginatedResponse>(url);

        const { articles, totalPages } = response.data;
        setArticles(articles || []);
        setTotalPages(totalPages || 0);
        onErrorChange(null);
    } catch (error) {
        onErrorChange(axios.isAxiosError(error) ? error.message : 'An unexpected error occurred');
    } finally {
        onLoadingChange(false);
    }
};

export const upvoteArticle = async (
    id: string,
) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/auth';
        return;
    }

    try {
        await axios.post(`${BACKEND_ROOT_URL}/articles/${id}/upvote`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Failed to upvote article:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
        }
    }
};

export const GetUserDetails = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return
    }

    try {
        const response = await axios.get(`${BACKEND_ROOT_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status == 200) {
            return response.data
        }
    } catch (error) {
        console.error('Failed to get user info:', error);
    }
}