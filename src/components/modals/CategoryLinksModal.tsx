import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { LinkItem } from '../LinkItem';
import { EditLinkModal } from './EditLinkModal';
import { useLinksStore } from '../../store/linksStore';
import { useToastStore } from '../../store/toastStore';
import type { Link } from '../../types/link';

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
  const { linksByCategory, deleteLink } = useLinksStore();
  const { showToast } = useToastStore();

  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const links = linksByCategory[categoryName] || [];
  const displayName = categoryName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteLink(id);
        showToast('Link deleted successfully', 'success');
      } catch (e: any) {
        showToast(e.message || 'Failed to delete link', 'error');
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !editingLink}
        onClose={onClose}
        title={`${displayName} Links`}
      >
        <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {links.length > 0 ? (
            links.map((link) => (
              <LinkItem
                key={link.id}
                link={link}
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
