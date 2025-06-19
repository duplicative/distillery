import React, { useState, useEffect } from 'react';
import { Search, Filter, Archive, Download, Grid, List } from 'lucide-react';
import { Article } from '../../types';
import { dbService } from '../../services/database';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ArticleGrid } from './ArticleGrid';
import { ArticleDetail } from './ArticleDetail';

export const KnowledgeStore: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, filter]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const articlesData = await dbService.getArticles();
      setArticles(articlesData);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.summary?.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    switch (filter) {
      case 'favorites':
        filtered = filtered.filter(article => article.isFavorite);
        break;
      case 'unread':
        filtered = filtered.filter(article => !article.isRead);
        break;
      // 'all' needs no additional filtering
    }

    setFilteredArticles(filtered);
  };

  const handleExport = async () => {
    try {
      const data = await dbService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-store-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleToggleFavorite = async (articleId: string) => {
    await dbService.toggleArticleFavorite(articleId);
    setArticles(prev => prev.map(a => 
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    ));
    if (selectedArticle?.id === articleId) {
      setSelectedArticle(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className={`${selectedArticle ? 'w-1/2' : 'w-full'} flex flex-col bg-white dark:bg-gray-900`}>
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Knowledge Store
            </h2>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={view === 'grid' ? List : Grid}
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search articles and notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'favorites' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('favorites')}
              >
                Favorites
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
            </div>
          </div>
        </div>

        {/* Articles Grid/List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Archive size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {searchQuery || filter !== 'all' ? 'No matching articles' : 'No articles yet'}
                </p>
                <p className="text-sm">
                  {searchQuery || filter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding RSS feeds or converting URLs to markdown'
                  }
                </p>
              </div>
            </div>
          ) : (
            <ArticleGrid
              articles={filteredArticles}
              selectedArticle={selectedArticle}
              onArticleSelect={setSelectedArticle}
              onToggleFavorite={handleToggleFavorite}
              view={view}
            />
          )}
        </div>
      </div>

      {/* Article Detail Panel */}
      {selectedArticle && (
        <div className="w-1/2 border-l border-gray-200 dark:border-gray-800">
          <ArticleDetail
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      )}
    </div>
  );
};