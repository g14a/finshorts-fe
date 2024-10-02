import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Article, CommentOnArticle, GetArticleById, GetArticleComments, EditCommentOnArticle, linkifyText } from '../api/apiUtils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FaExternalLinkAlt } from "react-icons/fa";

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
    onReplySubmit: () => void;
}

export const CommentTree: React.FC<CommentTreeProps> = ({ comments, onReplySubmit }) => {
    const { articleId } = useParams<{ articleId: string }>();
    const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<{ [key: string]: string }>({});

    const handleReplyClick = (commentId: string) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/auth';
            return;
        }

        setReplyingTo(commentId);
        setEditingComment(null);
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

                await CommentOnArticle(articleId!, data);

                setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
                setReplyingTo(null);

                onReplySubmit();
            }
        } catch (error) {
            console.error('Failed to submit reply:', error);
        }
    };

    const handleEditClick = (commentId: string, content: string) => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/auth';
            return;
        }

        setEditingComment(commentId);
        setEditContent({ [commentId]: content });
        setReplyingTo(null);
    };

    const handleEditChange = (commentId: string, content: string) => {
        setEditContent((prev) => ({ ...prev, [commentId]: content }));
    };

    const handleEditSubmit = async (commentId: string) => {
        try {
            if (editContent[commentId]) {
                const data = {
                    content: editContent[commentId],
                };

                await EditCommentOnArticle(articleId!, commentId, data);

                setEditingComment(null);
                onReplySubmit();
            }
        } catch (error) {
            console.error('Failed to edit comment:', error);
        }
    };

    // Render the comments recursively
    const renderComments = (comments: Comment[]) => {
        return comments.map((comment) => (
            <div key={comment.id} className="comment-item ml-4 mt-4">
                <div className="comment-content">
                    <p>{linkifyText(comment.content)}</p>
                    <span className="text-xs text-gray-500">{`${comment.username} ${formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true }).replace('about ', '').replace('minute', 'min')}`}</span>

                    <button
                        className="text-sm text-teal-600 ml-2 hover:underline"
                        onClick={() => handleReplyClick(comment.id)}
                    >
                        Reply
                    </button>

                    <button
                        className="text-sm text-teal-600 ml-2 hover:underline"
                        onClick={() => handleEditClick(comment.id, comment.content)}
                    >
                        Edit
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

                    {editingComment === comment.id && (
                        <div className="mt-2">
                            <textarea
                                value={editContent[comment.id] || ''}
                                onChange={(e) => handleEditChange(comment.id, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                placeholder="Edit your comment..."
                            />
                            <button
                                className="bg-teal-700 text-white px-4 py-2 rounded mt-2"
                                onClick={() => handleEditSubmit(comment.id)}
                            >
                                Save
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

    const handleCommentSubmit = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = '/auth';
            return;
        }

        try {
            await CommentOnArticle(articleId!, { content: rootCommentContent });
            setRootCommentContent('');
            fetchCommentsData();
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    };

    useEffect(() => {
        fetchArticleData();
        fetchCommentsData();
    }, [articleId]);

    return (
        <div className="article-comments-page p-3">
            {article && (
                <div className="article-header">
                    <h1 className="text-2xl mt-5">{article.headline}</h1>
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link hover:underline text-blue-500"
                    >
                        <span>
                            {`${article.link.slice(0, 80)}...`}
                            <FaExternalLinkAlt className="inline-block" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }} />
                        </span>
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
                    onClick={handleCommentSubmit}
                >
                    Comment
                </button>
            </div>
            <CommentTree comments={comments} onReplySubmit={fetchCommentsData} />
        </div>
    );
};
