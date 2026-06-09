import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, BookOpen, Upload } from 'lucide-react';
import { useReaderStore } from '@/store/readerStore';
import { useTheme } from '@/hooks/useTheme';
import { storage } from '@/utils/storage';
import { BookInfo } from '@/types';

export default function Bookshelf() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { books, loadBooks, addBook, deleteBook, setBookFile } = useReaderStore();
  const { theme, currentTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const bgColor = currentTheme.background;
  const borderColor = theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#e5e7eb';
  const textColor = theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#374151';
  const activeText = theme === 'night' ? '#fff' : theme === 'eye' ? '#3d2f1f' : '#111827';
  const mutedColor = theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#9ca3af';
  const cardBg = theme === 'night' ? '#1f1f1f' : theme === 'eye' ? '#faf6ea' : '#f9fafb';
  const cardHoverBg = theme === 'night' ? '#2a2a2a' : theme === 'eye' ? '#f5efdc' : '#f3f4f6';

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const dataUrlToFile = (dataUrl: string, fileName: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/epub+zip';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  const handleFileSelect = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.epub')) return;

    try {
      const bookId = `${file.name}-${file.size}-${file.lastModified}`;
      const existing = books.find((b) => b.id === bookId);

      if (existing) {
        const bookFile = dataUrlToFile(existing.fileDataUrl, existing.fileName);
        setBookFile(bookFile, existing.id);
        storage.updateBookLastRead(existing.id);
        navigate('/reader');
        return;
      }

      const dataUrl = await fileToDataUrl(file);
      const bookInfo: BookInfo = {
        id: bookId,
        title: file.name.replace(/\.epub$/i, ''),
        fileDataUrl: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
      };

      addBook(bookInfo);
      setBookFile(file, bookId);
      navigate('/reader');
    } catch (error) {
      console.error('添加书籍失败:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleOpenBook = (book: BookInfo) => {
    try {
      const bookFile = dataUrlToFile(book.fileDataUrl, book.fileName);
      setBookFile(bookFile, book.id);
      storage.updateBookLastRead(book.id);
      navigate('/reader');
    } catch (error) {
      console.error('打开书籍失败:', error);
    }
  };

  const handleDeleteBook = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    if (confirm('确定要从书库中删除这本书吗？')) {
      deleteBook(bookId);
    }
  };

  const getProgress = (bookId: string): number => {
    const progress = storage.getReadingProgress(bookId);
    return progress?.percentage || 0;
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const sortedBooks = [...books].sort((a, b) => {
    const aTime = a.lastReadAt || a.addedAt;
    const bTime = b.lastReadAt || b.addedAt;
    return bTime - aTime;
  });

  return (
    <div
      className="flex-1 h-full overflow-y-auto"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-serif font-semibold mb-1"
              style={{ color: activeText }}
            >
              我的书架
            </h1>
            <p className="text-sm font-serif" style={{ color: mutedColor }}>
              共 {books.length} 本书
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2
              ${isDragging ? 'scale-105' : ''}`}
            style={{
              backgroundColor: isDragging ? cardHoverBg : 'transparent',
              borderColor: isDragging ? activeText : borderColor,
              color: textColor,
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-serif">添加书籍</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {books.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300
              ${isDragging ? 'scale-105' : ''}`}
            style={{
              borderColor: isDragging ? activeText : borderColor,
              backgroundColor: isDragging ? cardHoverBg : 'transparent',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: mutedColor }}
            />
            <p className="text-lg font-serif mb-2" style={{ color: textColor }}>
              点击或拖拽 EPUB 文件到此处
            </p>
            <p className="text-sm font-serif" style={{ color: mutedColor }}>
              支持 .epub 格式文件
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortedBooks.map((book) => {
              const progress = getProgress(book.id);
              return (
                <div
                  key={book.id}
                  onClick={() => handleOpenBook(book)}
                  className="group relative rounded-xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-hidden"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                  }}
                >
                  <button
                    onClick={(e) => handleDeleteBook(e, book.id)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    style={{
                      backgroundColor: theme === 'night' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                      color: theme === 'night' ? '#f87171' : '#ef4444',
                    }}
                    title="删除书籍"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div
                    className="h-44 flex items-center justify-center"
                    style={{
                      background: theme === 'night'
                        ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)'
                        : theme === 'eye'
                        ? 'linear-gradient(135deg, #f5efdc 0%, #e8dfc8 100%)'
                        : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    }}
                  >
                    <BookOpen
                      className="w-14 h-14"
                      style={{ color: mutedColor }}
                    />
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-serif text-sm font-medium mb-2 truncate"
                      style={{ color: activeText }}
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-serif" style={{ color: mutedColor }}>
                        {formatSize(book.fileSize)}
                      </span>
                      {progress > 0 && (
                        <span
                          className="text-xs font-serif px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: theme === 'night' ? 'rgba(255,255,255,0.1)' : theme === 'eye' ? 'rgba(91,70,54,0.12)' : 'rgba(0,0,0,0.06)',
                            color: textColor,
                          }}
                        >
                          {progress.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#e5e7eb' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#6b7280',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
