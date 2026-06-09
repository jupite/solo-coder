import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '@/types';
import { storage } from '@/utils/storage';

export function useBookmarks(bookId: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (bookId) {
      setBookmarks(storage.getBookmarks(bookId));
    } else {
      setBookmarks([]);
    }
  }, [bookId]);

  const normalizeCfi = (cfi: string): string => {
    if (!cfi) return '';
    return cfi.replace(/!\[.*?\]/g, '').replace(/\)$/, '');
  };

  const addBookmark = useCallback((cfi: string, chapter: string, percentage: number) => {
    if (!bookId || !cfi) return;

    const newBookmark: Bookmark = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      cfi,
      chapter: chapter || '未命名章节',
      percentage: Math.round(percentage * 100) / 100,
      createdAt: Date.now(),
    };

    storage.saveBookmark(bookId, newBookmark);
    setBookmarks((prev) => [...prev, newBookmark]);
  }, [bookId]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    if (!bookId) return;
    storage.removeBookmark(bookId, bookmarkId);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }, [bookId]);

  const findBookmarkForCfi = useCallback((cfi: string): Bookmark | null => {
    if (!cfi || bookmarks.length === 0) return null;

    const normalized = normalizeCfi(cfi);
    for (const bm of bookmarks) {
      const normalizedBm = normalizeCfi(bm.cfi);
      if (normalizedBm === normalized) {
        return bm;
      }
      if (cfi.startsWith(bm.cfi) || bm.cfi.startsWith(cfi)) {
        return bm;
      }
    }
    return null;
  }, [bookmarks]);

  const toggleBookmark = useCallback((cfi: string, chapter: string, percentage: number) => {
    if (!bookId || !cfi) return;

    const existing = findBookmarkForCfi(cfi);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(cfi, chapter, percentage);
    }
  }, [bookId, findBookmarkForCfi, addBookmark, removeBookmark]);

  const isCurrentPageBookmarked = useCallback((cfi: string): boolean => {
    return findBookmarkForCfi(cfi) !== null;
  }, [findBookmarkForCfi]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isCurrentPageBookmarked,
    findBookmarkForCfi,
  };
}
