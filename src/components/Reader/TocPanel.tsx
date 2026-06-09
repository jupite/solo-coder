import { TocItem, ThemeId } from '@/types';
import { useReaderStore } from '@/store/readerStore';
import { X, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

interface TocPanelProps {
  toc: TocItem[];
  currentChapter: string;
  currentHref: string;
  theme: ThemeId;
  onNavigate: (href: string) => void;
}

const normalizeHref = (href: string): string => {
  if (!href) return '';
  return href.split('#')[0].replace(/^\.\//, '').replace(/^\//, '');
};

export default function TocPanel({ toc, currentChapter, currentHref, theme, onNavigate }: TocPanelProps) {
  const { showToc, setShowToc } = useReaderStore();
  const normalizedCurrentHref = useMemo(() => normalizeHref(currentHref), [currentHref]);

  const isItemActive = (item: TocItem): boolean => {
    if (currentChapter && currentChapter === item.label) {
      return true;
    }
    if (normalizedCurrentHref) {
      const normalizedItem = normalizeHref(item.href);
      if (normalizedItem === normalizedCurrentHref) {
        return true;
      }
      if (normalizedCurrentHref.startsWith(normalizedItem) || normalizedItem.startsWith(normalizedCurrentHref)) {
        return true;
      }
    }
    return false;
  };

  const handleItemClick = (href: string) => {
    onNavigate(href);
  };

  const checkHasActiveChild = (children: TocItem[]): boolean => {
    return children.some(child => {
      if (isItemActive(child)) return true;
      return child.children ? checkHasActiveChild(child.children) : false;
    });
  };

  const renderTocItem = (item: TocItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const initialExpanded = hasChildren ? checkHasActiveChild(item.children!) || true : false;
    const [expanded, setExpanded] = useState(initialExpanded);

    return (
      <div key={item.id}>
        <div
          className={`flex items-center cursor-pointer py-2 px-3 rounded-lg transition-colors duration-150
            ${isActive ? 'font-semibold' : ''}`}
          style={{
            paddingLeft: `${level * 16 + 12}px`,
            color: isActive
              ? theme === 'night' ? '#fff' : theme === 'eye' ? '#3d2f1f' : '#111'
              : theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333',
            backgroundColor: isActive
              ? theme === 'night' ? 'rgba(255,255,255,0.1)' : theme === 'eye' ? 'rgba(91,70,54,0.12)' : 'rgba(0,0,0,0.06)'
              : 'transparent',
          }}
          onClick={() => handleItemClick(item.href)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="mr-1 p-0.5 -ml-1"
              style={{ color: theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#999' }}
            >
              <ChevronRight
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>
          )}
          {!hasChildren && <span className="w-4" />}
          <span className="text-sm truncate font-serif">{item.label}</span>
        </div>

        {hasChildren && expanded && (
          <div>
            {item.children!.map((child) => renderTocItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out
          ${showToc ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: theme === 'night' ? '#1f1f1f' : theme === 'eye' ? '#f5efdc' : '#fff',
          borderRight: `1px solid ${theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#eee'}`,
        }}
      >
        <div
          className="flex items-center justify-between px-4 h-12"
          style={{
            borderBottom: `1px solid ${theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#eee'}`,
          }}
        >
          <h2
            className="font-serif text-base font-medium"
            style={{ color: theme === 'night' ? '#ccc' : theme === 'eye' ? '#5b4636' : '#333' }}
          >
            目录
          </h2>
          <button
            onClick={() => setShowToc(false)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-48px)] py-2">
          {toc.length > 0 ? (
            toc.map((item) => renderTocItem(item))
          ) : (
            <p
              className="px-4 py-8 text-center text-sm"
              style={{ color: theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#999' }}
            >
              暂无目录
            </p>
          )}
        </div>
      </div>

      {showToc && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setShowToc(false)}
        />
      )}
    </>
  );
}
