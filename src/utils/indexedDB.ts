const DB_NAME = 'ebook_reader_db';
const DB_VERSION = 1;
const STORE_NAME = 'book_files';

interface BookFileRecord {
  bookId: string;
  fileDataUrl: string;
  savedAt: number;
}

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('IndexedDB 打开失败'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'bookId' });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };
  });
}

export async function saveBookFile(bookId: string, fileDataUrl: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: BookFileRecord = {
      bookId,
      fileDataUrl,
      savedAt: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('保存书籍文件失败'));
  });
}

export async function getBookFile(bookId: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(bookId);

    request.onsuccess = () => {
      const result = request.result as BookFileRecord | undefined;
      resolve(result?.fileDataUrl || null);
    };

    request.onerror = () => reject(new Error('读取书籍文件失败'));
  });
}

export async function deleteBookFile(bookId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(bookId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('删除书籍文件失败'));
  });
}
