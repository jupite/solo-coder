import { Bookmark, ReadingProgress, ThemeId, FontSize } from '@/types';

const STORAGE_KEYS = {
  BOOKMARKS: 'epub_reader_bookmarks',
  PROGRESS: 'epub_reader_progress',
  THEME: 'epub_reader_theme',
  FONT_SIZE: 'epub_reader_font_size',
};

export const storage = {
  getBookmarks(bookId: string): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (!data) return [];
      const allBookmarks = JSON.parse(data) as Record<string, Bookmark[]>;
      return allBookmarks[bookId] || [];
    } catch {
      return [];
    }
  },

  saveBookmark(bookId: string, bookmark: Bookmark): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      const allBookmarks = data ? (JSON.parse(data) as Record<string, Bookmark[]>) : {};
      const bookBookmarks = allBookmarks[bookId] || [];
      const exists = bookBookmarks.find((b) => b.cfi === bookmark.cfi);
      if (!exists) {
        bookBookmarks.push(bookmark);
        allBookmarks[bookId] = bookBookmarks;
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(allBookmarks));
      }
    } catch {
      console.error('Failed to save bookmark');
    }
  },

  removeBookmark(bookId: string, bookmarkId: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (!data) return;
      const allBookmarks = JSON.parse(data) as Record<string, Bookmark[]>;
      const bookBookmarks = allBookmarks[bookId] || [];
      allBookmarks[bookId] = bookBookmarks.filter((b) => b.id !== bookmarkId);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(allBookmarks));
    } catch {
      console.error('Failed to remove bookmark');
    }
  },

  getReadingProgress(bookId: string): ReadingProgress | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) return null;
      const allProgress = JSON.parse(data) as Record<string, ReadingProgress>;
      return allProgress[bookId] || null;
    } catch {
      return null;
    }
  },

  saveReadingProgress(progress: ReadingProgress): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const allProgress = data ? (JSON.parse(data) as Record<string, ReadingProgress>) : {};
      allProgress[progress.bookId] = progress;
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
    } catch {
      console.error('Failed to save reading progress');
    }
  },

  getTheme(): ThemeId {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeId;
      return theme || 'white';
    } catch {
      return 'white';
    }
  },

  saveTheme(theme: ThemeId): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      console.error('Failed to save theme');
    }
  },

  getFontSize(): FontSize {
    try {
      const fontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE) as FontSize;
      return fontSize || 'medium';
    } catch {
      return 'medium';
    }
  },

  saveFontSize(fontSize: FontSize): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
    } catch {
      console.error('Failed to save font size');
    }
  },
};
