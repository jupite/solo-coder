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

  class Rendition {
    display(target?: string): Promise<any>;
    next(): Promise<any>;
    prev(): Promise<any>;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    themes: {
      default(theme: any): void;
      override(property: string, value: string): void;
      override(css: string): void;
      fontSize(size: string): void;
    };
  }

  class Book {
    ready: Promise<void>;
    metadata: Metadata;
    navigation: Navigation;
    locations: Locations;
    packaging: any;
    load(URL: string): Promise<void>;
    renderTo(container: HTMLElement, options?: RenditionOptions): Rendition;
    open(url: string): Promise<any>;
  }

  function ePub(url: string | ArrayBuffer, options?: BookOptions): Book;

  export default ePub;
  export { Book, Rendition, Location, TocItem, Navigation, Metadata };
}
