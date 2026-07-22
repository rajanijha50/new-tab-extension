import React from 'react';
import { Modal } from '../ui/Modal';

interface CategoryLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export const CategoryLinksModal: React.FC<CategoryLinksModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Category">
      <p className="text-sm text-gray-400">This category view is no longer used.</p>
    </Modal>
  );
};

export default CategoryLinksModal;
