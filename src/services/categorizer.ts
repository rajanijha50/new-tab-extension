import type { CategoryData, CategoryMap } from '../types/category';

const BUILT_IN_CATEGORIES: Record<string, CategoryData> = {
  social: {
    icon: 'FaUsers',
    color: '#3b82f6',
    patterns: ['facebook', 'twitter', 'instagram', 'linkedin', 'reddit', 'tiktok', 'discord', 'snapchat', 'telegram', 'mastodon', 'bluesky', 't.co', 'fb.com', 'x.com'],
    isBuiltIn: true
  },
  productivity: {
    icon: 'MdCheckCircle',
    color: '#10b981',
    patterns: ['notion', 'asana', 'monday', 'slack', 'gmail', 'outlook', 'todoist', 'trello', 'clickup', 'teams', 'drive.google', 'dropbox'],
    isBuiltIn: true
  },
  development: {
    icon: 'FaCode',
    color: '#8b5cf6',
    patterns: ['github', 'gitlab', 'stackoverflow', 'dev.to', 'npmjs', 'docs.', 'codepen', 'jsfiddle', 'replit', 'glitch', 'bitbucket', 'localhost', 'developer.'],
    isBuiltIn: true
  },
  entertainment: {
    icon: 'MdMovieFilter',
    color: '#f59e0b',
    patterns: ['youtube', 'netflix', 'twitch', 'hulu', 'disney', 'spotify', 'soundcloud', '9gag', 'imgur', 'vimeo'],
    isBuiltIn: true
  },
  'ai-chatbots': {
    icon: 'TbRobot',
    color: '#ec4899',
    patterns: ['openai', 'chatgpt', 'claude', 'gemini', 'bard', 'perplexity', 'huggingface', 'midjourney'],
    isBuiltIn: true
  },
  learning: {
    icon: 'IoBook',
    color: '#06b6d4',
    patterns: ['coursera', 'udemy', 'edx', 'skillshare', 'codecademy', 'freecodecamp', 'khanacademy', 'duolingo', 'wikipedia'],
    isBuiltIn: true
  },
  shopping: {
    icon: 'MdShoppingBag',
    color: '#f97316',
    patterns: ['amazon', 'ebay', 'etsy', 'shopify', 'aliexpress', 'walmart', 'target'],
    isBuiltIn: true
  },
  news: {
    icon: 'MdNewspaper',
    color: '#ef4444',
    patterns: ['bbc', 'cnn', 'hackernews', 'news.ycombinator', 'medium', 'substack', 'techcrunch', 'theverge', 'nytimes', 'reuters'],
    isBuiltIn: true
  },
  other: {
    icon: 'FaLink',
    color: '#6b7280',
    patterns: [],
    isBuiltIn: true
  }
};

class LinkCategorizer {
  getDomain(url: string): string {
    try {
      let cleanUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
      }
      const parsed = new URL(cleanUrl);
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      // Fallback simple parsing if URL constructor fails
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^:\/\s]+)/i);
      return match ? match[1] : url;
    }
  }

  categorize(url: string): string {
    const domain = this.getDomain(url).toLowerCase();
    
    // Check custom categories first
    const custom = this.getCustomCategories();
    for (const [name, cat] of Object.entries(custom)) {
      for (const pattern of cat.patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(url) || regex.test(domain)) {
            return name;
          }
        } catch (e) {
          console.error(`Invalid regex pattern ${pattern} for category ${name}:`, e);
        }
      }
    }

    // Check built-in categories
    for (const [name, cat] of Object.entries(BUILT_IN_CATEGORIES)) {
      if (name === 'other') continue;
      for (const pattern of cat.patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(url) || regex.test(domain)) {
            return name;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    return 'other';
  }

  categorizeBatch(urls: string[]): Record<string, { url: string; domain: string }[]> {
    const result: Record<string, { url: string; domain: string }[]> = {};
    for (const url of urls) {
      const cat = this.categorize(url);
      if (!result[cat]) {
        result[cat] = [];
      }
      result[cat].push({ url, domain: this.getDomain(url) });
    }
    return result;
  }

  getCustomCategories(): CategoryMap {
    const data = localStorage.getItem('custom_categories');
    if (!data) return {};
    try {
      return JSON.parse(data) as CategoryMap;
    } catch {
      return {};
    }
  }

  getCategoryInfo(name: string): CategoryData {
    const custom = this.getCustomCategories();
    if (custom[name]) return custom[name];
    if (BUILT_IN_CATEGORIES[name]) return BUILT_IN_CATEGORIES[name];
    return {
      icon: 'FaLink',
      color: '#6b7280',
      patterns: []
    };
  }

  getAllCategories(): CategoryMap {
    return {
      ...BUILT_IN_CATEGORIES,
      ...this.getCustomCategories()
    };
  }

  getCategoryNames(): string[] {
    return Object.keys(this.getAllCategories());
  }

  addCustomCategory(name: string, icon: string, color: string, patterns: string[] = []): string {
    const key = name.toLowerCase().trim().replace(/\s+/g, '-');
    if (this.exists(key)) {
      throw new Error(`Category "${name}" already exists.`);
    }

    const custom = this.getCustomCategories();
    custom[key] = {
      icon,
      color,
      patterns,
      isBuiltIn: false
    };

    localStorage.setItem('custom_categories', JSON.stringify(custom));
    return key;
  }

  updateCustomCategory(key: string, updates: Partial<CategoryData>): void {
    const custom = this.getCustomCategories();
    if (!custom[key]) {
      throw new Error(`Custom category "${key}" not found.`);
    }

    custom[key] = {
      ...custom[key],
      ...updates,
      isBuiltIn: false // Force keeping as custom
    };

    localStorage.setItem('custom_categories', JSON.stringify(custom));
  }

  deleteCustomCategory(key: string): void {
    const custom = this.getCustomCategories();
    if (custom[key]) {
      delete custom[key];
      localStorage.setItem('custom_categories', JSON.stringify(custom));
    }
  }

  isBuiltIn(name: string): boolean {
    return name in BUILT_IN_CATEGORIES;
  }

  exists(name: string): boolean {
    const key = name.toLowerCase().trim().replace(/\s+/g, '-');
    return (key in BUILT_IN_CATEGORIES) || (key in this.getCustomCategories());
  }
}

export const categorizer = new LinkCategorizer();
