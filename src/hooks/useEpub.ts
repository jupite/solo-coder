import { useState, useRef, useCallback, useEffect } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { TocItem } from '@/types';

interface SectionInfo {
  index: number;
  id: string;
  href: string;
  url: string;
  cfi: string;
}

export function useEpub() {
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [currentCfi, setCurrentCfi] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [currentHref, setCurrentHref] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bookId, setBookId] = useState<string>('');
  const [locationsReady, setLocationsReady] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<Book | null>(null);
  const tocRef = useRef<TocItem[]>([]);
  const locationsReadyRef = useRef<boolean>(false);
  const sectionsMapRef = useRef<Map<string, SectionInfo>>(new Map());

  const parseToc = (items: any[]): TocItem[] => {
    return items.map((item, index) => ({
      id: `${item.href}-${index}`,
      label: item.label,
      href: item.href,
      children: item.subitems ? parseToc(item.subitems) : undefined,
    }));
  };

  const normalizeHref = (href: string): string => {
    if (!href) return '';
    return href.split('#')[0].replace(/^\.\//, '').replace(/^\//, '');
  };

  const buildSectionsMap = (bookObj: Book) => {
    const map = new Map<string, SectionInfo>();
    try {
      const spine = (bookObj as any).spine;
      if (spine && spine.each) {
        spine.each((section: any, index: number) => {
          if (section && section.href) {
            const normalized = normalizeHref(section.href);
            map.set(normalized, {
              index,
              id: section.id || '',
              href: section.href,
              url: section.url || '',
              cfi: section.cfi || '',
            });
          }
        });
      } else if (spine && Array.isArray(spine.items)) {
        spine.items.forEach((section: any, index: number) => {
          if (section && section.href) {
            const normalized = normalizeHref(section.href);
            map.set(normalized, {
              index,
              id: section.id || '',
              href: section.href,
              url: section.url || '',
              cfi: section.cfi || '',
            });
          }
        });
      }
    } catch (e) {
      console.warn('构建章节映射失败:', e);
    }
    sectionsMapRef.current = map;
  };

  const findTocItemByHref = (items: TocItem[], href: string): TocItem | null => {
    const normalizedTarget = normalizeHref(href);
    for (const item of items) {
      const normalizedItem = normalizeHref(item.href);
      if (normalizedItem === normalizedTarget) {
        return item;
      }
      if (normalizedTarget.startsWith(normalizedItem) || normalizedItem.startsWith(normalizedTarget)) {
        return item;
      }
      if (item.children) {
        const found = findTocItemByHref(item.children, href);
        if (found) return found;
      }
    }
    return null;
  };

  const resolveTocHref = (tocHref: string): string => {
    if (!tocHref) return '';
    const normalized = normalizeHref(tocHref);
    const section = sectionsMapRef.current.get(normalized);
    if (section) {
      if (tocHref.includes('#')) {
        const hash = tocHref.split('#')[1];
        return `${section.href}#${hash}`;
      }
      return section.href;
    }
    return tocHref;
  };

  const loadBook = useCallback(async (file: File) => {
    setIsLoading(true);
    setIsLoaded(false);
    setLocationsReady(false);
    setLoadError(null);
    setCurrentCfi('');
    setProgress(0);
    setCurrentChapter('');
    setCurrentHref('');

    try {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      setBookId(id);

      const arrayBuffer = await file.arrayBuffer();
      const newBook = ePub(arrayBuffer);
      setBook(newBook);
      bookRef.current = newBook;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('书籍加载超时'));
        }, 15000);

        newBook.opened
          .then(() => {
            clearTimeout(timeout);
            resolve();
          })
          .catch((err: any) => {
            clearTimeout(timeout);
            reject(err);
          });
      });

      const metadata = newBook.metadata;
      setBookTitle(metadata?.title || file.name.replace(/\.epub$/i, ''));

      buildSectionsMap(newBook);

      const navigation = newBook.navigation;
      let tocItems: TocItem[] = [];
      if (navigation?.toc) {
        tocItems = parseToc(navigation.toc);
        setToc(tocItems);
        tocRef.current = tocItems;
      }

      setIsLoaded(true);
      setIsLoading(false);

      newBook.locations.generate(1024).then(() => {
        setLocationsReady(true);
        locationsReadyRef.current = true;
      }).catch((err: any) => {
        console.warn('生成阅读位置失败:', err);
      });

    } catch (error: any) {
      console.error('Failed to load book:', error);
      setLoadError(error.message || '加载失败');
      setIsLoading(false);
    }
  }, []);

  const renderBook = useCallback((container: HTMLElement) => {
    if (!bookRef.current) return;

    if (renditionRef.current) {
      try {
        renditionRef.current.destroy();
      } catch (e) {
        // ignore
      }
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
      if (location?.start) {
        setCurrentCfi(location.start.cfi || '');

        let href = location.start.href || '';
        if (!href && location.start.index != null && bookRef.current) {
          try {
            const spine = (bookRef.current as any).spine;
            const section = spine?.items?.[location.start.index] || spine?.get?.(location.start.index);
            if (section?.href) {
              href = section.href;
            }
          } catch (e) {
            // ignore
          }
        }

        if (href) {
          setCurrentHref(href);
          const tocItem = findTocItemByHref(tocRef.current, href);
          if (tocItem) {
            setCurrentChapter(tocItem.label);
          }
        }

        if (bookRef.current?.locations && locationsReadyRef.current) {
          try {
            const pct = bookRef.current.locations.percentageFromCfi(location.start.cfi);
            setProgress(Math.round(pct * 100 * 100) / 100);
          } catch (e) {
            // ignore
          }
        }
      }
    });

    newRendition.display();

    return newRendition;
  }, []);

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
      try {
        return renditionRef.current.display(cfi).catch((err: any) => {
          console.warn('goToCfi 跳转失败:', err?.message || err);
        });
      } catch (err: any) {
        console.warn('goToCfi 跳转失败:', err?.message || err);
      }
    }
    return Promise.resolve();
  }, []);

  const goToPercentage = useCallback((percentage: number) => {
    if (renditionRef.current && bookRef.current && locationsReadyRef.current) {
      try {
        const cfi = bookRef.current.locations.cfiFromPercentage(percentage / 100);
        if (cfi) {
          return renditionRef.current.display(cfi).catch((err: any) => {
            console.warn('goToPercentage 跳转失败:', err?.message || err);
          });
        }
      } catch (err: any) {
        console.warn('goToPercentage 跳转失败:', err?.message || err);
      }
    }
    return Promise.resolve();
  }, []);

  const goToHref = useCallback((href: string) => {
    if (!renditionRef.current || !href) return Promise.resolve();

    try {
      const resolved = resolveTocHref(href);
      return renditionRef.current.display(resolved).catch((err: any) => {
        console.warn('goToHref 跳转失败, resolved:', resolved, 'error:', err?.message || err);
        const fallback = normalizeHref(href);
        if (fallback && fallback !== resolved) {
          return renditionRef.current?.display(fallback).catch((err2: any) => {
            console.warn('goToHref fallback 也失败:', err2?.message || err2);
          });
        }
      });
    } catch (err: any) {
      console.warn('goToHref 跳转失败:', err?.message || err);
    }
    return Promise.resolve();
  }, []);

  const applyTheme = useCallback((background: string, text: string) => {
    if (renditionRef.current) {
      try {
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
      } catch (e) {
        console.warn('应用主题失败:', e);
      }
    }
  }, []);

  const applyFontSize = useCallback((fontSize: string) => {
    if (renditionRef.current) {
      try {
        renditionRef.current.themes.fontSize(fontSize);
      } catch (e) {
        console.warn('应用字体大小失败:', e);
      }
    }
  }, []);

  const applyStyles = useCallback(() => {
    if (renditionRef.current) {
      try {
        renditionRef.current.themes.override('line-height', '1.8');
        renditionRef.current.themes.override('font-family', 'Georgia, "Times New Roman", Times, serif');
        renditionRef.current.themes.override('text-align', 'justify');
      } catch (e) {
        console.warn('应用样式失败:', e);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
        } catch (e) {
          // ignore
        }
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
    currentHref,
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
    goToPercentage,
    goToHref,
    applyTheme,
    applyFontSize,
    applyStyles,
  };
}
