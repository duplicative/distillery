import Dexie, { Table } from 'dexie';
import { Feed, Article, Note, Highlight, AppSettings, FeedCategory } from '../types';

class ReadLaterDatabase extends Dexie {
  feeds!: Table<Feed>;
  articles!: Table<Article>;
  notes!: Table<Note>;
  highlights!: Table<Highlight>;
  settings!: Table<AppSettings & { id: string }>;
  categories!: Table<FeedCategory>;

  constructor() {
    super('ReadLaterDB');
    
    this.version(1).stores({
      feeds: 'id, url, title, category, lastUpdated, isActive',
      articles: 'id, feedId, title, publishDate, isRead, isFavorite, tags, createdAt',
      notes: 'id, articleId, createdAt, updatedAt, tags',
      highlights: 'id, articleId, noteId, createdAt',
      settings: 'id',
      categories: 'id, name, feedIds',
    });
  }
}

export const db = new ReadLaterDatabase();

// Initialize default settings
db.on('populate', () => {
  db.settings.add({
    id: 'default',
    theme: 'system',
    updateInterval: 30,
    defaultCategory: 'uncategorized',
    exportFormat: 'markdown',
    keyboardShortcuts: true,
  });

  db.categories.add({
    id: 'uncategorized',
    name: 'Uncategorized',
    color: '#6b7280',
    feedIds: [],
  });
});

export class DatabaseService {
  // Feed operations
  async addFeed(feed: Omit<Feed, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.feeds.add({ ...feed, id });
    return id;
  }

  async updateFeed(id: string, updates: Partial<Feed>): Promise<void> {
    await db.feeds.update(id, updates);
  }

  async deleteFeed(id: string): Promise<void> {
    await db.transaction('rw', [db.feeds, db.articles], async () => {
      await db.feeds.delete(id);
      await db.articles.where('feedId').equals(id).delete();
    });
  }

  async getFeeds(): Promise<Feed[]> {
    return db.feeds.orderBy('title').toArray();
  }

  async getFeedsByCategory(category: string): Promise<Feed[]> {
    return db.feeds.where('category').equals(category).toArray();
  }

  // Article operations
  async addArticle(article: Omit<Article, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.articles.add({ ...article, id });
    return id;
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
    await db.articles.update(id, updates);
  }

  async deleteArticle(id: string): Promise<void> {
    await db.transaction('rw', [db.articles, db.notes, db.highlights], async () => {
      await db.articles.delete(id);
      await db.notes.where('articleId').equals(id).delete();
      await db.highlights.where('articleId').equals(id).delete();
    });
  }

  async getArticles(feedId?: string): Promise<Article[]> {
    if (feedId) {
      return db.articles.where('feedId').equals(feedId).reverse().sortBy('publishDate');
    }
    return db.articles.orderBy('publishDate').reverse().toArray();
  }

  async getUnreadArticles(): Promise<Article[]> {
    return db.articles.where('isRead').equals(false).reverse().sortBy('publishDate');
  }

  async getFavoriteArticles(): Promise<Article[]> {
    return db.articles.where('isFavorite').equals(true).reverse().sortBy('publishDate');
  }

  async markArticleAsRead(id: string): Promise<void> {
    await db.articles.update(id, { isRead: true });
  }

  async toggleArticleFavorite(id: string): Promise<void> {
    const article = await db.articles.get(id);
    if (article) {
      await db.articles.update(id, { isFavorite: !article.isFavorite });
    }
  }

  // Note operations
  async addNote(note: Omit<Note, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.notes.add({ ...note, id, createdAt: now, updatedAt: now });
    return id;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    await db.notes.update(id, { ...updates, updatedAt: Date.now() });
  }

  async deleteNote(id: string): Promise<void> {
    await db.notes.delete(id);
  }

  async getNotesByArticle(articleId: string): Promise<Note[]> {
    return db.notes.where('articleId').equals(articleId).toArray();
  }

  // Highlight operations
  async addHighlight(highlight: Omit<Highlight, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.highlights.add({ ...highlight, id, createdAt: Date.now() });
    return id;
  }

  async deleteHighlight(id: string): Promise<void> {
    await db.highlights.delete(id);
  }

  async getHighlightsByArticle(articleId: string): Promise<Highlight[]> {
    return db.highlights.where('articleId').equals(articleId).toArray();
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    const settings = await db.settings.get('default');
    return settings || {
      theme: 'system',
      updateInterval: 30,
      defaultCategory: 'uncategorized',
      exportFormat: 'markdown',
      keyboardShortcuts: true,
    };
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    await db.settings.update('default', updates);
  }

  // Category operations
  async getCategories(): Promise<FeedCategory[]> {
    return db.categories.toArray();
  }

  async addCategory(category: Omit<FeedCategory, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.categories.add({ ...category, id });
    return id;
  }

  async updateCategory(id: string, updates: Partial<FeedCategory>): Promise<void> {
    await db.categories.update(id, updates);
  }

  async deleteCategory(id: string): Promise<void> {
    await db.categories.delete(id);
  }

  // Search
  async searchArticles(query: string): Promise<Article[]> {
    const searchTerm = query.toLowerCase();
    return db.articles
      .filter(article => 
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.summary?.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .toArray();
  }

  async searchNotes(query: string): Promise<Note[]> {
    const searchTerm = query.toLowerCase();
    return db.notes
      .filter(note => 
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .toArray();
  }

  // Bulk operations
  async addArticles(articles: Omit<Article, 'id'>[]): Promise<void> {
    const articlesWithIds = articles.map(article => ({
      ...article,
      id: crypto.randomUUID(),
    }));
    await db.articles.bulkAdd(articlesWithIds);
  }

  async exportData(): Promise<any> {
    const [feeds, articles, notes, highlights, settings, categories] = await Promise.all([
      db.feeds.toArray(),
      db.articles.toArray(),
      db.notes.toArray(),
      db.highlights.toArray(),
      db.settings.toArray(),
      db.categories.toArray(),
    ]);

    return {
      feeds,
      articles,
      notes,
      highlights,
      settings,
      categories,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  async importData(data: any): Promise<void> {
    await db.transaction('rw', [db.feeds, db.articles, db.notes, db.highlights, db.settings, db.categories], async () => {
      if (data.feeds) await db.feeds.bulkPut(data.feeds);
      if (data.articles) await db.articles.bulkPut(data.articles);
      if (data.notes) await db.notes.bulkPut(data.notes);
      if (data.highlights) await db.highlights.bulkPut(data.highlights);
      if (data.settings) await db.settings.bulkPut(data.settings);
      if (data.categories) await db.categories.bulkPut(data.categories);
    });
  }

  async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.feeds, db.articles, db.notes, db.highlights], async () => {
      await db.feeds.clear();
      await db.articles.clear();
      await db.notes.clear();
      await db.highlights.clear();
    });
  }
}

export const dbService = new DatabaseService();