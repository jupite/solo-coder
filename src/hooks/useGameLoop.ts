import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export const useGameLoop = () => {
  const { stones, gamePhase, nextTurn, currentStoneId } = useGameStore();
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (gamePhase !== 'thrown') {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
        checkTimerRef.current = null;
      }
      return;
    }

    const currentStone = stones.find((s) => s.id === currentStoneId);
    if (!currentStone) return;

    if (!currentStone.isMoving) {
      checkTimerRef.current = setTimeout(() => {
        nextTurn();
      }, 500);
    }

    return () => {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
      }
    };
  }, [stones, gamePhase, currentStoneId, nextTurn]);

  return null;
};
