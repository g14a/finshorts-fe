import React, { useState } from 'react';
import NewsList, { fetchArticles } from './components/NewsList';
import SearchBar from './components/SearchBar';
import { Article } from './components/NewsList';
import './App.css';  

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>(''); 
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const handleSearchResults = (results: Article[], totalPages: number) => {
    setArticles(results);
    setTotalPages(totalPages);
    setLoading(false);
  };

  const handleHomeClick = () => {
    setArticles([]);
    setError(null);
    setLoading(true);
    setQuery('');
    setTotalPages(0);
    setCurrentPage(1);
    setSelectedDomain('');
    fetchArticles(1, '', null, setArticles, setTotalPages, setLoading, setError);
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
      <header className="App-header bg-teal-700 text-white p-4 text-center">
        <a href="#" onClick={handleHomeClick} className="header-link">
          <h1 className="text-2xl font-bold">BizBrief</h1>
        </a>
      </header>
      <div className="top-bar p-4 flex flex-col sm:flex-row sm:justify-between items-start">
        <SearchBar
          onSearchResults={handleSearchResults}
          onSearchError={handleSearchError}
          onLoadingChange={setLoading}
          setTotalPages={setTotalPages}
          setArticles={setArticles}
          setQuery={setQuery}
        />
        <select 
          value={selectedDomain} 
          onChange={handleDomainChange} 
          className="domain-filter border border-gray-300 rounded px-4 py-2 mt-4 sm:mt-0 w-full sm:w-auto"
        >
          <option value="">Select Domain</option>
          <option value="livemint">Livemint</option>
          <option value="investopedia">Investopedia</option>
          <option value="economictimes">Economic Times</option>
          <option value="timesofindia">Times of India</option>
          <option value="outlookbusiness">Outlook Business</option>
          <option value="financialexpress">Financial Express</option>
          <option value="deccanherald">Deccan Herald</option>
          <option value="businesstoday">Business Today</option>
          <option value="hindustantimes">Hindustan Times</option>
        </select>
      </div>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {articles.length === 0 && !error && !loading && <div className="text-center">No articles to display.</div>}
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
