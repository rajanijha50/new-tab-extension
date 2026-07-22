import { create } from 'zustand';
import type { Folder } from '../types/folder';
import { storage } from '../services/storage';

interface FoldersState {
  folders: Folder[];
  isLoading: boolean;
  fetchAllFolders: () => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id'>) => Promise<number>;
  updateFolder: (id: number, data: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
  updatePositions: (updates: { id: number; x: number; y: number }[]) => Promise<void>;
}

export const useFoldersStore = create<FoldersState>((set, get) => ({
  folders: [],
  isLoading: false,

  fetchAllFolders: async () => {
    set({ isLoading: true });
    try {
      const folders = await storage.getAllFolders();
      set({ folders, isLoading: false });
    } catch (e) {
      console.error('Failed to fetch folders:', e);
      set({ isLoading: false });
    }
  },

  addFolder: async (folderData) => {
    const id = await storage.addFolder(folderData);
    await get().fetchAllFolders();
    return id;
  },

  updateFolder: async (id, data) => {
    await storage.updateFolder(id, data);
    await get().fetchAllFolders();
  },

  deleteFolder: async (id) => {
    await storage.deleteFolder(id);
    await get().fetchAllFolders();
  },

  updatePositions: async (updates) => {
    for (const u of updates) {
      await storage.updateFolder(u.id, { x: u.x, y: u.y });
    }
    await get().fetchAllFolders();
  },
}));

export default useFoldersStore;
