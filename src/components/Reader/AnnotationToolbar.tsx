import { useState, useEffect, useRef } from 'react';
import { Highlighter, Underline, Strikethrough, MessageSquare, X, Check } from 'lucide-react';
import { AnnotationStyle, AnnotationColor, ANNOTATION_COLORS, ThemeId } from '@/types';
import type { SelectionInfo } from '@/hooks/useEpub';

interface AnnotationToolbarProps {
  selectionInfo: SelectionInfo | null;
  onClose: () => void;
  onApply: (style: AnnotationStyle, color: AnnotationColor) => void;
  onAddNote: (color: AnnotationColor) => void;
  theme: ThemeId;
  isMobile?: boolean;
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
  isMobile = false,
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
    let attached = false;
    let timer: any = null;
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IFRAME' || target.closest('iframe')) {
          return;
        }
        onClose();
      }
    };
    if (selectionInfo) {
      timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        attached = true;
      }, 350);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (attached) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
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
      className={`fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg shadow-xl border ${
        isMobile ? 'flex-wrap' : ''
      }`}
      style={{
        backgroundColor: bgColor,
        borderColor,
        top: isMobile ? 'auto' : '80px',
        bottom: isMobile ? '80px' : 'auto',
        left: isMobile ? '12px' : '50%',
        right: isMobile ? '12px' : 'auto',
        transform: isMobile ? 'none' : 'translateX(-50%)',
      }}
    >
      {!showColors ? (
        <>
          {STYLES.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleStyleClick(id)}
              className={`p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors group relative ${
                isMobile ? 'flex-1 min-w-[48px]' : ''
              }`}
              style={{ color: textColor }}
              title={label}
            >
              {id === 'wavy' ? (
                <span className="w-5 h-5 flex items-center justify-center font-bold mx-auto" style={{ textDecoration: 'underline wavy', textDecorationThickness: '2px' }}>
                  A
                </span>
              ) : (
                <Icon className="w-5 h-5 mx-auto" />
              )}
              {isMobile && (
                <span className="block text-[9px] mt-0.5 text-center">{label}</span>
              )}
            </button>
          ))}
          <div
            className={`${isMobile ? 'hidden' : 'w-px h-6 mx-1'}`}
            style={{ backgroundColor: borderColor }}
          />
          <button
            onClick={handleAddNote}
            className={`p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
              isMobile ? 'flex-1 min-w-[48px]' : ''
            }`}
            style={{ color: textColor }}
            title="添加便签"
          >
            <MessageSquare className={`w-5 h-5 ${isMobile ? 'mx-auto' : ''}`} />
            {isMobile && (
              <span className="block text-[9px] mt-0.5 text-center">便签</span>
            )}
          </button>
          <button
            onClick={onClose}
            className={`p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
              isMobile ? 'flex-1 min-w-[48px]' : ''
            }`}
            style={{ color: textColor }}
            title="关闭"
          >
            <X className={`w-4 h-4 ${isMobile ? 'mx-auto' : ''}`} />
            {isMobile && (
              <span className="block text-[9px] mt-0.5 text-center">关闭</span>
            )}
          </button>
        </>
      ) : (
        <div className={`flex items-center gap-2 px-1 ${isMobile ? 'w-full flex-wrap justify-center py-1' : ''}`}>
          <span className="text-xs font-serif whitespace-nowrap" style={{ color: textColor }}>
            选择颜色:
          </span>
          <div className={`flex gap-2 ${isMobile ? 'flex-wrap justify-center flex-1' : ''}`}>
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} rounded-full border-2 transition-transform hover:scale-110`}
                style={{
                  backgroundColor: ANNOTATION_COLORS[color].bg,
                  borderColor: selectedColor === color ? textColor : 'transparent',
                }}
                title={ANNOTATION_COLORS[color].label}
              />
            ))}
          </div>
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
