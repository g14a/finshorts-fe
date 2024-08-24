import React, { useState } from 'react';
import './App.css';
import NewsList, { fetchArticles, Article } from './components/NewsList';
import SearchBar from './components/SearchBar';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSearchResults = (results: Article[]) => {
    setArticles(results);
    setLoading(false);
  };

  const handleHomeClick = () => {
    fetchArticles(setArticles, setLoading, setError);
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
        <SearchBar onSearchResults={handleSearchResults} onSearchError={setError} />
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
