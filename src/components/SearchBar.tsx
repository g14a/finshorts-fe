import React, { useState } from 'react';
import './SearchBar.css';
import { fetchArticles, Article } from './NewsList';

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
    const [localQuery, setLocalQuery] = useState<string>(''); // Manage local query state
    const [selectedChip, setSelectedChip] = useState<string | null>(null); // Manage selected chip state

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalQuery(event.target.value);
    };

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery) return;

        try {
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
        } catch (error) {
            console.error('Search error:', error);
            onSearchError('An error occurred during the search');
        }
    };

    const handleChipClick = (chipQuery: string) => {
        setSelectedChip(chipQuery); // Set the selected chip
        handleSearch(chipQuery); // Perform the search based on chip selection
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch(localQuery);
        }
    };

    return (
        <div className="search-bar-container">
            <div className="search-bar-and-chips">
                <input
                    type="text"
                    value={localQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for articles..."
                />
                <button onClick={() => handleSearch(localQuery)}>Search</button>
                <div className="chip-container">
                    <div
                        className={`chip ${selectedChip === 'ipo' ? 'chip-selected' : ''}`}
                        onClick={() => handleChipClick('ipo')}
                    >
                        IPO
                    </div>
                    <div
                        className={`chip ${selectedChip === 'banking' ? 'chip-selected' : ''}`}
                        onClick={() => handleChipClick('banking')}
                    >
                        Banking
                    </div>
                    <div
                        className={`chip ${selectedChip === 'energy' ? 'chip-selected' : ''}`}
                        onClick={() => handleChipClick('energy')}
                    >
                        Energy
                    </div>
                    <div
                        className={`chip ${selectedChip === 'nifty' ? 'chip-selected' : ''}`}
                        onClick={() => handleChipClick('nifty')}
                    >
                        Nifty
                    </div>
                    <div
                        className={`chip ${selectedChip === 'infra' ? 'chip-selected' : ''}`}
                        onClick={() => handleChipClick('infra')}
                    >
                        Infra
                    </div>
                    <div
                        className={`chip ${selectedChip === 'pharma' ? 'chip-selected' : ''}`}
                        onClick={() => handleChipClick('pharma')}
                    >
                        Pharma
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
