'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { SkinConfig, DEFAULT_SKIN_ID, getSkinById } from '@/lib/game/skins';

interface SkinContextType {
  currentSkinId: string;
  currentSkin: SkinConfig;
  setSkin: (skinId: string) => void;
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

const SKIN_STORAGE_KEY = 'sokoban-skin-id';

export function SkinProvider({ children }: { children: ReactNode }) {
  const [currentSkinId, setCurrentSkinId] = useState<string>(DEFAULT_SKIN_ID);

  useEffect(() => {
    const savedSkinId = localStorage.getItem(SKIN_STORAGE_KEY);
    if (savedSkinId) {
      setCurrentSkinId(savedSkinId);
    }
  }, []);

  const setSkin = useCallback((skinId: string) => {
    setCurrentSkinId(skinId);
    localStorage.setItem(SKIN_STORAGE_KEY, skinId);
  }, []);

  const currentSkin = useMemo(() => getSkinById(currentSkinId), [currentSkinId]);

  const value = useMemo(
    () => ({ currentSkinId, currentSkin, setSkin }),
    [currentSkinId, currentSkin, setSkin],
  );

  return (
    <SkinContext.Provider value={value}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin() {
  const context = useContext(SkinContext);
  if (context === undefined) {
    throw new Error('useSkin must be used within a SkinProvider');
  }
  return context;
}
