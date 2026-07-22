export type ItemType = 'link' | 'folder';

export interface BaseItem {
  id: string;         // crypto.randomUUID()
  type: ItemType;
  title: string;
  pageIndex: number;  // 0-based index for carousel slide
  gridIndex: number;  // 0 to 11 (3x4 grid position)
}

export interface LinkItem extends BaseItem {
  type: 'link';
  url: string;
  faviconUrl: string;
}

export interface FolderItem extends BaseItem {
  type: 'folder';
  children: LinkItem[]; // Folders-within-folders intentionally disallowed
}

export type GridItem = LinkItem | FolderItem;
