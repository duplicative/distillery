import React from 'react';
import { Star, ExternalLink, Calendar, User, Tag } from 'lucide-react';
import { Article } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '../ui/Card';

interface ArticleGridProps {
  articles: Article[];
  selectedArticle: Article | null;
  onArticleSelect: (article: Article) => void;
  onToggleFavorite: (articleId: string) => void;
  view: 'grid' | 'list';
}

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  selectedArticle,
  onArticleSelect,
  onToggleFavorite,
  view,
}) => {
  if (view === 'list') {
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => onArticleSelect(article)}
            className={`
              w-full text-left p-6 transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-800
              ${selectedArticle?.id === article.id 
                ? 'bg-primary-50 dark:bg-primary-900/10 border-r-4 border-primary-500' 
                : ''
              }
            `}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white leading-tight line-clamp-2">
                  {article.title}
                </h3>
                
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(article.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      article.isFavorite
                        ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Star size={16} fill={article.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
              
              {article.summary && (
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
                </div>
                
                <div className="flex items-center space-x-2">
                  {!article.isRead && (
                    <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                      Unread
                    </span>
                  )}
                </div>
              </div>
              
              {article.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag size={14} className="text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 5 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{article.tags.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card
            key={article.id}
            hover
            onClick={() => onArticleSelect(article)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedArticle?.id === article.id 
                ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(article.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors flex-shrink-0 ml-2 ${
                      article.isFavorite
                        ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    }`}
                  >
                    <Star size={16} fill={article.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                
                {article.summary && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    {article.author && (
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span className="truncate max-w-24">{article.author}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{formatDistanceToNow(article.publishDate, { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {!article.isRead && (
                        <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                          Unread
                        </span>
                      )}
                      
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};