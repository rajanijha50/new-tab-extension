import { openDB, type IDBPDatabase } from 'idb';
import type { GridItem } from '../types/grid';
import type { UserSettings } from '../types/settings';

const DB_NAME = 'ProdXTabDB';
const DB_VERSION = 1;
const GRID_STORE = 'grid_items';

export interface ExportData {
  gridItems: GridItem[];
  preferences: UserSettings;
}

class StorageManager {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  initDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(GRID_STORE)) {
            const store = db.createObjectStore(GRID_STORE, { keyPath: 'id' });
            store.createIndex('pageIndex', 'pageIndex', { unique: false });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async getAllGridItems(): Promise<GridItem[]> {
    const db = await this.initDB();
    return db.getAll(GRID_STORE);
  }

  async saveAllGridItems(items: GridItem[]): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(GRID_STORE, 'readwrite');
    await tx.objectStore(GRID_STORE).clear();
    for (const item of items) {
      await tx.objectStore(GRID_STORE).put(item);
    }
    await tx.done;
  }

  async saveGridItem(item: GridItem): Promise<void> {
    const db = await this.initDB();
    await db.put(GRID_STORE, item);
  }

  async deleteGridItem(id: string): Promise<void> {
    const db = await this.initDB();
    await db.delete(GRID_STORE, id);
  }

  // Preferences
  setPreference<T>(key: string, value: T): void {
    if (value === null || value === undefined) {
      localStorage.removeItem(`pref_${key}`);
    } else {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
    }
  }

  getPreference<T>(key: string, defaultValue: T): T {
    const val = localStorage.getItem(`pref_${key}`);
    if (val === null) return defaultValue;
    try {
      return JSON.parse(val) as T;
    } catch {
      return defaultValue;
    }
  }

  async exportData(): Promise<ExportData> {
    const gridItems = await this.getAllGridItems();
    const preferences: UserSettings = {
      theme: this.getPreference<UserSettings['theme']>('theme', 'auto'),
      glassBlur: this.getPreference<UserSettings['glassBlur']>('glassBlur', 10),
      glassOpacity: this.getPreference<UserSettings['glassOpacity']>('glassOpacity', 0.7),
      wallpaper: this.getPreference<UserSettings['wallpaper']>('wallpaper', null),
      showLinkName: this.getPreference<UserSettings['showLinkName']>('showLinkName', true),
    };
    return { gridItems, preferences };
  }

  async importData(data: ExportData): Promise<{ linksImported: number; foldersImported: number }> {
    if (data.gridItems) {
      await this.saveAllGridItems(data.gridItems);
    }
    if (data.preferences) {
      for (const key of Object.keys(data.preferences) as Array<keyof UserSettings>) {
        this.setPreference(key, (data.preferences as unknown as Record<string, unknown>)[key as string] as never);
      }
    }
    return { linksImported: data.gridItems?.length || 0, foldersImported: 0 };
  }

  async reset(): Promise<void> {
    await this.saveAllGridItems([]);
    localStorage.clear();
  }
}

export const storage = new StorageManager();
