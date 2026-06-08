import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '@/types';
import { storage } from '@/utils/storage';

export function useBookmarks(bookId: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (bookId) {
      setBookmarks(storage.getBookmarks(bookId));
    }
  }, [bookId]);

  const addBookmark = useCallback((cfi: string, chapter: string, percentage: number) => {
    if (!bookId || !cfi) return;

    const newBookmark: Bookmark = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      cfi,
      chapter,
      percentage,
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

  const toggleBookmark = useCallback((cfi: string, chapter: string, percentage: number) => {
    if (!bookId || !cfi) return;

    const existing = bookmarks.find((b) => b.cfi === cfi);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(cfi, chapter, percentage);
    }
  }, [bookId, bookmarks, addBookmark, removeBookmark]);

  const isCurrentPageBookmarked = useCallback((cfi: string) => {
    return bookmarks.some((b) => b.cfi === cfi);
  }, [bookmarks]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isCurrentPageBookmarked,
  };
}
