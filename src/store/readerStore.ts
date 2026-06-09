import { create } from 'zustand';
import { BookInfo, SidebarPanel, TocItem } from '@/types';
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
}

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
    });
  },
  goToHrefFn: null,
  setGoToHrefFn: (fn) => set({ goToHrefFn: fn }),
  goToCfiFn: null,
  setGoToCfiFn: (fn) => set({ goToCfiFn: fn }),
}));
