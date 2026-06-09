import { useState, useRef, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { TocItem } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

interface PdfOutlineItem {
  title: string;
  dest: any;
  url?: string;
  items?: PdfOutlineItem[];
}

export function usePdf() {
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

  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const currentPageRef = useRef<number>(1);
  const scaleRef = useRef<number>(1);
  const totalPagesRef = useRef<number>(0);
  const renderTaskRef = useRef<any>(null);
  const pdfOutlineRef = useRef<PdfOutlineItem[]>([]);
  const pageMapRef = useRef<Map<number, string>>(new Map());

  const parseOutline = (items: PdfOutlineItem[], depth: number = 0): TocItem[] => {
    let globalIndex = 0;
    const processItems = (list: PdfOutlineItem[], level: number): TocItem[] => {
      return list.map((item, idx) => {
        const id = `toc-${level}-${idx}-${globalIndex++}-pdf`;
        return {
          id,
          label: item.title || '',
          href: JSON.stringify(item.dest || idx),
          children: item.items && item.items.length > 0
            ? processItems(item.items, level + 1)
            : undefined,
        } as TocItem;
      });
    };
    return processItems(items, depth);
  };

  const findChapterForPage = (pageNum: number): string => {
    const outline = pdfOutlineRef.current;
    if (!outline || outline.length === 0) return '';

    const findLabel = (items: PdfOutlineItem[]): string => {
      for (const item of items) {
        const dest = item.dest;
        if (dest && Array.isArray(dest)) {
          const pageIndex = typeof dest[0] === 'number' ? dest[0] : -1;
          if (pageIndex >= 0 && pageIndex + 1 <= pageNum) {
            if (item.items && item.items.length > 0) {
              const child = findLabel(item.items);
              return child || item.title || '';
            }
            return item.title || '';
          }
        }
      }
      return '';
    };

    return findLabel(outline);
  };

  const extractCover = async (pdfDoc: any): Promise<string> => {
    try {
      const firstPage = await pdfDoc.getPage(1);
      const viewport = firstPage.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return '';
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await firstPage.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (e) {
      console.warn('PDF 封面提取失败:', e);
      return '';
    }
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
      setBookId(id);

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      pdfDocRef.current = pdfDoc;
      totalPagesRef.current = pdfDoc.numPages;

      const metadata = await pdfDoc.getMetadata().catch(() => null);
      const originalTitle = file.name.replace(/\.pdf$/i, '');
      const title = metadata?.info?.Title || originalTitle;
      setBookTitle(title);

      try {
        const outline = await pdfDoc.getOutline();
        if (outline && outline.length > 0) {
          pdfOutlineRef.current = outline as PdfOutlineItem[];
          const tocItems = parseOutline(outline as PdfOutlineItem[]);
          setToc(tocItems);
        }
      } catch (e) {
        console.warn('PDF 目录解析失败:', e);
      }

      const coverUrl = await extractCover(pdfDoc);
      setCover(coverUrl);

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        pageMapRef.current.set(i, `page-${i}`);
      }

      setIsLoaded(true);
      setIsLoading(false);
      setLocationsReady(true);

      const pagePct = Math.round((currentPageRef.current / (totalPagesRef.current || 1)) * 100 * 100) / 100;
      setProgress(pagePct);
      setCurrentCfi(`page-${currentPageRef.current}`);
      setCurrentHref(`page-${currentPageRef.current}`);

    } catch (error: any) {
      console.error('PDF 加载失败:', error);
      setLoadError(error.message || '加载失败');
      setIsLoading(false);
    }
  }, []);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || !containerRef.current) return;
    const pdfDoc = pdfDocRef.current;

    try {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
        renderTaskRef.current = null;
      }

      containerRef.current.innerHTML = '';

      const page = await pdfDoc.getPage(pageNum);
      const containerWidth = containerRef.current.clientWidth || 800;
      const containerHeight = containerRef.current.clientHeight || 600;

      const viewport1 = page.getViewport({ scale: 1 });
      const scaleX = containerWidth / viewport1.width;
      const scaleY = containerHeight / viewport1.height;
      const scale = Math.min(scaleX, scaleY, 1.5);
      scaleRef.current = scale;

      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';
      const context = canvas.getContext('2d');
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      containerRef.current.appendChild(canvas);

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
        transform: transform,
      });
      renderTaskRef.current = renderTask;

      await renderTask.promise;

      currentPageRef.current = pageNum;
      const pct = Math.round((pageNum / (totalPagesRef.current || 1)) * 100 * 100) / 100;
      setProgress(pct);
      setCurrentCfi(`page-${pageNum}`);
      setCurrentHref(`page-${pageNum}`);

      const chapter = findChapterForPage(pageNum);
      if (chapter) {
        setCurrentChapter(chapter);
      }
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') {
        console.warn('PDF 页面渲染失败:', e);
      }
    }
  }, []);

  const renderBook = useCallback((container: HTMLElement) => {
    containerRef.current = container;

    container.style.overflow = 'auto';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    renderPage(currentPageRef.current);

    return {
      on: (_event: string, _handler: any) => {},
      off: (_event: string, _handler: any) => {},
      destroy: () => {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // ignore
          }
        }
        containerRef.current = null;
      },
    };
  }, [renderPage]);

  const nextPage = useCallback(async (): Promise<any> => {
    const next = Math.min(currentPageRef.current + 1, totalPagesRef.current);
    return renderPage(next);
  }, [renderPage]);

  const prevPage = useCallback(async (): Promise<any> => {
    const prev = Math.max(currentPageRef.current - 1, 1);
    return renderPage(prev);
  }, [renderPage]);

  const goToCfi = useCallback((cfi: string) => {
    if (!cfi) return Promise.resolve();
    const match = cfi.match(/page-(\d+)/);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      return renderPage(pageNum);
    }
    return Promise.resolve();
  }, [renderPage]);

  const goToPercentage = useCallback((percentage: number) => {
    const total = totalPagesRef.current;
    if (total <= 0) return Promise.resolve();
    const pageNum = Math.max(1, Math.min(total, Math.round((percentage / 100) * total)));
    return renderPage(pageNum);
  }, [renderPage]);

  const goToHref = useCallback(async (href: string) => {
    if (!href || !pdfDocRef.current) return Promise.resolve();

    try {
      const dest = JSON.parse(href);
      if (Array.isArray(dest) && typeof dest[0] === 'number') {
        const pageNum = dest[0] + 1;
        return renderPage(pageNum);
      }
      if (typeof dest === 'number') {
        return renderPage(dest + 1);
      }
    } catch (e) {
      // ignore
    }

    try {
      const explicitDest = await pdfDocRef.current.getDestination(href);
      if (explicitDest && Array.isArray(explicitDest) && typeof explicitDest[0] === 'number') {
        return renderPage(explicitDest[0] + 1);
      }
    } catch (e) {
      // ignore
    }

    const match = href.match(/page-(\d+)/);
    if (match) {
      return renderPage(parseInt(match[1], 10));
    }

    return Promise.resolve();
  }, [renderPage]);

  const applyTheme = useCallback((background: string, text: string) => {
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = background;
      containerRef.current.style.color = text;
    }
  }, []);

  const applyFontSize = useCallback((_fontSize: string) => {
    // PDF 字体大小由渲染缩放控制，此处暂不单独处理
  }, []);

  const applyStyles = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.lineHeight = '1.8';
    }
  }, []);

  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
      }
      pdfDocRef.current = null;
      containerRef.current = null;
    };
  }, []);

  return {
    book: pdfDocRef.current,
    rendition: null,
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
