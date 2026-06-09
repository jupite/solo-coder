import { create } from 'zustand';
import { BookInfo, SidebarPanel, TocItem, ThemeId, FontSize, Bookmark, THEMES, FONT_SIZE_MAP } from '@/types';
import { storage } from '@/utils/storage';

interface ReaderState {
  bookFile: File | null;
  currentBookId: string | null;
  setBookFile: (file: File | null, bookId?: string) => void;
  activePanel: SidebarPanel;
  setActivePanel: (panel: SidebarPanel) => void;
  togglePanel: (panel: Exclude<SidebarPanel, null>) => void;
  books: BookInfo[];
  loadBooks: () => void;
  addBook: (book: BookInfo) => void;
  deleteBook: (bookId: string) => void;
  bookTitle: string;
  setBookTitle: (title: string) => void;
  toc: TocItem[];
  setToc: (toc: TocItem[]) => void;
  currentCfi: string;
  setCurrentCfi: (cfi: string) => void;
  currentChapter: string;
  setCurrentChapter: (chapter: string) => void;
  currentHref: string;
  setCurrentHref: (href: string) => void;
  resetReaderState: () => void;
  goToHrefFn: ((href: string) => void) | null;
  setGoToHrefFn: (fn: ((href: string) => void) | null) => void;
  goToCfiFn: ((cfi: string) => void) | null;
  setGoToCfiFn: (fn: ((cfi: string) => void) | null) => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  bookmarks: Bookmark[];
  loadBookmarks: (bookId: string) => void;
  toggleBookmark: (bookId: string, cfi: string, chapter: string, percentage: number) => void;
  removeBookmark: (bookId: string, bookmarkId: string) => void;
}

const normalizeCfi = (cfi: string): string => {
  if (!cfi) return '';
  return cfi.replace(/!\[.*?\]/g, '').replace(/\)$/, '');
};

export const useReaderStore = create<ReaderState>((set, get) => ({
  bookFile: null,
  currentBookId: null,
  setBookFile: (file, bookId) => set({ bookFile: file, currentBookId: bookId || null }),
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? null : panel });
  },
  books: [],
  loadBooks: () => {
    const books = storage.getBooks();
    set({ books });
  },
  addBook: (book) => {
    storage.saveBook(book);
    const books = storage.getBooks();
    set({ books });
  },
  deleteBook: (bookId) => {
    storage.removeBook(bookId);
    const books = storage.getBooks();
    set({ books });
  },
  bookTitle: '',
  setBookTitle: (title) => set({ bookTitle: title }),
  toc: [],
  setToc: (toc) => set({ toc }),
  currentCfi: '',
  setCurrentCfi: (cfi) => set({ currentCfi: cfi }),
  currentChapter: '',
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
  currentHref: '',
  setCurrentHref: (href) => set({ currentHref: href }),
  resetReaderState: () => {
    set({
      bookTitle: '',
      toc: [],
      currentCfi: '',
      currentChapter: '',
      currentHref: '',
      bookmarks: [],
    });
  },
  goToHrefFn: null,
  setGoToHrefFn: (fn) => set({ goToHrefFn: fn }),
  goToCfiFn: null,
  setGoToCfiFn: (fn) => set({ goToCfiFn: fn }),
  theme: (() => storage.getTheme())(),
  setTheme: (theme) => {
    storage.saveTheme(theme);
    set({ theme });
  },
  fontSize: (() => storage.getFontSize())(),
  setFontSize: (size) => {
    storage.saveFontSize(size);
    set({ fontSize: size });
  },
  bookmarks: [],
  loadBookmarks: (bookId) => {
    if (bookId) {
      set({ bookmarks: storage.getBookmarks(bookId) });
    } else {
      set({ bookmarks: [] });
    }
  },
  toggleBookmark: (bookId, cfi, chapter, percentage) => {
    if (!bookId || !cfi) return;
    const current = get().bookmarks;
    const normalized = normalizeCfi(cfi);

    let existing: Bookmark | null = null;
    for (const bm of current) {
      const normalizedBm = normalizeCfi(bm.cfi);
      if (normalizedBm === normalized || cfi.startsWith(bm.cfi) || bm.cfi.startsWith(cfi)) {
        existing = bm;
        break;
      }
    }

    if (existing) {
      storage.removeBookmark(bookId, existing.id);
      set({ bookmarks: current.filter((b) => b.id !== existing!.id) });
    } else {
      const newBookmark: Bookmark = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        bookId,
        cfi,
        chapter: chapter || '未命名章节',
        percentage: Math.round(percentage * 100) / 100,
        createdAt: Date.now(),
      };
      storage.saveBookmark(bookId, newBookmark);
      set({ bookmarks: [...current, newBookmark] });
    }
  },
  removeBookmark: (bookId, bookmarkId) => {
    storage.removeBookmark(bookId, bookmarkId);
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== bookmarkId) });
  },
}));

export const getCurrentTheme = () => {
  const themeId = useReaderStore.getState().theme;
  return THEMES.find((t) => t.id === themeId)!;
};

export const getFontSizeValue = () => {
  const size = useReaderStore.getState().fontSize;
  return FONT_SIZE_MAP[size];
};

export const isCurrentPageBookmarked = (cfi: string): boolean => {
  if (!cfi) return false;
  const bookmarks = useReaderStore.getState().bookmarks;
  const normalized = normalizeCfi(cfi);
  for (const bm of bookmarks) {
    const normalizedBm = normalizeCfi(bm.cfi);
    if (normalizedBm === normalized || cfi.startsWith(bm.cfi) || bm.cfi.startsWith(cfi)) {
      return true;
    }
  }
  return false;
};
