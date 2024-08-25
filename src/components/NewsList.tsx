import React, { useEffect, useState } from 'react';
import './NewsList.css';
import axios from 'axios';

export interface Article {
  id: string;
  headline: string;
  link: string;
  website: string;
}

interface PaginatedResponse {
  articles: Article[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface NewsListProps {
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (error: string | null) => void;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  query: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export const fetchArticles = async (
  page: number,
  query: string,
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  onLoadingChange: (isLoading: boolean) => void,
  onErrorChange: (error: string | null) => void
) => {
  onLoadingChange(true);
  try {
    const response = await axios.get<PaginatedResponse>(
      `http://localhost:8080/articles?page=${page}&pageSize=20&keyword=${query}`
    );
    setArticles(response.data.articles);
    setTotalPages(response.data.totalPages);
    onErrorChange(null);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      onErrorChange(error.message);
    } else {
      onErrorChange('An unexpected error occurred');
    }
  } finally {
    onLoadingChange(false);
  }
};

const NewsList: React.FC<NewsListProps> = ({ onLoadingChange, onErrorChange, articles, setArticles, query, currentPage, setCurrentPage }) => {
  const [totalPages, setTotalPages] = useState<number>(0);

  const getDomainName = (url: string) => {
    const hostname = new URL(url).hostname;
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  };

  useEffect(() => {
    fetchArticles(currentPage, query, setArticles, setTotalPages, onLoadingChange, onErrorChange);
  }, [currentPage, query, setArticles, onLoadingChange, onErrorChange]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="news-list">
      {articles.map((article, index) => (
        <div key={article.id} className="news-item">
          <span className="news-number">{(currentPage - 1) * 20 + index + 1}.</span>
          <button className="upvote-button">▲</button>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link">
            {article.headline}
          </a>
          <span className="news-source">({getDomainName(article.website)})</span>
        </div>
      ))}

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <span
            key={page}
            className={`page-number ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsList;
