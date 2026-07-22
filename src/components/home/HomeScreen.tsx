import React, { useState, useCallback, useRef } from 'react';
import type { Link } from '../../types/link';
import type { Folder } from '../../types/folder';
import { GridLink } from './GridLink';
import { GridFolder } from './GridFolder';
import { FolderView } from './FolderView';
import { EditLinkModal } from '../modals/EditLinkModal';
import { EditFolderModal } from '../modals/EditFolderModal';
import { AddLinkModal } from '../modals/AddLinkModal';
import { useLinksStore } from '../../store/linksStore';
import { useFoldersStore } from '../../store/foldersStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useToastStore } from '../../store/toastStore';
import { categorizer } from '../../services/categorizer';

interface HomeScreenProps {
  searchQuery: string;
  isAddLinkOpen: boolean;
  onAddLinkClose: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  searchQuery,
  isAddLinkOpen,
  onAddLinkClose,
}) => {
  const { links, homeLinks, updateLink, deleteLink } = useLinksStore();
  const { folders, deleteFolder } = useFoldersStore();
  const { settings } = useSettingsStore();
  const { showToast } = useToastStore();

  const [openFolder, setOpenFolder] = useState<Folder | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const folderViewRef = useRef<React.ElementRef<typeof FolderView>>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const cleanQuery = searchQuery.toLowerCase().trim();

  const filteredHomeLinks = cleanQuery
    ? homeLinks.filter(
        (l) =>
          l.title.toLowerCase().includes(cleanQuery) ||
          l.domain.toLowerCase().includes(cleanQuery) ||
          l.url.toLowerCase().includes(cleanQuery)
      )
    : homeLinks;

  const sortedHomeLinks = [...filteredHomeLinks].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  const sortedFolders = [...folders].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  const handleDragStartLink = useCallback((e: React.DragEvent, linkId: number) => {
    e.dataTransfer.setData('text/plain', String(linkId));
    e.dataTransfer.setData('application/x-type', 'link');
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragStartFolder = useCallback((e: React.DragEvent, folderId: number) => {
    e.dataTransfer.setData('text/plain', String(folderId));
    e.dataTransfer.setData('application/x-type', 'folder');
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDropOnLink = useCallback(async (draggedId: number, targetId: number) => {
    const draggedLink = links.find((l) => l.id === draggedId);
    const targetLink = links.find((l) => l.id === targetId);
    if (!draggedLink || !targetLink) return;

    const folderName = draggedLink.domain || 'New Folder';
    const folderColor = categorizer.getCategoryInfo(draggedLink.domain).color || '#3b82f6';

    try {
      const folderId = await useFoldersStore.getState().addFolder({
        name: folderName,
        icon: 'MdFolder',
        color: folderColor,
        timestamp: Date.now(),
        x: targetLink.x,
        y: targetLink.y,
        w: 1,
        h: 1,
      });

      await updateLink(draggedId, { folderId, x: 0, y: 0 });
      await updateLink(targetId, { folderId, x: 0, y: 0 });

      showToast('Folder created!', 'success');
    } catch (err) {
      showToast('Failed to create folder', 'error');
    }
  }, [links, updateLink, showToast]);

  const handleDropOnFolder = useCallback(async (draggedId: number, folderId: number) => {
    try {
      await updateLink(draggedId, { folderId });
      showToast('Link moved to folder', 'success');
    } catch {
      showToast('Failed to move link', 'error');
    }
  }, [updateLink, showToast]);

  const handleDeleteLink = async (id: number) => {
    if (window.confirm('Delete this link?')) {
      await deleteLink(id);
      showToast('Link deleted', 'success');
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (window.confirm('Delete this folder? Links inside will be moved to the home screen.')) {
      await deleteFolder(id);
      setOpenFolder(null);
      showToast('Folder deleted', 'info');
    }
  };

  const handleLinkOpen = (url: string) => {
    window.open(url, '_blank');
  };

  const folderLinks = openFolder
    ? links.filter((l) => l.folderId === openFolder.id)
    : [];

  const handleFolderResize = useCallback(async (folderId: number, w: number, h: number) => {
    await useFoldersStore.getState().updateFolder(folderId, { w, h });
  }, []);

  return (
    <>
      <div
        ref={gridContainerRef}
        className="home-grid w-full max-w-[520px] mx-auto px-4 py-6"
      >
        {sortedFolders.map((folder) => {
          const folderLinksList = links.filter((l) => l.folderId === folder.id);

          return (
            <GridFolder
              key={`folder-${folder.id}`}
              folder={folder}
              links={folderLinksList}
              onClick={() => setOpenFolder(folder)}
              onEdit={() => setEditingFolder(folder)}
              onDelete={() => handleDeleteFolder(folder.id!)}
              onDragStart={handleDragStartFolder}
              onDropOnFolder={handleDropOnFolder}
              onResize={handleFolderResize}
              isOpen={openFolder?.id === folder.id}
            />
          );
        })}

        {sortedHomeLinks.map((link) => (
          <GridLink
            key={`link-${link.id}`}
            link={link}
            showName={settings.showLinkName}
            onOpen={() => handleLinkOpen(link.url)}
            onEdit={() => setEditingLink(link)}
            onDelete={() => handleDeleteLink(link.id!)}
            onDragStart={handleDragStartLink}
            onDropOnItem={handleDropOnLink}
            folderId={link.folderId}
          />
        ))}
      </div>

      {sortedHomeLinks.length === 0 && sortedFolders.length === 0 && !cleanQuery && (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-5xl mb-4">+</div>
          <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">Your home screen is empty</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tap the + button to add your first link</p>
        </div>
      )}

      {cleanQuery && sortedHomeLinks.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <p className="text-sm text-gray-400 dark:text-gray-500">No links match "{searchQuery}"</p>
        </div>
      )}

      {openFolder && (
        <FolderView
          ref={folderViewRef}
          folder={openFolder}
          links={folderLinks}
          isOpen={true}
          onClose={() => setOpenFolder(null)}
          onEdit={() => setEditingFolder(openFolder)}
          onDelete={() => handleDeleteFolder(openFolder.id!)}
          onEditLink={(link) => setEditingLink(link)}
          onDeleteLink={handleDeleteLink}
          onOpenLink={handleLinkOpen}
          showLinkNames={settings.showLinkName}
        />
      )}

      {editingLink && (
        <EditLinkModal
          isOpen={true}
          onClose={() => setEditingLink(null)}
          link={editingLink}
        />
      )}

      {editingFolder && (
        <EditFolderModal
          isOpen={true}
          onClose={() => setEditingFolder(null)}
          folder={editingFolder}
        />
      )}

      {isAddLinkOpen && (
        <AddLinkModal
          isOpen={isAddLinkOpen}
          onClose={onAddLinkClose}
        />
      )}
    </>
  );
};

export default HomeScreen;