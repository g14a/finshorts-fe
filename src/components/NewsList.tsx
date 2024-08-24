import React, { useEffect } from 'react';
import './NewsList.css';
import axios from 'axios';

export interface Article {
  headline: string;
  link: string;
  website: string;
}

interface NewsListProps {
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (error: string | null) => void;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

export const fetchArticles = async (
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>,
  onLoadingChange: (isLoading: boolean) => void,
  onErrorChange: (error: string | null) => void
) => {
  onLoadingChange(true);
  try {
    const response = await axios.post<Article[]>('http://localhost:8080/articles');
    setArticles(response.data);
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

const NewsList: React.FC<NewsListProps> = ({ onLoadingChange, onErrorChange, articles, setArticles }) => {
  const getDomainName = (url: string) => {
    const hostname = new URL(url).hostname;
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  };

  useEffect(() => {
    fetchArticles(setArticles, onLoadingChange, onErrorChange);
  }, [setArticles, onLoadingChange, onErrorChange]);

  return (
    <div className="news-list">
      {articles.map((article, index) => (
        <div key={index} className="news-item">
          <span className="news-number">{index + 1}.</span>
          <button className="upvote-button">▲</button>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link">
            {article.headline}
          </a>
          <span className="news-source">({getDomainName(article.website)})</span>
        </div>
      ))}
    </div>
  );
};

export default NewsList;
