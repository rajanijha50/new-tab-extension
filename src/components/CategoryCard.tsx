import React from 'react';
import type { CategoryData } from '../types/category';
import type { Link } from '../types/link';
import { GlassCard } from './ui/GlassCard';
import { IconRenderer } from './ui/IconRenderer';
import LinkFormatter from '../services/formatter';

interface CategoryCardProps {
  name: string;
  info: CategoryData;
  links: Link[];
  onClick: () => void;
  index: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  info,
  links = [],
  onClick,
  index,
}) => {
  const previewLinks = links.slice(0, 3);
  const remainingCount = links.length - 3;

  const displayName = name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <GlassCard
      onClick={onClick}
      hover
      className="flex flex-col h-full transition-all duration-300 transform opacity-0 animate-slide-up"
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md shadow-black/10 bg-white/20"
            // style={{ backgroundColor: info.color }}
          >
            <IconRenderer name={info.icon} />
          </div>
          <h3 className="font-bold text-base text-gray-800 dark:text-gray-100 tracking-wide truncate max-w-35">
            {displayName}
          </h3>
        </div>
        
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 dark:bg-white/5 border border-white/10 text-gray-600 dark:text-gray-400"
        >
          {links.length}
        </span>
      </div>

      {/* Links Preview */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        {previewLinks.length > 0 ? (
          previewLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs py-2 px-3 rounded-lg bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 truncate hover:text-accent-primary dark:hover:text-accent-primary transition-all duration-150 flex items-center justify-between border border-white/5"
            >
              <img src={`${link.url}/favicon.ico`} alt={link.title} className="w-4 h-4 mr-2" />
              {/* <span className="truncate mr-2 font-medium">{link.title || link.domain}</span> */}
              <span className="truncate mr-2 font-medium">{LinkFormatter.getTitleFromUrl(link.url)}</span>
              {/* <span className="text-[9px] text-gray-400 dark:text-gray-500 truncate max-w-[40%] font-mono">
                {link.domain}
              </span> */}
            </a>
          ))
        ) : (
          <div className="text-xs italic text-gray-400 dark:text-gray-500 py-3 text-center">
            No links added
          </div>
        )}

        {remainingCount > 0 && (
          <div className="text-[10px] font-bold text-accent-primary hover:underline mt-1 text-right">
            +{remainingCount} more
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default CategoryCard;
