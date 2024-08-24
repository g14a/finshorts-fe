import React, { useState } from 'react';
import './SearchBar.css';
import { fetchArticles, Article } from './NewsList';

interface SearchBarProps {
    onSearchError: (message: string) => void;
    onLoadingChange: (isLoading: boolean) => void;
    setTotalPages: React.Dispatch<React.SetStateAction<number>>;
    setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchError, onLoadingChange, setTotalPages, setArticles }) => {
    const [query, setQuery] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSearch = async () => {
        if (!query) return;

        try {
            await fetchArticles(
                1, 
                query,
                setArticles,
                setTotalPages,
                onLoadingChange,
                (error: string | null) => {
                    if (error) {
                        onSearchError('An error occurred during the search');
                    } else {
                        onSearchError('');
                    }
                },
            );
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
