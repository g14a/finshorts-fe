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
  articles: Article[] | null;
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
  websiteFilter: string | null;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
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

    if (!response.data.articles || response.data.articles.length === 0) {
      setArticles([]); 
    } else {
      setArticles(response.data.articles);
      setTotalPages(response.data.totalPages);
      onErrorChange(null); 
    }
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

const NewsList: React.FC<NewsListProps> = ({
  onLoadingChange,
  onErrorChange,
  articles,
  setArticles,
  query,
  websiteFilter,
  currentPage,
  setCurrentPage,
}) => {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageGroup, setPageGroup] = useState<number>(0); // To track the group of pages (set of 10)
  const [error, setError] = useState<string | null>(null);

  const getDomainName = (url: string) => {
    const hostname = new URL(url).hostname;
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  };

  useEffect(() => {
    fetchArticles(
      currentPage,
      query,
      websiteFilter,
      setArticles,
      setTotalPages,
      onLoadingChange,
      setError
    );
  }, [currentPage, query, websiteFilter, setArticles, onLoadingChange]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevGroup = () => {
    if (pageGroup > 0) setPageGroup(pageGroup - 1);
  };

  const handleNextGroup = () => {
    if ((pageGroup + 1) * 10 < totalPages) setPageGroup(pageGroup + 1);
  };

  const startPage = pageGroup * 5 + 1;
  const endPage = Math.min((pageGroup + 1) * 5, totalPages);

  return (
    <div className="news-list">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {articles.map((article, index) => (
            <div key={article.id} className="news-item">
              <span className="news-number">
                {(currentPage - 1) * 20 + index + 1}.
              </span>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-link"
              >
                {article.headline}
              </a>
              <span className="news-source">
                ({getDomainName(article.website)})
              </span>
            </div>
          ))}
          <div className="pagination">
            {pageGroup > 0 && (
              <span className="page-nav" onClick={handlePrevGroup}>
                &lt;
              </span>
            )}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <span
                key={page}
                className={`page-number ${
                  page === currentPage ? 'active' : ''
                }`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </span>
            ))}
            {(pageGroup + 1) * 10 < totalPages && (
              <span className="page-nav" onClick={handleNextGroup}>
                &gt;
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NewsList;
