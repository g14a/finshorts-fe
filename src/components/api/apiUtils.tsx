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
    user_upvoted: boolean;
    user_saved: boolean
}

export interface PaginatedResponse {
    articles: Article[] | null;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export const getDomainName = (url: string) => {
    const hostname = new URL(url).hostname;
    return (hostname.startsWith('www.') ? hostname.slice(4) : hostname).split('.')[0];
};

export const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}\b(?:\/[^\s]*)?)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        const url = match[0];
        const href = url.startsWith('http') ? url : 
                    url.startsWith('www.') ? `https://${url}` : 
                    `https://${url}`;
        
        parts.push(
            <a
                key={match.index}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
            >
                {url}
            </a>
        );

        lastIndex = match.index + url.length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
};

export const login = async (payload: LoginPayload) => {
    const response = await axios.post(`${BACKEND_ROOT_URL}/users/login`, payload);
    return response.data;
};

export const signup = async (payload: SignupPayload) => {
    const response = await axios.post(`${BACKEND_ROOT_URL}/users/signup`, payload);
    return response.data;
};

export const FetchArticles = async (
    page: number,
    query: string,
    websiteFilter: string | null,
    setArticles: React.Dispatch<React.SetStateAction<Article[]>>,
    setTotalPages: React.Dispatch<React.SetStateAction<number>>,
    onLoadingChange: (isLoading: boolean) => void,
    onErrorChange: (error: string | null) => void
) => {
    onLoadingChange(true);
    const token = localStorage.getItem('authToken');

    var headers

    if (token) {
        headers = {
            Authorization: `Bearer ${token}`
        }
    }

    try {
        let url = `${BACKEND_ROOT_URL}/articles?page=${page}&pageSize=20`;

        if (query) {
            url = `${url}&keyword=${query}`;
        }

        if (websiteFilter) {
            url = `${url}&website=${websiteFilter}`;
        }

        const response = await axios.get<PaginatedResponse>(url, {
            headers
        });

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

export const GetArticleById = async (articleId: string | undefined) => {
    try {
        if (articleId) {
            const response = await axios.get(`${BACKEND_ROOT_URL}/articles/${articleId}`);

            if (response.status == 200) {
                return response.data
            }
        }
    } catch (error) {
        console.error('Failed to get article info:', error);
    }
}

export const GetArticleComments = async (articleId: string | undefined) => {
    try {
        if (articleId) {
            const response = await axios.get(`${BACKEND_ROOT_URL}/articles/${articleId}/comments`);

            if (response.status == 200) {
                return response.data
            }
        }
    } catch (error) {
        console.error('Failed to get Article comments:', error);
    }
}

export const CommentOnArticle = async (articleId: string, data: any) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/auth';
        return;
    }

    try {
        const response = await axios.post(`${BACKEND_ROOT_URL}/articles/${articleId}/comment`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status == 200) {
            return response.data
        }
    } catch (error) {
        console.error('Failed to get Article comments:', error);
    }
}

export const EditCommentOnArticle = async (articleId: string, commentId: string, data: any) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/auth';
        return;
    }

    try {
        const response = await axios.put(`${BACKEND_ROOT_URL}/articles/${articleId}/comment/${commentId}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status == 200) {
            return response.data
        }
    } catch (error) {
        console.error('Failed to get Article comments:', error);
    }
}

export const SaveArticle = async (articleId: string) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/auth';
        return;
    }
    
    try {
        const response = await axios.post(`${BACKEND_ROOT_URL}/articles/${articleId}/save`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status == 200) {
            return response.data
        }
    } catch (error) {
        console.error('Failed to get Article comments:', error);
    }
}

export const GetSavedArticles = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/auth';
        return;
    }

    try {
        const response = await axios.get(`${BACKEND_ROOT_URL}/user/saved`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status == 200) {
            return response.data
        }
    } catch (error) {
        console.error('Failed to get Article comments:', error);
    }
}
