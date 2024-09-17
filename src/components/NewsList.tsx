import React, { useEffect, useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Article, fetchArticles } from './Api'; 

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
  const [error, setError] = useState<string | null>(null);

  // Fetch articles on query, websiteFilter, or currentPage change
  useEffect(() => {
    fetchArticles(currentPage, query, websiteFilter, setArticles, setTotalPages, onLoadingChange, setError);
  }, [currentPage, query, websiteFilter]);

  const handlePageClick = (page: number) => setCurrentPage(page);

  return (
    <div className="news-list mt-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {articles.map((article, index) => (
            <NewsItem 
              key={article.id} 
              article={article} 
              index={index} 
              currentPage={currentPage} 
              query={query} 
            />
          ))}

          <Pagination 
            totalPages={totalPages} 
            currentPage={currentPage} 
            onPageClick={handlePageClick} 
          />
        </>
      )}
    </div>
  );
};

// Component for rendering each article item
const NewsItem: React.FC<{ article: Article; index: number; currentPage: number; query: string }> = ({ article, index, currentPage, query }) => {
  const getDomainName = (url: string) => {
    const hostname = new URL(url).hostname;
    return (hostname.startsWith('www.') ? hostname.slice(4) : hostname).split('.')[0];
  };

  // Function to highlight the search keyword
  const highlightText = (text: string, keyword: string) => {
    if (!keyword) return text;
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

  return (
    <div className="news-item flex md:flex-row flex-col justify-between py-4 border-b border-gray-300">
      <div className="flex">
        <span className="news-number text-gray-500 mr-2">
          {(currentPage - 1) * 20 + index + 1}.
        </span>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="news-link hover:underline"
        >
          {highlightText(
            article.headline.length > 50 ? `${article.headline.slice(0, 100)}...(click to read more)` : article.headline,
            query
          )}
        </a>
      </div>
      <div className="text-right">
        <span className="news-source text-gray-500">
          ({getDomainName(article.website)}) &nbsp;
        </span>
        <span className="news-time text-gray-500">
          {formatDistanceToNow(parseISO(article.created_at), { addSuffix: true }).replace('about ', '')}
        </span>
      </div>
    </div>
  );
};

// Pagination component
const Pagination: React.FC<{ totalPages: number; currentPage: number; onPageClick: (page: number) => void }> = ({ totalPages, currentPage, onPageClick }) => {
  const getPageNumbers = () => Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination flex justify-center mt-4 gap-2">
      {getPageNumbers().map((page) => (
        <span
          key={page}
          className={`page-number cursor-pointer py-1 px-3 border rounded ${page === currentPage ? 'bg-teal-700 text-white' : 'bg-gray-200'}`}
          onClick={() => onPageClick(page)}
        >
          {page}
        </span>
      ))}
    </div>
  );
};

export default NewsList;
