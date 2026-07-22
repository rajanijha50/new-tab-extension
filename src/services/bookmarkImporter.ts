import type { GridItem, LinkItem, FolderItem } from '../types/grid';

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

export async function requestBookmarkPermission(): Promise<boolean> {
  if (typeof chrome !== 'undefined' && chrome.permissions) {
    const hasPermission = await new Promise<boolean>((resolve) => {
      chrome.permissions.contains({ permissions: ['bookmarks'] }, (granted) => {
        resolve(!!granted);
      });
    });

    if (hasPermission) return true;

    // Prompt user for permission
    return new Promise<boolean>((resolve) => {
      chrome.permissions.request({ permissions: ['bookmarks'] }, (granted) => {
        resolve(!!granted);
      });
    });
  }
  return false;
}

export async function getBrowserBookmarks(): Promise<BookmarkNode[]> {
  if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getTree) {
    const granted = await requestBookmarkPermission();
    if (!granted) {
      throw new Error('Permission to access browser bookmarks was denied by user.');
    }

    return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree((tree) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve((tree as unknown as BookmarkNode[]) || []);
        }
      });
    });
  }
  throw new Error('Browser bookmarks API is not supported in this browser context.');
}

export function convertBookmarksToGridItems(bookmarkNodes: BookmarkNode[]): GridItem[] {
  const gridItems: GridItem[] = [];
  let currentPage = 0;
  let currentGridIdx = 0;

  const advancePosition = () => {
    currentGridIdx++;
    if (currentGridIdx >= 12) {
      currentGridIdx = 0;
      currentPage++;
    }
  };

  const processNode = (node: BookmarkNode) => {
    // If folder with children
    if (node.children && node.children.length > 0) {
      // If root bookmark bar container, iterate over its children instead of creating a top-level root folder
      if (node.id === '0' || node.id === '1' || node.title === 'Bookmarks Bar' || node.title === 'Other Bookmarks') {
        for (const child of node.children) {
          processNode(child);
        }
        return;
      }

      // Collect nested links for folder
      const folderChildren: LinkItem[] = [];
      for (const child of node.children) {
        if (child.url) {
          let domain = '';
          try {
            domain = new URL(child.url).hostname.replace(/^www\./i, '');
          } catch {
            domain = child.url;
          }
          folderChildren.push({
            id: crypto.randomUUID(),
            type: 'link',
            title: child.title || domain || 'Link',
            url: child.url,
            faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
            pageIndex: 0,
            gridIndex: 0,
          });
        }
      }

      if (folderChildren.length > 0) {
        const folderItem: FolderItem = {
          id: crypto.randomUUID(),
          type: 'folder',
          title: node.title || 'Bookmarks Folder',
          children: folderChildren,
          pageIndex: currentPage,
          gridIndex: currentGridIdx,
        };
        gridItems.push(folderItem);
        advancePosition();
      }
    } else if (node.url) {
      // Loose link
      let domain = '';
      try {
        domain = new URL(node.url).hostname.replace(/^www\./i, '');
      } catch {
        domain = node.url;
      }

      const linkItem: LinkItem = {
        id: crypto.randomUUID(),
        type: 'link',
        title: node.title || domain || 'Link',
        url: node.url,
        faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
        pageIndex: currentPage,
        gridIndex: currentGridIdx,
      };
      gridItems.push(linkItem);
      advancePosition();
    }
  };

  for (const rootNode of bookmarkNodes) {
    processNode(rootNode);
  }

  return gridItems;
}
