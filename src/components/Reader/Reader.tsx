import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReaderStore } from '@/store/readerStore';
import { useEpub } from '@/hooks/useEpub';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import Toolbar from './Toolbar';
import ProgressBar from './ProgressBar';
import TocPanel from './TocPanel';
import BookmarkList from './BookmarkList';
import { BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reader() {
  const navigate = useNavigate();
  const { bookFile, showToc, showBookmarks, setShowBookmarks } = useReaderStore();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isTurning, setIsTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [showJumpTip, setShowJumpTip] = useState(false);
  const hasJumpedRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  const {
    bookTitle,
    toc,
    currentCfi,
    progress,
    currentChapter,
    isLoaded,
    isLoading,
    bookId,
    locationsReady,
    loadError,
    loadBook,
    renderBook,
    nextPage,
    prevPage,
    goToCfi,
    goToHref,
    goToPercentage,
    applyTheme: applyEpubTheme,
    applyFontSize,
    applyStyles,
  } = useEpub();

  const { theme, setTheme, currentTheme, fontSize, setFontSize, fontSizeValue } = useTheme();
  const { bookmarks, toggleBookmark, removeBookmark, isCurrentPageBookmarked } = useBookmarks(bookId);
  const { saveProgress, progress: savedProgress } = useReadingProgress(bookId);

  useEffect(() => {
    if (!bookFile) {
      navigate('/');
      return;
    }
    loadBook(bookFile);
  }, [bookFile, loadBook, navigate]);

  useEffect(() => {
    if (isLoaded && viewerRef.current && isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      const rendition = renderBook(viewerRef.current);
      if (rendition) {
        setTimeout(() => {
          applyEpubTheme(currentTheme.background, currentTheme.text);
          applyFontSize(fontSizeValue);
          applyStyles();
        }, 100);

        const handleRelocated = () => {
          if (savedProgress && savedProgress.cfi && !hasJumpedRef.current) {
            hasJumpedRef.current = true;
            setTimeout(() => {
              goToCfi(savedProgress.cfi);
              setShowJumpTip(true);
              setTimeout(() => setShowJumpTip(false), 3000);
            }, 200);
          }
        };

        rendition.on('relocated', handleRelocated);

        return () => {
          rendition.off('relocated', handleRelocated);
        };
      }
    }
  }, [isLoaded, renderBook, currentTheme, fontSizeValue, applyEpubTheme, applyFontSize, applyStyles, savedProgress, goToCfi]);

  useEffect(() => {
    if (isLoaded && currentCfi && progress >= 0 && hasJumpedRef.current) {
      saveProgress(currentCfi, progress);
    }
  }, [currentCfi, progress, isLoaded, saveProgress]);

  useEffect(() => {
    if (isLoaded) {
      applyEpubTheme(currentTheme.background, currentTheme.text);
    }
  }, [theme, applyEpubTheme, currentTheme, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      applyFontSize(fontSizeValue);
    }
  }, [fontSize, applyFontSize, fontSizeValue, isLoaded]);

  const handleNextPage = useCallback(async () => {
    if (isTurning) return;
    setTurnDirection('next');
    setIsTurning(true);
    await nextPage();
    setTimeout(() => {
      setIsTurning(false);
      setTurnDirection(null);
    }, 300);
  }, [isTurning, nextPage]);

  const handlePrevPage = useCallback(async () => {
    if (isTurning) return;
    setTurnDirection('prev');
    setIsTurning(true);
    await prevPage();
    setTimeout(() => {
      setIsTurning(false);
      setTurnDirection(null);
    }, 300);
  }, [isTurning, prevPage]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      handleNextPage();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevPage();
    }
  }, [handleNextPage, handlePrevPage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTocNavigate = (href: string) => {
    goToHref(href);
  };

  const handleSeek = (percentage: number) => {
    goToPercentage(percentage);
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(currentCfi, currentChapter, progress);
  };

  const handleGoToBookmark = (cfi: string) => {
    goToCfi(cfi);
    setShowBookmarks(false);
  };

  const handleDeleteBookmark = (id: string) => {
    removeBookmark(id);
  };

  const isBookmarked = isCurrentPageBookmarked(currentCfi);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme.background }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: currentTheme.text, borderTopColor: 'transparent' }}
          />
          <p className="font-serif" style={{ color: currentTheme.text }}>
            正在加载书籍...
          </p>
          {loadError && (
            <p className="text-red-500 mt-4 text-sm font-serif">
              加载失败: {loadError}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loadError && !isLoaded) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme.background }}
      >
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">📕</div>
          <h2 className="text-xl font-serif mb-2" style={{ color: currentTheme.text }}>
            书籍加载失败
          </h2>
          <p className="text-sm font-serif mb-6" style={{ color: currentTheme.text, opacity: 0.7 }}>
            {loadError}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg font-serif text-sm"
            style={{
              backgroundColor: currentTheme.text,
              color: currentTheme.background,
            }}
          >
            返回书架
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: currentTheme.background }}
    >
      <TocPanel
        toc={toc}
        currentChapter={currentChapter}
        theme={theme}
        onNavigate={handleTocNavigate}
      />

      <div
        className={`relative h-screen transition-all duration-300 ease-in-out
          ${showToc ? 'md:ml-72' : 'ml-0'}`}
        onClick={() => {
          if (showBookmarks) setShowBookmarks(false);
        }}
      >
        <Toolbar
          bookTitle={bookTitle}
          theme={theme}
          fontSize={fontSize}
          isBookmarked={isBookmarked}
          onThemeChange={setTheme}
          onFontSizeChange={setFontSize}
          onBookmarkToggle={handleBookmarkToggle}
        />

        <BookmarkList
          bookmarks={bookmarks}
          theme={theme}
          onGoToBookmark={handleGoToBookmark}
          onDeleteBookmark={handleDeleteBookmark}
        />

        {isBookmarked && (
          <div className="absolute top-16 right-8 z-20 pointer-events-none">
            <BookmarkCheck
              className="w-5 h-5"
              style={{
                color: currentTheme.text,
                fill: currentTheme.text,
                opacity: 0.5,
              }}
            />
          </div>
        )}

        {showJumpTip && (
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg text-sm font-serif
              shadow-lg animate-fade-in"
            style={{
              backgroundColor: theme === 'night' ? 'rgba(60, 60, 60, 0.95)' : 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
            }}
          >
            已跳转到上次阅读位置
          </div>
        )}

        <div className="relative h-full flex items-stretch">
          <button
            className="absolute left-0 top-0 bottom-0 w-16 md:w-20 z-10 flex items-center justify-center
              transition-colors duration-200 group"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPage();
            }}
            title="上一页"
          >
            <ChevronLeft
              className="w-8 h-8 opacity-0 group-hover:opacity-30 transition-opacity duration-200"
              style={{ color: currentTheme.text }}
            />
          </button>

          <div
            ref={viewerRef}
            className={`h-full transition-transform duration-300 ease-in-out mx-auto
              ${turnDirection === 'next' ? 'translate-x-[-50px] opacity-0' : ''}
              ${turnDirection === 'prev' ? 'translate-x-[50px] opacity-0' : ''}`}
            style={{
              paddingTop: '60px',
              paddingBottom: '80px',
              maxWidth: '800px',
              width: '100%',
            }}
          />

          <button
            className="absolute right-0 top-0 bottom-0 w-16 md:w-20 z-10 flex items-center justify-center
              transition-colors duration-200 group"
            onClick={(e) => {
              e.stopPropagation();
              handleNextPage();
            }}
            title="下一页"
          >
            <ChevronRight
              className="w-8 h-8 opacity-0 group-hover:opacity-30 transition-opacity duration-200"
              style={{ color: currentTheme.text }}
            />
          </button>
        </div>

        <ProgressBar
          progress={progress}
          theme={theme}
          onSeek={handleSeek}
        />

        {!locationsReady && isLoaded && (
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs font-serif"
            style={{ color: currentTheme.text, opacity: 0.5 }}
          >
            正在生成阅读进度...
          </div>
        )}
      </div>
    </div>
  );
}
