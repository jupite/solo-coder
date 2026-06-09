import JSZip from 'jszip';
import {
  initMobiFile,
  initKf8File,
  type Mobi,
  type Kf8,
  type MobiMetadata,
  type MobiToc,
  type MobiTocItem,
  type MobiProcessedChapter,
} from '@lingo-reader/mobi-parser';

type EBookInstance = Mobi | Kf8;

function getSpine(book: EBookInstance): Array<{ id: string; [key: string]: unknown }> {
  return book.getSpine() as Array<{ id: string; [key: string]: unknown }>;
}

function getToc(book: EBookInstance): MobiToc {
  return book.getToc() as MobiToc;
}

function getMetadata(book: EBookInstance): MobiMetadata {
  return book.getMetadata() as MobiMetadata;
}

function getCoverImage(book: EBookInstance): string {
  return book.getCoverImage() as string;
}

function loadChapter(book: EBookInstance, id: string): MobiProcessedChapter | undefined {
  return book.loadChapter(id) as MobiProcessedChapter | undefined;
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildNcx(toc: MobiToc, uid: string, title: string): string {
  let navMap = '';
  let playOrder = 1;

  const buildNavPoint = (items: MobiTocItem[], depth: number): string => {
    let result = '';
    for (const item of items) {
      const id = `nav-${playOrder}`;
      const label = escapeXml(item.label || 'Untitled');
      let src = item.href || '';
      if (!src.startsWith('chapter')) {
        src = `chapter_${playOrder}.xhtml`;
      }
      result += `
<navPoint id="${id}" playOrder="${playOrder}">
  <navLabel>
    <text>${label}</text>
  </navLabel>
  <content src="${src}" />`;
      playOrder++;
      if (item.children && item.children.length > 0) {
        result += buildNavPoint(item.children, depth + 1);
      }
      result += '</navPoint>';
    }
    return result;
  };

  navMap = buildNavPoint(toc, 0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uid}" />
    <meta name="dtb:depth" content="3" />
    <meta name="dtb:totalPageCount" content="0" />
    <meta name="dtb:maxPageNumber" content="0" />
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <navMap>
${navMap}
  </navMap>
</ncx>`;
}

function buildOpf(
  metadata: MobiMetadata,
  spine: Array<{ id: string; [key: string]: unknown }>,
  chapters: { id: string; filename: string; mediaType: string }[],
  coverFilename: string | null,
  uid: string,
  title: string
): string {
  const author = metadata.author?.length ? metadata.author.join(', ') : 'Unknown';
  const language = metadata.language || 'en';
  const publisher = metadata.publisher || '';
  const date = metadata.published || '';
  const description = metadata.description || '';

  let manifest = '';
  for (const ch of chapters) {
    manifest += `    <item id="${ch.id}" href="${ch.filename}" media-type="${ch.mediaType}" />\n`;
  }
  if (coverFilename) {
    manifest += `    <item id="cover-image" href="${coverFilename}" media-type="image/jpeg" properties="cover-image" />\n`;
  }
  manifest += `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />\n`;

  let spineXml = '';
  for (let i = 0; i < chapters.length; i++) {
    spineXml += `    <itemref idref="${chapters[i].id}" />\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${uid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    ${publisher ? `<dc:publisher>${escapeXml(publisher)}</dc:publisher>` : ''}
    ${date ? `<dc:date>${escapeXml(date)}</dc:date>` : ''}
    ${description ? `<dc:description>${escapeXml(description)}</dc:description>` : ''}
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
${manifest}  </manifest>
  <spine toc="ncx">
${spineXml}  </spine>
</package>`;
}

function wrapXhtml(bodyHtml: string, title: string, cssHrefs: string[] = []): string {
  const cssLinks = cssHrefs
    .map((href) => `<link rel="stylesheet" type="text/css" href="${href}" />`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <title>${escapeXml(title)}</title>
${cssLinks}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

async function blobUrlToUint8Array(blobUrl: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (e) {
    console.warn('Failed to convert blob URL to Uint8Array:', e);
    return null;
  }
}

export async function mobiToEpub(file: File): Promise<ArrayBuffer> {
  const fileName = file.name.toLowerCase();
  const isKf8 = fileName.endsWith('.azw3') || fileName.endsWith('.azw');

  let book: EBookInstance;
  if (isKf8) {
    book = await initKf8File(file);
  } else {
    book = await initMobiFile(file);
  }

  try {
    const metadata = getMetadata(book);
    const spine = getSpine(book);
    const toc = getToc(book);
    const coverUrl = getCoverImage(book);
    const uid = metadata.identifier || `urn:uuid:${uuid()}`;
    const title = metadata.title || file.name.replace(/\.(mobi|azw|azw3)$/i, '');

    const zip = new JSZip();

    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    const metaInf = zip.folder('META-INF');
    if (metaInf) {
      metaInf.file(
        'container.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>`
      );
    }

    const oebps = zip.folder('OEBPS');
    if (!oebps) {
      throw new Error('Failed to create OEBPS folder');
    }

    const chapterFiles: { id: string; filename: string; mediaType: string }[] = [];
    const cssCache = new Map<string, string>();

    for (let i = 0; i < spine.length; i++) {
      const chapterId = spine[i].id;
      const processed = loadChapter(book, chapterId);
      const filename = `chapter_${i + 1}.xhtml`;

      let bodyHtml = '';
      const cssFilenames: string[] = [];

      if (processed) {
        bodyHtml = processed.html;

        for (let j = 0; j < processed.css.length; j++) {
          const cssPart = processed.css[j];
          if (!cssCache.has(cssPart.href)) {
            const cssFilename = `style_${cssCache.size}.css`;
            cssCache.set(cssPart.href, cssFilename);

            try {
              const cssData = await blobUrlToUint8Array(cssPart.href);
              if (cssData) {
                const decoder = new TextDecoder('utf-8');
                oebps.file(cssFilename, decoder.decode(cssData));
              }
            } catch (e) {
              console.warn('Failed to load CSS:', e);
            }
          }
          const cachedName = cssCache.get(cssPart.href);
          if (cachedName) {
            cssFilenames.push(cachedName);
          }
        }
      }

      const xhtml = wrapXhtml(bodyHtml, `${title} - Chapter ${i + 1}`, cssFilenames);
      oebps.file(filename, xhtml);
      chapterFiles.push({
        id: `chapter-${i + 1}`,
        filename,
        mediaType: 'application/xhtml+xml',
      });
    }

    let coverFilename: string | null = null;
    if (coverUrl) {
      try {
        const coverData = await blobUrlToUint8Array(coverUrl);
        if (coverData) {
          coverFilename = 'cover.jpg';
          oebps.file(coverFilename, coverData);
        }
      } catch (e) {
        console.warn('Failed to extract cover image:', e);
      }
    }

    const ncx = buildNcx(toc.length > 0 ? toc : spine.map((s, i) => ({
      label: `Chapter ${i + 1}`,
      href: `chapter_${i + 1}.xhtml`,
      children: undefined,
    })), uid, title);
    oebps.file('toc.ncx', ncx);

    const opf = buildOpf(metadata, spine, chapterFiles, coverFilename, uid, title);
    oebps.file('content.opf', opf);

    const epubBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      mimeType: 'application/epub+zip',
    });

    return epubBuffer;
  } finally {
    book.destroy();
  }
}

export function isMobiFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.mobi') || name.endsWith('.azw') || name.endsWith('.azw3');
}

export async function convertToEpubIfNeeded(file: File): Promise<{ file: File; isConverted: boolean }> {
  if (!isMobiFile(file)) {
    return { file, isConverted: false };
  }

  const epubBuffer = await mobiToEpub(file);
  const epubName = file.name.replace(/\.(mobi|azw|azw3)$/i, '.epub');
  const epubFile = new File([epubBuffer], epubName, {
    type: 'application/epub+zip',
    lastModified: file.lastModified,
  });

  return { file: epubFile, isConverted: true };
}
