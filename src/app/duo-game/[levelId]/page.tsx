'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DuoGameCanvas } from '@/components/game/DuoGameCanvas';
import { Controls } from '@/components/game/Controls';
import {
  RotateCcw,
  LogOut,
  Clock,
  Footprints,
  Hash,
  Trophy,
  Loader2,
  User,
  Users,
  Droplets,
  Flame,
  Undo2,
} from 'lucide-react';
import {
  createDuoGameState,
  moveDuoPlayer,
  undoDuoMove,
  toggleSwitch,
} from '@/lib/game/duo-engine';
import type {
  DuoGameState,
  Direction,
  DuoLevelData,
  PlayerColor,
} from '@/lib/game/types';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function DuoGamePage() {
  const router = useRouter();
  const params = useParams();
  const levelIdRaw = params.levelId;
  const levelId = Array.isArray(levelIdRaw) ? levelIdRaw[0] : levelIdRaw;
  const { data: session, status } = useSession();

  const [levelData, setLevelData] = useState<DuoLevelData | null>(null);
  const [levelName, setLevelName] = useState<string>('');
  const [loadingLevel, setLoadingLevel] = useState(true);
  const [gameState, setGameState] = useState<DuoGameState | null>(null);
  const [time, setTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerColor>('blue');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    const fetchLevelData = async () => {
      try {
        setLoadingLevel(true);
        const res = await fetch(`/api/duo-levels/${levelId}`);
        if (!res.ok) {
          throw new Error('关卡不存在');
        }
        const data = await res.json();
        if (!cancelled) {
          setLevelData({
            grid: data.grid,
            bluePlayer: data.bluePlayer,
            redPlayer: data.redPlayer,
            blueMaxSteps: data.blueMaxSteps,
            redMaxSteps: data.redMaxSteps,
            boxes: data.boxes,
            targets: data.targets,
            redGates: data.redGates,
            switches: data.switches,
          });
          setLevelName(data.name || `双人关卡 ${levelId}`);
        }
      } catch {
        if (!cancelled) {
          router.push('/levels');
        }
      } finally {
        if (!cancelled) {
          setLoadingLevel(false);
        }
      }
    };

    fetchLevelData();
    return () => {
      cancelled = true;
    };
  }, [status, levelId, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !levelData) return;
    const state = createDuoGameState(levelData);
    setGameState(state);
    setTime(0);
    setCompleted(false);
    setSubmitting(false);
    setSelectedPlayer('blue');
    startTimeRef.current = Date.now();
  }, [status, levelData]);

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

      let actualPlayer = selectedPlayer;
      if (selectedPlayer === 'blue' && gameState.bluePlayer.isGone) {
        actualPlayer = 'red';
      } else if (selectedPlayer === 'red' && gameState.redPlayer.isGone) {
        actualPlayer = 'blue';
      }

      setGameState((prev) => {
        if (!prev) return prev;
        const next = moveDuoPlayer(prev, actualPlayer, direction);
        if (next !== prev && next.isWin) {
          setCompleted(true);
        }
        return next;
      });
    },
    [gameState, completed, selectedPlayer],
  );

  const handleReset = useCallback(() => {
    if (!levelData) return;
    const state = createDuoGameState(levelData);
    setGameState(state);
    setTime(0);
    setCompleted(false);
    setSubmitting(false);
    setSelectedPlayer('blue');
    startTimeRef.current = Date.now();
  }, [levelData]);

  const handleUndo = useCallback(() => {
    if (!gameState || completed) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return undoDuoMove(prev);
    });
  }, [gameState, completed]);

  const handleSwitchClick = useCallback(
    (switchX: number, switchY: number) => {
      if (!gameState || completed) return;
      setGameState((prev) => {
        if (!prev) return prev;
        return toggleSwitch(prev, switchX, switchY, selectedPlayer);
      });
    },
    [gameState, completed, selectedPlayer],
  );

  const handleExit = useCallback(() => {
    router.push('/levels');
  }, [router]);

  const handleSubmitResult = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/duo-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId,
          time,
          steps: gameState?.steps ?? 0,
        }),
      });
      const data = await res.json();
      const bestTime = data.bestTime ?? time;
      const bestSteps = data.bestSteps ?? gameState?.steps ?? 0;
      const isNewRecord = data.isNewRecord ?? false;
      router.push(
        `/result/${levelId}?time=${time}&steps=${gameState?.steps ?? 0}&bestTime=${bestTime}&bestSteps=${bestSteps}&isNewRecord=${isNewRecord}&mode=duo`,
      );
    } catch {
      router.push(
        `/result/${levelId}?time=${time}&steps=${gameState?.steps ?? 0}&mode=duo`,
      );
    }
  }, [submitting, levelId, time, gameState, router]);

  if (status === 'loading' || loadingLevel) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-slate-300">加载中...</p>
        </div>
      </main>
    );
  }

  if (!session || !gameState || !levelData) {
    return null;
  }

  const displayLevelId = typeof levelId === 'string' && !isNaN(Number(levelId))
    ? `#${levelId}`
    : levelName;

  return (
    <main className="relative min-h-screen px-4 py-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 glass-card gradient-border p-4 md:p-6 relative" style={{ minHeight: 500, height: 'calc(100vh - 200px)', maxHeight: 700 }}>
            <DuoGameCanvas
              gameState={gameState}
              levelData={levelData}
              onSwitchClick={handleSwitchClick}
              activePlayerColor={selectedPlayer}
            />

            {completed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl z-20 p-4">
                <div className="glass-card p-8 text-center max-w-sm w-full space-y-5">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/50">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      双人关卡完成！
                    </h2>
                    <p className="text-slate-400">{levelName}</p>
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
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitResult}
                      disabled={submitting}
                      className="btn-primary flex-1"
                    >
                      {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                      查看成绩
                    </button>
                    <button
                      onClick={handleReset}
                      className="btn-secondary flex-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      再玩一次
                    </button>
                    <button
                      onClick={handleExit}
                      className="btn-ghost flex-1"
                    >
                      返回关卡
                    </button>
                  </div>
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
                  {displayLevelId}
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

            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">当前角色</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPlayer('blue')}
                  disabled={gameState.bluePlayer.isGone}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${selectedPlayer === 'blue' ? 'bg-blue-500/30 border-2 border-blue-500' : 'bg-white/5 border-2 border-transparent hover:bg-white/10'} ${gameState.bluePlayer.isGone ? 'opacity-40' : ''}`}
                >
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-slate-300">{gameState.bluePlayer.isGone ? '已通关' : '蓝色'}</span>
                  {!gameState.bluePlayer.isGone && (
                    <span className="text-xs text-blue-300">
                      {gameState.bluePlayer.stepsRemaining}/{gameState.bluePlayer.maxSteps}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPlayer('red')}
                  disabled={gameState.redPlayer.isGone}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${selectedPlayer === 'red' ? 'bg-red-500/30 border-2 border-red-500' : 'bg-white/5 border-2 border-transparent hover:bg-white/10'} ${gameState.redPlayer.isGone ? 'opacity-40' : ''}`}
                >
                  <Flame className="w-5 h-5 text-red-400" />
                  <span className="text-xs text-slate-300">{gameState.redPlayer.isGone ? '已通关' : '红色'}</span>
                  {!gameState.redPlayer.isGone && (
                    <span className="text-xs text-red-300">
                      {gameState.redPlayer.stepsRemaining}/{gameState.redPlayer.maxSteps}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="glass-card p-3 space-y-3">
              <button
                onClick={handleUndo}
                disabled={completed || gameState.history.length === 0}
                className="btn-secondary w-full inline-flex items-center justify-center gap-2"
              >
                <Undo2 className="w-4 h-4" />
                撤销一步
              </button>
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
              <p>点击上方按钮切换角色</p>
              <p>WASD 或 方向键：移动角色</p>
              <p>走一格消耗一点，原路返回恢复</p>
              <p>角色走到开关旁边时可点击切换</p>
              <p>角色到达目标点后消失</p>
              <p>两个角色都消失即为通关</p>
              <p>Z：撤销一步</p>
              <p>R：重置关卡</p>
              <p>Esc：退出关卡</p>
            </div>
          </div>
        </div>
      </div>

      <Controls onMove={handleMove} onReset={handleReset} onExit={handleExit} onUndo={handleUndo} />
    </main>
  );
}