import React from 'react';
import { ExternalLink, Star, Edit, Share, Calendar, User } from 'lucide-react';
import { Article } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';

interface ArticlePreviewProps {
  article: Article | null;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  if (!article) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Edit size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No article selected</p>
          <p className="text-sm">Select an article from the list to read it here</p>
        </div>
      </div>
    );
  }

  const handleSendToEditor = () => {
    // TODO: Implement send to editor functionality
    console.log('Send to editor:', article.id);
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
    <div className="h-full flex flex-col">
      {/* Article Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
              {article.title}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
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
            </div>
            
            {article.summary && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {article.summary}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="sm"
            icon={Edit}
            onClick={handleSendToEditor}
          >
            Send to Editor
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

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};