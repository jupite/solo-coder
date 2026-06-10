import { Library, List, Bookmark, Type, Sun, Moon, Eye, Highlighter } from 'lucide-react';
import { useReaderStore } from '@/store/readerStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { THEMES } from '@/types';

export default function ActivityBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activePanel, togglePanel, setActivePanel, theme } = useReaderStore();

  const currentTheme = THEMES.find((t) => t.id === theme)!;
  const isReader = location.pathname === '/reader';

  const handleGoHome = () => {
    navigate('/');
    setActivePanel(null);
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

  const bgColor = currentTheme.background;
  const borderColor = theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#e5e7eb';
  const textColor = theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#6b7280';
  const activeBg = theme === 'night' ? 'rgba(255,255,255,0.1)' : theme === 'eye' ? 'rgba(91,70,54,0.12)' : 'rgba(0,0,0,0.06)';
  const activeText = theme === 'night' ? '#fff' : theme === 'eye' ? '#3d2f1f' : '#111827';

  const buttonBase = `w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-150 relative`;
  const activeIndicator = `absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r`;

  const isHome = location.pathname === '/';

  return (
    <div
      className="w-14 h-full flex flex-col items-center py-3 gap-1 shrink-0"
      style={{
        backgroundColor: bgColor,
        borderRight: `1px solid ${borderColor}`,
      }}
    >
      <button
        onClick={handleGoHome}
        className={`${buttonBase} ${isHome ? '' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
        style={{
          color: isHome ? activeText : textColor,
          backgroundColor: isHome ? activeBg : 'transparent',
        }}
        title="书架"
      >
        {isHome && (
          <span
            className={activeIndicator}
            style={{ backgroundColor: activeText }}
          />
        )}
        <Library className="w-5 h-5" />
      </button>

      {isReader && (
        <>
          <div
            className="w-8 h-px my-1"
            style={{ backgroundColor: borderColor }}
          />

          <button
            onClick={() => togglePanel('toc')}
            className={`${buttonBase} ${activePanel !== 'toc' ? 'hover:bg-black/5 dark:hover:bg-white/10' : ''}`}
            style={{
              color: activePanel === 'toc' ? activeText : textColor,
              backgroundColor: activePanel === 'toc' ? activeBg : 'transparent',
            }}
            title="目录"
          >
            {activePanel === 'toc' && (
              <span
                className={activeIndicator}
                style={{ backgroundColor: activeText }}
              />
            )}
            <List className="w-5 h-5" />
          </button>

          <button
            onClick={() => togglePanel('bookmarks')}
            className={`${buttonBase} ${activePanel !== 'bookmarks' ? 'hover:bg-black/5 dark:hover:bg-white/10' : ''}`}
            style={{
              color: activePanel === 'bookmarks' ? activeText : textColor,
              backgroundColor: activePanel === 'bookmarks' ? activeBg : 'transparent',
            }}
            title="书签"
          >
            {activePanel === 'bookmarks' && (
              <span
                className={activeIndicator}
                style={{ backgroundColor: activeText }}
              />
            )}
            <Bookmark className="w-5 h-5" />
          </button>

          <button
            onClick={() => togglePanel('annotations')}
            className={`${buttonBase} ${activePanel !== 'annotations' ? 'hover:bg-black/5 dark:hover:bg-white/10' : ''}`}
            style={{
              color: activePanel === 'annotations' ? activeText : textColor,
              backgroundColor: activePanel === 'annotations' ? activeBg : 'transparent',
            }}
            title="标注"
          >
            {activePanel === 'annotations' && (
              <span
                className={activeIndicator}
                style={{ backgroundColor: activeText }}
              />
            )}
            <Highlighter className="w-5 h-5" />
          </button>

          <div
            className="w-8 h-px my-1"
            style={{ backgroundColor: borderColor }}
          />

          <button
            onClick={() => togglePanel('font')}
            className={`${buttonBase} ${activePanel !== 'font' ? 'hover:bg-black/5 dark:hover:bg-white/10' : ''}`}
            style={{
              color: activePanel === 'font' ? activeText : textColor,
              backgroundColor: activePanel === 'font' ? activeBg : 'transparent',
            }}
            title="字体"
          >
            {activePanel === 'font' && (
              <span
                className={activeIndicator}
                style={{ backgroundColor: activeText }}
              />
            )}
            <Type className="w-5 h-5" />
          </button>

          <button
            onClick={() => togglePanel('theme')}
            className={`${buttonBase} ${activePanel !== 'theme' ? 'hover:bg-black/5 dark:hover:bg-white/10' : ''}`}
            style={{
              color: activePanel === 'theme' ? activeText : textColor,
              backgroundColor: activePanel === 'theme' ? activeBg : 'transparent',
            }}
            title="主题"
          >
            {activePanel === 'theme' && (
              <span
                className={activeIndicator}
                style={{ backgroundColor: activeText }}
              />
            )}
            {themeIcon()}
          </button>
        </>
      )}

      <div className="flex-1" />
    </div>
  );
}
