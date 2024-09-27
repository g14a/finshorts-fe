import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Article, CommentOnArticle, GetArticleById, GetArticleComments } from '../api/api';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Comment {
    id: string;
    article_id: string;
    user_id: string;
    username: string;
    content: string;
    parent_comment_id?: string;
    created_at: string;
    replies?: Comment[];
}

interface CommentTreeProps {
    comments: Comment[];
    onReplySubmit: () => void; // Callback to refresh the comments after a reply is submitted
}

export const CommentTree: React.FC<CommentTreeProps> = ({ comments, onReplySubmit }) => {
    const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const handleReplyClick = (commentId: string) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/auth';
            return;
        }

        setReplyingTo(commentId);
    };

    const handleReplyChange = (commentId: string, content: string) => {
        setReplyContent((prev) => ({ ...prev, [commentId]: content }));
    };

    const handleReplySubmit = async (commentId: string) => {
        try {
            if (replyContent[commentId]) {
                const data = {
                    content: replyContent[commentId],
                    parent_comment_id: commentId
                };

                await CommentOnArticle(comments[0].article_id, data)

                setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
                setReplyingTo(null);

                onReplySubmit();
            }
        } catch (error) {
            console.error('Failed to submit reply:', error);
        }
    };

    const renderComments = (comments: Comment[]) => {
        return comments.map((comment) => (
            <div key={comment.id} className="comment-item ml-4 mt-4">
                <div className="comment-content">
                    <p>{comment.content}</p>
                    <span className="text-xs text-gray-500">{`${comment.username} ${formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true }).replace('about ', '').replace('minute', 'min')} `}</span>                    <button
                        className="text-sm text-teal-600 ml-2 hover:underline"
                        onClick={() => handleReplyClick(comment.id)}
                    >
                        Reply
                    </button>
                    {replyingTo === comment.id && (
                        <div className="mt-2">
                            <textarea
                                value={replyContent[comment.id] || ''}
                                onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="Write your reply..."
                            />
                            <button
                                className="bg-teal-700 text-white px-4 py-2 rounded mt-2"
                                onClick={() => handleReplySubmit(comment.id)}
                            >
                                Reply
                            </button>
                        </div>
                    )}
                </div>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies ml-4 border-l-2 border-gray-200 pl-4">
                        {renderComments(comment.replies)}
                    </div>
                )}
            </div>
        ));
    };

    return <div className="comment-tree">{renderComments(comments)}</div>;
};

export const ArticleCommentsPage: React.FC = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const [comments, setComments] = useState<Comment[]>([]);
    const [article, setArticle] = useState<Article | null>(null);
    const [rootCommentContent, setRootCommentContent] = useState<string>('');

    const fetchCommentsData = async () => {
        try {
            const commentsData = await GetArticleComments(articleId);
            if (commentsData) {
                setComments(commentsData);
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
        }
    };

    const fetchArticleData = async () => {
        try {
            const articleData = await GetArticleById(articleId);
            if (articleData) {
                setArticle(articleData);
            }
        } catch (error) {
            console.error('Error fetching article:', error);
        }
    };

    const handleRootCommentSubmit = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/auth';
            return;
        }

        try {
            await CommentOnArticle(articleId!, { content: rootCommentContent });
            setRootCommentContent(''); // Clear the input field after submission
            fetchCommentsData(); // Refresh the comments list
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    };

    useEffect(() => {
        fetchArticleData();
        fetchCommentsData();
    }, [articleId]);

    return (
        <div className="article-comments-page">
            {article && (
                <div className="article-header">
                    <h1 className="text-2xl mt-5">{article.headline}</h1>
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link hover:underline text-blue-500"
                    >
                        {article.link}
                    </a>
                </div>
            )}
            <div className="root-comment-box mt-4">
                <textarea
                    value={rootCommentContent}
                    onChange={(e) => setRootCommentContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Write your comment..."
                />
                <button
                    className="bg-teal-700 text-white px-4 py-2 rounded mt-2"
                    onClick={handleRootCommentSubmit}
                >
                    Comment
                </button>
            </div>
            <CommentTree comments={comments} onReplySubmit={fetchCommentsData} />
        </div>
    );
};
