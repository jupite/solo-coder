'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Controls } from '@/components/game/Controls';
import {
  RotateCcw,
  LogOut,
  Clock,
  Footprints,
  Hash,
  Trophy,
  Loader2,
} from 'lucide-react';
import { levels, getLevel } from '@/lib/game/levels';
import { createGameState, movePlayer } from '@/lib/game/engine';
import type { GameState, Direction } from '@/lib/game/types';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const levelId = Number(params.levelId);
  const { data: session, status } = useSession();

  const levelIndex = levelId - 1;
  const levelData = getLevel(levelIndex);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [time, setTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const state = createGameState(levelData);
    setGameState(state);
    setTime(0);
    setCompleted(false);
    setSubmitting(false);
    startTimeRef.current = Date.now();
  }, [status, levelId]);

  useEffect(() => {
    if (completed || !gameState) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 250);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [completed, gameState]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (!gameState || completed) return;
      setGameState((prev) => {
        if (!prev) return prev;
        const next = movePlayer(prev, direction);
        if (next !== prev && next.isWin) {
          setCompleted(true);
        }
        return next;
      });
    },
    [gameState, completed],
  );

  const handleReset = useCallback(() => {
    const state = createGameState(levelData);
    setGameState(state);
    setTime(0);
    setCompleted(false);
    setSubmitting(false);
    startTimeRef.current = Date.now();
  }, [levelData]);

  const handleExit = useCallback(() => {
    router.push('/levels');
  }, [router]);

  const handleSubmitResult = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelId, time, steps: gameState?.steps ?? 0 }),
      });
      const data = await res.json();
      const bestTime = data.bestTime ?? time;
      const bestSteps = data.bestSteps ?? gameState?.steps ?? 0;
      const isNewRecord = data.isNewRecord ?? false;
      router.push(
        `/result/${levelId}?time=${time}&steps=${gameState?.steps ?? 0}&bestTime=${bestTime}&bestSteps=${bestSteps}&isNewRecord=${isNewRecord}`,
      );
    } catch {
      router.push(
        `/result/${levelId}?time=${time}&steps=${gameState?.steps ?? 0}`,
      );
    }
  }, [submitting, levelId, time, gameState, router]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-slate-300">加载中...</p>
        </div>
      </main>
    );
  }

  if (!session || !gameState) {
    return null;
  }

  return (
    <main className="relative min-h-screen px-4 py-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 glass-card gradient-border p-4 md:p-6 aspect-square lg:aspect-auto lg:min-h-[600px] relative">
            <GameCanvas gameState={gameState} levelData={levelData} />

            {completed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl z-20 p-4">
                <div className="glass-card p-8 text-center max-w-sm w-full space-y-5">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      关卡完成！
                    </h2>
                    <p className="text-slate-400">第 {levelId} 关</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-3">
                      <p className="text-xs text-slate-400 mb-1">用时</p>
                      <p className="text-xl font-bold text-white font-[var(--font-orbitron)]">
                        {formatTime(time)}
                      </p>
                    </div>
                    <div className="glass-card p-3">
                      <p className="text-xs text-slate-400 mb-1">步数</p>
                      <p className="text-xl font-bold text-white font-[var(--font-orbitron)]">
                        {gameState.steps}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitResult}
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    查看成绩
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-72 flex flex-col gap-4">
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-slate-400">关卡</span>
                <span className="ml-auto text-lg font-bold text-white font-[var(--font-orbitron)]">
                  #{levelId}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-slate-400">时间</span>
                <span className="ml-auto text-lg font-bold text-white font-[var(--font-orbitron)]">
                  {formatTime(time)}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-slate-400">步数</span>
                <span className="ml-auto text-lg font-bold text-white font-[var(--font-orbitron)]">
                  {gameState.steps}
                </span>
              </div>
            </div>

            <div className="glass-card p-3 space-y-3">
              <button
                onClick={handleReset}
                disabled={completed}
                className="btn-secondary w-full inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置关卡
              </button>
              <button
                onClick={handleExit}
                className="btn-ghost w-full inline-flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                退出关卡
              </button>
            </div>

            <div className="glass-card p-4 text-xs text-slate-400 leading-relaxed">
              <p className="text-slate-300 font-medium mb-2">操作说明</p>
              <p>WASD 或 方向键：移动角色</p>
              <p>R：重置关卡</p>
              <p>Esc：退出关卡</p>
            </div>
          </div>
        </div>
      </div>

      <Controls onMove={handleMove} onReset={handleReset} onExit={handleExit} />
    </main>
  );
}
