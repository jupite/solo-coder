import { useState, useRef, useCallback, useEffect } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { TocItem } from '@/types';
import { convertToEpubIfNeeded } from '@/utils/mobiToEpub';

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
  const [cover, setCover] = useState<string>('');
  const renditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<Book | null>(null);
  const tocRef = useRef<TocItem[]>([]);
  const locationsReadyRef = useRef<boolean>(false);
  const sectionsMapRef = useRef<Map<string, SectionInfo>>(new Map());

  const blobUrlToBase64 = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('封面 blob->base64 转换失败:', e);
      return '';
    }
  };

  const extractCover = async (bookObj: Book): Promise<string> => {
    let coverUrl = '';
    try {
      const url = await (bookObj as any).coverUrl();
      if (url) coverUrl = url;
    } catch (e) {
      // ignore
    }
    if (!coverUrl) {
      try {
        const manifest = (bookObj as any).package?.manifest;
        if (manifest) {
          for (const key in manifest) {
            const item = manifest[key];
            if (
              item?.properties === 'cover-image' ||
              item?.href?.toLowerCase().includes('cover')
            ) {
              const url = await (bookObj as any).archive.createURL(item.href);
              if (url) {
                coverUrl = url;
                break;
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (coverUrl) {
      if (coverUrl.startsWith('data:')) {
        return coverUrl;
      }
      const base64 = await blobUrlToBase64(coverUrl);
      if (base64) return base64;
    }
    return '';
  };

  const parseToc = (items: any[], parentHref: string = '', depth: number = 0): TocItem[] => {
    let globalIndex = 0;
    const resolveHref = (href: string, parent: string): string => {
      if (!href) return parent || '';
      if (href.startsWith('http') || href.startsWith('/')) return href;
      if (href.startsWith('#')) return parent + href;
      if (!parent) return href;
      const parentPath = parent.substring(0, parent.lastIndexOf('/') + 1);
      return parentPath + href;
    };

    const processItems = (list: any[], parent: string, level: number): TocItem[] => {
      return list.map((item, idx) => {
        const resolvedHref = resolveHref(item.href || '', parent);
        const id = `toc-${level}-${idx}-${globalIndex++}-${item.href || 'no-href'}`;
        return {
          id,
          label: item.label || '',
          href: resolvedHref,
          children: item.subitems && item.subitems.length > 0
            ? processItems(item.subitems, item.href ? resolvedHref : parent, level + 1)
            : undefined,
        } as TocItem;
      });
    };

    return processItems(items, parentHref, depth);
  };

  const resolveRelativePath = (href: string): string => {
    if (!href) return '';
    let parts = href.split('#');
    let path = parts[0];
    const hash = parts[1] ? '#' + parts[1] : '';
    path = path.replace(/^\.\//, '').replace(/^\//, '');
    while (path.includes('../')) {
      path = path.replace(/^([^/]*\/)?\.\.\//, '');
    }
    return path + hash;
  };

  const normalizeHref = (href: string): string => {
    if (!href) return '';
    return resolveRelativePath(href).split('#')[0];
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
    const hashPart = tocHref.includes('#') ? '#' + tocHref.split('#')[1] : '';
    const normalized = normalizeHref(tocHref);

    const exact = sectionsMapRef.current.get(normalized);
    if (exact) {
      return exact.href + hashPart;
    }

    for (const [key, section] of sectionsMapRef.current.entries()) {
      if (key === normalized) {
        return section.href + hashPart;
      }
      if (normalized.endsWith(key) || key.endsWith(normalized)) {
        return section.href + hashPart;
      }
      if (normalized && key && (normalized.includes(key) || key.includes(normalized))) {
        return section.href + hashPart;
      }
    }

    const resolvedWithRelative = resolveRelativePath(tocHref);
    const normalized2 = normalizeHref(resolvedWithRelative);
    const exact2 = sectionsMapRef.current.get(normalized2);
    if (exact2) {
      return exact2.href + hashPart;
    }

    return tocHref;
  };

  const loadBook = useCallback(async (file: File, preferredBookId?: string) => {
    setIsLoading(true);
    setIsLoaded(false);
    setLocationsReady(false);
    setLoadError(null);
    setCurrentCfi('');
    setProgress(0);
    setCurrentChapter('');
    setCurrentHref('');

    try {
      const id = preferredBookId || `${file.name}-${file.size}-${file.lastModified}`;
      console.log('[useEpub loadBook] bookId:', id, 'preferredBookId:', preferredBookId);
      setBookId(id);

      const { file: epubFile, isConverted } = await convertToEpubIfNeeded(file);
      if (isConverted) {
        console.log('[useEpub loadBook] MOBI/KF8 file converted to EPUB');
      }

      const arrayBuffer = await epubFile.arrayBuffer();
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
      const originalTitle = file.name.replace(/\.(epub|mobi|azw|azw3|pdf)$/i, '');
      setBookTitle(metadata?.title || originalTitle);

      const coverUrl = await extractCover(newBook);
      setCover(coverUrl);

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
        try {
          const rendition: any = renditionRef.current;
          if (rendition && typeof rendition.currentLocation === 'function') {
            const loc = rendition.currentLocation();
            if (loc?.start?.cfi) {
              const pct = newBook.locations.percentageFromCfi(loc.start.cfi);
              setProgress(Math.round(pct * 100 * 100) / 100);
            }
          }
        } catch (e) {
          console.warn('locations ready 后计算进度失败:', e);
        }
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
            const rounded = Math.round(pct * 100 * 100) / 100;
            console.log('[progress] locations 计算进度:', rounded, '%');
            setProgress(rounded);
          } catch (e) {
            console.warn('[progress] locations 计算失败:', e);
          }
        } else if (location.start.index != null && bookRef.current) {
          try {
            const spine = (bookRef.current as any).spine;
            const total = spine?.items?.length || spine?.length || 0;
            if (total > 0) {
              const estimated = Math.round((location.start.index / (total - 1 || 1)) * 100 * 100) / 100;
              const clamped = Math.max(0, Math.min(100, estimated));
              console.log('[progress] spine 估算进度:', clamped, '% (index:', location.start.index, 'total:', total, ')');
              setProgress(clamped);
            }
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

    console.log('[goToHref 跳转:', href);

    const tryDisplay = async (targetHref: string): Promise<any> => {
      if (!renditionRef.current) return Promise.resolve();
      try {
        return await renditionRef.current.display(targetHref);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const tryAll = async () => {
      const resolved = resolveTocHref(href);
      const normalized = normalizeHref(href);
      const relativeResolved = resolveRelativePath(href);

      const attempts = [
        resolved,
        href,
        normalized,
        relativeResolved,
      ].filter((v, i, a) => v && a.indexOf(v) === i);

      console.log('尝试跳转的href列表:', attempts);

      let chain: Promise<any> = Promise.reject();
      for (const target of attempts) {
        chain = chain.catch(() => tryDisplay(target));
      }
      return chain.catch((err) => {
        console.warn('所有跳转fallback都失败:', err?.message || err);
      });
    };

    return tryAll();
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
    cover,
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
