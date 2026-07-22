import { create } from 'zustand';
import type { Link } from '../types/link';
import { storage } from '../services/storage';

interface LinksState {
  links: Link[];
  homeLinks: Link[];
  isLoading: boolean;
  fetchAllLinks: () => Promise<void>;
  addLink: (link: Omit<Link, 'id'>) => Promise<number>;
  updateLink: (id: number, data: Partial<Link>) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
  getLinksInFolder: (folderId: number) => Link[];
  updatePositions: (updates: { id: number; x: number; y: number }[]) => Promise<void>;
}

export const useLinksStore = create<LinksState>((set, get) => ({
  links: [],
  homeLinks: [],
  isLoading: false,

  fetchAllLinks: async () => {
    set({ isLoading: true });
    try {
      const links = await storage.getAllLinks();
      const homeLinks = links.filter((l: Link) => l.folderId === null || l.folderId === undefined);
      set({ links, homeLinks, isLoading: false });
    } catch (e) {
      console.error('Failed to fetch links:', e);
      set({ isLoading: false });
    }
  },

  addLink: async (linkData) => {
    const id = await storage.addLink(linkData);
    await get().fetchAllLinks();
    return id;
  },

  updateLink: async (id, data) => {
    await storage.updateLink(id, data);
    await get().fetchAllLinks();
  },

  deleteLink: async (id) => {
    await storage.deleteLink(id);
    await get().fetchAllLinks();
  },

  getLinksInFolder: (folderId) => {
    return get().links.filter((l: Link) => l.folderId === folderId);
  },

  updatePositions: async (updates) => {
    for (const u of updates) {
      await storage.updateLink(u.id, { x: u.x, y: u.y });
    }
    await get().fetchAllLinks();
  },
}));

export default useLinksStore;
