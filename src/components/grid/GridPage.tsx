import React from 'react';
import type { GridItem, FolderItem } from '../../types/grid';
import { GridLinkItem } from './GridLinkItem';
import { GridFolderItem } from './GridFolderItem';

interface GridPageProps {
  pageIndex: number;
  items: GridItem[];
  mergeTargetId?: string | null;
  onOpenFolder: (folder: FolderItem) => void;
}

export const GridPage: React.FC<GridPageProps> = ({ items, mergeTargetId, onOpenFolder }) => {
  const sortedItems = [...items].sort((a, b) => a.gridIndex - b.gridIndex);

  return (
    <div className="grid grid-cols-4 grid-rows-3 gap-4 sm:gap-6 justify-items-center items-center w-full max-w-92 sm:max-w-98 aspect-4/3 p-4">
      {sortedItems.map((item) =>
        item.type === 'link' ? (
          <GridLinkItem key={item.id} link={item} isMergeTarget={mergeTargetId === item.id} />
        ) : (
          <GridFolderItem
            key={item.id}
            folder={item}
            onOpenFolder={onOpenFolder}
            isMergeTarget={mergeTargetId === item.id}
          />
        )
      )}
    </div>
  );
};
