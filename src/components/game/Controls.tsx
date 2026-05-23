'use client';

import { useEffect, useCallback } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Direction } from '@/lib/game/types';

interface ControlsProps {
  onMove: (direction: Direction) => void;
  onReset: () => void;
  onExit: () => void;
}

const KEY_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};

export function Controls({ onMove, onReset, onExit }: ControlsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const direction = KEY_DIRECTION[e.key];
      if (direction) {
        e.preventDefault();
        onMove(direction);
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    },
    [onMove, onReset, onExit],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col gap-4 md:hidden">
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        <div />
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={() => onMove('up')}
          aria-label="向上"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
        <div />
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={() => onMove('left')}
          aria-label="向左"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div />
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={() => onMove('right')}
          aria-label="向右"
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
        <div />
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={() => onMove('down')}
          aria-label="向下"
        >
          <ArrowDown className="w-6 h-6" />
        </Button>
        <div />
      </div>

      <div className="flex gap-3 justify-center">
        <Button type="button" variant="secondary" onClick={onReset}>
          <RotateCcw className="w-5 h-5" />
          重置
        </Button>
        <Button type="button" variant="ghost" onClick={onExit}>
          <LogOut className="w-5 h-5" />
          退出
        </Button>
      </div>
    </div>
  );
}
