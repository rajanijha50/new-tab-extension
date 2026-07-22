import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { GridItem, FolderItem } from '../../types/grid';
import { useGridStore } from '../../store/gridStore';
import { GridPage } from './GridPage';
import { GridLinkItem } from './GridLinkItem';
import { GridFolderItem } from './GridFolderItem';

interface GridContainerProps {
  onOpenFolder: (folder: FolderItem) => void;
}

const MERGE_RADIUS_PX = 30; // Defined inner center distance radius threshold in pixels

export const GridContainer: React.FC<GridContainerProps> = ({ onOpenFolder }) => {
  const { items, currentPage, setCurrentPage, moveItem, mergeLinksIntoFolder, addItemToFolder } = useGridStore();
  const [activeItem, setActiveItem] = useState<GridItem | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const totalPages = Math.max(1, Math.max(...items.map((i) => i.pageIndex), 0) + 1);
  const itemsOnCurrentPage = items.filter((i) => i.pageIndex === currentPage);
  const itemIdsOnCurrentPage = itemsOnCurrentPage.map((i) => i.id);

  const calculateCenterDistance = (
    activeRect: { left: number; top: number; width: number; height: number },
    overRect: { left: number; top: number; width: number; height: number }
  ) => {
    const activeCenter = {
      x: activeRect.left + activeRect.width / 2,
      y: activeRect.top + activeRect.height / 2,
    };
    const overCenter = {
      x: overRect.left + overRect.width / 2,
      y: overRect.top + overRect.height / 2,
    };
    return Math.hypot(activeCenter.x - overCenter.x, activeCenter.y - overCenter.y);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find((i) => i.id === String(event.active.id));
    if (item) setActiveItem(item);
    setMergeTargetId(null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setMergeTargetId(null);
      return;
    }

    const sourceItem = items.find((i) => i.id === String(active.id));
    const targetItem = items.find((i) => i.id === String(over.id));

    if (!sourceItem || !targetItem || sourceItem.type !== 'link') {
      setMergeTargetId(null);
      return;
    }

    const activeNode = active.rect.current.translated;
    const overNode = over.rect;

    if (activeNode && overNode) {
      const distance = calculateCenterDistance(activeNode, overNode);
      if (distance <= MERGE_RADIUS_PX) {
        setMergeTargetId(targetItem.id);
        return;
      }
    }
    setMergeTargetId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const currentMergeTargetId = mergeTargetId;

    setActiveItem(null);
    setMergeTargetId(null);

    if (!over || active.id === over.id) return;

    const sourceId = String(active.id);
    const targetId = String(over.id);

    const sourceItem = items.find((i) => i.id === sourceId);
    const targetItem = items.find((i) => i.id === targetId);

    if (!sourceItem || !targetItem) return;

    // Check if drop location was within the defined inner center radius
    const activeNode = active.rect.current.translated;
    const overNode = over.rect;
    let isWithinRadius = false;

    if (activeNode && overNode) {
      const distance = calculateCenterDistance(activeNode, overNode);
      if (distance <= MERGE_RADIUS_PX) {
        isWithinRadius = true;
      }
    }

    // Also accept if currentMergeTargetId matched targetId right before release
    if (isWithinRadius || currentMergeTargetId === targetId) {
      if (sourceItem.type === 'link' && targetItem.type === 'link') {
        await mergeLinksIntoFolder(sourceId, targetId);
        return;
      }

      if (sourceItem.type === 'link' && targetItem.type === 'folder') {
        await addItemToFolder(sourceId, targetId);
        return;
      }
    }

    // Otherwise outside radius: perform slot location swap!
    await moveItem(sourceId, targetId);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIdsOnCurrentPage} strategy={rectSortingStrategy}>
          {/* Main 3x4 Paged Carousel */}
          <div className="w-full flex items-center justify-center relative min-h-95">
            {/* Carousel Prev Button */}
            {currentPage > 0 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="absolute left-1/5 z-20 p-2 glass-button text-slate-700 dark:text-slate-200 rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Previous Page"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Current Page 3x4 Grid */}
            <GridPage
              pageIndex={currentPage}
              items={itemsOnCurrentPage}
              mergeTargetId={mergeTargetId}
              onOpenFolder={onOpenFolder}
            />

            {/* Carousel Next Button */}
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="absolute right-1/5 z-20 p-2 glass-button text-slate-700 dark:text-slate-200 rounded-full shadow-lg hover:scale-110 transition-transform"
                title="Next Page"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </SortableContext>

        {/* Drag Overlay preview */}
        <DragOverlay>
          {activeItem ? (
            activeItem.type === 'link' ? (
              <GridLinkItem link={activeItem} />
            ) : (
              <GridFolderItem folder={activeItem} onOpenFolder={() => {}} />
            )
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Carousel Page Dots Indicator */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentPage
                  ? 'w-6 bg-blue-500 shadow-md'
                  : 'w-2 bg-slate-400/40 dark:bg-slate-600/40 hover:bg-slate-400/70'
              }`}
              title={`Page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
