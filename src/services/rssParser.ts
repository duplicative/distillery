export interface ParsedFeed {
  title: string;
  description: string;
  link: string;
  items: ParsedArticle[];
}

export interface ParsedArticle {
  title: string;
  link: string;
  description: string;
  content?: string;
  pubDate: string;
  author?: string;
  guid?: string;
}

export class RSSParser {
  async parseFeed(url: string): Promise<ParsedFeed> {
    try {
      // Use a CORS proxy for RSS feeds
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const xmlText = data.contents;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }
      
      // Determine feed type (RSS or Atom)
      if (doc.querySelector('rss')) {
        return this.parseRSS(doc);
      } else if (doc.querySelector('feed')) {
        return this.parseAtom(doc);
      } else {
        throw new Error('Unsupported feed format');
      }
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
      throw new Error(`Failed to parse RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseRSS(doc: Document): ParsedFeed {
    const channel = doc.querySelector('channel');
    if (!channel) throw new Error('Invalid RSS format');

    const title = this.getTextContent(channel, 'title') || 'Untitled Feed';
    const description = this.getTextContent(channel, 'description') || '';
    const link = this.getTextContent(channel, 'link') || '';

    const items = Array.from(channel.querySelectorAll('item')).map(item => ({
      title: this.getTextContent(item, 'title') || 'Untitled',
      link: this.getTextContent(item, 'link') || '',
      description: this.getTextContent(item, 'description') || '',
      content: this.getTextContent(item, 'content:encoded') || this.getTextContent(item, 'description') || '',
      pubDate: this.getTextContent(item, 'pubDate') || new Date().toISOString(),
      author: this.getTextContent(item, 'author') || this.getTextContent(item, 'dc:creator') || '',
      guid: this.getTextContent(item, 'guid') || this.getTextContent(item, 'link') || '',
    }));

    return { title, description, link, items };
  }

  private parseAtom(doc: Document): ParsedFeed {
    const feed = doc.querySelector('feed');
    if (!feed) throw new Error('Invalid Atom format');

    const title = this.getTextContent(feed, 'title') || 'Untitled Feed';
    const description = this.getTextContent(feed, 'subtitle') || '';
    const linkEl = feed.querySelector('link[rel="alternate"]') || feed.querySelector('link');
    const link = linkEl?.getAttribute('href') || '';

    const items = Array.from(feed.querySelectorAll('entry')).map(entry => {
      const linkElement = entry.querySelector('link[rel="alternate"]') || entry.querySelector('link');
      const contentEl = entry.querySelector('content');
      const summaryEl = entry.querySelector('summary');
      
      return {
        title: this.getTextContent(entry, 'title') || 'Untitled',
        link: linkElement?.getAttribute('href') || '',
        description: summaryEl?.textContent || '',
        content: contentEl?.textContent || summaryEl?.textContent || '',
        pubDate: this.getTextContent(entry, 'published') || this.getTextContent(entry, 'updated') || new Date().toISOString(),
        author: this.getTextContent(entry, 'author name') || '',
        guid: this.getTextContent(entry, 'id') || linkElement?.getAttribute('href') || '',
      };
    });

    return { title, description, link, items };
  }

  private getTextContent(parent: Element, selector: string): string | null {
    const element = parent.querySelector(selector);
    return element?.textContent?.trim() || null;
  }

  async validateFeedUrl(url: string): Promise<boolean> {
    try {
      await this.parseFeed(url);
      return true;
    } catch {
      return false;
    }
  }

  async extractFeedUrls(websiteUrl: string): Promise<string[]> {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(websiteUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) return [];
      
      const data = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      const feedUrls: string[] = [];
      
      // Look for RSS/Atom feed links
      const feedLinks = doc.querySelectorAll('link[type="application/rss+xml"], link[type="application/atom+xml"]');
      feedLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          // Convert relative URLs to absolute
          const url = new URL(href, websiteUrl);
          feedUrls.push(url.toString());
        }
      });
      
      return feedUrls;
    } catch {
      return [];
    }
  }
}

export const rssParser = new RSSParser();