import { create } from 'zustand';
import type { Link } from '../types/link';
import { storage } from '../services/storage';

interface LinksState {
  links: Link[];
  linksByCategory: Record<string, Link[]>;
  isLoading: boolean;
  fetchAllLinks: () => Promise<void>;
  addLink: (link: Omit<Link, 'id'>) => Promise<void>;
  updateLink: (id: number, data: Partial<Link>) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
  searchLinks: (query: string) => Link[];
}

export const useLinksStore = create<LinksState>((set, get) => ({
  links: [],
  linksByCategory: {},
  isLoading: false,

  fetchAllLinks: async () => {
    set({ isLoading: true });
    try {
      const links = await storage.getAllLinks();
      
      // Compute links by category map manually to ensure all categories from categorizer exist
      const linksByCategory: Record<string, Link[]> = {};
      
      // Initialize with empty arrays for all links categories
      for (const link of links) {
        if (!linksByCategory[link.category]) {
          linksByCategory[link.category] = [];
        }
        linksByCategory[link.category].push(link);
      }
      
      set({ links, linksByCategory, isLoading: false });
    } catch (e) {
      console.error('Failed to fetch links:', e);
      set({ isLoading: false });
    }
  },

  addLink: async (linkData) => {
    await storage.addLink(linkData);
    await get().fetchAllLinks();
  },

  updateLink: async (id, data) => {
    await storage.updateLink(id, data);
    await get().fetchAllLinks();
  },

  deleteLink: async (id) => {
    await storage.deleteLink(id);
    await get().fetchAllLinks();
  },

  searchLinks: (query) => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return get().links;
    return get().links.filter(
      (l) =>
        l.title.toLowerCase().includes(cleanQuery) ||
        l.domain.toLowerCase().includes(cleanQuery) ||
        l.url.toLowerCase().includes(cleanQuery)
    );
  },
}));
