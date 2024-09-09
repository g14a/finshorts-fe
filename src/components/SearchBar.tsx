import React, { useState } from 'react';
import './SearchBar.css';
import { fetchArticles, Article } from './NewsList';

interface SearchBarProps {
    onSearchResults: (articles: Article[], totalPages: number) => void;
    onSearchError: (message: string) => void;
    onLoadingChange: (isLoading: boolean) => void;
    setTotalPages: React.Dispatch<React.SetStateAction<number>>;
    setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
    setQuery: React.Dispatch<React.SetStateAction<string>>; // Add setQuery prop to update the query in App.tsx
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchResults, onSearchError, onLoadingChange, setTotalPages, setArticles, setQuery }) => {
    const [localQuery, setLocalQuery] = useState<string>(''); // Manage local query state

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalQuery(event.target.value); // Update the local query state
    };

    const handleSearch = async () => {
        if (!localQuery) return;

        try {
            setQuery(localQuery); // Update the query in App.tsx
            await fetchArticles(
                1, 
                localQuery,
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
                value={localQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for articles..."
            />
            <button onClick={handleSearch}>Search</button>
        </div>
    );
};

export default SearchBar;
