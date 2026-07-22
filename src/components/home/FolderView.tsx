import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { Folder } from '../../types/folder';
import type { Link } from '../../types/link';
import { GridLink } from './GridLink';
import { ContextMenu } from '../ui/ContextMenu';
import { MdClose } from 'react-icons/md';

interface FolderViewProps {
  folder: Folder;
  links: Link[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditLink: (link: Link) => void;
  onDeleteLink: (id: number) => void;
  onOpenLink: (url: string) => void;
  showLinkNames: boolean;
}

interface FolderViewRef {
  scrollToLink: (linkId: number) => void;
}

export const FolderView = forwardRef<FolderViewRef, FolderViewProps>(
  ({
    folder,
    links,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onEditLink,
    onDeleteLink,
    onOpenLink,
    showLinkNames,
  }, ref) => {
    const [showContextMenu, setShowContextMenu] = useState<{ type: 'link' | 'folder'; item: Link | Folder; x: number; y: number } | null>(null);
    const [showLinkMenu, setShowLinkMenu] = useState<{ link: Link; x: number; y: number } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const folderViewRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToLink: (linkId: number) => {
        if (scrollContainerRef.current) {
          const linkElement = scrollContainerRef.current.querySelector(`[data-link-id="${linkId}"]`);
          if (linkElement) {
            linkElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      },
    }));

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [onClose]);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (folderViewRef.current && !folderViewRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const folderContextMenuItems = [
      {
        label: 'Close Folder',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ),
        onClick: onClose,
      },
      {
        label: 'Edit Folder',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        ),
        onClick: onEdit,
      },
      {
        label: 'Delete Folder',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        ),
        onClick: onDelete,
        danger: true,
      },
    ];

    const handleFolderContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowContextMenu({ type: 'folder', item: folder, x: e.clientX, y: e.clientY });
    };

    return (
      <div
        ref={folderViewRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
        onContextMenu={handleFolderContextMenu}
      >
        <div
          className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[3px]"
          onClick={onClose}
        />

        <div
          className="relative w-full max-w-[520px] glass rounded-3xl shadow-2xl border border-white/20 dark:border-white/8 animate-scale-in overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b border-white/10 dark:border-white/8 bg-white/5 dark:bg-white/5 sticky top-0 z-10"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: folder.color + '22', color: folder.color }}
              >
                {folder.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold truncate">{folder.name}</h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{links.length} link{links.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 text-gray-400 hover:text-current transition-colors cursor-pointer"
                title="Close"
              >
                <MdClose className="text-base" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {links.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="text-center">
                  <div className="text-4xl mb-3 opacity-50">📁</div>
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">This folder is empty</p>
                  <p className="text-xs text-gray-400/60 dark:text-gray-500/60 mt-1">Drag links here from the home screen</p>
                </div>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 scrollbar-thumb-hover-white/30 -mx-4 px-4"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                <div
                  className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-3 min-w-max"
                  style={{ gridAutoFlow: 'column', gridAutoColumns: '72px' }}
                >
                  {links.map((link) => (
                    <div
                      key={link.id}
                      data-link-id={link.id}
                      className="scroll-snap-center flex flex-col items-center"
                    >
                      <GridLink
                        link={link}
                        showName={showLinkNames}
                        onOpen={() => onOpenLink(link.url)}
                        onEdit={() => onEditLink(link)}
                        onDelete={() => onDeleteLink(link.id!)}
                        onDragStart={() => {}}
                        onDropOnItem={() => {}}
                        folderId={folder.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showLinkMenu && (
          <ContextMenu
            isOpen={true}
            x={showLinkMenu.x}
            y={showLinkMenu.y}
            items={[
              {
                label: 'Open',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                ),
                onClick: () => onOpenLink(showLinkMenu.link.url),
              },
              {
                label: 'Move to Home',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <path d="M12 15v4" />
                  </svg>
                ),
                onClick: () => onEditLink(showLinkMenu.link),
              },
              {
                label: 'Edit',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ),
                onClick: () => onEditLink(showLinkMenu.link),
              },
              {
                label: 'Delete',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                ),
                onClick: () => onDeleteLink(showLinkMenu.link.id!),
                danger: true,
              },
            ]}
            onClose={() => setShowLinkMenu(null)}
          />
        )}

        {showContextMenu && showContextMenu.type === 'folder' && (
          <ContextMenu
            isOpen={true}
            x={showContextMenu.x}
            y={showContextMenu.y}
            items={folderContextMenuItems}
            onClose={() => setShowContextMenu(null)}
          />
        )}
      </div>
    );
  }
);

FolderView.displayName = 'FolderView';
export default FolderView;