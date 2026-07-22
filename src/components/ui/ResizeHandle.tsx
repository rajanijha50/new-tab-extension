import React, { useCallback } from 'react';

interface ResizeHandleProps {
  initialWidth: number;
  initialHeight: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize: (width: number, height: number) => void;
  onResizeEnd: (width: number, height: number) => void;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  initialWidth,
  initialHeight,
  minWidth = 72,
  minHeight = 72,
  maxWidth = 280,
  maxHeight = 280,
  onResize,
  onResizeEnd,
  className = '',
}) => {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = initialWidth;
      const startHeight = initialHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + moveEvent.clientX - startX));
        const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + moveEvent.clientY - startY));
        onResize(newWidth, newHeight);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        const finalWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + upEvent.clientX - startX));
        const finalHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + upEvent.clientY - startY));
        onResizeEnd(finalWidth, finalHeight);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [initialWidth, initialHeight, minWidth, minHeight, maxWidth, maxHeight, onResize, onResizeEnd]
  );

  return (
    <div
      className={className}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        cursor: 'se-resize',
        background: 'linear-gradient(135deg, transparent 50%, currentColor 50%)',
        color: 'currentColor',
        opacity: 0.5,
        borderRadius: '0 0 16px 0',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 2,
      }}
      title="Resize folder"
      aria-label="Resize folder"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5" style={{ transform: 'rotate(45deg)' }}>
        <path d="M19 5l-7 7-7 7" />
      </svg>
    </div>
  );
};

export default ResizeHandle;