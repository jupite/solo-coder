declare module 'epubjs' {
  interface BookOptions {
    replacements?: string;
    styles?: string;
    defaultFontSize?: number;
  }

  interface RenditionOptions {
    width?: string | number;
    height?: string | number;
    spread?: string;
    flow?: string;
    manager?: string;
    minSpreadWidth?: number;
    stylesheet?: string;
  }

  interface Location {
    start: {
      cfi: string;
      href: string;
      index: number;
      percentage: number;
    };
    end: {
      cfi: string;
      href: string;
      index: number;
      percentage: number;
    };
  }

  interface TocItem {
    label: string;
    href: string;
    subitems?: TocItem[];
  }

  interface Navigation {
    toc: TocItem[];
    landmarks: TocItem[];
  }

  interface Metadata {
    title: string;
    creator: string;
    description: string;
    pubdate: string;
    publisher: string;
    identifier: string;
    language: string;
    rights: string;
  }

  interface Locations {
    generate(sectionChars?: number): Promise<void>;
    cfiFromPercentage(percentage: number): string;
    percentageFromCfi(cfi: string): number;
  }

  interface AnnotationMark {
    unmark(): void;
    mark?: any;
  }

  interface Annotations {
    mark(cfiStart: string, cfiEnd: string, options?: {
      class?: string;
      style?: string;
      'data-annotation-id'?: string;
      [key: string]: any;
    }): AnnotationMark;
    [key: string]: any;
  }

  interface Contents {
    window?: Window;
    document?: Document;
    [key: string]: any;
  }

  class Rendition {
    display(target?: string): Promise<any>;
    next(): Promise<any>;
    prev(): Promise<any>;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    getContents(): Contents[];
    currentLocation(): Location | null;
    book: Book;
    annotations: Annotations;
    themes: {
      default(theme: any): void;
      override(property: string, value: string): void;
      override(css: string): void;
      fontSize(size: string): void;
    };
  }

  class Book {
    ready: Promise<void>;
    opened: Promise<void>;
    metadata: Metadata;
    navigation: Navigation;
    locations: Locations;
    packaging: any;
    archive?: any;
    package?: any;
    spine?: any;
    load(URL: string): Promise<void>;
    renderTo(container: HTMLElement, options?: RenditionOptions): Rendition;
    open(url: string): Promise<any>;
    coverUrl(): Promise<string>;
    cfiFromRange(range: Range): string;
    getRange(cfiStart: string, cfiEnd: string): Range | null;
  }

  function ePub(url: string | ArrayBuffer, options?: BookOptions): Book;

  export default ePub;
  export { Book, Rendition, Location, TocItem, Navigation, Metadata };
}
