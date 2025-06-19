import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Settings, Folder, List } from 'lucide-react';
import { Feed, Article } from '../../types';
import { dbService } from '../../services/database';
import { rssParser } from '../../services/rssParser';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { FeedList } from './FeedList';
import { ArticleList } from './ArticleList';
import { ArticlePreview } from './ArticlePreview';

export const RSSReader: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [view, setView] = useState<'folders' | 'list'>('folders');

  useEffect(() => {
    loadFeeds();
    loadAllArticles();
  }, []);

  useEffect(() => {
    if (selectedFeed) {
      loadArticlesByFeed(selectedFeed);
    } else {
      loadAllArticles();
    }
  }, [selectedFeed]);

  const loadFeeds = async () => {
    try {
      const feedsData = await dbService.getFeeds();
      setFeeds(feedsData);
    } catch (error) {
      console.error('Failed to load feeds:', error);
    }
  };

  const loadAllArticles = async () => {
    try {
      const articlesData = await dbService.getArticles();
      setArticles(articlesData.slice(0, 100)); // Limit for performance
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  };

  const loadArticlesByFeed = async (feedId: string) => {
    try {
      const articlesData = await dbService.getArticles(feedId);
      setArticles(articlesData);
    } catch (error) {
      console.error('Failed to load articles by feed:', error);
    }
  };

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return;

    setIsLoading(true);
    try {
      const feedData = await rssParser.parseFeed(newFeedUrl);
      
      const feedId = await dbService.addFeed({
        url: newFeedUrl,
        title: feedData.title,
        description: feedData.description,
        category: 'uncategorized',
        lastUpdated: Date.now(),
        updateInterval: 30,
        isActive: true,
      });

      // Add initial articles
      const articles = feedData.items.map(item => ({
        feedId,
        title: item.title,
        content: item.content || item.description,
        summary: item.description,
        url: item.link,
        author: item.author,
        publishDate: new Date(item.pubDate).getTime(),
        isRead: false,
        isFavorite: false,
        tags: [],
        createdAt: Date.now(),
      }));

      await dbService.addArticles(articles);
      
      await loadFeeds();
      await loadAllArticles();
      
      setNewFeedUrl('');
      setShowAddFeed(false);
    } catch (error) {
      console.error('Failed to add feed:', error);
      alert('Failed to add feed. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshFeeds = async () => {
    setIsUpdating(true);
    try {
      const activeFeeds = feeds.filter(feed => feed.isActive);
      
      for (const feed of activeFeeds) {
        try {
          const feedData = await rssParser.parseFeed(feed.url);
          
          // Update feed info
          await dbService.updateFeed(feed.id, {
            title: feedData.title,
            description: feedData.description,
            lastUpdated: Date.now(),
          });

          // Add new articles
          const existingArticles = await dbService.getArticles(feed.id);
          const existingUrls = new Set(existingArticles.map(a => a.url));
          
          const newArticles = feedData.items
            .filter(item => !existingUrls.has(item.link))
            .map(item => ({
              feedId: feed.id,
              title: item.title,
              content: item.content || item.description,
              summary: item.description,
              url: item.link,
              author: item.author,
              publishDate: new Date(item.pubDate).getTime(),
              isRead: false,
              isFavorite: false,
              tags: [],
              createdAt: Date.now(),
            }));

          if (newArticles.length > 0) {
            await dbService.addArticles(newArticles);
          }
        } catch (error) {
          console.error(`Failed to update feed ${feed.title}:`, error);
        }
      }
      
      await loadFeeds();
      await loadAllArticles();
    } catch (error) {
      console.error('Failed to refresh feeds:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    if (!article.isRead) {
      dbService.markArticleAsRead(article.id);
      setArticles(prev => prev.map(a => 
        a.id === article.id ? { ...a, isRead: true } : a
      ));
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
      {/* Left Panel - Feeds */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              RSS Feeds
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={view === 'folders' ? List : Folder}
                onClick={() => setView(view === 'folders' ? 'list' : 'folders')}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefreshFeeds}
                disabled={isUpdating}
                className={isUpdating ? 'animate-spin' : ''}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={() => setShowAddFeed(true)}
              />
            </div>
          </div>

          {showAddFeed && (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Enter RSS feed URL..."
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeed()}
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleAddFeed}
                      loading={isLoading}
                      disabled={!newFeedUrl.trim()}
                      className="flex-1"
                    >
                      Add Feed
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowAddFeed(false);
                        setNewFeedUrl('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <FeedList
            feeds={feeds}
            selectedFeed={selectedFeed}
            onFeedSelect={setSelectedFeed}
            view={view}
          />
        </div>
      </div>

      {/* Middle Panel - Articles */}
      <div className="w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
        <ArticleList
          articles={articles}
          selectedArticle={selectedArticle}
          onArticleSelect={handleArticleSelect}
          onToggleFavorite={handleToggleFavorite}
          selectedFeedTitle={selectedFeed ? feeds.find(f => f.id === selectedFeed)?.title : 'All Articles'}
        />
      </div>

      {/* Right Panel - Article Preview */}
      <div className="flex-1 bg-white dark:bg-gray-900">
        <ArticlePreview article={selectedArticle} />
      </div>
    </div>
  );
};