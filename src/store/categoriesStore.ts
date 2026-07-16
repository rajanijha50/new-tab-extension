import { create } from 'zustand';
import type { CategoryMap } from '../types/category';
import { categorizer } from '../services/categorizer';

interface CategoriesState {
  categories: CategoryMap;
  addCustomCategory: (name: string, icon: string, color: string) => void;
  deleteCustomCategory: (key: string) => void;
  refreshCategories: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: categorizer.getAllCategories(),

  addCustomCategory: (name, icon, color) => {
    categorizer.addCustomCategory(name, icon, color);
    set({ categories: categorizer.getAllCategories() });
  },

  deleteCustomCategory: (key) => {
    categorizer.deleteCustomCategory(key);
    set({ categories: categorizer.getAllCategories() });
  },

  refreshCategories: () => {
    set({ categories: categorizer.getAllCategories() });
  },
}));
