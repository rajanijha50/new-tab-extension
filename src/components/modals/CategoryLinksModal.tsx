import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { LinkItem } from '../LinkItem';
import { EditLinkModal } from './EditLinkModal';
import { useLinksStore } from '../../store/linksStore';
import { useCategoriesStore } from '../../store/categoriesStore';
import { useToastStore } from '../../store/toastStore';
import { IconRenderer } from '../ui/IconRenderer';
import type { Link } from '../../types/link';
import clsx from 'clsx';

interface CategoryLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
}

export const CategoryLinksModal: React.FC<CategoryLinksModalProps> = ({
  isOpen,
  onClose,
  categoryName,
}) => {
  const { linksByCategory, updateLink, deleteLink } = useLinksStore();
  const { categories } = useCategoriesStore();
  const { showToast } = useToastStore();

  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);
  const [draggedLink, setDraggedLink] = useState<Link | null>(null);

  const links = linksByCategory[categoryName] || [];

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, link: Link) => {
    e.dataTransfer.setData('text/plain', String(link.id));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLink(link);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, catName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (catName !== categoryName) {
      setActiveDropTarget(catName);
    }
  }, [categoryName]);

  const handleDragLeave = useCallback(() => {
    setActiveDropTarget(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, targetCategory: string) => {
    e.preventDefault();
    setActiveDropTarget(null);
    setDraggedLink(null);

    const linkId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(linkId) || targetCategory === categoryName) return;

    try {
      await updateLink(linkId, { category: targetCategory });
      const displayName = targetCategory
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      showToast(`Link moved to ${displayName}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to move link', 'error');
    }
  }, [categoryName, updateLink, showToast]);

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteLink(id);
        showToast('Link deleted successfully', 'success');
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed to delete link', 'error');
      }
    }
  };

  const categoryEntries = Object.entries(categories);
  const currentDisplayName = categoryName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <>
      <Modal
        isOpen={isOpen && !editingLink}
        onClose={onClose}
        title={`${currentDisplayName} Links`}
      >
        <div className="flex gap-4 min-h-[45vh]">
          {/* Category sidebar for drop targets */}
          <div className="w-44 shrink-0 border-r border-white/10 dark:border-white/8 pr-3 overflow-y-auto scrollbar-thin">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
              Move to...
            </p>
            <div className="flex flex-col gap-1">
              {categoryEntries.map(([catName, catData]) => {
                const catLinks = linksByCategory[catName] || [];
                const isCurrent = catName === categoryName;
                const isDropTarget = activeDropTarget === catName;
                const catDisplayName = catName
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ');

                return (
                  <div
                    key={catName}
                    onDragOver={(e) => handleDragOver(e, catName)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, catName)}
                    className={clsx(
                      'flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 text-sm',
                      isCurrent
                        ? 'bg-accent-primary/15 text-accent-primary font-semibold'
                        : isDropTarget
                          ? 'bg-accent-secondary/20 border border-accent-secondary/40 text-accent-secondary scale-[1.02]'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5',
                      !isCurrent && draggedLink && 'cursor-copy'
                    )}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs shrink-0"
                      style={{ backgroundColor: catData.color }}
                    >
                      <IconRenderer name={catData.icon} />
                    </div>
                    <span className="truncate flex-1 text-xs">{catDisplayName}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{catLinks.length}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Links list */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
            {links.length > 0 ? (
              links.map((link) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  draggable
                  onDragStart={handleDragStart}
                  onEdit={() => setEditingLink(link)}
                  onDelete={() => handleDelete(link.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 italic text-gray-400 dark:text-gray-500">
                No links in this category.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {editingLink && (
        <EditLinkModal
          isOpen={!!editingLink}
          onClose={() => setEditingLink(null)}
          link={editingLink}
        />
      )}
    </>
  );
};

export default CategoryLinksModal;
