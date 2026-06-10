import { useState, useEffect, useRef } from 'react';
import { Highlighter, Underline, Strikethrough, MessageSquare, X, Check } from 'lucide-react';
import { AnnotationStyle, AnnotationColor, ANNOTATION_COLORS } from '@/types';
import type { SelectionInfo } from '@/hooks/useEpub';

interface AnnotationToolbarProps {
  selectionInfo: SelectionInfo | null;
  onClose: () => void;
  onApply: (style: AnnotationStyle, color: AnnotationColor) => void;
  onAddNote: (color: AnnotationColor) => void;
  theme: 'white' | 'eye' | 'night';
}

const STYLES: { id: AnnotationStyle; icon: typeof Highlighter; label: string }[] = [
  { id: 'highlight', icon: Highlighter, label: '高亮' },
  { id: 'underline', icon: Underline, label: '下划线' },
  { id: 'strikethrough', icon: Strikethrough, label: '删除线' },
  { id: 'wavy', icon: Underline, label: '波浪线' },
];

const COLORS: AnnotationColor[] = ['yellow', 'green', 'blue', 'pink', 'orange'];

export default function AnnotationToolbar({
  selectionInfo,
  onClose,
  onApply,
  onAddNote,
  theme,
}: AnnotationToolbarProps) {
  const [showColors, setShowColors] = useState(false);
  const [activeStyle, setActiveStyle] = useState<AnnotationStyle | null>(null);
  const [selectedColor, setSelectedColor] = useState<AnnotationColor>('yellow');
  const toolbarRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'night';
  const bgColor = isDark ? 'rgba(40, 40, 40, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const borderColor = isDark ? '#444' : '#e5e7eb';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const hoverBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  useEffect(() => {
    if (selectionInfo) {
      setShowColors(false);
      setActiveStyle(null);
    }
  }, [selectionInfo]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (selectionInfo) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectionInfo, onClose]);

  if (!selectionInfo) return null;

  const handleStyleClick = (style: AnnotationStyle) => {
    if (style === 'wavy') {
      setActiveStyle(style);
      setShowColors(true);
      return;
    }
    setActiveStyle(style);
    setShowColors(true);
  };

  const handleColorSelect = (color: AnnotationColor) => {
    setSelectedColor(color);
    if (activeStyle) {
      onApply(activeStyle, color);
      onClose();
    }
  };

  const handleAddNote = () => {
    onAddNote(selectedColor);
    onClose();
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg shadow-xl border"
      style={{
        backgroundColor: bgColor,
        borderColor,
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {!showColors ? (
        <>
          {STYLES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleStyleClick(id)}
              className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors group relative"
              style={{ color: textColor }}
              title={label}
            >
              {id === 'wavy' ? (
                <span className="w-5 h-5 flex items-center justify-center font-bold" style={{ textDecoration: 'underline wavy', textDecorationThickness: '2px' }}>
                  A
                </span>
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </button>
          ))}
          <div
            className="w-px h-6 mx-1"
            style={{ backgroundColor: borderColor }}
          />
          <button
            onClick={handleAddNote}
            className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ color: textColor }}
            title="添加便签"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            style={{ color: textColor }}
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-serif" style={{ color: textColor }}>
            选择颜色:
          </span>
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: ANNOTATION_COLORS[color].bg,
                borderColor: selectedColor === color ? textColor : 'transparent',
              }}
              title={ANNOTATION_COLORS[color].label}
            />
          ))}
          <button
            onClick={() => {
              setShowColors(false);
              setActiveStyle(null);
            }}
            className="ml-1 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: textColor }}
            title="返回"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
