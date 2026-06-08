'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  RotateCcw,
  LogOut,
  Clock,
  Footprints,
  Hash,
  Trophy,
  Loader2,
  Users,
  Droplets,
  Flame,
  Undo2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  createDuoGravityGameState,
  moveDuoGravityPlayer,
  undoDuoGravityMove,
} from '@/lib/game/duo-gravity-engine';
import type {
  DuoGravityGameState,
  Direction,
  DuoGravityLevelData,
  PlayerColor,
} from '@/lib/game/types';
import { useSkin } from '@/components/game/SkinProvider';
import { DuoGravityGameCanvas } from '@/components/game/DuoGravityGameCanvas';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function DuoGravityGamePage() {
  const router = useRouter();
  const params = useParams();
  const levelIdRaw = params.levelId;
  const levelId = Array.isArray(levelIdRaw) ? levelIdRaw[0] : levelIdRaw;
  const { data: session, status } = useSession();
  const { currentSkin } = useSkin();

  const [levelData, setLevelData] = useState<DuoGravityLevelData | null>(null);
  const [levelName, setLevelName] = useState<string>('');
  const [loadingLevel, setLoadingLevel] = useState(true);
  const [gameState, setGameState] = useState<DuoGravityGameState | null>(null);
  const [time, setTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerColor>('blue');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const gameStateRef = useRef<DuoGravityGameState | null>(null);
  const selectedPlayerRef = useRef<PlayerColor>('blue');

  useEffect(() => {
    selectedPlayerRef.current = selectedPlayer;
  }, [selectedPlayer]);

  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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
        const res = await fetch(`/api/duo-gravity-levels/${levelId}`);
        if (!res.ok) {
          throw new Error('关卡不存在');
        }
        const data = await res.json();
        if (!cancelled) {
          setLevelData({
            grid: data.grid,
            bluePlayer: data.bluePlayer,
            redPlayer: data.redPlayer,
            boxes: data.boxes,
            targets: data.targets,
          });
          setLevelName(data.name || `重力关卡 ${levelId}`);
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
    const state = createDuoGravityGameState(levelData);
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

  useEffect(() => {
    if (gameState?.isWin && !completed) {
      setCompleted(true);
    }
  }, [gameState?.isWin, completed]);

  const handleMove = useCallback((direction: Direction) => {
    if (completedRef.current) return;
    const player = selectedPlayerRef.current;
    setGameState((prev) => {
      if (!prev) return prev;
      return moveDuoGravityPlayer(prev, player, direction);
    });
  }, []);

  const handleReset = useCallback(() => {
    if (!levelData) return;
    const state = createDuoGravityGameState(levelData);
    setGameState(state);
    setTime(0);
    setCompleted(false);
    setSubmitting(false);
    setSelectedPlayer('blue');
    startTimeRef.current = Date.now();
  }, [levelData]);

  const handleUndo = useCallback(() => {
    if (completedRef.current) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return undoDuoGravityMove(prev);
    });
  }, []);

  const handleExit = useCallback(() => {
    router.push('/levels');
  }, [router]);

  const handleSubmitResult = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/duo-gravity-record', {
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
        `/result/${levelId}?time=${time}&steps=${gameState?.steps ?? 0}&bestTime=${bestTime}&bestSteps=${bestSteps}&isNewRecord=${isNewRecord}&mode=duo-gravity`,
      );
    } catch {
      router.push(
        `/result/${levelId}?time=${time}&steps=${gameState?.steps ?? 0}&mode=duo-gravity`,
      );
    }
  }, [submitting, levelId, time, gameState, router]);

  const handleSwitchPlayer = useCallback(() => {
    setSelectedPlayer((prev) => (prev === 'blue' ? 'red' : 'blue'));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStateRef.current || completedRef.current) return;
      if (e.key === 'Tab') {
        e.preventDefault();
        handleSwitchPlayer();
        return;
      }
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') handleMove('right');
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') handleMove('up');
      if (e.key === 'z' || e.key === 'Z') handleUndo();
      if (e.key === 'r' || e.key === 'R') handleReset();
      if (e.key === 'Escape') handleExit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleUndo, handleReset, handleExit, handleSwitchPlayer]);

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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 glass-card gradient-border p-4 md:p-6 relative" style={{ minHeight: 500, height: 'calc(100vh - 200px)', maxHeight: 700 }}>
            <DuoGravityGameCanvas
              gameState={gameState}
              levelData={levelData}
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
                      重力关卡完成！
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
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleSubmitResult}
                      disabled={submitting}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                      查看成绩
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={handleReset}
                        className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        再玩一次
                      </button>
                      <button
                        onClick={() => router.push('/duo-gravity-levels')}
                        className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        选择关卡
                      </button>
                    </div>
                    <button
                      onClick={handleExit}
                      className="btn-ghost w-full inline-flex items-center justify-center gap-2"
                    >
                      返回模式
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!completed && (
              <div className="absolute bottom-4 left-4 glass-card p-2 flex items-center gap-1">
                <button onClick={() => handleMove('left')} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={() => handleMove('right')} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-72 flex flex-col gap-4">
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-400" />
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
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border-2 ${selectedPlayer === 'blue' ? '' : 'border-transparent hover:bg-white/10'} bg-white/5`}
                  style={{
                    backgroundColor: selectedPlayer === 'blue' ? `${currentSkin.player.color}30` : undefined,
                    borderColor: selectedPlayer === 'blue' ? currentSkin.player.color : undefined,
                    boxShadow: selectedPlayer === 'blue' ? `0 0 15px ${currentSkin.player.color}50` : undefined,
                  }}
                >
                  <Droplets
                    className="w-5 h-5"
                    style={{ color: currentSkin.player.color }}
                  />
                  <span className="text-xs text-slate-300">
                    {gameState?.bluePlayer.onTarget ? '已就位' : '玩家 1'}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedPlayer('red')}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border-2 ${selectedPlayer === 'red' ? '' : 'border-transparent hover:bg-white/10'} bg-white/5`}
                  style={{
                    backgroundColor: selectedPlayer === 'red' ? `${currentSkin.redPlayer.color}30` : undefined,
                    borderColor: selectedPlayer === 'red' ? currentSkin.redPlayer.color : undefined,
                    boxShadow: selectedPlayer === 'red' ? `0 0 15px ${currentSkin.redPlayer.color}50` : undefined,
                  }}
                >
                  <Flame
                    className="w-5 h-5"
                    style={{ color: currentSkin.redPlayer.color }}
                  />
                  <span className="text-xs text-slate-300">
                    {gameState?.redPlayer.onTarget ? '已就位' : '玩家 2'}
                  </span>
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
              <p>Tab：切换控制角色</p>
              <p>A/D 或 ←/→：左右移动</p>
              <p>W 或 ↑：向上攀登</p>
              <p>可攀登高度为1格</p>
              <p>最多推动2个水平箱子</p>
              <p>堆叠的箱子可一起推动</p>
              <p>两个角色都站在目标点即通关</p>
              <p>角色变绿表示已就位</p>
              <p>Z：撤销一步</p>
              <p>R：重置关卡</p>
              <p>Esc：退出关卡</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
