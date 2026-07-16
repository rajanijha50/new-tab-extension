import React from 'react';
import type { CategoryMap } from '../types/category';
import type { Link } from '../types/link';
import { CategoryCard } from './CategoryCard';

interface CategoriesGridProps {
  categories: CategoryMap;
  linksByCategory: Record<string, Link[]>;
  searchQuery: string;
  onCategoryClick: (categoryName: string) => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  linksByCategory,
  searchQuery,
  onCategoryClick,
}) => {
  const cleanQuery = searchQuery.toLowerCase().trim();
  const categoryEntries = Object.entries(categories);

  const items = categoryEntries.map(([name, data]) => {
    const allLinks = linksByCategory[name] || [];
    const filteredLinks = cleanQuery
      ? allLinks.filter(
          (l) =>
            l.title.toLowerCase().includes(cleanQuery) ||
            l.domain.toLowerCase().includes(cleanQuery) ||
            l.url.toLowerCase().includes(cleanQuery) ||
            name.toLowerCase().includes(cleanQuery)
        )
      : allLinks;

    return {
      name,
      data,
      links: filteredLinks,
    };
  });

  const visibleItems = cleanQuery
    ? items.filter((item) => item.links.length > 0)
    : items;

  if (visibleItems.length === 0) {
    return (
      <div className="w-full text-center py-16 animate-in fade-in duration-300">
        <p className="text-lg text-gray-400 dark:text-gray-500 font-medium">
          No matching links or categories found
        </p>
        {cleanQuery && (
          <p className="text-xs text-gray-500 mt-1">
            Try a different search term or add a new link
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-4 max-w-7xl mx-auto">
      {visibleItems.map((item, index) => (
        <div key={item.name} className="h-full">
          <CategoryCard
            name={item.name}
            info={item.data}
            links={item.links}
            onClick={() => onCategoryClick(item.name)}
            index={index}
          />
        </div>
      ))}
    </div>
  );
};

export default CategoriesGrid;
