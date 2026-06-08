import { useState } from 'react';
import {
  Home,
  List,
  Bookmark,
  BookmarkCheck,
  Type,
  Sun,
  Moon,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReaderStore } from '@/store/readerStore';
import { ThemeId, FontSize, FONT_SIZE_LABELS, THEMES } from '@/types';

interface ToolbarProps {
  bookTitle: string;
  theme: ThemeId;
  fontSize: FontSize;
  isBookmarked: boolean;
  onThemeChange: (theme: ThemeId) => void;
  onFontSizeChange: (size: FontSize) => void;
  onBookmarkToggle: () => void;
}

export default function Toolbar({
  bookTitle,
  theme,
  fontSize,
  isBookmarked,
  onThemeChange,
  onFontSizeChange,
  onBookmarkToggle,
}: ToolbarProps) {
  const navigate = useNavigate();
  const { setShowToc, setShowBookmarks, showBookmarks } = useReaderStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const themeIcon = () => {
    switch (theme) {
      case 'night':
        return <Moon className="w-5 h-5" />;
      case 'eye':
        return <Eye className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 group">
      <div
        className="h-12 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: theme === 'night'
            ? 'rgba(26, 26, 26, 0.95)'
            : theme === 'eye'
            ? 'rgba(245, 239, 220, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#eee'}`,
        }}
      >
        <div className="h-full flex items-center justify-between px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
              title="返回书架"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowToc(true)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
              title="目录"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div
            className="flex-1 text-center font-serif text-base truncate px-4"
            style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
          >
            {bookTitle}
          </div>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={onBookmarkToggle}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
                title={isBookmarked ? '取消书签' : '添加书签'}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 fill-current" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors -ml-1"
                style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowFontMenu(!showFontMenu);
                  setShowThemeMenu(false);
                }}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1"
                style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
                title="字体大小"
              >
                <Type className="w-5 h-5" />
                <span className="text-xs">{FONT_SIZE_LABELS[fontSize]}</span>
              </button>

              {showFontMenu && (
                <div
                  className="absolute top-full right-0 mt-1 py-1 rounded-lg shadow-lg min-w-[80px]"
                  style={{
                    background: theme === 'night' ? '#2a2a2a' : theme === 'eye' ? '#f5efdc' : '#fff',
                    border: `1px solid ${theme === 'night' ? '#444' : theme === 'eye' ? '#e5dfcc' : '#eee'}`,
                  }}
                >
                  {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        onFontSizeChange(size);
                        setShowFontMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      style={{
                        color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333',
                        fontWeight: fontSize === size ? '600' : '400',
                      }}
                    >
                      {FONT_SIZE_LABELS[size]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowThemeMenu(!showThemeMenu);
                  setShowFontMenu(false);
                }}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333' }}
                title="主题"
              >
                {themeIcon()}
              </button>

              {showThemeMenu && (
                <div
                  className="absolute top-full right-0 mt-1 py-1 rounded-lg shadow-lg min-w-[120px]"
                  style={{
                    background: theme === 'night' ? '#2a2a2a' : theme === 'eye' ? '#f5efdc' : '#fff',
                    border: `1px solid ${theme === 'night' ? '#444' : theme === 'eye' ? '#e5dfcc' : '#eee'}`,
                  }}
                >
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onThemeChange(t.id);
                        setShowThemeMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
                      style={{
                        color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#333',
                        fontWeight: theme === t.id ? '600' : '400',
                      }}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: t.background }}
                      />
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
