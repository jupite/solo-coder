import { Bookmark, ThemeId } from '@/types';
import { useReaderStore } from '@/store/readerStore';
import { BookMarked, Trash2, X } from 'lucide-react';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  theme: ThemeId;
  onGoToBookmark: (cfi: string) => void;
  onDeleteBookmark: (id: string) => void;
}

export default function BookmarkList({
  bookmarks,
  theme,
  onGoToBookmark,
  onDeleteBookmark,
}: BookmarkListProps) {
  const { showBookmarks, setShowBookmarks } = useReaderStore();

  if (!showBookmarks) return null;

  return (
    <div className="absolute top-14 right-4 z-30 w-72 rounded-lg shadow-xl overflow-hidden"
      style={{
        background: theme === 'night' ? '#1f1f1f' : theme === 'eye' ? '#f5efdc' : '#fff',
        border: `1px solid ${theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#eee'}`,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: `1px solid ${theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#eee'}`,
        }}
      >
        <h3
          className="font-serif text-sm font-medium flex items-center gap-2"
          style={{ color: theme === 'night' ? '#ccc' : theme === 'eye' ? '#5b4636' : '#333' }}
        >
          <BookMarked className="w-4 h-4" />
          书签列表
        </h3>
        <button
          onClick={() => setShowBookmarks(false)}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          style={{ color: theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#666' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {bookmarks.length > 0 ? (
          <div className="py-1">
            {bookmarks
              .sort((a, b) => a.percentage - b.percentage)
              .map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => {
                    onGoToBookmark(bookmark.cfi);
                    setShowBookmarks(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm truncate font-serif"
                      style={{ color: theme === 'night' ? '#ccc' : theme === 'eye' ? '#5b4636' : '#333' }}
                    >
                      {bookmark.chapter || '未命名章节'}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#999' }}
                    >
                      {bookmark.percentage.toFixed(1)}%
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBookmark(bookmark.id);
                    }}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                    style={{ color: theme === 'night' ? '#f87171' : '#ef4444' }}
                    title="删除书签"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <p
            className="px-4 py-8 text-center text-sm"
            style={{ color: theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#999' }}
          >
            暂无书签
          </p>
        )}
      </div>
    </div>
  );
}
