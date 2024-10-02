import React, { useEffect, useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Article, FetchArticles, getDomainName, SaveArticle, upvoteArticle } from './api/apiUtils';
import './NewsList.css'

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

const highlightText = (text: string, keyword: string) => {
  if (!keyword) return text;

  const rootKeyword = keyword.slice(0, 4);
  const regex = new RegExp(`(${rootKeyword}\\w*)`, 'gi');

  return (
    <>
      {text.split(regex).map((part, i) =>
        part.toLowerCase().startsWith(rootKeyword.toLowerCase()) ? (
          <span key={i} className="bg-yellow-300">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
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

  useEffect(() => {
    FetchArticles(
      currentPage,
      query,
      websiteFilter,
      setArticles,
      setTotalPages,
      onLoadingChange,
      setError
    );
  }, [currentPage, query, websiteFilter]);

  const groupSize = 10;

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevGroup = () => {
    if (pageGroup > 0) setPageGroup(pageGroup - 1);
  };

  const handleNextGroup = () => {
    if ((pageGroup + 1) * groupSize < totalPages) setPageGroup(pageGroup + 1);
  };

  const startPage = pageGroup * groupSize + 1;
  const endPage = Math.min((pageGroup + 1) * groupSize, totalPages);

  const handleUpvote = async (articleId: string) => {
    try {
      await upvoteArticle(articleId);
      FetchArticles(
        currentPage,
        query,
        websiteFilter,
        setArticles,
        setTotalPages,
        onLoadingChange,
        setError
      );
    } catch (error) {
      console.error('Failed to upvote article:', error);
    }
  };

  const handleCommentClick = (articleId: string) => {
    window.location.href = `/${articleId}`;
  };

  const handleSaveClick = async (articleId: string) => {
    try {
      await SaveArticle(articleId);
      FetchArticles(
        currentPage,
        query,
        websiteFilter,
        setArticles,
        setTotalPages,
        onLoadingChange,
        setError
      );
    } catch (error) {
      console.error('Failed to upvote article:', error);
    }
  };

  return (
    <div className="news-list mt-2">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {articles.map((article, index) => (
            <div key={article.id} className="news-item flex md:flex-row flex-col justify-between border-gray-300">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex flex-col flex-grow">
                  <div className='flex items-center'>
                    <div className='news-number'>
                      {(currentPage - 1) * 20 + index + 1}.
                    </div>
                    <div
                      className={`upvote-icon cursor-pointer ${article.user_upvoted ? 'text-[#05846a]' : 'text-gray-400'} hover:text-[#05846a]`}
                      onClick={() => handleUpvote(article.id)}
                    >
                      ▲
                    </div>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-link hover:underline"
                    >
                      {highlightText(article.headline.split(' ').length > 50 ? `${article.headline.slice(0, 100)}...(click to read more)` : article.headline, query)}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm ml-10 text-gray-500">
                      {!article.upvote_count
                        ? '0 upvotes '
                        : article.upvote_count === 1
                          ? '1 upvote '
                          : `${article.upvote_count} upvotes `}
                    </div>
                    <div>
                      <button
                        onClick={() => handleCommentClick(article.id)}
                        className="text-blue-500 ml-2 text-sm hover:underline"
                      >
                        comments
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={!article.user_saved ? () => handleSaveClick(article.id) : undefined}
                        className={`ml-2 text-sm ${!article.user_saved ? 'hover:underline text-blue-500' : 'text-[#05846a]'}`}
                      >
                        {article.user_saved ? 'saved!' : 'save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="news-source text-sm text-gray-500">
                  ({getDomainName(article.website)}) &nbsp;
                </span>
                <span className="news-time text-sm text-gray-500">
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
                className={`page-number cursor-pointer px-3 border rounded ${page === currentPage ? 'bg-teal-600' : 'bg-gray-200'}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </span>
            ))}
            {(pageGroup + 1) * groupSize < totalPages && (
              <span className="page-nav cursor-pointer" onClick={handleNextGroup}>
                &gt;
              </span>
            )}
          </div>
        </>
      )}
      <footer className="text-black text-center p-4">
        News refreshed every 10 minutes
      </footer>
    </div>
  );
};

export default NewsList;