import { useState, useEffect, useCallback } from 'react';
import { ReadingProgress } from '@/types';
import { storage } from '@/utils/storage';

export function useReadingProgress(bookId: string) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [showJumpTip, setShowJumpTip] = useState(false);

  useEffect(() => {
    if (bookId) {
      const saved = storage.getReadingProgress(bookId);
      setProgress(saved);
    }
  }, [bookId]);

  const saveProgress = useCallback((cfi: string, percentage: number) => {
    if (!bookId || !cfi) return;

    const newProgress: ReadingProgress = {
      bookId,
      cfi,
      percentage,
      lastReadAt: Date.now(),
    };

    storage.saveReadingProgress(newProgress);
    setProgress(newProgress);
  }, [bookId]);

  const triggerJumpTip = useCallback(() => {
    setShowJumpTip(true);
    setTimeout(() => {
      setShowJumpTip(false);
    }, 3000);
  }, []);

  return {
    progress,
    saveProgress,
    showJumpTip,
    triggerJumpTip,
  };
}
