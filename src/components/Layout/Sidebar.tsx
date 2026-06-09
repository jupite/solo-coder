import { useReaderStore } from '@/store/readerStore';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/hooks/useBookmarks';
import { TocItem, FONT_SIZE_LABELS, THEMES, FontSize, ThemeId } from '@/types';
import { ChevronRight, BookMarked, Trash2, X, Type, Sun, Moon, Eye, List } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const normalizeHref = (href: string): string => {
  if (!href) return '';
  return href.split('#')[0].replace(/^\.\//, '').replace(/^\//, '');
};

interface TocItemNodeProps {
  item: TocItem;
  level: number;
  normalizedCurrentHref: string;
  currentChapter: string;
  goToHrefFn: ((href: string) => void) | null;
  activeText: string;
  textColor: string;
  activeBg: string;
  mutedColor: string;
}

function TocItemNode({
  item,
  level,
  normalizedCurrentHref,
  currentChapter,
  goToHrefFn,
  activeText,
  textColor,
  activeBg,
  mutedColor,
}: TocItemNodeProps) {
  const isItemActive = (it: TocItem): boolean => {
    if (currentChapter && currentChapter === it.label) return true;
    if (normalizedCurrentHref) {
      const normalizedItem = normalizeHref(it.href);
      if (normalizedItem === normalizedCurrentHref) return true;
      if (normalizedCurrentHref.startsWith(normalizedItem) || normalizedItem.startsWith(normalizedCurrentHref)) return true;
    }
    return false;
  };

  const checkHasActiveChild = (children: TocItem[]): boolean => {
    return children.some(child => {
      if (isItemActive(child)) return true;
      return child.children ? checkHasActiveChild(child.children) : false;
    });
  };

  const isActive = isItemActive(item);
  const hasChildren = item.children && item.children.length > 0;
  const initialExpanded = hasChildren ? checkHasActiveChild(item.children!) || true : false;
  const [expanded, setExpanded] = useState(initialExpanded);

  const handleClick = () => {
    if (goToHrefFn) goToHrefFn(item.href);
  };

  return (
    <div>
      <div
        className={`flex items-center cursor-pointer py-2 px-3 rounded-lg transition-colors duration-150
          ${isActive ? 'font-semibold' : ''}`}
        style={{
          paddingLeft: `${level * 16 + 12}px`,
          color: isActive ? activeText : textColor,
          backgroundColor: isActive ? activeBg : 'transparent',
        }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="mr-1 p-0.5 -ml-1"
            style={{ color: mutedColor }}
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
          {item.children!.map((child) => (
            <TocItemNode
              key={child.id}
              item={child}
              level={level + 1}
              normalizedCurrentHref={normalizedCurrentHref}
              currentChapter={currentChapter}
              goToHrefFn={goToHrefFn}
              activeText={activeText}
              textColor={textColor}
              activeBg={activeBg}
              mutedColor={mutedColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const {
    activePanel,
    setActivePanel,
    currentBookId,
    toc,
    currentChapter,
    currentHref,
    currentCfi,
    goToHrefFn,
    goToCfiFn,
  } = useReaderStore();
  const { theme, currentTheme, fontSize, setFontSize, setTheme } = useTheme();
  const { bookmarks, isCurrentPageBookmarked, removeBookmark } = useBookmarks(currentBookId || '');

  const normalizedCurrentHref = useMemo(() => normalizeHref(currentHref), [currentHref]);

  isCurrentPageBookmarked(currentCfi);

  const isReader = location.pathname === '/reader';

  const bgColor = currentTheme.background;
  const borderColor = theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#e5e7eb';
  const textColor = theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#374151';
  const activeText = theme === 'night' ? '#fff' : theme === 'eye' ? '#3d2f1f' : '#111827';
  const activeBg = theme === 'night' ? 'rgba(255,255,255,0.1)' : theme === 'eye' ? 'rgba(91,70,54,0.12)' : 'rgba(0,0,0,0.06)';
  const mutedColor = theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#9ca3af';

  if (!activePanel) return null;

  const panelTitle = {
    toc: '目录',
    bookmarks: '书签',
    font: '字体大小',
    theme: '主题',
  }[activePanel];

  const panelIcon = {
    toc: <List className="w-4 h-4" />,
    bookmarks: <BookMarked className="w-4 h-4" />,
    font: <Type className="w-4 h-4" />,
    theme: theme === 'night' ? <Moon className="w-4 h-4" /> : theme === 'eye' ? <Eye className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
  }[activePanel];

  const handleGoToBookmark = (cfi: string) => {
    if (goToCfiFn) goToCfiFn(cfi);
    setActivePanel(null);
  };

  const renderContent = () => {
    if (!isReader) {
      return (
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-sm text-center font-serif" style={{ color: mutedColor }}>
            选择一本书开始阅读
          </p>
        </div>
      );
    }

    switch (activePanel) {
      case 'toc':
        return (
          <div className="flex-1 overflow-y-auto py-2">
            {toc.length > 0 ? (
              toc.map((item) => (
                <TocItemNode
                  key={item.id}
                  item={item}
                  level={0}
                  normalizedCurrentHref={normalizedCurrentHref}
                  currentChapter={currentChapter}
                  goToHrefFn={goToHrefFn}
                  activeText={activeText}
                  textColor={textColor}
                  activeBg={activeBg}
                  mutedColor={mutedColor}
                />
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm font-serif" style={{ color: mutedColor }}>
                暂无目录
              </p>
            )}
          </div>
        );

      case 'bookmarks':
        return (
          <div className="flex-1 overflow-y-auto">
            {bookmarks.length > 0 ? (
              <div className="py-1">
                {bookmarks
                  .sort((a, b) => a.percentage - b.percentage)
                  .map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-center justify-between px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => handleGoToBookmark(bookmark.cfi)}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate font-serif"
                          style={{ color: textColor }}
                        >
                          {bookmark.chapter && bookmark.chapter !== '未命名章节'
                            ? `${bookmark.chapter} · ${bookmark.percentage.toFixed(1)}%`
                            : `阅读位置 ${bookmark.percentage.toFixed(1)}%`}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bookmark.id);
                        }}
                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                        style={{ color: theme === 'night' ? '#f87171' : '#ef4444' }}
                        title="删除书签"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="px-4 py-8 text-center text-sm font-serif" style={{ color: mutedColor }}>
                暂无书签
              </p>
            )}
          </div>
        );

      case 'font':
        return (
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-2">
              {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center justify-between"
                  style={{
                    color: fontSize === size ? activeText : textColor,
                    backgroundColor: fontSize === size ? activeBg : 'transparent',
                    fontWeight: fontSize === size ? 600 : 400,
                  }}
                >
                  <span
                    className="font-serif"
                    style={{ fontSize: size === 'small' ? '14px' : size === 'medium' ? '16px' : '18px' }}
                  >
                    字体大小示例文字
                  </span>
                  <span className="text-sm">{FONT_SIZE_LABELS[size]}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeId)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3"
                  style={{
                    color: theme === t.id ? activeText : textColor,
                    backgroundColor: theme === t.id ? activeBg : 'transparent',
                    fontWeight: theme === t.id ? 600 : 400,
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full border flex-shrink-0"
                    style={{ backgroundColor: t.background, borderColor: borderColor }}
                  />
                  <div className="flex-1">
                    <p className="font-serif text-sm">{t.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="w-72 h-full flex flex-col shrink-0 border-r transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
    >
      <div
        className="flex items-center justify-between px-4 h-12 shrink-0 border-b"
        style={{ borderColor: borderColor }}
      >
        <h3
          className="font-serif text-sm font-medium flex items-center gap-2"
          style={{ color: activeText }}
        >
          {panelIcon}
          {panelTitle}
        </h3>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          style={{ color: textColor }}
          title="关闭侧栏"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
