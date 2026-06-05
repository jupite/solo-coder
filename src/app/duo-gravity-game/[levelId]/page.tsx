'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
  Position,
} from '@/lib/game/types';
import { CellType } from '@/lib/game/types';
import { useSkin } from '@/components/game/SkinProvider';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function CameraSetup({ centerX, centerZ, distance, zoom }: { centerX: number; centerZ: number; distance: number; zoom: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(centerX, distance * 2, centerZ);
    camera.rotation.set(-Math.PI / 2, 0, 0);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [camera, centerX, centerZ, distance, zoom]);

  return null;
}

function GameFloor({ col, row }: { col: number; row: number }) {
  return (
    <mesh position={[col, 0, row]} receiveShadow>
      <boxGeometry args={[0.92, 0.08, 0.92]} />
      <meshStandardMaterial
        color="#1e3a5f"
        metalness={0.2}
        roughness={0.8}
        emissive="#0b1f3a"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function GameWall({ col, row }: { col: number; row: number }) {
  const { currentSkin } = useSkin();
  return (
    <RoundedBox
      args={[0.92, 0.92, 0.92]}
      radius={0.08}
      smoothness={2}
      position={[col, 0.46, row]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={currentSkin.wall.color} metalness={currentSkin.wall.metalness} roughness={currentSkin.wall.roughness} />
    </RoundedBox>
  );
}

function GameTarget({ col, row }: { col: number; row: number }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  return (
    <group position={[col, 0, row]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color="#3a2a0a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.42, 32]} />
        <meshStandardMaterial
          color={skin.target.color}
          emissive={skin.target.emissive}
          emissiveIntensity={skin.target.emissiveIntensity}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
          side={2}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial
          color={skin.target.color}
          emissive={skin.target.emissive}
          emissiveIntensity={skin.target.emissiveIntensity * 0.5}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function GameBox({ position, isOnTarget }: { position: Position; isOnTarget?: boolean }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  return (
    <group position={[position.x, 0.46, position.y]}>
      <RoundedBox args={[0.82, 0.82, 0.82]} radius={0.06} smoothness={2} castShadow receiveShadow>
        {isOnTarget ? (
          <meshStandardMaterial color={skin.boxOnTarget.color} emissive={skin.boxOnTarget.emissive} emissiveIntensity={skin.boxOnTarget.emissiveIntensity} metalness={skin.boxOnTarget.metalness} roughness={skin.boxOnTarget.roughness} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={skin.box.color} metalness={skin.box.metalness} roughness={skin.box.roughness} />
        )}
      </RoundedBox>
    </group>
  );
}

function GameBluePlayer({ position, onTarget }: { position: Position; onTarget?: boolean }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial
          color={onTarget ? '#22c55e' : skin.player.color}
          emissive={onTarget ? '#22c55e' : skin.player.emissive}
          emissiveIntensity={onTarget ? 0.8 : skin.player.emissiveIntensity}
          metalness={skin.player.metalness}
          roughness={skin.player.roughness}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial
          color={onTarget ? '#22c55e' : skin.player.color}
          emissive={onTarget ? '#22c55e' : skin.player.emissive}
          emissiveIntensity={onTarget ? 1.5 : skin.player.emissiveIntensity * 2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function GameRedPlayer({ position, onTarget }: { position: Position; onTarget?: boolean }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial
          color={onTarget ? '#22c55e' : skin.redPlayer.color}
          emissive={onTarget ? '#22c55e' : skin.redPlayer.emissive}
          emissiveIntensity={onTarget ? 0.8 : skin.redPlayer.emissiveIntensity}
          metalness={skin.redPlayer.metalness}
          roughness={skin.redPlayer.roughness}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial
          color={onTarget ? '#22c55e' : skin.redPlayer.color}
          emissive={onTarget ? '#22c55e' : skin.redPlayer.emissive}
          emissiveIntensity={onTarget ? 1.5 : skin.redPlayer.emissiveIntensity * 2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function GravityGameCanvas({
  gameState,
  levelData,
}: {
  gameState: DuoGravityGameState;
  levelData: DuoGravityLevelData;
}) {
  const { grid } = levelData;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const centerX = (cols - 1) / 2;
  const centerZ = (rows - 1) / 2;
  const size = Math.max(rows, cols);
  const cameraDistance = size * 1.5;
  const zoom = Math.max(40, 80 - size * 8);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 450, position: 'relative' }}>
      <Canvas
        shadows
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', background: '#0a0f1e' }}
      >
        <OrthographicCamera makeDefault near={0.1} far={500} />
        <CameraSetup centerX={centerX} centerZ={centerZ} distance={cameraDistance} zoom={zoom} />

        <ambientLight intensity={0.7} color="#c7d2fe" />
        <directionalLight
          position={[centerX + 5, 10, centerZ + 5]}
          intensity={1.0}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[centerX - 4, 6, centerZ - 4]}
          intensity={0.4}
          color="#818cf8"
        />

        {gameState.grid.map((row, r) =>
          row.map((cell, c) => {
            if (cell === CellType.WALL) {
              return <GameWall key={`w-${r}-${c}`} col={c} row={r} />;
            }
            if (cell === CellType.TARGET) {
              return <GameTarget key={`t-${r}-${c}`} col={c} row={r} />;
            }
            return <GameFloor key={`f-${r}-${c}`} col={c} row={r} />;
          })
        )}

        {gameState.boxes.map((pos, idx) => {
          const isOnTarget = gameState.targets.some(
            (t) => t.x === pos.x && t.y === pos.y,
          );
          return <GameBox key={`box-${idx}`} position={pos} isOnTarget={isOnTarget} />;
        })}

        <GameBluePlayer position={gameState.bluePlayer.position} onTarget={gameState.bluePlayer.onTarget} />
        <GameRedPlayer position={gameState.redPlayer.position} onTarget={gameState.redPlayer.onTarget} />

        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

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
      setGameState((prev) => {
        if (!prev) return prev;
        const next = moveDuoGravityPlayer(prev, prev.currentTurn, direction);
        if (next !== prev && next.isWin) {
          setCompleted(true);
        }
        return next;
      });
    },
    [gameState, completed],
  );

  const handleReset = useCallback(() => {
    if (!levelData) return;
    const state = createDuoGravityGameState(levelData);
    setGameState(state);
    setTime(0);
    setCompleted(false);
    setSubmitting(false);
    startTimeRef.current = Date.now();
  }, [levelData]);

  const handleUndo = useCallback(() => {
    if (!gameState || completed) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return undoDuoGravityMove(prev);
    });
  }, [gameState, completed]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState || completed) return;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') handleMove('right');
      if (e.key === 'z' || e.key === 'Z') handleUndo();
      if (e.key === 'r' || e.key === 'R') handleReset();
      if (e.key === 'Escape') handleExit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, completed, handleMove, handleUndo, handleReset, handleExit]);

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
            <GravityGameCanvas
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
                <span className="text-sm text-slate-400">当前轮次</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border-2 ${gameState?.currentTurn === 'blue' ? '' : 'border-transparent opacity-60'} bg-white/5`}
                  style={{
                    backgroundColor: gameState?.currentTurn === 'blue' ? `${currentSkin.player.color}30` : undefined,
                    borderColor: gameState?.currentTurn === 'blue' ? currentSkin.player.color : undefined,
                    boxShadow: gameState?.currentTurn === 'blue' ? `0 0 15px ${currentSkin.player.color}50` : undefined,
                  }}
                >
                  <Droplets
                    className="w-5 h-5"
                    style={{ color: currentSkin.player.color }}
                  />
                  <span className="text-xs text-slate-300">
                    {gameState?.bluePlayer.onTarget ? '已就位' : '玩家 1'}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border-2 ${gameState?.currentTurn === 'red' ? '' : 'border-transparent opacity-60'} bg-white/5`}
                  style={{
                    backgroundColor: gameState?.currentTurn === 'red' ? `${currentSkin.redPlayer.color}30` : undefined,
                    borderColor: gameState?.currentTurn === 'red' ? currentSkin.redPlayer.color : undefined,
                    boxShadow: gameState?.currentTurn === 'red' ? `0 0 15px ${currentSkin.redPlayer.color}50` : undefined,
                  }}
                >
                  <Flame
                    className="w-5 h-5"
                    style={{ color: currentSkin.redPlayer.color }}
                  />
                  <span className="text-xs text-slate-300">
                    {gameState?.redPlayer.onTarget ? '已就位' : '玩家 2'}
                  </span>
                </div>
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
              <p>红蓝角色轮流移动</p>
              <p>A/D 或 ←/→：移动角色</p>
              <p>可攀登高度为1格</p>
              <p>最多推动2个箱子</p>
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
