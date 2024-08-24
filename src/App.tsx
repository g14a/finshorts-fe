import React, { useState } from 'react';
import './App.css';
import NewsList, { Article, fetchArticles } from './components/NewsList';
import SearchBar from './components/SearchBar';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);  // New state for total pages

  const handleSearchResults = (results: Article[], totalPages: number) => {
    setArticles(results);
    setTotalPages(totalPages);
    setLoading(false);
  };

  const handleSearchError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const handleHomeClick = () => {
    // Reset state to load the initial articles
    setArticles([]);
    setError(null);
    setLoading(true);

    // Fetch the first page of articles as the default when returning home
    fetchArticles(1, "", setArticles, setTotalPages, setLoading, setError);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Finshorts</h1>
      </header>
      <div className="top-bar">
        <a href="#" className="home-link" onClick={handleHomeClick}>
          Home
        </a>
        <SearchBar
          onSearchError={handleSearchError}
          onLoadingChange={setLoading}
          setTotalPages={setTotalPages}
          setArticles={setArticles}
        />
      </div>
      {error && <div>Error: {error}</div>}
      {articles.length === 0 && !error && !loading && <div>No articles to display.</div>}
      <NewsList
        onLoadingChange={setLoading}
        onErrorChange={setError}
        articles={articles}
        setArticles={setArticles}
      />
    </div>
  );
}

export default App;
