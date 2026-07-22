import { openDB, type IDBPDatabase } from 'idb';
import type { GridItem, LinkItem, FolderItem } from '../types/grid';
import type { UserSettings } from '../types/settings';
import type { Link } from '../types/link';
import type { Folder } from '../types/folder';

const DB_NAME = 'ProdXTabDB';
const DB_VERSION = 1;
const GRID_STORE = 'grid_items';

export interface ExportData {
  gridItems: GridItem[];
  preferences: UserSettings;
  links?: Link[];
  folders?: Folder[];
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

  // Legacy compatibility helpers for options / legacy stores
  async getAllLinks(): Promise<Link[]> {
    const items = await this.getAllGridItems();
    const links: Link[] = [];
    items.forEach((item) => {
      if (item.type === 'link') {
        links.push({
          id: Math.abs(hashCode(item.id)),
          title: item.title,
          url: item.url,
          domain: item.title,
          icon: item.faviconUrl,
          timestamp: Date.now(),
          x: item.gridIndex,
          y: item.pageIndex,
          w: 1,
          h: 1,
          folderId: null,
        });
      } else if (item.type === 'folder') {
        item.children.forEach((child) => {
          links.push({
            id: Math.abs(hashCode(child.id)),
            title: child.title,
            url: child.url,
            domain: child.title,
            icon: child.faviconUrl,
            timestamp: Date.now(),
            x: 0,
            y: 0,
            w: 1,
            h: 1,
            folderId: Math.abs(hashCode(item.id)),
          });
        });
      }
    });
    return links;
  }

  async getAllFolders(): Promise<Folder[]> {
    const items = await this.getAllGridItems();
    return items
      .filter((i): i is FolderItem => i.type === 'folder')
      .map((item) => ({
        id: Math.abs(hashCode(item.id)),
        name: item.title,
        icon: 'MdFolder',
        color: '#8b5cf6',
        timestamp: Date.now(),
        x: item.gridIndex,
        y: item.pageIndex,
        w: 1,
        h: 1,
      }));
  }

  async addLink(link: Omit<Link, 'id'>): Promise<number> {
    const items = await this.getAllGridItems();
    const newLinkItem: LinkItem = {
      id: crypto.randomUUID(),
      type: 'link',
      title: link.title || 'Link',
      url: link.url,
      faviconUrl: link.icon || '',
      pageIndex: 0,
      gridIndex: items.length % 12,
    };
    items.push(newLinkItem);
    await this.saveAllGridItems(items);
    return Math.abs(hashCode(newLinkItem.id));
  }

  async updateLink(_id: number, _data: Partial<Link>): Promise<void> {}

  async deleteLink(_id: number): Promise<void> {}

  async addFolder(folder: Omit<Folder, 'id'>): Promise<number> {
    const items = await this.getAllGridItems();
    const newFolderItem: FolderItem = {
      id: crypto.randomUUID(),
      type: 'folder',
      title: folder.name || 'Folder',
      children: [],
      pageIndex: 0,
      gridIndex: items.length % 12,
    };
    items.push(newFolderItem);
    await this.saveAllGridItems(items);
    return Math.abs(hashCode(newFolderItem.id));
  }

  async updateFolder(_id: number, _data: Partial<Folder>): Promise<void> {}

  async deleteFolder(_id: number): Promise<void> {}

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

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export const storage = new StorageManager();
