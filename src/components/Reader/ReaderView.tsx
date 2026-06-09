import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReaderStore, getCurrentTheme, getFontSizeValue, isCurrentPageBookmarked } from '@/store/readerStore';
import { useEpub } from '@/hooks/useEpub';
import { usePdf } from '@/hooks/usePdf';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import ProgressBar from '../Reader/ProgressBar';
import { BookmarkCheck, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { THEMES } from '@/types';
import { storage } from '@/utils/storage';
import { isMobiFile, isPdfFile } from '@/utils/mobiToEpub';

export default function ReaderView() {
  const navigate = useNavigate();
  const {
    bookFile,
    currentBookId,
    setBookTitle,
    setToc,
    setCurrentCfi,
    setCurrentChapter,
    setCurrentHref,
    setGoToHrefFn,
    setGoToCfiFn,
    setActivePanel,
    resetReaderState,
    theme,
    fontSize,
    toggleBookmark,
    loadBookmarks,
    bookmarks,
  } = useReaderStore();

  const viewerRef = useRef<HTMLDivElement>(null);
  const [isTurning, setIsTurning] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [showJumpTip, setShowJumpTip] = useState(false);
  const hasJumpedRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  const currentTheme = THEMES.find((t) => t.id === theme)!;
  const fontSizeValue = getFontSizeValue();
  const bookIdForProgress = currentBookId || '';

  const epubHook = useEpub();
  const pdfHook = usePdf();

  const isPdf = bookFile ? isPdfFile(bookFile) : false;
  const bookHook = isPdf ? pdfHook : epubHook;

  const {
    bookTitle,
    toc,
    currentCfi,
    progress,
    currentChapter,
    currentHref,
    isLoaded,
    isLoading,
    bookId,
    locationsReady,
    loadError,
    cover,
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
  } = bookHook;

  const { saveProgress, progress: savedProgress } = useReadingProgress(bookIdForProgress);

  useEffect(() => {
    if (currentBookId) {
      loadBookmarks(currentBookId);
    }
  }, [currentBookId, loadBookmarks]);

  useEffect(() => {
    setGoToHrefFn(goToHref);
    setGoToCfiFn(goToCfi);
    return () => {
      setGoToHrefFn(null);
      setGoToCfiFn(null);
    };
  }, [goToHref, goToCfi, setGoToHrefFn, setGoToCfiFn]);

  useEffect(() => {
    if (bookTitle) setBookTitle(bookTitle);
  }, [bookTitle, setBookTitle]);

  useEffect(() => {
    if (cover && currentBookId && cover.startsWith('data:')) {
      (async () => {
        try {
          const books = storage.getBooks();
          const book = books.find((b) => b.id === currentBookId);
          if (book && !book.cover) {
            console.log('[封面保存] 正在保存封面，长度:', cover.length);
            await storage.saveBook({ ...book, cover });
          }
        } catch (e) {
          console.warn('[封面保存] 失败:', e);
        }
      })();
    }
  }, [cover, currentBookId]);

  useEffect(() => {
    setToc(toc);
  }, [toc, setToc]);

  useEffect(() => {
    setCurrentCfi(currentCfi);
  }, [currentCfi, setCurrentCfi]);

  useEffect(() => {
    setCurrentChapter(currentChapter);
  }, [currentChapter, setCurrentChapter]);

  useEffect(() => {
    setCurrentHref(currentHref);
  }, [currentHref, setCurrentHref]);

  useEffect(() => {
    if (!bookFile) {
      navigate('/');
      return;
    }
    loadBook(bookFile, currentBookId || undefined);
    return () => {
      resetReaderState();
      setActivePanel(null);
    };
  }, [bookFile, currentBookId, loadBook, navigate, resetReaderState, setActivePanel]);

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

        if (isPdf) {
          if (savedProgress && savedProgress.cfi && !hasJumpedRef.current) {
            hasJumpedRef.current = true;
            setTimeout(() => {
              goToCfi(savedProgress.cfi);
              setShowJumpTip(true);
              setTimeout(() => setShowJumpTip(false), 3000);
            }, 300);
          } else {
            hasJumpedRef.current = true;
          }
        } else {
          const handleRelocated = () => {
            if (savedProgress && savedProgress.cfi && !hasJumpedRef.current) {
              hasJumpedRef.current = true;
              setTimeout(() => {
                goToCfi(savedProgress.cfi);
                setShowJumpTip(true);
                setTimeout(() => setShowJumpTip(false), 3000);
              }, 200);
            } else {
              hasJumpedRef.current = true;
            }
          };

          rendition.on('relocated', handleRelocated);

          return () => {
            rendition.off('relocated', handleRelocated);
          };
        }
      }
    }
  }, [isLoaded, renderBook, currentTheme, fontSizeValue, applyEpubTheme, applyFontSize, applyStyles, savedProgress, goToCfi, isPdf]);

  useEffect(() => {
    if (isLoaded && currentCfi) {
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

  const handleSeek = (percentage: number) => {
    goToPercentage(percentage);
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(currentBookId || bookId, currentCfi, currentChapter, progress);
  };

  const isBookmarked = isCurrentPageBookmarked(currentCfi);

  if (isLoading) {
    const isMobi = bookFile ? isMobiFile(bookFile) : false;
    const loadingPdf = bookFile ? isPdfFile(bookFile) : false;
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: currentTheme.background }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: currentTheme.text, borderTopColor: 'transparent' }}
        />
          <p className="font-serif" style={{ color: currentTheme.text }}>
            {loadingPdf ? '正在加载 PDF 书籍...' : isMobi ? '正在转换 MOBI 书籍...' : '正在加载书籍...'}
          </p>
          {isMobi && (
            <p className="text-sm font-serif mt-2 opacity-70" style={{ color: currentTheme.text }}>
              首次加载需要转换格式，请稍候
            </p>
          )}
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
        className="flex-1 flex items-center justify-center"
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
      className="relative flex-1 h-full overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: currentTheme.background }}
    >
      <div className="relative h-full">
        {isBookmarked && (
          <div className="absolute top-4 right-6 z-20 pointer-events-none">
            <BookmarkCheck
              className="w-5 h-5"
              style={{
                color: currentTheme.text,
                fill: currentTheme.text,
                opacity: 0.4,
              }}
            />
          </div>
        )}

        <button
          onClick={handleBookmarkToggle}
          className="absolute top-4 right-20 z-20 p-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
          style={{ color: currentTheme.text }}
          title={isBookmarked ? '取消书签' : '添加书签'}
        >
          {isBookmarked ? (
            <Bookmark className="w-5 h-5 fill-current" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>

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
              paddingTop: '20px',
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
