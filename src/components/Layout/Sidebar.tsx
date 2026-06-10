import { useReaderStore, isCurrentPageBookmarked as checkBookmarked } from '@/store/readerStore';
import { FONT_SIZE_LABELS, THEMES, FontSize, ThemeId, TocItem, Annotation, ANNOTATION_COLORS, ANNOTATION_STYLES, AnnotationColor, AnnotationStyle } from '@/types';
import { ChevronRight, BookMarked, Trash2, X, Type, Sun, Moon, Eye, List, Highlighter, MessageSquare, Edit3, Check, Palette } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const normalizeHref = (href: string): string => {
  if (!href) return '';
  return href.split('#')[0].replace(/^\.\//, '').replace(/^\//, '');
};

interface TocItemNodeProps {
  item: TocItem;
  level: number;
  parentId: string;
  normalizedCurrentHref: string;
  currentChapter: string;
  activeText: string;
  textColor: string;
  activeBg: string;
  mutedColor: string;
}

function TocItemNode({
  item,
  level,
  parentId,
  normalizedCurrentHref,
  currentChapter,
  activeText,
  textColor,
  activeBg,
  mutedColor,
}: TocItemNodeProps) {
  const { goToHrefFn } = useReaderStore();

  const isItemActive = (it: TocItem): boolean => {
    if (currentChapter && currentChapter === it.label) return true;
    if (normalizedCurrentHref) {
      const normalizedItem = normalizeHref(it.href);
      if (normalizedItem === normalizedCurrentHref) return true;
      if (normalizedCurrentHref.startsWith(normalizedItem) || normalizedItem.startsWith(normalizedCurrentHref)) return true;
    }
    return false;
  };

  const checkHasActiveChild = (children: TocItem[]): boolean => {
    return children.some(child => {
      if (isItemActive(child)) return true;
      return child.children ? checkHasActiveChild(child.children) : false;
    });
  };

  const isActive = isItemActive(item);
  const hasChildren = item.children && item.children.length > 0;
  const initialExpanded = hasChildren ? checkHasActiveChild(item.children!) || true : false;
  const [expanded, setExpanded] = useState(initialExpanded);

  const handleClick = () => {
    if (goToHrefFn && item.href) {
      goToHrefFn(item.href);
    }
  };

  const nodeKey = `${parentId}-${item.id}`;

  return (
    <div>
      <div
        className={`flex items-center cursor-pointer py-2 px-3 rounded-lg transition-colors duration-150
          ${isActive ? 'font-semibold' : ''}`}
        style={{
          paddingLeft: `${level * 16 + 12}px`,
          color: isActive ? activeText : textColor,
          backgroundColor: isActive ? activeBg : 'transparent',
        }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="mr-1 p-0.5 -ml-1"
            style={{ color: mutedColor }}
          >
            <ChevronRight
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="text-sm truncate font-serif">{item.label}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child) => (
            <TocItemNode
              key={`${nodeKey}-${child.id}`}
              item={child}
              level={level + 1}
              parentId={nodeKey}
              normalizedCurrentHref={normalizedCurrentHref}
              currentChapter={currentChapter}
              activeText={activeText}
              textColor={textColor}
              activeBg={activeBg}
              mutedColor={mutedColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const {
    activePanel,
    setActivePanel,
    currentBookId,
    toc,
    currentChapter,
    currentHref,
    currentCfi,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    bookmarks,
    removeBookmark,
    goToCfiFn,
    annotations,
    removeAnnotation,
    updateAnnotation,
  } = useReaderStore();

  const currentTheme = THEMES.find((t) => t.id === theme)!;
  const normalizedCurrentHref = useMemo(() => normalizeHref(currentHref), [currentHref]);

  checkBookmarked(currentCfi);

  const isReader = location.pathname === '/reader';

  const bgColor = currentTheme.background;
  const borderColor = theme === 'night' ? '#333' : theme === 'eye' ? '#e5dfcc' : '#e5e7eb';
  const textColor = theme === 'night' ? '#999' : theme === 'eye' ? '#5b4636' : '#374151';
  const activeText = theme === 'night' ? '#fff' : theme === 'eye' ? '#3d2f1f' : '#111827';
  const activeBg = theme === 'night' ? 'rgba(255,255,255,0.1)' : theme === 'eye' ? 'rgba(91,70,54,0.12)' : 'rgba(0,0,0,0.06)';
  const mutedColor = theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#9ca3af';

  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editColor, setEditColor] = useState<AnnotationColor>('yellow');
  const [editStyle, setEditStyle] = useState<AnnotationStyle>('highlight');
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null);
  const [stylePickerFor, setStylePickerFor] = useState<string | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const stylePickerRef = useRef<HTMLDivElement>(null);
  const effectiveBookId = currentBookId || '';

  useEffect(() => {
    if (editingAnnotation) {
      setEditNote(editingAnnotation.note || '');
      setEditColor(editingAnnotation.color);
      setEditStyle(editingAnnotation.style);
      setTimeout(() => editTextareaRef.current?.focus(), 100);
    }
  }, [editingAnnotation]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerFor(null);
      }
      if (stylePickerRef.current && !stylePickerRef.current.contains(e.target as Node)) {
        setStylePickerFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveEdit = () => {
    if (!editingAnnotation) return;
    updateAnnotation(effectiveBookId, editingAnnotation.id, {
      note: editNote.trim() || undefined,
      color: editColor,
      style: editStyle,
    });
    setEditingAnnotation(null);
  };

  const handleQuickColorChange = (annotationId: string, color: AnnotationColor) => {
    updateAnnotation(effectiveBookId, annotationId, { color });
    setColorPickerFor(null);
  };

  const handleQuickStyleChange = (annotationId: string, style: AnnotationStyle) => {
    updateAnnotation(effectiveBookId, annotationId, { style });
    setStylePickerFor(null);
  };

  if (!activePanel) return null;

  const panelTitle = {
    toc: '目录',
    bookmarks: '书签',
    annotations: '标注',
    font: '字体大小',
    theme: '主题',
  }[activePanel];

  const panelIcon = {
    toc: <List className="w-4 h-4" />,
    bookmarks: <BookMarked className="w-4 h-4" />,
    annotations: <Highlighter className="w-4 h-4" />,
    font: <Type className="w-4 h-4" />,
    theme: theme === 'night' ? <Moon className="w-4 h-4" /> : theme === 'eye' ? <Eye className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
  }[activePanel];

  const handleGoToBookmark = (cfi: string) => {
    if (goToCfiFn) goToCfiFn(cfi);
    setActivePanel(null);
  };

  const handleGoToAnnotation = (cfi: string) => {
    if (goToCfiFn) goToCfiFn(cfi);
  };

  const renderContent = () => {
    if (!isReader) {
      return (
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-sm text-center font-serif" style={{ color: mutedColor }}>
            选择一本书开始阅读
          </p>
        </div>
      );
    }

    switch (activePanel) {
      case 'toc':
        return (
          <div className="flex-1 overflow-y-auto py-2">
            {toc.length > 0 ? (
              toc.map((item) => (
                <TocItemNode
                  key={`root-${item.id}`}
                  item={item}
                  level={0}
                  parentId="root"
                  normalizedCurrentHref={normalizedCurrentHref}
                  currentChapter={currentChapter}
                  activeText={activeText}
                  textColor={textColor}
                  activeBg={activeBg}
                  mutedColor={mutedColor}
                />
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm font-serif" style={{ color: mutedColor }}>
                暂无目录
              </p>
            )}
          </div>
        );

      case 'bookmarks':
        return (
          <div className="flex-1 overflow-y-auto">
            {bookmarks.length > 0 ? (
              <div className="py-1">
                {bookmarks
                  .sort((a, b) => a.percentage - b.percentage)
                  .map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex items-center justify-between px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => handleGoToBookmark(bookmark.cfi)}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate font-serif"
                          style={{ color: textColor }}
                        >
                          {bookmark.chapter && bookmark.chapter !== '未命名章节'
                            ? `${bookmark.chapter} · ${bookmark.percentage.toFixed(1)}%`
                            : `阅读位置 ${bookmark.percentage.toFixed(1)}%`}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(currentBookId || '', bookmark.id);
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
              <p className="px-4 py-8 text-center text-sm font-serif" style={{ color: mutedColor }}>
                暂无书签
              </p>
            )}
          </div>
        );

      case 'annotations':
        return (
          <div className="flex-1 overflow-y-auto">
            {annotations.length > 0 ? (
              <div className="py-1">
                {annotations
                  .sort((a, b) => a.percentage - b.percentage)
                  .map((annotation) => {
                    const colorConfig = ANNOTATION_COLORS[annotation.color];
                    const showColorPicker = colorPickerFor === annotation.id;
                    const showStylePicker = stylePickerFor === annotation.id;
                    return (
                      <div
                        key={annotation.id}
                        className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group border-b last:border-b-0 relative"
                        style={{ borderColor: theme === 'night' ? '#333' : '#f3f4f6' }}
                        onClick={() => handleGoToAnnotation(annotation.cfi)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0 mt-1" ref={showColorPicker ? colorPickerRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setColorPickerFor(showColorPicker ? null : annotation.id);
                                setStylePickerFor(null);
                              }}
                              className="w-3.5 h-3.5 rounded-full border-2 hover:scale-110 transition-transform block"
                              style={{
                                backgroundColor: colorConfig.bg,
                                borderColor: showColorPicker ? textColor : 'transparent',
                              }}
                              title="点击更改颜色"
                            />
                            {showColorPicker && (
                              <div
                                className="absolute left-0 top-5 z-50 p-2 rounded-lg shadow-xl border flex flex-wrap gap-1.5 w-32"
                                style={{
                                  backgroundColor: bgColor,
                                  borderColor,
                                }}
                              >
                                {(Object.keys(ANNOTATION_COLORS) as AnnotationColor[]).map((c) => (
                                  <button
                                    key={c}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickColorChange(annotation.id, c);
                                    }}
                                    className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                                    style={{
                                      backgroundColor: ANNOTATION_COLORS[c].bg,
                                      borderColor: annotation.color === c ? textColor : 'transparent',
                                    }}
                                    title={ANNOTATION_COLORS[c].label}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="relative" ref={showStylePicker ? stylePickerRef : null}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStylePickerFor(showStylePicker ? null : annotation.id);
                                    setColorPickerFor(null);
                                  }}
                                  className="text-[10px] px-1.5 py-0.5 rounded font-serif hover:opacity-80 transition-opacity"
                                  style={{
                                    backgroundColor: colorConfig.bg,
                                    color: colorConfig.text,
                                  }}
                                  title="点击更改样式"
                                >
                                  {ANNOTATION_STYLES[annotation.style]}
                                </button>
                                {showStylePicker && (
                                  <div
                                    className="absolute left-0 top-5 z-50 p-1.5 rounded-lg shadow-xl border flex flex-col gap-1 w-24"
                                    style={{
                                      backgroundColor: bgColor,
                                      borderColor,
                                    }}
                                  >
                                    {(Object.keys(ANNOTATION_STYLES) as AnnotationStyle[]).map((s) => (
                                      <button
                                        key={s}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuickStyleChange(annotation.id, s);
                                        }}
                                        className="text-[11px] px-2 py-1 rounded text-left font-serif hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-between"
                                        style={{
                                          color: annotation.style === s ? activeText : textColor,
                                          backgroundColor: annotation.style === s ? activeBg : 'transparent',
                                          fontWeight: annotation.style === s ? 600 : 400,
                                        }}
                                      >
                                        <span>{ANNOTATION_STYLES[s]}</span>
                                        {annotation.style === s && <Check className="w-3 h-3" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {annotation.note && (
                                <MessageSquare className="w-3 h-3" style={{ color: mutedColor }} />
                              )}
                              <span
                                className="text-[10px] font-serif ml-auto"
                                style={{ color: mutedColor }}
                              >
                                {annotation.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <p
                              className="text-xs font-serif line-clamp-2 mb-1 leading-relaxed"
                              style={{ color: textColor }}
                            >
                              "{annotation.selectedText}"
                            </p>
                            {annotation.note && (
                              <p
                                className="text-xs font-serif line-clamp-2 leading-relaxed italic"
                                style={{ color: mutedColor }}
                              >
                                💬 {annotation.note}
                              </p>
                            )}
                            {annotation.chapter && annotation.chapter !== '未命名章节' && (
                              <p
                                className="text-[10px] font-serif mt-1.5"
                                style={{ color: mutedColor }}
                              >
                                {annotation.chapter}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAnnotation(annotation);
                              }}
                              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                              style={{ color: textColor }}
                              title="编辑标注"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAnnotation(currentBookId || '', annotation.id);
                              }}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              style={{ color: theme === 'night' ? '#f87171' : '#ef4444' }}
                              title="删除标注"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <Highlighter className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: textColor }} />
                <p className="text-sm font-serif" style={{ color: mutedColor }}>
                  暂无标注
                </p>
                <p className="text-xs font-serif mt-1" style={{ color: mutedColor, opacity: 0.7 }}>
                  选中文本即可添加高亮、下划线或批注
                </p>
              </div>
            )}

            {editingAnnotation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div
                  className="w-[480px] max-w-[90vw] rounded-xl shadow-2xl border flex flex-col max-h-[80vh]"
                  style={{ backgroundColor: bgColor, borderColor }}
                >
                  <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor }}
                  >
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5" style={{ color: textColor }} />
                      <h3 className="font-serif text-base font-medium" style={{ color: textColor }}>
                        编辑标注
                      </h3>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ANNOTATION_COLORS[editColor].bg }}
                        title={ANNOTATION_COLORS[editColor].label}
                      />
                    </div>
                    <button
                      onClick={() => setEditingAnnotation(null)}
                      className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      style={{ color: mutedColor }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-serif mb-2" style={{ color: mutedColor }}>
                        选中内容
                      </label>
                      <div
                        className="p-3 rounded-lg text-sm font-serif leading-relaxed line-clamp-4"
                        style={{
                          backgroundColor: ANNOTATION_COLORS[editColor].bg,
                          color: ANNOTATION_COLORS[editColor].text,
                        }}
                      >
                        "{editingAnnotation.selectedText}"
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-serif mb-2 flex items-center gap-1.5" style={{ color: mutedColor }}>
                        <Palette className="w-3 h-3" />
                        颜色
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {(Object.keys(ANNOTATION_COLORS) as AnnotationColor[]).map((c) => (
                          <button
                            key={c}
                            onClick={() => setEditColor(c)}
                            className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: ANNOTATION_COLORS[c].bg,
                              borderColor: editColor === c ? textColor : 'transparent',
                            }}
                            title={ANNOTATION_COLORS[c].label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-serif mb-2" style={{ color: mutedColor }}>
                        样式
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(Object.keys(ANNOTATION_STYLES) as AnnotationStyle[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setEditStyle(s)}
                            className="px-3 py-2 rounded-lg text-xs font-serif transition-colors border"
                            style={{
                              color: editStyle === s ? activeText : textColor,
                              backgroundColor: editStyle === s ? activeBg : 'transparent',
                              borderColor: editStyle === s ? activeBg : borderColor,
                              fontWeight: editStyle === s ? 600 : 400,
                            }}
                          >
                            {ANNOTATION_STYLES[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-serif mb-2" style={{ color: mutedColor }}>
                        批注内容
                      </label>
                      <textarea
                        ref={editTextareaRef}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="在此输入你的批注、想法、评论..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border text-sm font-serif leading-relaxed resize-none focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: theme === 'night' ? '#2a2a2a' : '#f9fafb',
                          color: textColor,
                          borderColor,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-end gap-2 px-5 py-4 border-t"
                    style={{ borderColor }}
                  >
                    <button
                      onClick={() => setEditingAnnotation(null)}
                      className="px-4 py-2 rounded-lg text-sm font-serif transition-colors"
                      style={{ color: mutedColor }}
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2 rounded-lg text-sm font-serif transition-colors flex items-center gap-1.5"
                      style={{
                        backgroundColor: textColor,
                        color: bgColor,
                      }}
                    >
                      <Check className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'font':
        return (
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-2">
              {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center justify-between"
                  style={{
                    color: fontSize === size ? activeText : textColor,
                    backgroundColor: fontSize === size ? activeBg : 'transparent',
                    fontWeight: fontSize === size ? 600 : 400,
                  }}
                >
                  <span
                    className="font-serif"
                    style={{ fontSize: size === 'small' ? '14px' : size === 'medium' ? '16px' : '18px' }}
                  >
                    字体大小示例文字
                  </span>
                  <span className="text-sm">{FONT_SIZE_LABELS[size]}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeId)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3"
                  style={{
                    color: theme === t.id ? activeText : textColor,
                    backgroundColor: theme === t.id ? activeBg : 'transparent',
                    fontWeight: theme === t.id ? 600 : 400,
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full border flex-shrink-0"
                    style={{ backgroundColor: t.background, borderColor: borderColor }}
                  />
                  <div className="flex-1">
                    <p className="font-serif text-sm">{t.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="w-72 h-full flex flex-col shrink-0 border-r transition-all duration-300"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
    >
      <div
        className="flex items-center justify-between px-4 h-12 shrink-0 border-b"
        style={{ borderColor: borderColor }}
      >
        <h3
          className="font-serif text-sm font-medium flex items-center gap-2"
          style={{ color: activeText }}
        >
          {panelIcon}
          {panelTitle}
        </h3>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          style={{ color: textColor }}
          title="关闭侧栏"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
