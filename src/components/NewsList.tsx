import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns';

export interface Article {
  id: string;
  headline: string;
  link: string;
  website: string;
  created_at: string;
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

// Function to highlight the search keyword
const highlightText = (text: string, keyword: string) => {
  if (!keyword) return text; // Return the text if no keyword is entered
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <span key={i} className="bg-yellow-300">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
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
  const [pageGroup, setPageGroup] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const getDomainName = (url: string) => {
    const hostname = new URL(url).hostname;
    return (hostname.startsWith('www.') ? hostname.slice(4) : hostname).split('.')[0];
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
  }, [currentPage, query, websiteFilter]);

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
    <div className="news-list mt-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {articles.map((article, index) => (
            <div key={article.id} className="news-item flex md:flex-row flex-col justify-between py-4 border-b border-gray-300">
              <div className="flex">
                <span className="news-number text-gray-500 mr-2">{(currentPage - 1) * 20 + index + 1}.</span>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-link hover:underline"
                >
                  {highlightText(article.headline.split(' ').length > 50 ? `${article.headline.slice(0, 100)}...(click to read more)` : article.headline, query)}
                </a>
              </div>
              <div className="text-right">
                <span className="news-source text-gray-500">
                  ({getDomainName(article.website)}) &nbsp;
                </span>
                <span className="news-time text-gray-500">
                  {formatDistanceToNow(parseISO(article.created_at), { addSuffix: true }).replace('about ', '').replace('minutes', 'min')}
                </span>
              </div>
            </div>
          ))}
          <div className="pagination flex justify-center mt-4 gap-2">
            {pageGroup > 0 && (
              <span className="page-nav cursor-pointer" onClick={handlePrevGroup}>
                &lt;
              </span>
            )}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <span
                key={page}
                className={`page-number cursor-pointer py-1 px-3 border rounded ${page === currentPage ? 'bg-teal-700 text-white' : 'bg-gray-200'}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </span>
            ))}
            {(pageGroup + 1) * 10 < totalPages && (
              <span className="page-nav cursor-pointer" onClick={handleNextGroup}>
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
