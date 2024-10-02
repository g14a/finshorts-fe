import React, { useEffect, useState } from 'react';
import { getDomainName, GetSavedArticles, upvoteArticle } from '../api/apiUtils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Article } from '../api/apiUtils';

interface SavedArticle {
    article_id: string;
    user_id: string;
    article: Article;
}

const ProfilePage: React.FC = () => {
    const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSavedArticles = async () => {
            try {
                const savedData = await GetSavedArticles();
                setSavedArticles(savedData);
            } catch (error) {
                setError('Failed to fetch saved articles.');
            }
        };

        fetchSavedArticles();
    }, []);

    const handleCommentClick = (articleId: string) => {
        window.location.href = `/${articleId}`;
    };

    return (
        <div className="profile-page mt-4">
            <h1 className="text-2xl font-bold mb-4">Your Saved Articles</h1>
            {error ? (
                <div className="text-red-500">{error}</div>
            ) : savedArticles.length === 0 ? (
                <div>No saved articles found.</div>
            ) : (
                <div className="saved-articles-list">
                    {savedArticles.map(({ article }, index) => (
                        <div key={article.id} className="news-item flex md:flex-row flex-col justify-between border-gray-300 mb-4">
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className="flex flex-col flex-grow">
                                    <div className="flex items-center">
                                        <div className="news-number">
                                            {index + 1}.
                                        </div>
                                        <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="news-link hover:underline"
                                        >
                                            {article.headline.split(' ').length > 50 ? `${article.headline.slice(0, 100)}...(click to read more)` : article.headline}
                                        </a>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="text-sm ml-5 text-gray-500">
                                            {!article.upvote_count
                                                ? '0 upvotes '
                                                : article.upvote_count === 1
                                                    ? '1 upvote '
                                                    : `${article.upvote_count} upvotes `}
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => handleCommentClick(article.id)}
                                                className="text-blue-500 ml-2 text-sm hover:underline"
                                            >
                                                comments
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="news-source text-sm text-gray-500">
                                    ({getDomainName(article.website)}) &nbsp;
                                </span>
                                <span className="news-time text-sm text-gray-500">
                                    {formatDistanceToNow(parseISO(article.created_at), { addSuffix: true }).replace('about ', '').replace('minutes', 'min')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
