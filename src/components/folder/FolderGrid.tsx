import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiGlobe, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { LinkItem, FolderItem } from '../../types/grid';
import { useGridStore } from '../../store/gridStore';
import { useSettingsStore } from '../../store/settingsStore';
import { FaGripVertical } from 'react-icons/fa';

interface FolderGridProps {
  folder: FolderItem;
}

const DraggableFolderLink: React.FC<{ link: LinkItem; folderId: string }> = ({ link, folderId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
    data: { item: link },
  });

  const { removeItemFromFolder } = useGridStore();
  const { settings } = useSettingsStore();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group flex flex-col items-center justify-center p-2 rounded-2xl glass-card cursor-pointer select-none w-[80px] h-[88px] touch-none transition-all hover:scale-105"
    >
      {/* Drag handle - separate from click target */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-opacity z-10"
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <FaGripVertical className="w-4 h-4" />
      </button>

      {/* Remove from folder button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeItemFromFolder(folderId, link.id);
        }}
        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 text-white bg-red-500 hover:bg-red-600 rounded-full shadow transition-opacity z-10"
        title="Remove from folder"
      >
        <FiX className="w-3 h-3" />
      </button>

      {/* Clickable area to open link - separate from drag handle */}
      <div
        onClick={() => window.open(link.url, '_blank')}
        className="w-full h-full flex flex-col items-center justify-center gap-1"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/70 shadow-sm border border-white/20 overflow-hidden">
          {link.faviconUrl ? (
            <img src={link.faviconUrl} alt="" className="w-6 h-6 object-contain" />
          ) : (
            <FiGlobe className="w-5 h-5 text-blue-500" />
          )}
        </div>

        {settings.showLinkName && (
          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200 text-center truncate max-w-full px-0.5">
            {link.title}
          </span>
        )}
      </div>
    </div>
  );
};

export const FolderGrid: React.FC<FolderGridProps> = ({ folder }) => {
  const { reorderFolderChildren } = useGridStore();
  const [folderPage, setFolderPage] = React.useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const FOLDER_PAGE_SIZE = 9; // 3x3 grid
  const totalFolderPages = Math.max(1, Math.ceil(folder.children.length / FOLDER_PAGE_SIZE));

  const visibleChildren = folder.children.slice(
    folderPage * FOLDER_PAGE_SIZE,
    (folderPage + 1) * FOLDER_PAGE_SIZE
  );

  const childIds = visibleChildren.map((c) => c.id);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    await reorderFolderChildren(folder.id, String(active.id), String(over.id));
  };

  return (
    <div className="flex flex-col items-center w-full relative">
      <div className="flex items-center justify-center w-full relative">
        {/* Previous Page Chevron Button */}
        {totalFolderPages > 1 && folderPage > 0 && (
          <button
            onClick={() => setFolderPage(folderPage - 1)}
            className="absolute -left-4 z-20 p-1.5 glass-button text-slate-700 dark:text-slate-200 rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Previous Folder Page"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={childIds} strategy={rectSortingStrategy}>
            {/* Strict 3x3 Grid View */}
            <div className="grid grid-cols-3 grid-rows-3 gap-3 justify-items-center items-center w-full max-w-[280px] aspect-square p-2">
              {visibleChildren.map((child) => (
                <DraggableFolderLink key={child.id} link={child} folderId={folder.id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Next Page Chevron Button */}
        {totalFolderPages > 1 && folderPage < totalFolderPages - 1 && (
          <button
            onClick={() => setFolderPage(folderPage + 1)}
            className="absolute -right-4 z-20 p-1.5 glass-button text-slate-700 dark:text-slate-200 rounded-full shadow-lg hover:scale-110 transition-transform"
            title="Next Folder Page"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Folder Pagination Dots Indicator */}
      {totalFolderPages > 1 && (
        <div className="flex items-center gap-1.5 mt-3">
          {Array.from({ length: totalFolderPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setFolderPage(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === folderPage ? 'w-4 bg-purple-500 shadow-sm' : 'w-1.5 bg-slate-400/40 hover:bg-slate-400'
              }`}
              title={`Page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
