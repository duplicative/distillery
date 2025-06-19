import React from 'react';
import { Star, ExternalLink, Clock, User } from 'lucide-react';
import { Article } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface ArticleListProps {
  articles: Article[];
  selectedArticle: Article | null;
  onArticleSelect: (article: Article) => void;
  onToggleFavorite: (articleId: string) => void;
  selectedFeedTitle?: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  selectedArticle,
  onArticleSelect,
  onToggleFavorite,
  selectedFeedTitle,
}) => {
  const unreadCount = articles.filter(article => !article.isRead).length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {selectedFeedTitle || 'Articles'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {articles.length} articles
          {unreadCount > 0 && ` • ${unreadCount} unread`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8">
            <Clock size={48} className="mb-4 opacity-50" />
            <p className="text-sm text-center">No articles to display</p>
            <p className="text-xs text-center mt-1">
              {selectedFeedTitle === 'All Articles' 
                ? 'Add some RSS feeds to get started'
                : 'This feed has no articles yet'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => onArticleSelect(article)}
                className={`
                  w-full text-left p-4 transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-800
                  ${selectedArticle?.id === article.id 
                    ? 'bg-primary-50 dark:bg-primary-900/10 border-r-2 border-primary-500' 
                    : ''
                  }
                  ${!article.isRead ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}
                `}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className={`font-medium text-sm leading-5 line-clamp-2 ${
                      !article.isRead 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {article.title}
                    </h4>
                    
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(article.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          article.isFavorite
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Star size={14} fill={article.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded text-gray-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  
                  {article.summary && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-4">
                      {article.summary}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      {article.author && (
                        <div className="flex items-center space-x-1">
                          <User size={10} />
                          <span className="truncate max-w-20">{article.author}</span>
                        </div>
                      )}
                      <span>
                        {formatDistanceToNow(article.publishDate, { addSuffix: true })}
                      </span>
                    </div>
                    
                    {!article.isRead && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};