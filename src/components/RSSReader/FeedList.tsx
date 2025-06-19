import React from 'react';
import { Rss, Folder, MoreVertical, Wifi, WifiOff } from 'lucide-react';
import { Feed } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface FeedListProps {
  feeds: Feed[];
  selectedFeed: string | null;
  onFeedSelect: (feedId: string | null) => void;
  view: 'folders' | 'list';
}

export const FeedList: React.FC<FeedListProps> = ({
  feeds,
  selectedFeed,
  onFeedSelect,
  view,
}) => {
  const handleAllArticlesClick = () => {
    onFeedSelect(null);
  };

  const handleFeedClick = (feedId: string) => {
    onFeedSelect(feedId);
  };

  return (
    <div className="p-4 space-y-2">
      {/* All Articles Option */}
      <button
        onClick={handleAllArticlesClick}
        className={`
          w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
          ${selectedFeed === null
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
      >
        <div className={`p-1.5 rounded ${selectedFeed === null ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <Rss size={16} className={selectedFeed === null ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">All Articles</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {feeds.reduce((total, feed) => total + (feed.isActive ? 1 : 0), 0)} active feeds
          </p>
        </div>
      </button>

      {/* Feeds List */}
      {feeds.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Rss size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">No RSS feeds added yet</p>
          <p className="text-xs mt-1">Click the + button to add your first feed</p>
        </div>
      ) : (
        <div className="space-y-1">
          {feeds.map((feed) => (
            <button
              key={feed.id}
              onClick={() => handleFeedClick(feed.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group
                ${selectedFeed === feed.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <div className={`p-1.5 rounded ${selectedFeed === feed.id ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {feed.favicon ? (
                  <img 
                    src={feed.favicon} 
                    alt="" 
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Rss size={16} className={selectedFeed === feed.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium truncate">{feed.title}</p>
                  {feed.isActive ? (
                    <Wifi size={12} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <WifiOff size={12} className="text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {feed.lastUpdated 
                    ? `Updated ${formatDistanceToNow(feed.lastUpdated)} ago`
                    : 'Never updated'
                  }
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Show feed options menu
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
              >
                <MoreVertical size={14} />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};