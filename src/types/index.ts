export interface Feed {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  lastUpdated: number;
  updateInterval: number;
  favicon?: string;
  isActive: boolean;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  author?: string;
  publishDate: number;
  content: string;
  summary?: string;
  url: string;
  isRead: boolean;
  isFavorite: boolean;
  tags: string[];
  createdAt: number;
}

export interface Note {
  id: string;
  articleId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export interface Highlight {
  id: string;
  articleId: string;
  noteId?: string;
  text: string;
  color: string;
  position: {
    start: number;
    end: number;
  };
  createdAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  updateInterval: number;
  defaultCategory: string;
  exportFormat: 'markdown' | 'html' | 'json';
  keyboardShortcuts: boolean;
}

export interface FeedCategory {
  id: string;
  name: string;
  color: string;
  feedIds: string[];
}

export type TabType = 'rss' | 'fetch' | 'editor' | 'store' | 'summarize';

export interface SearchResult {
  type: 'article' | 'note';
  item: Article | Note;
  score: number;
  highlights: string[];
}

export interface SummaryResult {
  id: string;
  originalArticleId: string;
  summary: string;
  model: string;
  prompt: string;
  createdAt: number;
}