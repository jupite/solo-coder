import { useState, useEffect } from 'react';
import { ThemeId, THEMES, FontSize, FONT_SIZE_MAP } from '@/types';
import { storage } from '@/utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(() => storage.getTheme());
  const [fontSize, setFontSize] = useState<FontSize>(() => storage.getFontSize());

  useEffect(() => {
    storage.saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    storage.saveFontSize(fontSize);
  }, [fontSize]);

  const currentTheme = THEMES.find((t) => t.id === theme)!;

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  const cycleFontSize = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  return {
    theme,
    setTheme,
    currentTheme,
    fontSize,
    setFontSize,
    fontSizeValue: FONT_SIZE_MAP[fontSize],
    cycleTheme,
    cycleFontSize,
  };
}
