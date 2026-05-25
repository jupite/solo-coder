'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CellType, Position, LevelData, GameState, Direction } from '@/lib/game/types';
import { createGameState, movePlayer } from '@/lib/game/engine';
import {
  Save,
  Play,
  RotateCcw,
  Square,
  Eraser,
  User,
  Package,
  Target,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Trash2,
} from 'lucide-react';

type ToolType = 'floor' | 'wall' | 'target' | 'box' | 'player' | 'erase';

interface ToolConfig {
  type: ToolType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const TOOLS: ToolConfig[] = [
  { type: 'floor', label: '地板', icon: <Square className="w-5 h-5" />, color: 'text-slate-300' },
  { type: 'wall', label: '墙壁', icon: <Square className="w-5 h-5" />, color: 'text-gray-500' },
  { type: 'target', label: '目标点', icon: <Target className="w-5 h-5" />, color: 'text-yellow-400' },
  { type: 'box', label: '箱子', icon: <Package className="w-5 h-5" />, color: 'text-amber-600' },
  { type: 'player', label: '角色', icon: <User className="w-5 h-5" />, color: 'text-blue-400' },
  { type: 'erase', label: '擦除', icon: <Eraser className="w-5 h-5" />, color: 'text-red-400' },
];

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

function EditorFloorTile({ col, row, onClick, onDragOver, isSelected }: { col: number; row: number; onClick: () => void; onDragOver: () => void; isSelected: boolean }) {
  return (
    <mesh
      position={[col, 0, row]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { if (e.buttons === 1) { e.stopPropagation(); onDragOver(); } }}
      receiveShadow
    >
      <boxGeometry args={[0.92, 0.08, 0.92]} />
      <meshStandardMaterial
        color={isSelected ? '#4f46e5' : '#1e3a5f'}
        metalness={0.2}
        roughness={0.8}
        emissive={isSelected ? '#4338ca' : '#0b1f3a'}
        emissiveIntensity={isSelected ? 0.5 : 0.3}
      />
    </mesh>
  );
}

function EditorWallTile({ col, row, onClick, onDragOver }: { col: number; row: number; onClick: () => void; onDragOver: () => void }) {
  return (
    <RoundedBox
      args={[0.92, 0.92, 0.92]}
      radius={0.08}
      smoothness={2}
      position={[col, 0.46, row]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { if (e.buttons === 1) { e.stopPropagation(); onDragOver(); } }}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.7} />
    </RoundedBox>
  );
}

function EditorTargetTile({ col, row, onClick, onDragOver }: { col: number; row: number; onClick: () => void; onDragOver: () => void }) {
  return (
    <group position={[col, 0, row]}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { if (e.buttons === 1) { e.stopPropagation(); onDragOver(); } }}
        receiveShadow
      >
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color="#3a2a0a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.7]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function EditorBox({ position, isOnTarget }: { position: Position; isOnTarget?: boolean }) {
  return (
    <group position={[position.x, 0.46, position.y]}>
      <RoundedBox args={[0.82, 0.82, 0.82]} radius={0.06} smoothness={2} castShadow receiveShadow>
        {isOnTarget ? (
          <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.9} metalness={0.7} roughness={0.25} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#8b5a2b" metalness={0.1} roughness={0.85} />
        )}
      </RoundedBox>
    </group>
  );
}

function EditorPlayer({ position }: { position: Position }) {
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.35} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EditorGrid({
  grid,
  boxes,
  targets,
  player,
  selectedArea,
  onCellClick,
  onCellDrag,
}: {
  grid: CellType[][];
  boxes: Position[];
  targets: Position[];
  player: Position | null;
  selectedArea: { startX: number; startY: number; endX: number; endY: number } | null;
  onCellClick: (x: number, y: number) => void;
  onCellDrag: (x: number, y: number) => void;
}) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const centerX = (cols - 1) / 2;
  const centerZ = (rows - 1) / 2;
  const size = Math.max(rows, cols);
  const cameraDistance = size * 1.5;
  const zoom = Math.max(40, 80 - size * 8);

  const isInSelectedArea = (x: number, y: number) => {
    if (!selectedArea) return false;
    const minX = Math.min(selectedArea.startX, selectedArea.endX);
    const maxX = Math.max(selectedArea.startX, selectedArea.endX);
    const minY = Math.min(selectedArea.startY, selectedArea.endY);
    const maxY = Math.max(selectedArea.startY, selectedArea.endY);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  };

  return (
    <Canvas shadows gl={{ antialias: true }} style={{ width: '100%', height: '100%', background: '#0a0f1e' }}>
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

      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isSelected = isInSelectedArea(c, r);
          if (cell === CellType.WALL) {
            return <EditorWallTile key={`w-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} />;
          }
          if (cell === CellType.TARGET) {
            return <EditorTargetTile key={`t-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} />;
          }
          return <EditorFloorTile key={`f-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} isSelected={isSelected} />;
        })
      )}

      {boxes.map((pos, idx) => {
        const isOnTarget = targets.some((t) => t.x === pos.x && t.y === pos.y);
        return <EditorBox key={`box-${idx}`} position={pos} isOnTarget={isOnTarget} />;
      })}

      {player && <EditorPlayer position={player} />}

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

export function LevelEditor() {
  const [gridSize, setGridSize] = useState({ width: 8, height: 8 });
  const [grid, setGrid] = useState<CellType[][]>(() =>
    Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => CellType.FLOOR as CellType))
  );
  const [boxes, setBoxes] = useState<Position[]>([]);
  const [targets, setTargets] = useState<Position[]>([]);
  const [player, setPlayer] = useState<Position | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType>('floor');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [levelName, setLevelName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const isSelectingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback((width: number, height: number) => {
    const newGrid = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        if (y < grid.length && x < grid[0]?.length) {
          return grid[y][x];
        }
        return CellType.FLOOR as CellType;
      })
    );
    setGrid(newGrid);
    setBoxes(boxes.filter((b) => b.x < width && b.y < height));
    setTargets(targets.filter((t) => t.x < width && t.y < height));
    if (player && (player.x >= width || player.y >= height)) {
      setPlayer(null);
    }
    setGridSize({ width, height });
  }, [grid, boxes, targets, player]);

  const placeTool = useCallback((x: number, y: number) => {
    if (isPlaying) return;

    if (selectedTool === 'erase') {
      setBoxes(boxes.filter((b) => !(b.x === x && b.y === y)));
      setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
      if (player && player.x === x && player.y === y) {
        setPlayer(null);
      }
      const newGrid = grid.map((row) => [...row]);
      newGrid[y][x] = CellType.FLOOR;
      setGrid(newGrid);
      return;
    }

    if (selectedTool === 'box') {
      if (boxes.some((b) => b.x === x && b.y === y)) {
        setBoxes(boxes.filter((b) => !(b.x === x && b.y === y)));
      } else {
        setBoxes([...boxes, { x, y }]);
      }
      return;
    }

    if (selectedTool === 'player') {
      if (player && player.x === x && player.y === y) {
        setPlayer(null);
      } else {
        setPlayer({ x, y });
      }
      return;
    }

    const newGrid = grid.map((row) => [...row]);
    if (selectedTool === 'floor') {
      newGrid[y][x] = CellType.FLOOR;
      setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
    } else if (selectedTool === 'wall') {
      newGrid[y][x] = CellType.WALL;
      setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
    } else if (selectedTool === 'target') {
      newGrid[y][x] = CellType.TARGET;
      if (!targets.some((t) => t.x === x && t.y === y)) {
        setTargets([...targets, { x, y }]);
      }
    }
    setGrid(newGrid);
  }, [grid, boxes, targets, player, selectedTool, isPlaying]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (isPlaying) return;
    if (selectedTool === 'box' || selectedTool === 'player') {
      placeTool(x, y);
    } else {
      placeTool(x, y);
    }
  }, [isPlaying, selectedTool, placeTool]);

  const handleCellDrag = useCallback((x: number, y: number) => {
    if (isPlaying) return;
    if (selectedTool === 'box' || selectedTool === 'player') return;
    placeTool(x, y);
  }, [isPlaying, selectedTool, placeTool]);

  const handleClearLevel = useCallback(() => {
    if (isPlaying) return;
    setGrid(Array.from({ length: gridSize.height }, () => Array.from({ length: gridSize.width }, () => CellType.FLOOR as CellType)));
    setBoxes([]);
    setTargets([]);
    setPlayer(null);
  }, [isPlaying, gridSize]);

  const handlePlay = useCallback(() => {
    if (!player || boxes.length === 0 || targets.length === 0) {
      setMessage('需要放置角色、至少一个箱子和一个目标点才能试玩');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const levelData: LevelData = {
      grid: grid.map((row) => [...row]),
      player: { ...player },
      boxes: boxes.map((b) => ({ ...b })),
      targets: targets.map((t) => ({ ...t })),
    };

    setGameState(createGameState(levelData));
    setIsPlaying(true);
  }, [grid, player, boxes, targets]);

  const handleStopPlay = useCallback(() => {
    setIsPlaying(false);
    setGameState(null);
  }, []);

  const handleMove = useCallback((direction: Direction) => {
    if (!gameState || !isPlaying) return;
    setGameState((prev) => {
      if (!prev) return prev;
      const next = movePlayer(prev, direction);
      if (next.isWin) {
        setMessage('恭喜！关卡完成！');
        setTimeout(() => setMessage(null), 3000);
      }
      return next;
    });
  }, [gameState, isPlaying]);

  const handleResetPlay = useCallback(() => {
    if (!player || boxes.length === 0 || targets.length === 0) return;
    const levelData: LevelData = {
      grid: grid.map((row) => [...row]),
      player: { ...player },
      boxes: boxes.map((b) => ({ ...b })),
      targets: targets.map((t) => ({ ...t })),
    };
    setGameState(createGameState(levelData));
  }, [grid, player, boxes, targets]);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') handleMove('up');
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') handleMove('down');
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') handleMove('right');
      if (e.key === 'r' || e.key === 'R') handleResetPlay();
      if (e.key === 'Escape') handleStopPlay();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleMove, handleResetPlay, handleStopPlay]);

  const handleSave = useCallback(async () => {
    if (!player || boxes.length === 0 || targets.length === 0) {
      setMessage('需要放置角色、至少一个箱子和一个目标点才能保存');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!levelName.trim()) {
      setMessage('请输入关卡名称');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const levelData = {
        name: levelName.trim(),
        gridData: JSON.stringify(grid),
        playerX: player.x,
        playerY: player.y,
        boxes: JSON.stringify(boxes),
        targets: JSON.stringify(targets),
      };

      const res = await fetch('/api/user-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '保存失败');
      }

      setMessage('关卡保存成功！');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }, [grid, player, boxes, targets, levelName]);

  const displayGrid = isPlaying && gameState ? gameState.grid : grid;
  const displayBoxes = isPlaying && gameState ? gameState.boxes : boxes;
  const displayTargets = isPlaying && gameState ? gameState.targets : targets;
  const displayPlayer = isPlaying && gameState ? gameState.player : player;

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row h-full gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <div className="glass-card p-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">地图宽度:</label>
            <input
              type="number"
              min="3"
              max="20"
              value={gridSize.width}
              onChange={(e) => handleResize(Math.max(3, Math.min(20, parseInt(e.target.value) || 3)), gridSize.height)}
              disabled={isPlaying}
              className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">地图高度:</label>
            <input
              type="number"
              min="3"
              max="20"
              value={gridSize.height}
              onChange={(e) => handleResize(gridSize.width, Math.max(3, Math.min(20, parseInt(e.target.value) || 3)))}
              disabled={isPlaying}
              className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-sm text-slate-400">关卡名称:</label>
            <input
              type="text"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              disabled={isPlaying}
              placeholder="输入关卡名称"
              className="flex-1 px-3 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button onClick={handlePlay} className="btn-primary px-4 py-2 inline-flex items-center gap-2 text-sm">
                <Play className="w-4 h-4" />
                试玩
              </button>
            ) : (
              <button onClick={handleStopPlay} className="btn-secondary px-4 py-2 inline-flex items-center gap-2 text-sm">
                <Pause className="w-4 h-4" />
                停止
              </button>
            )}
            <button onClick={handleResetPlay} disabled={!isPlaying} className="btn-secondary px-4 py-2 inline-flex items-center gap-2 text-sm disabled:opacity-50">
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button onClick={handleClearLevel} disabled={isPlaying} className="btn-ghost px-4 py-2 inline-flex items-center gap-2 text-sm disabled:opacity-50">
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>
        </div>

        <div className="glass-card gradient-border p-4 flex-1 relative" style={{ minHeight: 500 }}>
          <EditorGrid
            grid={displayGrid}
            boxes={displayBoxes}
            targets={displayTargets}
            player={displayPlayer}
            selectedArea={selectedArea}
            onCellClick={handleCellClick}
            onCellDrag={handleCellDrag}
          />

          {isPlaying && (
            <div className="absolute bottom-4 left-4 glass-card p-2 flex items-center gap-1">
              <button onClick={() => handleMove('up')} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleMove('left')} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => handleMove('down')} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button onClick={() => handleMove('right')} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {isPlaying && gameState && (
            <div className="absolute top-4 right-4 glass-card px-4 py-2">
              <span className="text-sm text-slate-400">步数: </span>
              <span className="text-lg font-bold text-white">{gameState.steps}</span>
            </div>
          )}

          {message && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 bg-indigo-500/20 border-indigo-500/30">
              <p className="text-sm text-white">{message}</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:w-56 flex flex-col gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white mb-3">工具</h3>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map((tool) => (
              <button
                key={tool.type}
                onClick={() => setSelectedTool(tool.type)}
                disabled={isPlaying}
                className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 ${
                  selectedTool === tool.type
                    ? 'bg-indigo-500/30 border-2 border-indigo-500'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className={tool.color}>{tool.icon}</span>
                <span className="text-xs text-slate-300">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white mb-3">关卡信息</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">箱子数量:</span>
              <span className="text-white">{boxes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">目标数量:</span>
              <span className="text-white">{targets.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">角色位置:</span>
              <span className="text-white">{player ? `(${player.x}, ${player.y})` : '未放置'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isPlaying || saving}
          className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? '保存中...' : '保存关卡'}
        </button>

        <div className="glass-card p-4 text-xs text-slate-400 leading-relaxed">
          <p className="text-slate-300 font-medium mb-2">操作说明</p>
          <p>• 选择工具后点击地图放置物品</p>
          <p>• 拖动可以连续绘制墙壁和地板</p>
          <p>• 点击箱子和目标点可以移除</p>
          <p>• 试玩模式: WASD/方向键移动</p>
          <p>• R 重置，Esc 退出试玩</p>
        </div>
      </div>
    </div>
  );
}
