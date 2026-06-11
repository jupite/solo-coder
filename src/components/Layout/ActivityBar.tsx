import { Library, List, Bookmark, Type, Sun, Moon, Eye, Highlighter } from 'lucide-react';
import { useReaderStore } from '@/store/readerStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { THEMES } from '@/types';
import { useMobile } from '@/hooks/useMobile';

export default function ActivityBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activePanel, togglePanel, setActivePanel, theme } = useReaderStore();
  const isMobile = useMobile();

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

  const buttonBase = isMobile
    ? `flex-1 h-14 flex flex-col items-center justify-center transition-all duration-150 relative gap-0.5`
    : `w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-150 relative`;
  const activeIndicator = isMobile
    ? `absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-b`
    : `absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r`;

  const isHome = location.pathname === '/';

  const buttonLabel = isMobile ? (
    <span className="text-[10px] font-serif">
      {isHome ? '书架' : activePanel === 'toc' ? '目录' : activePanel === 'bookmarks' ? '书签' : activePanel === 'annotations' ? '标注' : activePanel === 'font' ? '字体' : activePanel === 'theme' ? '主题' : theme === 'night' ? '夜间' : theme === 'eye' ? '护眼' : '日间'}
    </span>
  ) : null;

  return (
    <div
      className={isMobile
        ? 'w-full flex flex-row items-center shrink-0 border-t px-1'
        : 'w-14 h-full flex flex-col items-center py-3 gap-1 shrink-0'}
      style={{
        backgroundColor: bgColor,
        borderRight: isMobile ? 'none' : `1px solid ${borderColor}`,
        borderTop: isMobile ? `1px solid ${borderColor}` : 'none',
        paddingTop: isMobile ? '4px' : '12px',
        paddingBottom: isMobile ? '4px' : '12px',
        paddingLeft: isMobile ? '4px' : undefined,
        paddingRight: isMobile ? '4px' : undefined,
      }}
    >
      <button
        onClick={handleGoHome}
        className={`${buttonBase} ${isHome ? '' : isMobile ? '' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
        style={{
          color: isHome ? activeText : textColor,
          backgroundColor: isHome ? activeBg : 'transparent',
          borderRadius: isMobile ? '8px' : undefined,
        }}
        title="书架"
      >
        {isHome && (
          <span
            className={activeIndicator}
            style={{ backgroundColor: activeText }}
          />
        )}
        <Library className={isMobile ? 'w-5 h-5' : 'w-5 h-5'} />
        {isMobile && <span className="text-[10px] font-serif">书架</span>}
      </button>

      {isReader && (
        <>
          <div
            className={isMobile ? 'w-px h-8 mx-0.5' : 'w-8 h-px my-1'}
            style={{ backgroundColor: borderColor }}
          />

          <button
            onClick={() => togglePanel('toc')}
            className={`${buttonBase} ${activePanel !== 'toc' ? (isMobile ? '' : 'hover:bg-black/5 dark:hover:bg-white/10') : ''}`}
            style={{
              color: activePanel === 'toc' ? activeText : textColor,
              backgroundColor: activePanel === 'toc' ? activeBg : 'transparent',
              borderRadius: isMobile ? '8px' : undefined,
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
            {isMobile && <span className="text-[10px] font-serif">目录</span>}
          </button>

          <button
            onClick={() => togglePanel('bookmarks')}
            className={`${buttonBase} ${activePanel !== 'bookmarks' ? (isMobile ? '' : 'hover:bg-black/5 dark:hover:bg-white/10') : ''}`}
            style={{
              color: activePanel === 'bookmarks' ? activeText : textColor,
              backgroundColor: activePanel === 'bookmarks' ? activeBg : 'transparent',
              borderRadius: isMobile ? '8px' : undefined,
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
            {isMobile && <span className="text-[10px] font-serif">书签</span>}
          </button>

          <button
            onClick={() => togglePanel('annotations')}
            className={`${buttonBase} ${activePanel !== 'annotations' ? (isMobile ? '' : 'hover:bg-black/5 dark:hover:bg-white/10') : ''}`}
            style={{
              color: activePanel === 'annotations' ? activeText : textColor,
              backgroundColor: activePanel === 'annotations' ? activeBg : 'transparent',
              borderRadius: isMobile ? '8px' : undefined,
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
            {isMobile && <span className="text-[10px] font-serif">标注</span>}
          </button>

          {isMobile && <div className="w-px h-8 mx-0.5" style={{ backgroundColor: borderColor }} />}
          {!isMobile && <div className="w-8 h-px my-1" style={{ backgroundColor: borderColor }} />}

          <button
            onClick={() => togglePanel('font')}
            className={`${buttonBase} ${activePanel !== 'font' ? (isMobile ? '' : 'hover:bg-black/5 dark:hover:bg-white/10') : ''}`}
            style={{
              color: activePanel === 'font' ? activeText : textColor,
              backgroundColor: activePanel === 'font' ? activeBg : 'transparent',
              borderRadius: isMobile ? '8px' : undefined,
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
            {isMobile && <span className="text-[10px] font-serif">字体</span>}
          </button>

          <button
            onClick={() => togglePanel('theme')}
            className={`${buttonBase} ${activePanel !== 'theme' ? (isMobile ? '' : 'hover:bg-black/5 dark:hover:bg-white/10') : ''}`}
            style={{
              color: activePanel === 'theme' ? activeText : textColor,
              backgroundColor: activePanel === 'theme' ? activeBg : 'transparent',
              borderRadius: isMobile ? '8px' : undefined,
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
            {isMobile && <span className="text-[10px] font-serif">主题</span>}
          </button>
        </>
      )}

      {!isMobile && <div className="flex-1" />}
    </div>
  );
}
