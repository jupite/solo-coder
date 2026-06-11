import { useState, useEffect, useRef } from 'react';
import { X, MessageSquarePlus } from 'lucide-react';
import { Annotation, ANNOTATION_COLORS, AnnotationColor, ThemeId } from '@/types';

interface AnnotationNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  selectedText: string;
  initialNote?: string;
  color: AnnotationColor;
  annotation?: Annotation | null;
  theme: ThemeId;
  isMobile?: boolean;
}

export default function AnnotationNoteModal({
  open,
  onClose,
  onSave,
  selectedText,
  initialNote = '',
  color,
  annotation,
  theme,
  isMobile = false,
}: AnnotationNoteModalProps) {
  const [note, setNote] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = theme === 'night';
  const bgColor = isDark ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const borderColor = isDark ? '#444' : '#e5e7eb';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const mutedColor = isDark ? '#888' : '#9ca3af';
  const inputBg = isDark ? '#2a2a2a' : '#f9fafb';

  useEffect(() => {
    if (open) {
      setNote(initialNote);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open, initialNote]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    onSave(note.trim());
  };

  const colorConfig = ANNOTATION_COLORS[color];

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm ${isMobile ? '' : ''}`}>
      <div
        className={`${isMobile ? 'w-full rounded-t-2xl max-h-[90vh]' : 'w-[480px] max-w-[90vw] rounded-xl max-h-[80vh]'} shadow-2xl border flex flex-col`}
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div
          className={`flex items-center justify-between ${isMobile ? 'px-4 py-3' : 'px-5 py-4'} border-b`}
          style={{ borderColor }}
        >
          <div className="flex items-center gap-2">
            <MessageSquarePlus className={isMobile ? 'w-5 h-5' : 'w-5 h-5'} style={{ color: textColor }} />
            <h3 className={`font-serif ${isMobile ? 'text-sm' : 'text-base'} font-medium`} style={{ color: textColor }}>
              {annotation ? '编辑批注' : '添加便签批注'}
            </h3>
            <span
              className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full`}
              style={{ backgroundColor: colorConfig.bg }}
              title={colorConfig.label}
            />
          </div>
          <button
            onClick={onClose}
            className={`${isMobile ? 'p-2' : 'p-1.5'} rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
            style={{ color: mutedColor }}
          >
            <X className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4 space-y-3' : 'p-5 space-y-4'}`}>
          {selectedText && (
            <div>
              <label className={`block ${isMobile ? 'text-[11px]' : 'text-xs'} font-serif mb-2`} style={{ color: mutedColor }}>
                选中内容
              </label>
              <div
                className={`${isMobile ? 'p-2.5 text-xs' : 'p-3 text-sm'} rounded-lg font-serif leading-relaxed line-clamp-4`}
                style={{
                  backgroundColor: colorConfig.bg,
                  color: colorConfig.text,
                }}
              >
                "{selectedText}"
              </div>
            </div>
          )}

          <div>
            <label className={`block ${isMobile ? 'text-[11px]' : 'text-xs'} font-serif mb-2`} style={{ color: mutedColor }}>
              批注内容
            </label>
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="在此输入你的批注、想法、评论..."
              rows={isMobile ? 5 : 6}
              className={`w-full ${isMobile ? 'px-3 py-2.5 text-sm' : 'px-4 py-3 text-sm'} rounded-lg border font-serif leading-relaxed resize-none focus:outline-none focus:ring-2 transition-all`}
              style={{
                backgroundColor: inputBg,
                color: textColor,
                borderColor,
              }}
            />
          </div>
        </div>

        <div
          className={`flex items-center justify-end gap-2 ${isMobile ? 'px-4 py-3' : 'px-5 py-4'} border-t`}
          style={{ borderColor }}
        >
          <button
            onClick={onClose}
            className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-4 py-2 text-sm'} rounded-lg font-serif transition-colors`}
            style={{ color: mutedColor }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!note.trim()}
            className={`${isMobile ? 'px-5 py-2 text-sm' : 'px-5 py-2 text-sm'} rounded-lg font-serif transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              backgroundColor: textColor,
              color: bgColor,
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
