export type ThemeId = 'white' | 'eye' | 'night';
export type FontSize = 'small' | 'medium' | 'large';
export type SidebarPanel = 'toc' | 'bookmarks' | 'annotations' | 'font' | 'theme' | null;
export type BookFormat = 'epub' | 'mobi' | 'azw' | 'azw3' | 'pdf';
export type AnnotationStyle = 'highlight' | 'underline' | 'strikethrough' | 'wavy';
export type AnnotationColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

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

export interface Annotation {
  id: string;
  bookId: string;
  cfi: string;
  cfiStart: string;
  cfiEnd: string;
  cfiRange: string;
  selectedText: string;
  style: AnnotationStyle;
  color: AnnotationColor;
  note?: string;
  chapter: string;
  percentage: number;
  createdAt: number;
  updatedAt: number;
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

export const ANNOTATION_COLORS: Record<AnnotationColor, { bg: string; label: string; text: string }> = {
  yellow: { bg: '#fef08a', label: '黄色', text: '#854d0e' },
  green: { bg: '#bbf7d0', label: '绿色', text: '#14532d' },
  blue: { bg: '#bfdbfe', label: '蓝色', text: '#1e3a8a' },
  pink: { bg: '#fbcfe8', label: '粉色', text: '#831843' },
  orange: { bg: '#fed7aa', label: '橙色', text: '#7c2d12' },
};

export const ANNOTATION_STYLES: Record<AnnotationStyle, string> = {
  highlight: '高亮',
  underline: '下划线',
  strikethrough: '删除线',
  wavy: '波浪线',
};
