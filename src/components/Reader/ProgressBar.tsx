import { useState, useRef, useCallback, useEffect } from 'react';
import { ThemeId } from '@/types';

interface ProgressBarProps {
  progress: number;
  theme: ThemeId;
  onSeek: (percentage: number) => void;
}

export default function ProgressBar({ progress, theme, onSeek }: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);

  const getPercentageFromEvent = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    return Math.max(0, Math.min(100, percentage));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const pct = getPercentageFromEvent(e.clientX);
    setLocalProgress(pct);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const pct = getPercentageFromEvent(e.clientX);
        setLocalProgress(pct);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onSeek(localProgress);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, localProgress, getPercentageFromEvent, onSeek]);

  const barColor = theme === 'night' ? '#444' : theme === 'eye' ? '#d4cdb8' : '#e0e0e0';
  const fillColor = theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#666';
  const thumbColor = theme === 'night' ? '#888' : theme === 'eye' ? '#5b4636' : '#333';

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
      <div className="max-w-4xl mx-auto">
        <div
          ref={barRef}
          className="relative h-1 cursor-pointer group"
          style={{ backgroundColor: barColor }}
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute top-0 left-0 h-full transition-all duration-100"
            style={{
              width: `${localProgress}%`,
              backgroundColor: fillColor,
            }}
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              left: `${localProgress}%`,
              backgroundColor: thumbColor,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            }}
          />
        </div>

        <div
          className="text-xs text-center mt-2 font-serif"
          style={{ color: theme === 'night' ? '#666' : theme === 'eye' ? '#8b7355' : '#999' }}
        >
          {localProgress.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
