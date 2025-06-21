import React from 'react';
import { X, Star, ExternalLink, Edit, Share, Calendar, User, Tag, Sparkles } from 'lucide-react';
import { Article } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import ReactMarkdown from 'react-markdown';

interface ArticleDetailProps {
  article: Article;
  onClose: () => void;
  onToggleFavorite: (articleId: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  onClose,
  onToggleFavorite,
}) => {
  const { setArticleToSummarize, setActiveTab } = useAppStore();

  const handleSendToEditor = () => {
    // TODO: Implement send to editor functionality
    console.log('Send to editor:', article.id);
  };

  const handleSendToAI = () => {
    setArticleToSummarize(article);
    setActiveTab('summarize');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url,
      });
    } else {
      navigator.clipboard.writeText(article.url);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
              {article.title}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              {article.author && (
                <div className="flex items-center space-x-1">
                  <User size={14} />
                  <span>{article.author}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{formatDistanceToNow(article.publishDate, { addSuffix: true })}</span>
              </div>
              
              {article.isFavorite && (
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span>Favorited</span>
                </div>
              )}
              
              {!article.isRead && (
                <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                  Unread
                </span>
              )}
            </div>
            
            {article.summary && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {article.summary}
              </p>
            )}
            
            {article.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag size={14} className="text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              icon={Star}
              onClick={() => onToggleFavorite(article.id)}
              className={article.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : ''}
            >
              <span className="sr-only">Toggle favorite</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={handleSendToAI}
          >
            Summarize with AI
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            icon={Edit}
            onClick={handleSendToEditor}
          >
            Edit Notes
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            icon={ExternalLink}
            onClick={() => window.open(article.url, '_blank')}
          >
            Open Original
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={Share}
            onClick={handleShare}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown>
            {article.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};