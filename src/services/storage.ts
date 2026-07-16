import { openDB, type IDBPDatabase } from 'idb';
import type { Link } from '../types/link';
import type { UserSettings } from '../types/settings';

const DB_NAME = 'LinksDashboardDB';
const DB_VERSION = 1;
const STORE_NAME = 'links';

export interface ExportData {
  links: Link[];
  preferences: UserSettings;
  customCategories?: any;
}

class StorageManager {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  initDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, {
              keyPath: 'id',
              autoIncrement: true,
            });
            store.createIndex('category', 'category', { unique: false });
            store.createIndex('domain', 'domain', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async addLink(link: Omit<Link, 'id'>): Promise<number> {
    const db = await this.initDB();
    const result = await db.add(STORE_NAME, link);
    return result as number;
  }

  async updateLink(id: number, data: Partial<Link>): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing = await store.get(id);
    if (existing) {
      await store.put({ ...existing, ...data });
    }
    await tx.done;
  }

  async deleteLink(id: number): Promise<void> {
    const db = await this.initDB();
    return db.delete(STORE_NAME, id);
  }

  async getLinkById(id: number): Promise<Link | undefined> {
    const db = await this.initDB();
    return db.get(STORE_NAME, id);
  }

  async getLinksByCategory(category: string): Promise<Link[]> {
    const db = await this.initDB();
    return db.getAllFromIndex(STORE_NAME, 'category', category);
  }

  async getAllLinks(): Promise<Link[]> {
    const db = await this.initDB();
    return db.getAll(STORE_NAME);
  }

  async getAllLinksByCategory(): Promise<Record<string, Link[]>> {
    const links = await this.getAllLinks();
    const map: Record<string, Link[]> = {};
    for (const link of links) {
      if (!map[link.category]) {
        map[link.category] = [];
      }
      map[link.category].push(link);
    }
    return map;
  }

  async searchLinks(query: string): Promise<Link[]> {
    const links = await this.getAllLinks();
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return links;
    return links.filter(
      (l) =>
        l.title.toLowerCase().includes(cleanQuery) ||
        l.domain.toLowerCase().includes(cleanQuery) ||
        l.url.toLowerCase().includes(cleanQuery)
    );
  }

  async clearAllLinks(): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).clear();
    await tx.done;
  }

  async getStats(): Promise<{ totalLinks: number; byCategory: Record<string, number> }> {
    const links = await this.getAllLinks();
    const byCategory: Record<string, number> = {};
    for (const link of links) {
      byCategory[link.category] = (byCategory[link.category] || 0) + 1;
    }
    return {
      totalLinks: links.length,
      byCategory,
    };
  }

  async exportData(): Promise<ExportData> {
    const links = await this.getAllLinks();
    const preferences = this.getAllPreferences();
    const customCategoriesStr = localStorage.getItem('custom_categories');
    const customCategories = customCategoriesStr ? JSON.parse(customCategoriesStr) : {};
    return { links, preferences, customCategories };
  }

  async importData(data: ExportData): Promise<{ linksImported: number }> {
    await this.clearAllLinks();
    const db = await this.initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let count = 0;
    if (data.links && Array.isArray(data.links)) {
      for (const link of data.links) {
        const { id, ...linkData } = link;
        await store.add(linkData);
        count++;
      }
    }
    await tx.done;

    if (data.preferences) {
      for (const key of Object.keys(data.preferences) as Array<keyof UserSettings>) {
        this.setPreference(key, data.preferences[key]);
      }
    }

    if (data.customCategories) {
      localStorage.setItem('custom_categories', JSON.stringify(data.customCategories));
    }

    return { linksImported: count };
  }

  async reset(): Promise<void> {
    await this.clearAllLinks();
    localStorage.removeItem('pref_theme');
    localStorage.removeItem('custom_categories');
    const prefKeys: Array<keyof UserSettings> = ['theme', 'glassBlur', 'glassOpacity', 'wallpaper'];
    for (const key of prefKeys) {
      localStorage.removeItem(`pref_${key}`);
    }
  }

  setPreference<T>(key: keyof UserSettings, value: T): void {
    if (value === null || value === undefined) {
      localStorage.removeItem(`pref_${key}`);
    } else {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
    }
  }

  getPreference<T>(key: keyof UserSettings, defaultValue: T): T {
    const val = localStorage.getItem(`pref_${key}`);
    if (val === null) return defaultValue;
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  }

  private getAllPreferences(): UserSettings {
    return {
      theme: this.getPreference<UserSettings['theme']>('theme', 'auto'),
      glassBlur: this.getPreference<UserSettings['glassBlur']>('glassBlur', 10),
      glassOpacity: this.getPreference<UserSettings['glassOpacity']>('glassOpacity', 0.7),
      wallpaper: this.getPreference<UserSettings['wallpaper']>('wallpaper', null),
    };
  }
}

export const storage = new StorageManager();
