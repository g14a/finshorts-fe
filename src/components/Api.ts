import axios from 'axios';

export interface Article {
    id: string;
    headline: string;
    link: string;
    website: string;
    created_at: string;
}

export interface PaginatedResponse {
    articles: Article[] | null;
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

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
        let url = `https://bizbrief.in/api/articles?page=${page}&pageSize=20`;

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
