# New Tab Dashboard — React + Vite + TypeScript Rebuild Setup

## 📌 Project Goal

Rebuild the **New Tab Dashboard** browser extension from scratch using a modern frontend stack. The original was hand-crafted with plain HTML, CSS, and vanilla JavaScript. This rebuild produces a fully equivalent, polished, and maintainable extension using:

- **React 18** — component-driven UI
- **Vite** — blazing-fast build tool with CRXJS plugin for extension packaging
- **TypeScript** — full type safety across all services, components, and extension APIs
- **Tailwind CSS v3** — utility-first styling (glassmorphism effects via custom Tailwind classes)
- **react-icons** — icon library replacing emoji icons throughout the UI

---

## 🎯 What It Does

A cross-browser **New Tab page replacement** extension (Chrome, Brave, Edge, Firefox, Opera). When the user opens a new tab, instead of the default blank page they see a beautiful glassmorphic dashboard featuring:

1. **Inspirational Quote** — fetched from an external API with a refresh button
2. **Category Grid** — links organized into auto-detected and custom categories, displayed as glassmorphic cards
3. **Search Bar** — live-filters all links by title/domain/URL
4. **Floating Action Button (FAB)** — opens a modal to add a new link
5. **Theme Toggle** — cycles Light → Dark → Auto (follows system)
6. **Settings Button** — opens the Options/Settings page

---

## 🧱 Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 18.x | Component-driven UI |
| Vite | 5.x | Build tool |
| @crxjs/vite-plugin | 2.x | Extension packaging (HMR in dev) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first CSS |
| react-icons | 5.x | SVG icon components (replaces all emoji icons) |
| idb | 8.x | Typed IndexedDB wrapper (replaces raw IndexedDB in StorageManager) |

---

## 🗂️ Recommended Project Structure

```
new-tab-extension-react/
├── public/
│   └── assets/
│       └── icons/
│           ├── icon-16.png
│           ├── icon-48.png
│           └── icon-128.png
├── src/
│   ├── background/
│   │   └── index.ts              ← Background service worker
│   ├── components/               ← All React UI components
│   │   ├── Header.tsx
│   │   ├── QuoteSection.tsx
│   │   ├── CategoriesGrid.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── LinkItem.tsx
│   │   ├── FAB.tsx
│   │   ├── Toast.tsx
│   │   ├── modals/
│   │   │   ├── AddLinkModal.tsx
│   │   │   ├── EditLinkModal.tsx
│   │   │   ├── AddCategoryModal.tsx
│   │   │   └── CategoryLinksModal.tsx
│   │   └── ui/                   ← Reusable primitives
│   │       ├── GlassCard.tsx
│   │       ├── GlassButton.tsx
│   │       ├── GlassInput.tsx
│   │       └── Modal.tsx
│   ├── hooks/                    ← Custom React hooks
│   │   ├── useStorage.ts
│   │   ├── useTheme.ts
│   │   ├── useQuote.ts
│   │   └── useSearch.ts
│   ├── services/                 ← Business logic (ported from vanilla JS services)
│   │   ├── storage.ts            ← IndexedDB via `idb` + localStorage prefs
│   │   ├── categorizer.ts        ← Domain-based link categorization
│   │   ├── theme.ts              ← Theme detection and persistence
│   │   ├── api.ts                ← Quote API client (Quotable / ZenQuotes / Advice Slip)
│   │   └── animations.ts         ← Animation utilities (or handled via Tailwind transitions)
│   ├── store/                    ← Global state (Zustand or React Context)
│   │   ├── linksStore.ts
│   │   ├── categoriesStore.ts
│   │   └── settingsStore.ts
│   ├── types/                    ← Shared TypeScript interfaces
│   │   ├── link.ts
│   │   ├── category.ts
│   │   ├── quote.ts
│   │   └── settings.ts
│   ├── pages/
│   │   ├── newtab/
│   │   │   ├── index.html        ← Entry HTML for new tab page
│   │   │   └── main.tsx          ← React root for new tab
│   │   ├── options/
│   │   │   ├── index.html        ← Entry HTML for options page
│   │   │   └── main.tsx          ← React root for options
│   │   └── popup/
│   │       ├── index.html        ← Entry HTML for popup
│   │       └── main.tsx          ← React root for popup
│   ├── options/                  ← Options page components
│   │   ├── OptionsApp.tsx
│   │   ├── sections/
│   │   │   ├── GeneralSection.tsx
│   │   │   ├── AppearanceSection.tsx
│   │   │   ├── LinksSection.tsx
│   │   │   ├── CategoriesSection.tsx
│   │   │   └── AboutSection.tsx
│   │   └── Sidebar.tsx
│   ├── popup/                    ← Popup components
│   │   └── PopupApp.tsx
│   └── newtab/                   ← New Tab page top-level component
│       └── NewTabApp.tsx
├── manifest.json                 ← Manifest V3 (updated for Vite build paths)
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

---

## 📦 Dependencies to Install

```bash
# Core
npm create vite@latest . -- --template react-ts

# Extension bundling
npm install -D @crxjs/vite-plugin@beta

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icons
npm install react-icons

# IndexedDB
npm install idb

# State management (choose one — Zustand recommended for extensions)
npm install zustand

# Optional: clsx for conditional Tailwind classes
npm install clsx
```

---

## 🔑 Key TypeScript Types to Define

```typescript
// src/types/link.ts
export interface Link {
  id?: number;
  url: string;
  title: string;
  domain: string;
  category: string;
  timestamp: number;
}

// src/types/category.ts
export interface CategoryData {
  icon: string;              // react-icons component name or emoji fallback
  color: string;             // hex color string
  patterns: string[];        // regex patterns (serialized as strings for storage)
  isBuiltIn?: boolean;
}

export type CategoryMap = Record<string, CategoryData>;

// src/types/quote.ts
export interface Quote {
  text: string;
  author: string;
  category?: string;
}

// src/types/settings.ts
export type ThemeMode = 'light' | 'dark' | 'auto';
export type QuoteApiType = 'quotable' | 'zenquotes' | 'adviceslip';

export interface UserSettings {
  theme: ThemeMode;
  quoteApi: QuoteApiType;
  glassBlur: number;          // 0–30 (px)
  glassOpacity: number;       // 0.3–0.95
  wallpaper: string | null;   // base64 data URL or null
}
```

---

## 🧩 Components to Build

### New Tab Page Components

#### `NewTabApp.tsx`
Top-level component that composes the entire new tab dashboard. Renders: `<Header>`, `<QuoteSection>`, `<CategoriesGrid>`, `<FAB>`, `<ToastContainer>`, and all modals.

#### `Header.tsx`
Glassmorphic sticky header bar containing:
- **Left:** "Dashboard" app title
- **Center:** Search input (`<GlassInput>`) that live-filters the category grid
- **Right:** Theme toggle button (`MdDarkMode` / `MdLightMode` / `MdAutorenew` icons from react-icons), Settings button (`IoSettingsSharp` icon)

#### `QuoteSection.tsx`
Centered glassmorphic section displaying:
- Quote text (italic, large)
- Author attribution
- Refresh button with spinning animation (`MdRefresh` icon from react-icons)
- Fade transition when loading a new quote

#### `CategoriesGrid.tsx`
Responsive CSS grid (auto-fill, `minmax(280px, 1fr)`) of `<CategoryCard>` components. Filters cards by search query. Accepts array of `[categoryName, categoryData, links]` tuples.

#### `CategoryCard.tsx`
Glassmorphic card with:
- Category icon (react-icons component or emoji) + title + link count badge
- Preview of up to 3 links (truncated, clickable to open in new tab)
- "+N more" label when > 3 links
- Hover: gradient overlay, lift shadow
- Click: opens `<CategoryLinksModal>` with all links in that category
- Stagger entrance animation on initial render

#### `LinkItem.tsx`
Row component used inside `<CategoryLinksModal>`. Shows link title, domain, plus Edit and Delete action buttons.

#### `FAB.tsx`
Fixed bottom-right floating action button with `+` / `MdAdd` icon. Opens `<AddLinkModal>` on click. Gradient background (`accent-primary` → `accent-secondary`). Scale on hover.

#### `Toast.tsx` / `ToastContainer.tsx`
Self-removing toast notifications (success = green, error = red, info = blue). Slide in from the right. Stack vertically above each other, bottom-left of screen.

### Modals

All modals share a common `<Modal>` base: fixed overlay, centered glass-container content, click-outside to close, ESC key to close.

#### `AddLinkModal.tsx`
Form: URL input (required, auto-normalizes missing `https://`), Title input (optional), Category dropdown (includes "Auto-detect" + all categories). On submit: normalizes URL, auto-detects category if not selected, saves link to IndexedDB, triggers category grid re-render.

#### `EditLinkModal.tsx`
Form: Title input (pre-filled), Category dropdown (pre-selected). Hidden link ID field. On submit: updates existing link in IndexedDB.

#### `AddCategoryModal.tsx`
Form: Category name (required), Icon emoji input (max 2 chars), Color picker (hex). On submit: creates custom category, persists to localStorage.

#### `CategoryLinksModal.tsx`
Dynamically opened when a category card is clicked. Shows a scrollable list of all links in that category using `<LinkItem>`. Has a close button.

### Options Page Components

#### `OptionsApp.tsx`
Two-column layout: `<Sidebar>` (left, glass nav) + content area (right). Renders active section based on router/state.

#### `Sidebar.tsx`
Navigation list with 5 items: General, Appearance, Links, Categories, About. Active item highlighted.

#### `GeneralSection.tsx`
- **Theme:** Radio group (Light / Dark / Auto)
- **Quote API:** Select dropdown (Quotable.io / ZenQuotes / Advice Slip)

#### `AppearanceSection.tsx`
- **Wallpaper:** Preview box, upload button, clear button (file → base64 → localStorage)
- **Glassmorphism:** Blur slider (0–30px), Opacity slider (30%–95%), Live preview card

#### `LinksSection.tsx`
- **Import/Export:** Export as JSON button, Import from JSON button
- **Link Statistics:** Total links + per-category counts
- **Data Management:** Reset to Defaults (danger button with confirmation)

#### `CategoriesSection.tsx`
- **Create Custom Category** button → opens `<AddCategoryModal>`
- List of custom categories with delete buttons
- Read-only list of built-in categories

#### `AboutSection.tsx`
Extension name, version, feature list, privacy note.

### Popup Components

#### `PopupApp.tsx`
Compact popup (350px wide):
- Extension name + logo
- Quick stats (total links, top 3 categories by count)
- "Open New Tab" button (`chrome.tabs.create`)
- "Open Settings" button (`chrome.runtime.openOptionsPage`)

### UI Primitives

#### `GlassCard.tsx`
Reusable wrapper with backdrop-filter blur, semi-transparent background, border, shadow. Props: `children`, `className`, `hover` (boolean), `onClick`.

#### `GlassButton.tsx`
Styled button with glass effect. Props: `variant` (`'primary' | 'secondary' | 'danger' | 'default'`), `icon` (react-icons element), `loading` (boolean), `onClick`, `children`.

#### `GlassInput.tsx`
Styled input/select/textarea with glass effect. Props: `type`, `placeholder`, `value`, `onChange`, `className`.

#### `Modal.tsx`
Base modal wrapper. Props: `isOpen`, `onClose`, `title`, `children`. Handles backdrop click, ESC key, aria attributes.

---

## ⚙️ Services to Port (Vanilla JS → TypeScript)

### `services/storage.ts`

Port `StorageManager` class. Replace raw `IndexedDB` API with the `idb` library for promise-based, typed access.

**IndexedDB Schema:**
- Database: `LinksDashboardDB` (version 1)
- Object store: `links`
  - keyPath: `id` (auto-increment)
  - Indexes: `category`, `domain`, `timestamp`

**Methods to implement:**
- `initDB(): Promise<void>`
- `addLink(link: Omit<Link, 'id'>): Promise<number>`
- `updateLink(id: number, data: Partial<Link>): Promise<void>`
- `deleteLink(id: number): Promise<void>`
- `getLinkById(id: number): Promise<Link | undefined>`
- `getLinksByCategory(category: string): Promise<Link[]>`
- `getAllLinks(): Promise<Link[]>`
- `getAllLinksByCategory(): Promise<Record<string, Link[]>>`
- `searchLinks(query: string): Promise<Link[]>`
- `clearAllLinks(): Promise<void>`
- `getStats(): Promise<{ totalLinks: number; byCategory: Record<string, number> }>`
- `exportData(): Promise<ExportData>`
- `importData(data: ExportData): Promise<{ linksImported: number }>`
- `reset(): Promise<void>`
- `setPreference<T>(key: keyof UserSettings, value: T): void`
- `getPreference<T>(key: keyof UserSettings, defaultValue: T): T`

### `services/categorizer.ts`

Port `LinkCategorizer` class. Replace pattern arrays with typed `RegExp[]`.

**Built-in categories (9 total):**
- `social` — 👥 / `FaUsers` — `#3b82f6` — facebook, twitter/x, instagram, linkedin, reddit, tiktok, discord, snapchat, telegram, mastodon, bluesky
- `productivity` — ✓ / `MdCheckCircle` — `#10b981` — notion, asana, monday, slack, gmail, outlook, todoist, trello, clickup, teams, drive, dropbox
- `development` — `</>` / `FaCode` — `#8b5cf6` — github, gitlab, stackoverflow, dev.to, npmjs, docs., codepen, jsfiddle, replit, glitch, bitbucket
- `entertainment` — 🎬 / `MdMovieFilter` — `#f59e0b` — youtube, netflix, twitch, hulu, disney+, spotify, soundcloud, 9gag, imgur
- `ai-chatbots` — 🤖 / `TbRobot` — `#ec4899` — openai, chatgpt, claude, gemini, bard, perplexity, huggingface, midjourney
- `learning` — 📚 / `IoBook` — `#06b6d4` — coursera, udemy, edx, skillshare, codecademy, freecodecamp, khanacademy, duolingo
- `shopping` — 🛍️ / `MdShoppingBag` — `#f97316` — amazon, ebay, etsy, shopify, aliexpress
- `news` — 📰 / `MdNewspaper` — `#ef4444` — bbc, cnn, hackernews, medium, substack, techcrunch, theverge
- `other` — 🔗 / `FaLink` — `#6b7280` — catch-all

Custom categories are persisted in `localStorage` as `custom_categories` (JSON).

**Methods to implement:**
- `getDomain(url: string): string`
- `categorize(url: string): string`
- `categorizeBatch(urls: string[]): Record<string, { url: string; domain: string }[]>`
- `getCategoryInfo(name: string): CategoryData`
- `getAllCategories(): CategoryMap`
- `getCategoryNames(): string[]`
- `addCustomCategory(name: string, icon: string, color: string, patterns?: string[]): string`
- `updateCustomCategory(key: string, updates: Partial<CategoryData>): void`
- `deleteCustomCategory(key: string): void`
- `isBuiltIn(name: string): boolean`
- `exists(name: string): boolean`

### `services/theme.ts`

Port `ThemeManager` class. Expose as a singleton or hook (`useTheme`).

**Logic:**
- Themes: `'light' | 'dark' | 'auto'`
- Saved in `localStorage` under `pref_theme`
- `'auto'` resolves to `'dark'` or `'light'` via `window.matchMedia('(prefers-color-scheme: dark)')`
- Apply theme by setting `document.documentElement.setAttribute('data-theme', resolved)`
- Listen for `matchMedia` changes when in `'auto'` mode
- Dispatch `CustomEvent('themechange')` on change

**Methods:**
- `detectTheme(): ThemeMode`
- `applyTheme(theme: ThemeMode): void`
- `toggle(): ThemeMode` (light → dark → auto → light)
- `getCurrent(): ThemeMode`
- `getEffective(): 'light' | 'dark'`

### `services/api.ts`

Port `QuoteService` class. Support three providers with fallback quotes.

**Providers:**
- `quotable` → `https://api.quotable.io/random` → `{ content, author, tags[0] }`
- `zenquotes` → `https://zenquotes.io/api/random` → `[{ q, a }]`
- `adviceslip` → `https://api.adviceslip.com/advice` → `{ slip: { advice } }`

**Methods:**
- `getRandomQuote(): Promise<Quote>`
- `setApiType(type: QuoteApiType): void`
- `clearCache(): void`
- `getAvailableApis(): Record<QuoteApiType, string>`
- In-memory cache (1 hour TTL), fetch timeout (5 seconds), 10 hardcoded fallback quotes

---

## 🎨 Design System — Tailwind Configuration

Extend `tailwind.config.ts` with the following custom design tokens to replicate the original glassmorphic design:

### Colors
```ts
colors: {
  accent: {
    primary: '#3b82f6',   // blue-500
    secondary: '#10b981', // emerald-500
    danger: '#ef4444',    // red-500
    warning: '#f59e0b',   // amber-500
    violet: '#8b5cf6',    // violet-500
    rose: '#ec4899',      // pink-500
  }
}
```

### Custom Utilities (in `index.css` with `@layer utilities`)
```css
.glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.48));
  backdrop-filter: blur(var(--glass-blur, 10px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 10px));
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.08);
}

.glass-dark {
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(255,255,255,0.1);
}
```

### CSS Variables (in `:root`)
```css
--glass-blur: 10px;
--glass-opacity: 0.7;
--glass-border-opacity: 0.2;
```

These variables are updated dynamically from the Appearance settings sliders.

### Body Background
Multi-layered radial gradient that creates the soft color field behind the glass panels:
```css
background:
  radial-gradient(circle at 12% 18%, rgba(59,130,246,0.22), transparent 28rem),
  radial-gradient(circle at 82% 12%, rgba(236,72,153,0.16), transparent 26rem),
  radial-gradient(circle at 70% 84%, rgba(16,185,129,0.18), transparent 30rem),
  var(--bg-primary);
```

### Theme Switching
Use `data-theme` attribute on `<html>`. Define CSS variables for light/dark in `index.css`:
```css
:root { --bg-primary: #f9fafb; --text-primary: #1f2937; }
[data-theme="dark"] { --bg-primary: #111827; --text-primary: #f9fafb; }
```

---

## 🗃️ State Management

Use **Zustand** for global state. Three stores:

### `linksStore.ts`
```typescript
interface LinksState {
  links: Link[];
  linksByCategory: Record<string, Link[]>;
  isLoading: boolean;
  fetchAllLinks: () => Promise<void>;
  addLink: (link: Omit<Link, 'id'>) => Promise<void>;
  updateLink: (id: number, data: Partial<Link>) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
  searchLinks: (query: string) => Link[];
}
```

### `categoriesStore.ts`
```typescript
interface CategoriesState {
  categories: CategoryMap;
  addCustomCategory: (name: string, icon: string, color: string) => void;
  deleteCustomCategory: (key: string) => void;
  refreshCategories: () => void;
}
```

### `settingsStore.ts`
```typescript
interface SettingsState {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  loadSettings: () => void;
}
```

---

## 🔧 Manifest V3 Configuration

The `manifest.json` must be updated for Vite output paths. With `@crxjs/vite-plugin`, the manifest is read directly and HMR works during development.

```json
{
  "manifest_version": 3,
  "name": "New Tab Dashboard",
  "version": "1.0.0",
  "description": "Replace your New Tab page with a customizable glassmorphic dashboard.",
  "permissions": ["storage"],
  "host_permissions": [
    "https://api.quotable.io/*",
    "https://zenquotes.io/*",
    "https://api.adviceslip.com/*"
  ],
  "chrome_url_overrides": {
    "newtab": "src/pages/newtab/index.html"
  },
  "action": {
    "default_popup": "src/pages/popup/index.html",
    "default_title": "New Tab Dashboard Settings",
    "default_icon": {
      "16": "public/assets/icons/icon-16.png",
      "48": "public/assets/icons/icon-48.png",
      "128": "public/assets/icons/icon-128.png"
    }
  },
  "icons": {
    "16": "public/assets/icons/icon-16.png",
    "48": "public/assets/icons/icon-48.png",
    "128": "public/assets/icons/icon-128.png"
  },
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "options_page": "src/pages/options/index.html"
}
```

---

## 🔌 react-icons Mapping

Replace all emoji/text icons with react-icons SVG components:

| Original Emoji / Text | react-icons Component | Import |
|---|---|---|
| 🌙 (dark theme) | `MdDarkMode` | `react-icons/md` |
| ☀️ (light theme) | `MdLightMode` | `react-icons/md` |
| 🔄 (auto theme) | `MdAutorenew` | `react-icons/md` |
| ⚙️ (settings) | `IoSettingsSharp` | `react-icons/io5` |
| 🔄 (quote refresh) | `MdRefresh` | `react-icons/md` |
| + (FAB add) | `MdAdd` | `react-icons/md` |
| × (close modal) | `MdClose` | `react-icons/md` |
| 👥 (social) | `FaUsers` | `react-icons/fa` |
| ✓ (productivity) | `MdCheckCircle` | `react-icons/md` |
| `</>` (development) | `FaCode` | `react-icons/fa` |
| 🎬 (entertainment) | `MdMovieFilter` | `react-icons/md` |
| 🤖 (AI) | `TbRobot` | `react-icons/tb` |
| 📚 (learning) | `IoBook` | `react-icons/io5` |
| 🛍️ (shopping) | `MdShoppingBag` | `react-icons/md` |
| 📰 (news) | `MdNewspaper` | `react-icons/md` |
| 🔗 (other) | `FaLink` | `react-icons/fa` |
| Delete (button text) | `MdDelete` | `react-icons/md` |
| Edit (button text) | `MdEdit` | `react-icons/md` |
| Export (button text) | `MdFileDownload` | `react-icons/md` |
| Import (button text) | `MdFileUpload` | `react-icons/md` |

---

## 🖼️ Pages & Entry Points

Three independent React apps, each with their own HTML entry point:

### `src/pages/newtab/index.html`
Renders `<NewTabApp />`. Full-viewport, no scrollbar on body, Google Fonts (Inter or Outfit).

### `src/pages/options/index.html`
Renders `<OptionsApp />`. Two-column layout (sidebar + content area). Same glass design system.

### `src/pages/popup/index.html`
Renders `<PopupApp />`. Fixed width 350px, compact stats view, quick action buttons.

---

## 🌐 Cross-Browser Compatibility

The extension must work on Chrome, Brave, Edge, Firefox, and Opera.

- Use `chrome.*` APIs (Chromium-compatible) for all browsers except Firefox
- Firefox uses `browser.*` with promise-based APIs — add a polyfill or check `typeof browser !== 'undefined'`
- Avoid `chrome_url_overrides` conflict with Firefox by using Manifest V3 where available
- All `backdrop-filter` uses must include `-webkit-backdrop-filter` prefixed version
- Test in all target browsers before shipping

---

## ✅ Feature Parity Checklist

Ensure all features from the original vanilla JS version are reproduced:

- [ ] New Tab page opens on every new tab
- [ ] Background gradient (multi-radial) applied to body
- [ ] Custom wallpaper: upload (5MB max), persist as base64, apply as fixed background
- [ ] Theme: Light / Dark / Auto — persists across sessions, applies `data-theme` on `<html>`
- [ ] Quote: fetched from API on load, cached 1 hour, refresh button spins, fade transition
- [ ] Quote API: switchable between Quotable.io, ZenQuotes, Advice Slip from settings
- [ ] Category grid: auto-fill responsive grid of category cards
- [ ] Category card: shows icon, name, count badge, preview of 3 links
- [ ] Click category card → modal with all links + edit/delete actions
- [ ] Add Link modal: URL (required, auto-prepends https://), title (optional), category (auto-detect)
- [ ] Auto-categorize: domain matched against 8 built-in category regex pattern groups
- [ ] Edit Link modal: update title and category
- [ ] Delete Link: with confirmation dialog
- [ ] Search: live filters category grid by link title/domain/URL
- [ ] Custom category: create with name, emoji icon, color — persisted in localStorage
- [ ] Delete custom category from Settings → Categories
- [ ] Built-in categories listed as read-only in Settings → Categories
- [ ] Glassmorphism blur slider (0–30px) — live preview + saved to localStorage
- [ ] Glass opacity slider (30%–95%) — live preview + saved to localStorage
- [ ] Export links as JSON (includes links + preferences)
- [ ] Import links from JSON (clears existing, imports new)
- [ ] Link statistics: total links + per-category count
- [ ] Reset all data (IndexedDB + localStorage) with confirmation
- [ ] FAB (floating action button): fixed bottom-right, opens Add Link modal
- [ ] Toast notifications: success / error / info — auto-dismiss after 3s
- [ ] Options page opens via Settings button (calls `chrome.runtime.openOptionsPage()`)
- [ ] Popup: shows quick stats + open new tab + open settings buttons
- [ ] Background service worker: pings back, opens options on first install
- [ ] Responsive layout — grid adapts from 1 to 4+ columns based on viewport width
- [ ] Accessible: `aria-label`, `aria-hidden`, `aria-live`, `role="dialog"` on all modals
- [ ] Stagger animation on category cards entrance
- [ ] Hover lift effect on category cards (`translateY(-2px)`)
- [ ] Custom scrollbar styling (thin, rounded, uses CSS variables)

---

## 🚀 Development Workflow

```bash
# Install dependencies
npm install

# Start dev server (with HMR for extension pages)
npm run dev

# Load unpacked extension from dist/ in Chrome/Brave/Edge:
# chrome://extensions → Developer mode ON → Load unpacked → select dist/

# Production build
npm run build

# Preview production build
npm run preview
```

> **Note:** With `@crxjs/vite-plugin`, the `dist/` folder is already a valid unpacked extension. No manual zipping needed for development.

---

## 🗒️ Notes for Implementation

1. **IndexedDB initialization** must happen before any link operations. Use a `useEffect` on app mount or a Zustand store middleware.
2. **Wallpaper base64** strings are large — store in `localStorage` only (IndexedDB not needed for preferences).
3. **`chrome.storage.local`** can be used instead of `localStorage` for better extension isolation if desired — but localStorage is simpler and works in all target browsers.
4. **Category patterns** in `categorizer.ts` use `RegExp` objects in memory. When storing custom category patterns to localStorage, serialize them as strings (`pattern.source`) and reconstruct with `new RegExp(str, 'i')`.
5. **The `idb` library** significantly simplifies IndexedDB code. Use `openDB`, `IDBPDatabase`, and the typed transaction API.
6. **CRXJS HMR** reloads extension pages automatically on save during development.
7. **CSS Variables** (`--glass-blur`, `--glass-opacity`) must be updated on `document.documentElement` from the settings sliders — this applies globally without a React re-render.
8. **Tailwind purge** will remove unused classes in production — ensure all dynamic class names are safelisted if generated programmatically.
