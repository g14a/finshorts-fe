import React, { useState } from 'react';
import './App.css';
import NewsList, { fetchArticles } from './components/NewsList';
import SearchBar from './components/SearchBar';
import { Article } from './components/NewsList';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>(''); 
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1); // New state for current page
  const [selectedDomain, setSelectedDomain] = useState<string>(''); // New state for selected domain

  const handleSearchResults = (results: Article[], totalPages: number) => {
    setArticles(results);
    setTotalPages(totalPages);
    setLoading(false);
  };

  const handleHomeClick = () => {
    // Reset state to load the initial articles
    setArticles([]);
    setError(null);
    setLoading(true);
    setQuery('')
    setTotalPages(0)
    setCurrentPage(1)
    setSelectedDomain(''); 
    // Fetch the first page of articles as the default when returning home
    fetchArticles(1, "", null, setArticles, setTotalPages, setLoading, setError);
  };

  const handleSearchError = (message: string) => {
    setError(message);
    setLoading(false);
  };

  const handleDomainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>BizBrief</h1>
      </header>
      <div className="top-bar">
        <a href="#" className="home-link" onClick={handleHomeClick}>
          Home
        </a>
        <SearchBar
          onSearchResults={handleSearchResults}
          onSearchError={handleSearchError}
          onLoadingChange={setLoading}
          setTotalPages={setTotalPages}
          setArticles={setArticles}
          setQuery={setQuery}
        />
        <select value={selectedDomain} onChange={handleDomainChange} className="domain-filter">
          <option value="">Select by domain</option>
          <option value="livemint">Livemint</option>
          <option value="investopedia">Investopedia</option>
          <option value="economictimes">Economic Times</option>
          <option value="timesofindia">Times of India</option>
          <option value="outlookbusiness">Outlook Business</option>
          <option value="financialexpress">Financial Express</option>
          <option value="deccanherald">Deccan Herald</option>
          <option value="businesstoday">Business Today</option>
        </select>
      </div>
      {error && <div>Error: {error}</div>}
      {articles.length === 0 && !error && !loading && <div>No articles to display.</div>}
      <NewsList
        onLoadingChange={setLoading}
        onErrorChange={setError}
        articles={articles}
        setArticles={setArticles}
        query={query} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        websiteFilter={selectedDomain} 
      />
    </div>
  );
}

export default App;
