import { create } from 'zustand';
import type { GridItem, LinkItem, FolderItem } from '../types/grid';
import { storage } from '../services/storage';

interface GridState {
  items: GridItem[];
  currentPage: number;
  isLoading: boolean;
  
  // Core Actions
  loadItems: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  addLink: (link: Omit<LinkItem, 'id' | 'type' | 'pageIndex' | 'gridIndex'>) => Promise<void>;
  addFolder: (title: string, links?: LinkItem[]) => Promise<string>;
  deleteItem: (id: string) => Promise<void>;
  updateItemTitle: (id: string, newTitle: string) => Promise<void>;
  
  // Drag-and-Drop & Folder Engine Mechanics
  moveItem: (activeId: string, overId: string) => Promise<void>;
  mergeLinksIntoFolder: (sourceLinkId: string, targetLinkId: string) => Promise<void>;
  addItemToFolder: (linkId: string, folderId: string) => Promise<void>;
  removeItemFromFolder: (folderId: string, linkId: string) => Promise<void>;
  reorderFolderChildren: (folderId: string, activeLinkId: string, overLinkId: string) => Promise<void>;
  deleteFolderSafely: (folderId: string) => Promise<void>;
  
  // Bulk setters
  setItems: (items: GridItem[]) => Promise<void>;
}

const ITEMS_PER_PAGE = 12;

function findNextAvailablePosition(items: GridItem[]): { pageIndex: number; gridIndex: number } {
  let page = 0;
  while (true) {
    const pageItems = items.filter((i) => i.pageIndex === page);
    if (pageItems.length < ITEMS_PER_PAGE) {
      const occupiedIndices = new Set(pageItems.map((i) => i.gridIndex));
      for (let idx = 0; idx < ITEMS_PER_PAGE; idx++) {
        if (!occupiedIndices.has(idx)) {
          return { pageIndex: page, gridIndex: idx };
        }
      }
    }
    page++;
  }
}

function reflowItems(items: GridItem[]): GridItem[] {
  const itemsByPage = new Map<number, GridItem[]>();
  for (const item of items) {
    if (!itemsByPage.has(item.pageIndex)) {
      itemsByPage.set(item.pageIndex, []);
    }
    itemsByPage.get(item.pageIndex)!.push(item);
  }

  const maxPage = Math.max(...itemsByPage.keys(), -1);
  const result: GridItem[] = [];

  for (let page = 0; page <= maxPage; page++) {
    const pageItems = itemsByPage.get(page) || [];
    const sortedItems = [...pageItems].sort((a, b) => a.gridIndex - b.gridIndex);
    
    for (let i = 0; i < sortedItems.length; i++) {
      result.push({
        ...sortedItems[i],
        pageIndex: page,
        gridIndex: i,
      });
    }
  }

  const lastPage = result.filter((i) => i.pageIndex === maxPage);
  if (lastPage.length === 0 && maxPage > 0) {
    return result.filter((i) => i.pageIndex < maxPage);
  }

  return result;
}

export const useGridStore = create<GridState>((set, get) => ({
  items: [],
  currentPage: 0,
  isLoading: true,

  loadItems: async () => {
    set({ isLoading: true });
    try {
      const items = await storage.getAllGridItems();
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: Math.max(0, page) });
  },

  setItems: async (items: GridItem[]) => {
    set({ items });
    await storage.saveAllGridItems(items);
  },

  addLink: async (linkData) => {
    const { items } = get();
    const { pageIndex, gridIndex } = findNextAvailablePosition(items);

    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      type: 'link',
      title: linkData.title || 'New Link',
      url: linkData.url,
      faviconUrl: linkData.faviconUrl || '',
      pageIndex,
      gridIndex,
    };

    const updated = [...items, newLink];
    set({ items: updated });
    await storage.saveAllGridItems(updated);
  },

  addFolder: async (title, initialLinks = []) => {
    const { items } = get();
    const { pageIndex, gridIndex } = findNextAvailablePosition(items);

    const newFolder: FolderItem = {
      id: crypto.randomUUID(),
      type: 'folder',
      title: title || 'New Folder',
      children: initialLinks,
      pageIndex,
      gridIndex,
    };

    const updated = [...items, newFolder];
    set({ items: updated });
    await storage.saveAllGridItems(updated);
    return newFolder.id;
  },

  deleteItem: async (id: string) => {
    const { items } = get();
    const target = items.find((i) => i.id === id);
    if (!target) return;

    if (target.type === 'folder') {
      await get().deleteFolderSafely(id);
      return;
    }

    const updated = items.filter((i) => i.id !== id);
    const reflowed = reflowItems(updated);
    set({ items: reflowed });
    await storage.saveAllGridItems(reflowed);
  },

  updateItemTitle: async (id: string, newTitle: string) => {
    const { items } = get();
    const updated = items.map((i) => (i.id === id ? { ...i, title: newTitle } : i));
    set({ items: updated });
    await storage.saveAllGridItems(updated);
  },

  // Move item using shift logic (not swap) - items shift to fill the gap
  moveItem: async (activeId: string, overId: string) => {
    const { items } = get();
    const activeItem = items.find((i) => i.id === activeId);
    const overItem = items.find((i) => i.id === overId);

    if (!activeItem || !overItem || activeId === overId) return;

    const activePage = activeItem.pageIndex;
    const activeGrid = activeItem.gridIndex;
    const overPage = overItem.pageIndex;
    const overGrid = overItem.gridIndex;

    // Convert to linear index across all pages
    const activeLinear = activePage * ITEMS_PER_PAGE + activeGrid;
    const overLinear = overPage * ITEMS_PER_PAGE + overGrid;

    // Create a flat array of all items sorted by their linear position
    const sortedItems = [...items].sort((a, b) => {
      const aLinear = a.pageIndex * ITEMS_PER_PAGE + a.gridIndex;
      const bLinear = b.pageIndex * ITEMS_PER_PAGE + b.gridIndex;
      return aLinear - bLinear;
    });

    // Find indices in the sorted array
    const fromIndex = sortedItems.findIndex((i) => i.id === activeId);
    const toIndex = sortedItems.findIndex((i) => i.id === overId);

    if (fromIndex === -1 || toIndex === -1) return;

    // Remove the active item and insert at target position (shift logic)
    const [movedItem] = sortedItems.splice(fromIndex, 1);
    sortedItems.splice(toIndex, 0, movedItem);

    // Reassign pageIndex and gridIndex based on new positions
    const updated = sortedItems.map((item, index) => ({
      ...item,
      pageIndex: Math.floor(index / ITEMS_PER_PAGE),
      gridIndex: index % ITEMS_PER_PAGE,
    }));

    set({ items: updated });
    await storage.saveAllGridItems(updated);
  },

  // Drag-to-Merge: Drop link A onto link B -> creates a new Folder containing A and B
  mergeLinksIntoFolder: async (sourceLinkId: string, targetLinkId: string) => {
    const { items } = get();
    const sourceLink = items.find((i) => i.id === sourceLinkId && i.type === 'link') as LinkItem | undefined;
    const targetLink = items.find((i) => i.id === targetLinkId && i.type === 'link') as LinkItem | undefined;

    if (!sourceLink || !targetLink || sourceLinkId === targetLinkId) return;

    // Create folder at target position
    const folderId = crypto.randomUUID()
    const newFolder: FolderItem = {
      id: folderId,
      type: 'folder',
      title: 'Folder' + folderId.slice(0,4),
      pageIndex: targetLink.pageIndex,
      gridIndex: targetLink.gridIndex,
      children: [targetLink, sourceLink],
    };

    // Remove source and target links from main grid, add new folder
    const updated = items
      .filter((i) => i.id !== sourceLinkId && i.id !== targetLinkId)
      .concat(newFolder);

    set({ items: updated });
    await storage.saveAllGridItems(updated);
  },

  // Add link into existing folder
  addItemToFolder: async (linkId: string, folderId: string) => {
    const { items } = get();
    const linkItem = items.find((i) => i.id === linkId && i.type === 'link') as LinkItem | undefined;
    const folderItem = items.find((i) => i.id === folderId && i.type === 'folder') as FolderItem | undefined;

    if (!linkItem || !folderItem) return;

    const updatedFolder: FolderItem = {
      ...folderItem,
      children: [...folderItem.children, linkItem],
    };

    const updated = items
      .filter((i) => i.id !== linkId)
      .map((i) => (i.id === folderId ? updatedFolder : i));

    const reflowed = reflowItems(updated);
    set({ items: reflowed });
    await storage.saveAllGridItems(reflowed);
  },

  // Remove link from folder and restore to main grid
  removeItemFromFolder: async (folderId: string, linkId: string) => {
    const { items } = get();
    const folderItem = items.find((i) => i.id === folderId && i.type === 'folder') as FolderItem | undefined;

    if (!folderItem) return;

    const removedLink = folderItem.children.find((c) => c.id === linkId);
    if (!removedLink) return;

    const remainingChildren = folderItem.children.filter((c) => c.id !== linkId);
    const { pageIndex, gridIndex } = findNextAvailablePosition(items);

    const restoredLink: LinkItem = {
      ...removedLink,
      pageIndex,
      gridIndex,
    };

    let updated: GridItem[];

    // If folder only has 1 item left, dissolve folder and restore the last remaining link to grid
    if (remainingChildren.length === 1) {
      const lastChild = remainingChildren[0];
      const restoredLastChild: LinkItem = {
        ...lastChild,
        pageIndex: folderItem.pageIndex,
        gridIndex: folderItem.gridIndex,
      };
      updated = items
        .filter((i) => i.id !== folderId)
        .concat([restoredLastChild, restoredLink]);
    } else {
      const updatedFolder: FolderItem = {
        ...folderItem,
        children: remainingChildren,
      };
      updated = items
        .map((i) => (i.id === folderId ? updatedFolder : i))
        .concat(restoredLink);
    }

    const reflowed = reflowItems(updated);
    set({ items: reflowed });
    await storage.saveAllGridItems(reflowed);
  },

  // Inner folder reordering
  reorderFolderChildren: async (folderId: string, activeLinkId: string, overLinkId: string) => {
    const { items } = get();
    const folderItem = items.find((i) => i.id === folderId && i.type === 'folder') as FolderItem | undefined;

    if (!folderItem || activeLinkId === overLinkId) return;

    const oldIndex = folderItem.children.findIndex((c) => c.id === activeLinkId);
    const newIndex = folderItem.children.findIndex((c) => c.id === overLinkId);

    if (oldIndex === -1 || newIndex === -1) return;

    const newChildren = [...folderItem.children];
    const [moved] = newChildren.splice(oldIndex, 1);
    newChildren.splice(newIndex, 0, moved);

    const updatedFolder: FolderItem = {
      ...folderItem,
      children: newChildren,
    };

    const updated = items.map((i) => (i.id === folderId ? updatedFolder : i));
    set({ items: updated });
    await storage.saveAllGridItems(updated);
  },

  // Safe folder deletion & un-nesting logic as defined in setup.md:
  // 1. Locate all children inside target FolderItem.
  // 2. Delete parent FolderItem from gridStore.
  // 3. Iterate through extracted children, assigning them to next available gridIndex (spill onto new page if 12 full).
  deleteFolderSafely: async (folderId: string) => {
    const { items } = get();
    const folder = items.find((i) => i.id === folderId && i.type === 'folder') as FolderItem | undefined;

    if (!folder) return;

    const childrenToRestore = folder.children;
    // Remove folder from items
    const currentGrid = items.filter((i) => i.id !== folderId);

    // Place each child in next available slot
    for (const child of childrenToRestore) {
      const pos = findNextAvailablePosition(currentGrid);
      const restoredLink: LinkItem = {
        ...child,
        pageIndex: pos.pageIndex,
        gridIndex: pos.gridIndex,
      };
      currentGrid.push(restoredLink);
    }

    const reflowed = reflowItems(currentGrid);
    set({ items: reflowed });
    await storage.saveAllGridItems(reflowed);
  },
}));
