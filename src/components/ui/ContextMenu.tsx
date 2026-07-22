import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

interface ContextMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed glass rounded-xl py-1.5 px-1 min-w-[140px] shadow-2xl border border-white/10 dark:border-white/5 animate-scale-in z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
      }}
      role="menu"
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          className={clsx(
            'flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer',
            item.danger
              ? 'text-accent-danger hover:bg-accent-danger/10 dark:hover:bg-accent-danger/10'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/15 dark:hover:bg-white/10',
            item.disabled && 'opacity-40 cursor-not-allowed'
          )}
          role="menuitem"
        >
          <span className="flex-shrink-0" style={{ width: 18, height: 18 }}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;