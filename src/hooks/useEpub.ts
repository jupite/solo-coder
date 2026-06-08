import { useState, useRef, useCallback, useEffect } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { TocItem } from '@/types';

export function useEpub() {
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentCfi, setCurrentCfi] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookId, setBookId] = useState<string>('');
  const [locationsReady, setLocationsReady] = useState<boolean>(false);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<Book | null>(null);

  const parseToc = (items: any[]): TocItem[] => {
    return items.map((item, index) => ({
      id: `${item.href}-${index}`,
      label: item.label,
      href: item.href,
      children: item.subitems ? parseToc(item.subitems) : undefined,
    }));
  };

  const findTocItemByHref = (items: TocItem[], href: string): TocItem | null => {
    const baseHref = href.split('#')[0];
    for (const item of items) {
      const itemBase = item.href.split('#')[0];
      if (itemBase === baseHref) {
        return item;
      }
      if (item.children) {
        const found = findTocItemByHref(item.children, href);
        if (found) return found;
      }
    }
    return null;
  };

  const loadBook = useCallback(async (file: File) => {
    setIsLoading(true);
    setIsLoaded(false);
    setLocationsReady(false);

    try {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      setBookId(id);

      const url = URL.createObjectURL(file);
      const newBook = ePub(url);
      setBook(newBook);
      bookRef.current = newBook;

      await newBook.ready;

      const metadata = newBook.metadata;
      setBookTitle(metadata.title || file.name.replace(/\.epub$/i, ''));

      const navigation = newBook.navigation;
      if (navigation && navigation.toc) {
        setToc(parseToc(navigation.toc));
      }

      setIsLoaded(true);

      newBook.locations.generate(1024).then(() => {
        setLocationsReady(true);
      });
    } catch (error) {
      console.error('Failed to load book:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderBook = useCallback((container: HTMLElement) => {
    if (!bookRef.current) return;

    if (renditionRef.current) {
      renditionRef.current.destroy();
      renditionRef.current = null;
    }

    const newRendition = bookRef.current.renderTo(container, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'paginated',
      manager: 'default',
    });

    renditionRef.current = newRendition;
    setRendition(newRendition);

    newRendition.on('relocated', (location: any) => {
      if (location.start) {
        setCurrentCfi(location.start.cfi);

        if (location.start.href) {
          const tocItem = findTocItemByHref(toc, location.start.href);
          if (tocItem) {
            setCurrentChapter(tocItem.label);
          }
        }

        if (bookRef.current && bookRef.current.locations && locationsReady) {
          try {
            const pct = bookRef.current.locations.percentageFromCfi(location.start.cfi);
            setProgress(Math.round(pct * 100 * 100) / 100);
          } catch (e) {
            setProgress(0);
          }
        }
      }
    });

    newRendition.display();

    return newRendition;
  }, [toc, locationsReady]);

  const nextPage = useCallback((): Promise<any> => {
    if (renditionRef.current) {
      return renditionRef.current.next();
    }
    return Promise.resolve();
  }, []);

  const prevPage = useCallback((): Promise<any> => {
    if (renditionRef.current) {
      return renditionRef.current.prev();
    }
    return Promise.resolve();
  }, []);

  const goToCfi = useCallback((cfi: string) => {
    if (renditionRef.current && cfi) {
      renditionRef.current.display(cfi);
    }
  }, []);

  const goToPercentage = useCallback((percentage: number) => {
    if (renditionRef.current && bookRef.current && locationsReady) {
      try {
        const cfi = bookRef.current.locations.cfiFromPercentage(percentage / 100);
        if (cfi) {
          renditionRef.current.display(cfi);
        }
      } catch (e) {
        console.error('Failed to go to percentage:', e);
      }
    }
  }, [locationsReady]);

  const goToHref = useCallback((href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href);
    }
  }, []);

  const applyTheme = useCallback((background: string, text: string) => {
    if (renditionRef.current) {
      renditionRef.current.themes.default({
        'body': {
          background: `${background} !important`,
          color: `${text} !important`,
        },
        'p': {
          color: `${text} !important`,
        },
        'div': {
          color: `${text} !important`,
        },
        'span': {
          color: `${text} !important`,
        },
        'a': {
          color: `${text} !important`,
        },
        'h1, h2, h3, h4, h5, h6': {
          color: `${text} !important`,
        },
        'li': {
          color: `${text} !important`,
        },
      });
    }
  }, []);

  const applyFontSize = useCallback((fontSize: string) => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(fontSize);
    }
  }, []);

  const applyStyles = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.override('line-height', '1.8');
      renditionRef.current.themes.override('font-family', 'Georgia, "Times New Roman", Times, serif');
      renditionRef.current.themes.override('text-align', 'justify');

      const css = `
        p {
          text-indent: 2em;
          margin-bottom: 1.2em;
          line-height: 1.8;
        }
        body {
          padding: 0 !important;
        }
      `;
      renditionRef.current.themes.override(css);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
        renditionRef.current = null;
      }
    };
  }, []);

  return {
    book,
    rendition,
    bookTitle,
    toc,
    currentCfi,
    progress,
    currentChapter,
    isLoaded,
    isLoading,
    bookId,
    locationsReady,
    viewerRef,
    loadBook,
    renderBook,
    nextPage,
    prevPage,
    goToCfi,
    goToPercentage,
    goToHref,
    applyTheme,
    applyFontSize,
    applyStyles,
  };
}
