import { create } from 'zustand';

interface ReaderState {
  bookFile: File | null;
  setBookFile: (file: File | null) => void;
  showToc: boolean;
  setShowToc: (show: boolean) => void;
  showBookmarks: boolean;
  setShowBookmarks: (show: boolean) => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  bookFile: null,
  setBookFile: (file) => set({ bookFile: file }),
  showToc: false,
  setShowToc: (show) => set({ showToc: show }),
  showBookmarks: false,
  setShowBookmarks: (show) => set({ showBookmarks: show }),
}));
