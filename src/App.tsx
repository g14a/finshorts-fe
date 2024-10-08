import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import NewsList from './components/NewsList';
import SearchBar from './components/SearchBar';
import './App.css';
import AuthPage from './components/auth/AuthPage';
import { Article, GetUserDetails } from './components/api/apiUtils';
import { ArticleCommentsPage } from './components/comments/CommentTree';
import ProfilePage from './components/profile/Profile';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [username, setUsername] = useState<string | null>(null);

  const handleSearchResults = (results: Article[], totalPages: number) => {
    setArticles(results);
    setTotalPages(totalPages);
    setLoading(false);
  };

  const handleDomainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(event.target.value);
  };

  useEffect(() => {
    GetUserDetails().then((userDetails) => {
      if (userDetails?.username) {
        setUsername(userDetails.username);
      }
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <header className="App-header bg-teal-700 text-white p-4 text-center flex flex-col sm:flex-row justify-between">
          <Link to="/" className="header-link">
            <h1 className="text-2xl font-bold">BizBrief</h1>
            <h2 className="text-sm font-bold">Your business news aggregator buddy</h2>
          </Link>
          <div className="flex items-center mt-4 sm:mt-0 sm:ml-auto sm:order-last">
            {username ? (
              <>
                <Link
                  to="/profile"
                  className="text-0.5xl font-bold hover:underline"
                >
                  Logged in as {username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-0.5xl font-bold hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="ml-4 text-0.5xl font-bold hover:underline"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <div className="top-bar p-4 flex flex-col sm:flex-row sm:justify-between items-start w-full">
                    <SearchBar
                      onSearchResults={handleSearchResults}
                      onLoadingChange={setLoading}
                      onSearchError={(message: string) => setError(message)}
                      setTotalPages={setTotalPages}
                      setArticles={setArticles}
                      setQuery={setQuery}
                    />

                  <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:ml-4">
                      <select
                        value={selectedDomain}
                        onChange={handleDomainChange}
                        className="domain-filter border border-gray-300 rounded px-4 py-2 w-full sm:w-auto"
                      >
                      <option value="">Filter News</option>
                        <option value="livemint">Livemint</option>
                        <option value="investopedia">Investopedia</option>
                        <option value="economictimes">Economic Times</option>
                        <option value="timesofindia">Times of India</option>
                        <option value="thehindu">The Hindu</option>
                        <option value="outlookbusiness">Outlook Business</option>
                        <option value="financialexpress">Financial Express</option>
                        <option value="deccanherald">Deccan Herald</option>
                        <option value="businesstoday">Business Today</option>
                        <option value="hindustantimes">Hindustan Times</option>
                        <option value="hindubusinessline">Hindu Business Line</option>
                        <option value="moneycontrol">Money Control</option>
                      </select>
                    </div>
                  </div>

                  {error && <div className="text-red-500 text-center">{error}</div>}
                  {articles.length === 0 && !error && !loading && (
                    <div className="text-center">No articles to display.</div>
                  )}

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
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/:articleId" element={<ArticleCommentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
