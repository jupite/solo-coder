export type ThemeId = 'white' | 'eye' | 'night';
export type FontSize = 'small' | 'medium' | 'large';
export type SidebarPanel = 'toc' | 'bookmarks' | 'font' | 'theme' | null;
export type BookFormat = 'epub' | 'mobi' | 'azw' | 'azw3';

export interface Theme {
  id: ThemeId;
  name: string;
  background: string;
  text: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  cfi: string;
  chapter: string;
  percentage: number;
  createdAt: number;
}

export interface ReadingProgress {
  bookId: string;
  cfi: string;
  percentage: number;
  lastReadAt: number;
}

export interface TocItem {
  id: string;
  label: string;
  href: string;
  children?: TocItem[];
}

export interface BookInfo {
  id: string;
  title: string;
  fileDataUrl: string;
  fileName: string;
  fileSize: number;
  addedAt: number;
  lastReadAt?: number;
  cover?: string;
  format?: BookFormat;
}

export const THEMES: Theme[] = [
  { id: 'white', name: '白底黑字', background: '#ffffff', text: '#333333' },
  { id: 'eye', name: '米黄底棕字', background: '#f5efdc', text: '#5b4636' },
  { id: 'night', name: '黑底灰字', background: '#1a1a1a', text: '#999999' },
];

export const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

export const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: '小',
  medium: '中',
  large: '大',
};
