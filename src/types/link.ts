export interface Link {
  id?: number;
  url: string;
  title: string;
  domain: string;
  timestamp: number;
  icon?: string;
  description?: string;
  folderId: number | null;
  x: number;
  y: number;
  w: number;
  h: number;
}
