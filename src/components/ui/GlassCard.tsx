import React from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false,
  onClick,
  style,
}) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={clsx(
        'glass rounded-2xl p-6 transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:shadow-xl cursor-pointer hover:border-white/35 dark:hover:border-white/15',
        className
      )}
    >
      {children}
    </div>
  );
};
export default GlassCard;
