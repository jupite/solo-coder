'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Droplets,
  Flame,
  ToggleLeft,
  RefreshCw,
} from 'lucide-react';
import type { Direction, PlayerColor, DuoLevelData, DuoGameState } from '@/lib/game/types';
import { solveDuoLevel, solveDuoFromState, DuoSolveStep } from '@/lib/game/duo-solver';

interface DuoHintPanelProps {
  levelData: DuoLevelData;
  currentState?: DuoGameState | null;
  onStep: (color: PlayerColor, direction: Direction) => void;
  onSwitchToggle: (color: PlayerColor, switchX: number, switchY: number) => void;
  onAutoSolveComplete?: () => void;
  onReset?: () => void;
  disabled?: boolean;
}

const DIR_ARROWS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const DIR_LABELS: Record<Direction, string> = {
  up: '上',
  down: '下',
  left: '左',
  right: '右',
};

export function DuoHintPanel({
  levelData,
  currentState,
  onStep,
  onSwitchToggle,
  onAutoSolveComplete,
  onReset,
  disabled = false,
}: DuoHintPanelProps) {
  const [solution, setSolution] = useState<DuoSolveStep[] | null | undefined>(undefined);
  const [solving, setSolving] = useState(false);
  const [solvedFromStart, setSolvedFromStart] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSolve = useCallback(async () => {
    setShowPanel(true);
    setSolving(true);
    setSolution(undefined);
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setSolvedFromStart(false);

    try {
      await new Promise((r) => setTimeout(r, 50));

      let result: DuoSolveStep[] | null = null;

      if (currentState && !currentState.isWin) {
        result = solveDuoFromState(currentState, 200000);
      }

      if (result === null) {
        result = solveDuoLevel(levelData, 300000);
        if (result !== null) {
          setSolvedFromStart(true);
        }
      }

      setSolution(result);
    } catch {
      setSolution(null);
    } finally {
      setSolving(false);
    }
  }, [levelData, currentState]);

  const handlePrevStep = useCallback(() => {
    if (!solution || currentStep <= 0 || isAutoPlaying) return;
    setCurrentStep((s) => s - 1);
  }, [solution, currentStep, isAutoPlaying]);

  const handleNextStep = useCallback(() => {
    if (!solution || currentStep >= solution.length || isAutoPlaying) return;
    const step = solution[currentStep];
    if (step.isSwitchToggle && step.switchX !== undefined && step.switchY !== undefined) {
      onSwitchToggle(step.color, step.switchX, step.switchY);
    } else {
      onStep(step.color, step.direction);
    }
    setCurrentStep((s) => s + 1);
  }, [solution, currentStep, onStep, onSwitchToggle, isAutoPlaying]);

  const handleAutoPlay = useCallback(() => {
    if (!solution || isAutoPlaying) return;
    if (currentStep >= solution.length) return;

    setIsAutoPlaying(true);
    let step = currentStep;

    const playNext = () => {
      if (step >= solution!.length) {
        setIsAutoPlaying(false);
        onAutoSolveComplete?.();
        return;
      }
      const s = solution![step];
      if (s.isSwitchToggle && s.switchX !== undefined && s.switchY !== undefined) {
        onSwitchToggle(s.color, s.switchX, s.switchY);
      } else {
        onStep(s.color, s.direction);
      }
      step++;
      setCurrentStep(step);
      autoPlayRef.current = setTimeout(playNext, 500);
    };

    playNext();
  }, [solution, currentStep, isAutoPlaying, onStep, onSwitchToggle, onAutoSolveComplete]);

  const handlePauseAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setIsAutoPlaying(false);
  }, []);

  const handleClose = useCallback(() => {
    handlePauseAutoPlay();
    setShowPanel(false);
    setSolution(undefined);
    setCurrentStep(0);
  }, [handlePauseAutoPlay]);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, []);

  if (!showPanel) {
    return (
      <button
        onClick={handleSolve}
        disabled={disabled || solving}
        className="btn-secondary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Lightbulb className="w-4 h-4" />
        提示
      </button>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">过关提示</span>
        </div>
        <button
          onClick={handleClose}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          关闭
        </button>
      </div>

      {solving && (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          <span className="text-sm text-slate-400">正在寻找解法...</span>
        </div>
      )}

      {!solving && solution === null && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 py-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">当前状态下无法找到解法</span>
          </div>
          {onReset && (
            <button
              onClick={() => {
                handleClose();
                onReset();
              }}
              className="btn-secondary w-full inline-flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              重置关卡后再试
            </button>
          )}
        </div>
      )}

      {!solving && solution != null && (
        <>
          <div className="flex items-center gap-2 py-1 text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">
              已找到解法，共 {solution.length} 步
            </span>
          </div>

          {solvedFromStart && onReset && (
            <div className="glass-card p-3 bg-amber-500/10 border-amber-500/20">
              <p className="text-xs text-amber-300 mb-2">
                此解法从初始状态开始。需要重置关卡才能按步骤演示。
              </p>
              <button
                onClick={() => {
                  onReset();
                  setCurrentStep(0);
                }}
                className="btn-primary w-full inline-flex items-center justify-center gap-1 text-xs py-2"
              >
                <RefreshCw className="w-3 h-3" />
                重置并应用解法
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 py-2">
            <span className="text-sm text-slate-400">
              当前：
            </span>
            <span className="text-lg font-bold text-white font-[var(--font-orbitron)]">
              {currentStep} / {solution.length}
            </span>
          </div>

          {solution.length > 0 && currentStep > 0 && (
            <div className="glass-card p-2 bg-white/5">
              <p className="text-xs text-slate-400 mb-1">上一步</p>
              <div className="flex items-center gap-2">
                {solution[currentStep - 1].color === 'blue' ? (
                  <Droplets className="w-4 h-4 text-blue-400" />
                ) : (
                  <Flame className="w-4 h-4 text-red-400" />
                )}
                {solution[currentStep - 1].isSwitchToggle ? (
                  <div className="flex items-center gap-1">
                    <ToggleLeft className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-300">切换开关</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-2xl text-cyan-400 font-bold">
                      {DIR_ARROWS[solution[currentStep - 1].direction]}
                    </span>
                    <span className="text-sm text-slate-300">
                      {DIR_LABELS[solution[currentStep - 1].direction]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {solution.length > 0 && currentStep < solution.length && (
            <div className="glass-card p-2 bg-indigo-500/10 border-indigo-500/20">
              <p className="text-xs text-slate-400 mb-1">下一步</p>
              <div className="flex items-center gap-2">
                {solution[currentStep].color === 'blue' ? (
                  <Droplets className="w-4 h-4 text-blue-400" />
                ) : (
                  <Flame className="w-4 h-4 text-red-400" />
                )}
                {solution[currentStep].isSwitchToggle ? (
                  <div className="flex items-center gap-1">
                    <ToggleLeft className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-yellow-300">切换开关</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-2xl text-yellow-400 font-bold">
                      {DIR_ARROWS[solution[currentStep].direction]}
                    </span>
                    <span className="text-sm text-slate-300">
                      {DIR_LABELS[solution[currentStep].direction]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStep <= 0 || isAutoPlaying}
              className="flex-1 btn-secondary py-2 px-2 text-sm inline-flex items-center justify-center gap-1 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
              上一步
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStep >= solution.length || isAutoPlaying}
              className="flex-1 btn-primary py-2 px-2 text-sm inline-flex items-center justify-center gap-1 disabled:opacity-30"
            >
              下一步
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            {!isAutoPlaying ? (
              <button
                onClick={handleAutoPlay}
                disabled={currentStep >= solution.length}
                className="flex-1 btn-primary py-2 px-2 text-sm inline-flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 border-yellow-500/30 disabled:opacity-30"
              >
                <Play className="w-4 h-4" />
                自动通关
              </button>
            ) : (
              <button
                onClick={handlePauseAutoPlay}
                className="flex-1 btn-secondary py-2 px-2 text-sm inline-flex items-center justify-center gap-1"
              >
                <Pause className="w-4 h-4" />
                暂停
              </button>
            )}
          </div>

          <p className="text-xs text-amber-300/80 text-center">
            提示通关不计入成绩
          </p>
        </>
      )}
    </div>
  );
}
