'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CellType, Position, DuoGravityLevelData, DuoGravityGameState, Direction, PlayerColor } from '@/lib/game/types';
import { createDuoGravityGameState, moveDuoGravityPlayer, undoDuoGravityMove } from '@/lib/game/duo-gravity-engine';
import { useSkin } from '@/components/game/SkinProvider';
import {
  Save,
  Play,
  RotateCcw,
  Square,
  Eraser,
  User,
  Package,
  Target,
  ChevronLeft,
  ChevronRight,
  Pause,
  Trash2,
  Droplets,
  Flame,
  ArrowDown,
} from 'lucide-react';

type GravityToolType = 'floor' | 'wall' | 'target' | 'box' | 'bluePlayer' | 'redPlayer' | 'erase';

interface ToolConfig {
  type: GravityToolType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const GRAVITY_TOOLS: ToolConfig[] = [
  { type: 'floor', label: '地板', icon: <Square className="w-5 h-5" />, color: 'text-slate-300' },
  { type: 'wall', label: '墙壁', icon: <Square className="w-5 h-5" />, color: 'text-gray-500' },
  { type: 'target', label: '目标点', icon: <Target className="w-5 h-5" />, color: 'text-yellow-400' },
  { type: 'box', label: '箱子', icon: <Package className="w-5 h-5" />, color: 'text-amber-600' },
  { type: 'bluePlayer', label: '玩家 1', icon: <Droplets className="w-5 h-5" />, color: 'text-blue-400' },
  { type: 'redPlayer', label: '玩家 2', icon: <Flame className="w-5 h-5" />, color: 'text-red-400' },
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

function GravityEditorFloorTile({ col, row, onClick, onDragOver, isSelected }: { col: number; row: number; onClick: () => void; onDragOver: () => void; isSelected: boolean }) {
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

function GravityEditorWallTile({ col, row, onClick, onDragOver }: { col: number; row: number; onClick: () => void; onDragOver: () => void }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
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
      <meshStandardMaterial color={skin.wall.color} metalness={skin.wall.metalness} roughness={skin.wall.roughness} />
    </RoundedBox>
  );
}

function GravityEditorTargetTile({ col, row, onClick, onDragOver }: { col: number; row: number; onClick: () => void; onDragOver: () => void }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  return (
    <group position={[col, 0, row]} onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={(e) => { if (e.buttons === 1) { e.stopPropagation(); onDragOver(); } }}>
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

function GravityEditorBox({ position, isOnTarget }: { position: Position; isOnTarget?: boolean }) {
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

function GravityEditorBluePlayer({ position }: { position: Position }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial color={skin.player.color} emissive={skin.player.emissive} emissiveIntensity={skin.player.emissiveIntensity} metalness={skin.player.metalness} roughness={skin.player.roughness} />
      </mesh>
      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial color={skin.player.color} emissive={skin.player.emissive} emissiveIntensity={skin.player.emissiveIntensity * 2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function GravityEditorRedPlayer({ position }: { position: Position }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 6, 12]} />
        <meshStandardMaterial color={skin.redPlayer.color} emissive={skin.redPlayer.emissive} emissiveIntensity={skin.redPlayer.emissiveIntensity} metalness={skin.redPlayer.metalness} roughness={skin.redPlayer.roughness} />
      </mesh>
      <mesh position={[0, 0.08, 0.35]} castShadow>
        <coneGeometry args={[0.18, 0.3, 3]} />
        <meshStandardMaterial color={skin.redPlayer.color} emissive={skin.redPlayer.emissive} emissiveIntensity={skin.redPlayer.emissiveIntensity * 2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function GravityEditorGrid({
  grid,
  boxes,
  targets,
  bluePlayer,
  redPlayer,
  selectedArea,
  onCellClick,
  onCellDrag,
  isPlaying,
}: {
  grid: CellType[][];
  boxes: Position[];
  targets: Position[];
  bluePlayer: Position | null;
  redPlayer: Position | null;
  selectedArea: { startX: number; startY: number; endX: number; endY: number } | null;
  onCellClick: (x: number, y: number) => void;
  onCellDrag: (x: number, y: number) => void;
  isPlaying?: boolean;
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
            return <GravityEditorWallTile key={`w-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} />;
          }
          if (cell === CellType.TARGET) {
            return <GravityEditorTargetTile key={`t-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} />;
          }
          return <GravityEditorFloorTile key={`f-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} isSelected={isSelected} />;
        })
      )}

      {boxes.map((pos, idx) => {
        const isOnTarget = targets.some((t) => t.x === pos.x && t.y === pos.y);
        return <GravityEditorBox key={`box-${idx}`} position={pos} isOnTarget={isOnTarget} />;
      })}

      {bluePlayer && <GravityEditorBluePlayer position={bluePlayer} />}
      {redPlayer && <GravityEditorRedPlayer position={redPlayer} />}

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

export function DuoGravityLevelEditor({ editingLevelId }: { editingLevelId?: string | null }) {
  const [gridSize, setGridSize] = useState({ width: 8, height: 8 });
  const [grid, setGrid] = useState<CellType[][]>(() =>
    Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => CellType.FLOOR as CellType))
  );
  const [boxes, setBoxes] = useState<Position[]>([]);
  const [targets, setTargets] = useState<Position[]>([]);
  const [bluePlayer, setBluePlayer] = useState<Position | null>(null);
  const [redPlayer, setRedPlayer] = useState<Position | null>(null);
  const [selectedTool, setSelectedTool] = useState<GravityToolType>('floor');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<DuoGravityGameState | null>(null);
  const [activePlayer, setActivePlayer] = useState<PlayerColor>('blue');
  const [levelName, setLevelName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasCompletedPlaythrough, setHasCompletedPlaythrough] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editingLevelId) return;

    let cancelled = false;

    const loadLevel = async () => {
      setLoadingLevel(true);
      try {
        const res = await fetch(`/api/user-duo-gravity-levels/${editingLevelId}`);
        if (!res.ok) {
          throw new Error('加载关卡失败');
        }
        const data = await res.json();
        if (!cancelled && data.level) {
          const lv = data.level;
          const parsedGrid = JSON.parse(lv.gridData);
          const parsedBoxes = JSON.parse(lv.boxes);
          const parsedTargets = JSON.parse(lv.targets);

          setGrid(parsedGrid);
          setBoxes(parsedBoxes);
          setTargets(parsedTargets);
          setBluePlayer({ x: lv.bluePlayerX, y: lv.bluePlayerY });
          setRedPlayer({ x: lv.redPlayerX, y: lv.redPlayerY });
          setLevelName(lv.name);
          setGridSize({ width: parsedGrid[0]?.length ?? 0, height: parsedGrid.length });
          setHasCompletedPlaythrough(lv.verified);
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : '加载失败');
        setTimeout(() => setMessage(null), 3000);
      } finally {
        if (!cancelled) {
          setLoadingLevel(false);
        }
      }
    };

    loadLevel();
    return () => {
      cancelled = true;
    };
  }, [editingLevelId]);

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
    if (bluePlayer && (bluePlayer.x >= width || bluePlayer.y >= height)) {
      setBluePlayer(null);
    }
    if (redPlayer && (redPlayer.x >= width || redPlayer.y >= height)) {
      setRedPlayer(null);
    }
    setGridSize({ width, height });
    setHasCompletedPlaythrough(false);
  }, [grid, boxes, targets, bluePlayer, redPlayer]);

  const hasCollision = useCallback((x: number, y: number, excludeType?: GravityToolType): boolean => {
    const hasWall = grid[y]?.[x] === CellType.WALL;
    const hasBox = boxes.some((b) => b.x === x && b.y === y);
    const hasBluePlayer = bluePlayer && bluePlayer.x === x && bluePlayer.y === y;
    const hasRedPlayer = redPlayer && redPlayer.x === x && redPlayer.y === y;
    const hasTarget = targets.some((t) => t.x === x && t.y === y);

    if (excludeType === 'wall') return false;
    if (excludeType === 'target') return hasWall || hasBox || !!hasBluePlayer || !!hasRedPlayer;
    if (excludeType === 'box') return hasWall || !!hasBluePlayer || !!hasRedPlayer;
    if (excludeType === 'bluePlayer' || excludeType === 'redPlayer') return hasWall || hasBox;
    if (excludeType === 'floor') return false;
    if (excludeType === 'erase') return false;

    return hasWall || hasBox || !!hasBluePlayer || !!hasRedPlayer;
  }, [grid, boxes, targets, bluePlayer, redPlayer]);

  const placeTool = useCallback((x: number, y: number) => {
    if (isPlaying) return;

    if (selectedTool === 'erase') {
      setBoxes(boxes.filter((b) => !(b.x === x && b.y === y)));
      setTargets(targets.filter((t) => !(t.x === x && t.y === y)));

      if (bluePlayer && bluePlayer.x === x && bluePlayer.y === y) {
        setBluePlayer(null);
      }
      if (redPlayer && redPlayer.x === x && redPlayer.y === y) {
        setRedPlayer(null);
      }
      const newGrid = grid.map((row) => [...row]);
      newGrid[y][x] = CellType.FLOOR;
      setGrid(newGrid);
      setHasCompletedPlaythrough(false);
      return;
    }

    if (selectedTool === 'box') {
      if (boxes.some((b) => b.x === x && b.y === y)) {
        setBoxes(boxes.filter((b) => !(b.x === x && b.y === y)));
      } else if (!hasCollision(x, y, 'box')) {
        setBoxes([...boxes, { x, y }]);
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    if (selectedTool === 'bluePlayer') {
      if (bluePlayer && bluePlayer.x === x && bluePlayer.y === y) {
        setBluePlayer(null);
      } else if (!hasCollision(x, y, 'bluePlayer')) {
        setBluePlayer({ x, y });
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    if (selectedTool === 'redPlayer') {
      if (redPlayer && redPlayer.x === x && redPlayer.y === y) {
        setRedPlayer(null);
      } else if (!hasCollision(x, y, 'redPlayer')) {
        setRedPlayer({ x, y });
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    const newGrid = grid.map((row) => [...row]);
    if (selectedTool === 'floor') {
      newGrid[y][x] = CellType.FLOOR;
      setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
      setGrid(newGrid);
      setHasCompletedPlaythrough(false);
    } else if (selectedTool === 'wall') {
      if (!hasCollision(x, y, 'wall')) {
        newGrid[y][x] = CellType.WALL;
        setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
        setBoxes(boxes.filter((b) => !(b.x === x && b.y === y)));
        if (bluePlayer && bluePlayer.x === x && bluePlayer.y === y) {
          setBluePlayer(null);
        }
        if (redPlayer && redPlayer.x === x && redPlayer.y === y) {
          setRedPlayer(null);
        }
        setGrid(newGrid);
        setHasCompletedPlaythrough(false);
      }
    } else if (selectedTool === 'target') {
      if (!hasCollision(x, y, 'target')) {
        newGrid[y][x] = CellType.TARGET;
        if (!targets.some((t) => t.x === x && t.y === y)) {
          setTargets([...targets, { x, y }]);
        }
        setGrid(newGrid);
        setHasCompletedPlaythrough(false);
      }
    }
  }, [grid, boxes, targets, bluePlayer, redPlayer, selectedTool, isPlaying, hasCollision]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (isPlaying) return;
    placeTool(x, y);
  }, [isPlaying, placeTool]);

  const handleCellDrag = useCallback((x: number, y: number) => {
    if (isPlaying) return;
    if (selectedTool === 'box' || selectedTool === 'bluePlayer' || selectedTool === 'redPlayer') return;
    placeTool(x, y);
  }, [isPlaying, selectedTool, placeTool]);

  const handleClearLevel = useCallback(() => {
    if (isPlaying) return;
    setGrid(Array.from({ length: gridSize.height }, () => Array.from({ length: gridSize.width }, () => CellType.FLOOR as CellType)));
    setBoxes([]);
    setTargets([]);
    setBluePlayer(null);
    setRedPlayer(null);
    setHasCompletedPlaythrough(false);
  }, [isPlaying, gridSize]);

  const handlePlay = useCallback(() => {
    if (!bluePlayer || !redPlayer || targets.length < 2) {
      setMessage('需要放置红蓝角色和至少两个目标点才能试玩');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const levelData: DuoGravityLevelData = {
      grid: grid.map((row) => [...row]),
      bluePlayer: { ...bluePlayer },
      redPlayer: { ...redPlayer },
      boxes: boxes.map((b) => ({ ...b })),
      targets: targets.map((t) => ({ ...t })),
    };

    setGameState(createDuoGravityGameState(levelData));
    setIsPlaying(true);
    setActivePlayer('blue');
  }, [grid, bluePlayer, redPlayer, boxes, targets]);

  const handleStopPlay = useCallback(() => {
    setIsPlaying(false);
    setGameState(null);
  }, []);

  useEffect(() => {
    if (!gameState?.isWin || !isPlaying) return;
    const timer = setTimeout(() => {
      setIsPlaying(false);
      setGameState(null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [gameState?.isWin, isPlaying]);

  const handleMove = useCallback((direction: Direction) => {
    if (!gameState || !isPlaying) return;

    let actualPlayer = activePlayer;
    if (activePlayer === 'blue' && gameState.bluePlayer.onTarget) {
      actualPlayer = 'red';
    } else if (activePlayer === 'red' && gameState.redPlayer.onTarget) {
      actualPlayer = 'blue';
    }

    setGameState((prev) => {
      if (!prev) return prev;
      const next = moveDuoGravityPlayer(prev, actualPlayer, direction);
      if (next.isWin) {
        setMessage('恭喜！重力关卡完成！已验证可通关。');
        setHasCompletedPlaythrough(true);
        setTimeout(() => setMessage(null), 3000);
      }
      return next;
    });
  }, [gameState, isPlaying, activePlayer]);

  const handleResetPlay = useCallback(() => {
    if (!bluePlayer || !redPlayer || targets.length === 0) return;
    const levelData: DuoGravityLevelData = {
      grid: grid.map((row) => [...row]),
      bluePlayer: { ...bluePlayer },
      redPlayer: { ...redPlayer },
      boxes: boxes.map((b) => ({ ...b })),
      targets: targets.map((t) => ({ ...t })),
    };
    setGameState(createDuoGravityGameState(levelData));
    setActivePlayer('blue');
  }, [grid, bluePlayer, redPlayer, boxes, targets]);

  const handleUndoPlay = useCallback(() => {
    if (!gameState || !isPlaying) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return undoDuoGravityMove(prev);
    });
  }, [gameState, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') handleMove('right');
      if (e.key === 'z' || e.key === 'Z') handleUndoPlay();
      if (e.key === 'r' || e.key === 'R') handleResetPlay();
      if (e.key === 'Escape') handleStopPlay();
      if (e.key === 'Tab') {
        e.preventDefault();
        setActivePlayer((prev) => (prev === 'blue' ? 'red' : 'blue'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleMove, handleUndoPlay, handleResetPlay, handleStopPlay]);

  const handleSave = useCallback(async () => {
    if (!bluePlayer || !redPlayer || targets.length < 2) {
      setMessage('需要放置红蓝角色和至少两个目标点才能保存');
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
        bluePlayerX: bluePlayer.x,
        bluePlayerY: bluePlayer.y,
        redPlayerX: redPlayer.x,
        redPlayerY: redPlayer.y,
        boxes: JSON.stringify(boxes),
        targets: JSON.stringify(targets),
        verified: hasCompletedPlaythrough,
      };

      let res;
      if (editingLevelId) {
        res = await fetch(`/api/user-duo-gravity-levels/${editingLevelId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(levelData),
        });
      } else {
        res = await fetch('/api/user-duo-gravity-levels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(levelData),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '保存失败');
      }

      setMessage(editingLevelId ? '关卡更新成功！' : '关卡保存成功！');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存失败');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }, [grid, bluePlayer, redPlayer, boxes, targets, levelName, hasCompletedPlaythrough, editingLevelId]);

  const displayGrid = isPlaying && gameState ? gameState.grid : grid;
  const displayBoxes = isPlaying && gameState ? gameState.boxes : boxes;
  const displayTargets = isPlaying && gameState ? gameState.targets : targets;
  const displayBlue = isPlaying && gameState ? gameState.bluePlayer.position : bluePlayer;
  const displayRed = isPlaying && gameState ? gameState.redPlayer.position : redPlayer;

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
          <GravityEditorGrid
            grid={displayGrid}
            boxes={displayBoxes}
            targets={displayTargets}
            bluePlayer={displayBlue}
            redPlayer={displayRed}
            selectedArea={null}
            onCellClick={handleCellClick}
            onCellDrag={handleCellDrag}
            isPlaying={isPlaying}
          />

          {isPlaying && (
            <div className="absolute bottom-4 left-4 glass-card p-2 flex items-center gap-1">
              <button onClick={() => handleMove('left')} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => handleMove('right')} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {isPlaying && gameState && (
            <div className="absolute top-4 right-4 glass-card px-4 py-2">
              <span className="text-sm text-slate-400">步数: </span>
              <span className="text-lg font-bold text-white">{gameState.steps}</span>
            </div>
          )}

          {isPlaying && (
            <div className="absolute top-4 left-4 glass-card px-3 py-2">
              <span className="text-xs text-slate-400">当前控制: </span>
              <button
                onClick={() => setActivePlayer(activePlayer === 'blue' ? 'red' : 'blue')}
                className={`ml-2 px-2 py-1 rounded text-xs font-bold ${activePlayer === 'blue' ? 'bg-blue-500/30 text-blue-300' : 'bg-red-500/30 text-red-300'}`}
              >
                {activePlayer === 'blue' ? '玩家 1' : '玩家 2'} (Tab切换)
              </button>
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
            {GRAVITY_TOOLS.map((tool) => (
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
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400">通关验证:</span>
              <span className={`text-sm font-medium ${hasCompletedPlaythrough ? 'text-green-400' : 'text-red-400'}`}>
                {hasCompletedPlaythrough ? '✓ 已通过' : '✗ 未通过'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? '保存中...' : '保存关卡'}
        </button>

        <div className="glass-card p-4 text-xs text-slate-400 leading-relaxed">
          <p className="text-slate-300 font-medium mb-2">重力模式说明</p>
          <p>角色和箱子受重力影响</p>
          <p>角色只能左右移动</p>
          <p>可攀登高度为1格</p>
          <p>最多可推动2个箱子</p>
          <p>两个角色都站在目标点即为通关</p>
          <p>角色不会消失，可继续移动</p>
          <p className="mt-2 text-slate-500">A/D 或 ←/→：移动</p>
          <p className="text-slate-500">Z：撤销 R：重置</p>
          <p className="text-slate-500">Tab：切换角色</p>
        </div>
      </div>
    </div>
  );
}
