import React, { useState } from 'react';
import './SearchBar.css';
import axios from 'axios';
import { Article } from './NewsList';

interface SearchBarProps {
    onSearchResults: (articles: Article[]) => void;
    onSearchError: (message: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults, onSearchError }) => {
    const [query, setQuery] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSearch = async () => {
        if (!query) return;

        try {
            const response = await axios.post<Article[]>(`http://localhost:8080/articles?keyword=${encodeURIComponent(query)}`);
            if (response.data.length === 0) {
                onSearchError('No results found');
                onSearchResults([]);
            } else {
                onSearchResults(response.data);
                onSearchError('');
            }
        } catch (error) {
            console.error('Search error:', error);
            onSearchError('An error occurred during the search');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for articles..."
            />
            <button onClick={handleSearch}>Search</button>
        </div>
    );
};

export default SearchBar;
