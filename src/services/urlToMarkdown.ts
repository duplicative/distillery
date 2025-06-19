import TurndownService from 'turndown';

export class URLToMarkdownService {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // Configure turndown rules
    this.turndownService.addRule('removeScripts', {
      filter: ['script', 'style', 'nav', 'header', 'footer', 'aside'],
      replacement: () => '',
    });

    this.turndownService.addRule('cleanImages', {
      filter: 'img',
      replacement: (content, node) => {
        const img = node as HTMLImageElement;
        const alt = img.alt || '';
        const src = img.src || '';
        return src ? `![${alt}](${src})` : '';
      },
    });
  }

  async convertUrlToMarkdown(url: string): Promise<{
    title: string;
    content: string;
    author?: string;
    publishDate?: string;
    summary?: string;
  }> {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const html = data.contents;
      
      return this.processHTML(html, url);
    } catch (error) {
      console.error('Error converting URL to markdown:', error);
      throw new Error(`Failed to convert URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private processHTML(html: string, originalUrl: string): {
    title: string;
    content: string;
    author?: string;
    publishDate?: string;
    summary?: string;
  } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract metadata
    const title = this.extractTitle(doc);
    const author = this.extractAuthor(doc);
    const publishDate = this.extractPublishDate(doc);
    const summary = this.extractSummary(doc);
    
    // Clean and extract main content
    this.removeUnwantedElements(doc);
    const mainContent = this.extractMainContent(doc);
    
    // Convert to markdown
    const content = this.turndownService.turndown(mainContent);
    
    return {
      title,
      content: this.cleanMarkdown(content),
      author,
      publishDate,
      summary,
    };
  }

  private extractTitle(doc: Document): string {
    // Try multiple selectors for title
    const titleSelectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'h1',
      'title',
      '.entry-title',
      '.post-title',
      '.article-title',
    ];

    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const title = element.getAttribute('content') || element.textContent;
        if (title && title.trim()) {
          return title.trim();
        }
      }
    }

    return 'Untitled';
  }

  private extractAuthor(doc: Document): string | undefined {
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '.author',
      '.byline',
      '[rel="author"]',
    ];

    for (const selector of authorSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const author = element.getAttribute('content') || element.textContent;
        if (author && author.trim()) {
          return author.trim();
        }
      }
    }

    return undefined;
  }

  private extractPublishDate(doc: Document): string | undefined {
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'time[datetime]',
      '.published',
      '.date',
    ];

    for (const selector of dateSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const date = element.getAttribute('content') || 
                    element.getAttribute('datetime') || 
                    element.textContent;
        if (date && date.trim()) {
          return date.trim();
        }
      }
    }

    return undefined;
  }

  private extractSummary(doc: Document): string | undefined {
    const summarySelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ];

    for (const selector of summarySelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const summary = element.getAttribute('content');
        if (summary && summary.trim()) {
          return summary.trim();
        }
      }
    }

    return undefined;
  }

  private removeUnwantedElements(doc: Document): void {
    const unwantedSelectors = [
      'script',
      'style',
      'nav',
      'header',
      'footer',
      'aside',
      '.advertisement',
      '.ads',
      '.social-share',
      '.comments',
      '.related-posts',
      '.sidebar',
      '.popup',
      '.modal',
      '.newsletter-signup',
    ];

    unwantedSelectors.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });
  }

  private extractMainContent(doc: Document): HTMLElement {
    // Try to find main content area
    const contentSelectors = [
      'article',
      'main',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.content',
      '#content',
      '.post-body',
    ];

    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent && element.textContent.length > 100) {
        return element as HTMLElement;
      }
    }

    // Fallback to body if no main content found
    return doc.body;
  }

  private cleanMarkdown(markdown: string): string {
    return markdown
      // Remove excessive whitespace
      .replace(/\n{3,}/g, '\n\n')
      // Remove empty links
      .replace(/\[\]\([^)]*\)/g, '')
      // Clean up list formatting
      .replace(/^\s*[-*+]\s*$/gm, '')
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  async extractMetadata(url: string): Promise<{
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  }> {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) return {};
      
      const data = await response.json();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      return {
        title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || 
               doc.querySelector('title')?.textContent || undefined,
        description: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                    doc.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
        image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined,
        siteName: doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || undefined,
      };
    } catch {
      return {};
    }
  }
}

export const urlToMarkdownService = new URLToMarkdownService();