import React, { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Article, fetchArticles } from './api/api';

interface SearchBarProps {
  onSearchResults: (articles: Article[], totalPages: number) => void;
  onSearchError: (message: string) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchResults,
  onSearchError,
  onLoadingChange,
  setTotalPages,
  setArticles,
  setQuery
}) => {
  const [localQuery, setLocalQuery] = useState<string>(''); 
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      handleSearch(searchQuery);
    }, 300), []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalQuery(value);
    debouncedSearch(value); 
  };

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery); 
    await fetchArticles(
      1,
      searchQuery,
      null,
      setArticles,
      setTotalPages,
      onLoadingChange,
      (error: string | null) => {
        if (error) {
          onSearchError('No articles found');
        } else {
          onSearchError('');
        }
      }
    );
  };

  const handleChipClick = (chipQuery: string) => {
    if (selectedChip === chipQuery) {
      setSelectedChip(null);
      handleSearch('');
    } else {
      setSelectedChip(chipQuery);
      handleSearch(chipQuery);
    }
  };

  return (
    <div className="search-bar-container flex flex-col sm:flex-row items-center w-full">
      <div className="flex w-full sm:w-auto items-center space-x-2">
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          placeholder="Search for articles..."
          className="w-full px-4 py-2 border border-gray-300 rounded sm:w-full sm:max-w-xs"
        />
        <button 
          onClick={() => handleSearch(localQuery)} 
          className="bg-teal-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      <div className="chip-container flex flex-wrap gap-2 mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto justify-center sm:justify-start">
        {['IPO', 'banking', 'energy', 'infra','mutual funds'].map((chip) => (
          <div
            key={chip}
            className={`chip flex-grow text-center px-2 py-1 text-sm sm:px-4 sm:py-2 sm:text-base rounded-full cursor-pointer ${
              selectedChip === chip ? 'bg-teal-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => handleChipClick(chip)} 
          >
            {chip.charAt(0).toUpperCase() + chip.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
