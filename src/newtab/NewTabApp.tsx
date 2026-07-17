import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { QuoteSection } from '../components/QuoteSection';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { TodoWidget } from '../components/TodoWidget';
import { FAB } from '../components/FAB';
import { ToastContainer } from '../components/Toast';
import { AddLinkModal } from '../components/modals/AddLinkModal';
import { CategoryLinksModal } from '../components/modals/CategoryLinksModal';
import { useLinksStore } from '../store/linksStore';
import { useCategoriesStore } from '../store/categoriesStore';
import { useSettingsStore } from '../store/settingsStore';

export const NewTabApp: React.FC = () => {
  const { fetchAllLinks, linksByCategory } = useLinksStore();
  const { categories, refreshCategories } = useCategoriesStore();
  const { settings, loadSettings } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

  useEffect(() => {
    loadSettings();
    fetchAllLinks();
    refreshCategories();
  }, [loadSettings, fetchAllLinks, refreshCategories]);

  const openSettingsPage = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/src/pages/options/index.html', '_blank');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col pb-16">
      {/* Custom Wallpaper */}
      {settings.wallpaper && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: `url(${settings.wallpaper})` }}
        />
      )}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSettingsClick={openSettingsPage}
        leftSlot={<TodoWidget />}
      />

      {/* Quote Section */}
      <QuoteSection />

      {/* Categories Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6">
        <CategoriesGrid
          categories={categories}
          linksByCategory={linksByCategory}
          searchQuery={searchQuery}
          onCategoryClick={setActiveCategory}
        />
      </main>

      {/* Floating Action Button */}
      <FAB onClick={() => setIsAddLinkOpen(true)} />

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
      />

      {/* Category Links Modal */}
      {activeCategory && (
        <CategoryLinksModal
          isOpen={!!activeCategory}
          onClose={() => setActiveCategory(null)}
          categoryName={activeCategory}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default NewTabApp;
