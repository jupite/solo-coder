'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CellType, Position, DuoLevelData, DuoGameState, Direction, PlayerColor, RedGate, SwitchItem, OneWayBarrier } from '@/lib/game/types';
import { createDuoGameState, moveDuoPlayer, undoDuoMove, toggleSwitch } from '@/lib/game/duo-engine';
import { DuoHintPanel } from '@/components/game/DuoHintPanel';
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
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Trash2,
  Droplets,
  Flame,
  Lock,
  ToggleLeft,
  Lightbulb,
} from 'lucide-react';

type DuoToolType = 'floor' | 'wall' | 'target' | 'box' | 'bluePlayer' | 'redPlayer' | 'redGate' | 'switch' | 'erase';

interface ToolConfig {
  type: DuoToolType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const DUO_TOOLS: ToolConfig[] = [
  { type: 'floor', label: '地板', icon: <Square className="w-5 h-5" />, color: 'text-slate-300' },
  { type: 'wall', label: '墙壁', icon: <Square className="w-5 h-5" />, color: 'text-gray-500' },
  { type: 'target', label: '目标点', icon: <Target className="w-5 h-5" />, color: 'text-yellow-400' },
  { type: 'box', label: '箱子', icon: <Package className="w-5 h-5" />, color: 'text-amber-600' },
  { type: 'bluePlayer', label: '玩家 1', icon: <Droplets className="w-5 h-5" />, color: 'text-blue-400' },
  { type: 'redPlayer', label: '玩家 2', icon: <Flame className="w-5 h-5" />, color: 'text-red-400' },
  { type: 'redGate', label: '红色机关', icon: <Lock className="w-5 h-5" />, color: 'text-red-500' },
  { type: 'switch', label: '开关', icon: <ToggleLeft className="w-5 h-5" />, color: 'text-green-400' },
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

function DuoEditorFloorTile({ col, row, onClick, onDragOver, isSelected }: { col: number; row: number; onClick: () => void; onDragOver: () => void; isSelected: boolean }) {
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

function DuoEditorWallTile({ col, row, onClick, onDragOver }: { col: number; row: number; onClick: () => void; onDragOver: () => void }) {
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

function DuoEditorTargetTile({ col, row, onClick, onDragOver }: { col: number; row: number; onClick: () => void; onDragOver: () => void }) {
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

function DuoEditorBox({ position, isOnTarget }: { position: Position; isOnTarget?: boolean }) {
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

function DuoEditorBluePlayer({ position }: { position: Position }) {
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

function DuoEditorRedPlayer({ position }: { position: Position }) {
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

function DuoEditorRedGate({ position, isOpen }: { position: Position; isOpen?: boolean }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  if (isOpen) {
    return (
      <group position={[position.x, 0, position.y]}>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.92, 0.08, 0.92]} />
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.2}
            roughness={0.8}
            emissive="#0b1f3a"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 32]} />
          <meshStandardMaterial
            color={skin.redGate.color}
            emissive={skin.redGate.emissive}
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[position.x, 0, position.y]}>
      <RoundedBox
        args={[0.92, 0.92, 0.92]}
        radius={0.08}
        smoothness={2}
        position={[0, 0.46, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={skin.redGate.color} emissive={skin.redGate.emissive} emissiveIntensity={0.5} metalness={0.6} roughness={0.3} toneMapped={false} />
      </RoundedBox>
      <mesh position={[0, 0.46, 0.47]}>
        <boxGeometry args={[0.6, 0.6, 0.02]} />
        <meshStandardMaterial color={skin.redGate.color} emissive={skin.redGate.emissive} emissiveIntensity={0.8} transparent opacity={0.7} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DuoEditorSwitch({
  position,
  isActive,
  isClickable,
  switchId,
  onClick,
}: {
  position: Position;
  isActive?: boolean;
  isClickable?: boolean;
  switchId?: string | number;
  onClick?: () => void;
}) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const switchColor = isActive ? skin.switchTile.onColor : skin.switchTile.offColor;
  const switchEmissive = isClickable ? switchColor : skin.switchTile.emissive;

  return (
    <group position={[position.x, 0, position.y]} onClick={handleClick}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color="#3a2a0a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshStandardMaterial
          color={isClickable ? switchColor : (isActive ? '#64748b' : '#475569')}
          emissive={switchEmissive}
          emissiveIntensity={isClickable ? 0.8 : 0.3}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.06]} />
        <meshStandardMaterial
          color={switchColor}
          emissive={switchColor}
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
      {isClickable && (
        <mesh position={[0, 0.06, 0]}>
          <ringGeometry args={[0.38, 0.42, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={2} />
        </mesh>
      )}
      {switchId !== undefined && (
        <group position={[0, 0.25, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.18, 32]} />
            <meshBasicMaterial color="#1e293b" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function DuoEditorOneWayBarrier({ barrier }: { barrier: OneWayBarrier }) {
  const { currentSkin } = useSkin();
  const skin = currentSkin;
  const color = barrier.color === 'blue' ? skin.player.color : skin.redPlayer.color;
  const rotation = {
    up: 0,
    right: Math.PI / 2,
    down: Math.PI,
    left: -Math.PI / 2,
  }[barrier.exitDirection];

  return (
    <group position={[barrier.x, 0, barrier.y]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.88, 0.88]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={2} />
      </mesh>
      <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, rotation]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.12, 0.2, 3]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function DuoEditorGrid({
  grid,
  boxes,
  targets,
  bluePlayer,
  redPlayer,
  bluePlayerGone,
  redPlayerGone,
  redGates,
  switches,
  activeSwitches,
  activePlayerColor,
  oneWayBarriers,
  selectedArea,
  onCellClick,
  onCellDrag,
  onSwitchClick,
  isPlaying,
}: {
  grid: CellType[][];
  boxes: Position[];
  targets: Position[];
  bluePlayer: Position | null;
  redPlayer: Position | null;
  bluePlayerGone?: boolean;
  redPlayerGone?: boolean;
  redGates: RedGate[];
  switches: SwitchItem[];
  activeSwitches?: Set<string | number>;
  activePlayerColor?: PlayerColor;
  oneWayBarriers?: OneWayBarrier[];
  selectedArea: { startX: number; startY: number; endX: number; endY: number } | null;
  onCellClick: (x: number, y: number) => void;
  onCellDrag: (x: number, y: number) => void;
  onSwitchClick?: (x: number, y: number) => void;
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

  const isSwitchActive = (sw: SwitchItem) => {
    if (!activeSwitches || sw.id === undefined) return false;
    return activeSwitches.has(sw.id);
  };

  const isGateOpen = (gate: RedGate) => {
    if (!activeSwitches) return false;
    return activeSwitches.has(gate.switchId);
  };

  const isSwitchClickable = (sw: SwitchItem) => {
    if (!isPlaying || !activePlayerColor) return false;
    const player = activePlayerColor === 'blue' ? bluePlayer : redPlayer;
    const playerGone = activePlayerColor === 'blue' ? bluePlayerGone : redPlayerGone;
    if (!player || playerGone) return false;
    const dx = Math.abs(player.x - sw.x);
    const dy = Math.abs(player.y - sw.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
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
            return <DuoEditorWallTile key={`w-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} />;
          }
          if (cell === CellType.TARGET) {
            return <DuoEditorTargetTile key={`t-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} />;
          }
          return <DuoEditorFloorTile key={`f-${r}-${c}`} col={c} row={r} onClick={() => onCellClick(c, r)} onDragOver={() => onCellDrag(c, r)} isSelected={isSelected} />;
        })
      )}

      {redGates.map((gate, idx) => (
        <DuoEditorRedGate key={`gate-${idx}`} position={{ x: gate.x, y: gate.y }} isOpen={isGateOpen(gate)} />
      ))}

      {switches.map((sw, idx) => (
        <DuoEditorSwitch
          key={`sw-${idx}`}
          position={{ x: sw.x, y: sw.y }}
          isActive={isSwitchActive(sw)}
          isClickable={isSwitchClickable(sw)}
          switchId={!isPlaying ? sw.id : undefined}
          onClick={() => {
            if (isPlaying) {
              onSwitchClick?.(sw.x, sw.y);
            }
          }}
        />
      ))}

      {oneWayBarriers?.map((barrier, idx) => (
        <DuoEditorOneWayBarrier key={`barrier-${idx}`} barrier={barrier} />
      ))}

      {boxes.map((pos, idx) => {
        const isOnTarget = targets.some((t) => t.x === pos.x && t.y === pos.y);
        return <DuoEditorBox key={`box-${idx}`} position={pos} isOnTarget={isOnTarget} />;
      })}

      {bluePlayer && !bluePlayerGone && <DuoEditorBluePlayer position={bluePlayer} />}
      {redPlayer && !redPlayerGone && <DuoEditorRedPlayer position={redPlayer} />}

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

export function DuoLevelEditor({ editingLevelId }: { editingLevelId?: string | null }) {
  const [gridSize, setGridSize] = useState({ width: 8, height: 8 });
  const [grid, setGrid] = useState<CellType[][]>(() =>
    Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => CellType.FLOOR as CellType))
  );
  const [boxes, setBoxes] = useState<Position[]>([]);
  const [targets, setTargets] = useState<Position[]>([]);
  const [bluePlayer, setBluePlayer] = useState<Position | null>(null);
  const [redPlayer, setRedPlayer] = useState<Position | null>(null);
  const [redGates, setRedGates] = useState<RedGate[]>([]);
  const [switches, setSwitches] = useState<SwitchItem[]>([]);
  const [editingGate, setEditingGate] = useState<{ x: number; y: number } | null>(null);
  const [blueMaxSteps, setBlueMaxSteps] = useState(20);
  const [redMaxSteps, setRedMaxSteps] = useState(20);
  const [selectedTool, setSelectedTool] = useState<DuoToolType>('floor');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<DuoGameState | null>(null);
  const [activePlayer, setActivePlayer] = useState<PlayerColor>('blue');
  const [levelName, setLevelName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasCompletedPlaythrough, setHasCompletedPlaythrough] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState(false);
  const [autoSolved, setAutoSolved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextSwitchIdRef = useRef(1);

  useEffect(() => {
    if (!editingLevelId) return;

    let cancelled = false;

    const loadLevel = async () => {
      setLoadingLevel(true);
      try {
        const res = await fetch(`/api/user-duo-levels/${editingLevelId}`);
        if (!res.ok) {
          throw new Error('加载关卡失败');
        }
        const data = await res.json();
        if (!cancelled && data.level) {
          const lv = data.level;
          const parsedGrid = JSON.parse(lv.gridData);
          const parsedBoxes = JSON.parse(lv.boxes);
          const parsedTargets = JSON.parse(lv.targets);
          const parsedRedGates = JSON.parse(lv.redGates || '[]');
          const parsedSwitches = JSON.parse(lv.switches || '[]');

          let finalGates: RedGate[] = parsedRedGates;
          let finalSwitches: SwitchItem[] = parsedSwitches;

          if (parsedRedGates.length > 0 && typeof parsedRedGates[0].switchId !== 'number') {
            const idMap = new Map<string, number>();
            let nextId = 1;

            finalSwitches = parsedSwitches.map((s: any) => {
              const gateId = typeof s.gateId === 'string' ? s.gateId : `gate-${s.id}`;
              if (!idMap.has(gateId)) {
                idMap.set(gateId, nextId++);
              }
              return { x: s.x, y: s.y, id: idMap.get(gateId)! };
            });

            finalGates = parsedRedGates.map((g: any) => {
              const switchId = typeof g.switchId === 'string' ? g.switchId : `switch-${g.id}`;
              return { x: g.x, y: g.y, switchId: idMap.get(switchId) || 0 };
            });

            nextSwitchIdRef.current = nextId;
          } else {
            let maxId = 0;
            parsedSwitches.forEach((s: SwitchItem) => {
              if (typeof s.id === 'number' && s.id > maxId) maxId = s.id;
            });
            nextSwitchIdRef.current = maxId + 1;
          }

          setGrid(parsedGrid);
          setBoxes(parsedBoxes);
          setTargets(parsedTargets);
          setBluePlayer({ x: lv.bluePlayerX, y: lv.bluePlayerY });
          setRedPlayer({ x: lv.redPlayerX, y: lv.redPlayerY });
          setBlueMaxSteps(lv.blueMaxSteps);
          setRedMaxSteps(lv.redMaxSteps);
          setRedGates(finalGates);
          setSwitches(finalSwitches);
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
    setRedGates(redGates.filter((g) => g.x < width && g.y < height));
    setSwitches(switches.filter((s) => s.x < width && s.y < height));
    if (bluePlayer && (bluePlayer.x >= width || bluePlayer.y >= height)) {
      setBluePlayer(null);
    }
    if (redPlayer && (redPlayer.x >= width || redPlayer.y >= height)) {
      setRedPlayer(null);
    }
    setGridSize({ width, height });
    setHasCompletedPlaythrough(false);
  }, [grid, boxes, targets, bluePlayer, redPlayer, redGates, switches]);

  const hasDuoCollision = useCallback((x: number, y: number, excludeType?: DuoToolType): boolean => {
    const hasWall = grid[y]?.[x] === CellType.WALL;
    const hasBox = boxes.some((b) => b.x === x && b.y === y);
    const hasBluePlayer = bluePlayer && bluePlayer.x === x && bluePlayer.y === y;
    const hasRedPlayer = redPlayer && redPlayer.x === x && redPlayer.y === y;
    const hasRedGate = redGates.some((g) => g.x === x && g.y === y);
    const hasSwitch = switches.some((s) => s.x === x && s.y === y);
    const hasTarget = targets.some((t) => t.x === x && t.y === y);

    if (excludeType === 'wall') return false;
    if (excludeType === 'target') return hasWall || hasBox || !!hasBluePlayer || !!hasRedPlayer || hasRedGate || hasSwitch;
    if (excludeType === 'box') return hasWall || !!hasBluePlayer || !!hasRedPlayer || hasRedGate || hasSwitch;
    if (excludeType === 'bluePlayer' || excludeType === 'redPlayer') return hasWall || hasBox || hasRedGate || hasSwitch;
    if (excludeType === 'redGate') return hasWall || hasBox || !!hasBluePlayer || !!hasRedPlayer || hasSwitch;
    if (excludeType === 'switch') return hasWall || hasBox || !!hasBluePlayer || !!hasRedPlayer || hasRedGate;
    if (excludeType === 'floor') return false;
    if (excludeType === 'erase') return false;

    return hasWall || hasBox || !!hasBluePlayer || !!hasRedPlayer || hasRedGate || hasSwitch;
  }, [grid, boxes, targets, bluePlayer, redPlayer, redGates, switches]);

  const placeTool = useCallback((x: number, y: number) => {
    if (isPlaying) return;

    if (selectedTool === 'erase') {
      setBoxes(boxes.filter((b) => !(b.x === x && b.y === y)));
      setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
      setRedGates(redGates.filter((g) => !(g.x === x && g.y === y)));
      setSwitches(switches.filter((s) => !(s.x === x && s.y === y)));

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
      } else if (!hasDuoCollision(x, y, 'box')) {
        setBoxes([...boxes, { x, y }]);
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    if (selectedTool === 'bluePlayer') {
      if (bluePlayer && bluePlayer.x === x && bluePlayer.y === y) {
        setBluePlayer(null);
      } else if (!hasDuoCollision(x, y, 'bluePlayer')) {
        setBluePlayer({ x, y });
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    if (selectedTool === 'redPlayer') {
      if (redPlayer && redPlayer.x === x && redPlayer.y === y) {
        setRedPlayer(null);
      } else if (!hasDuoCollision(x, y, 'redPlayer')) {
        setRedPlayer({ x, y });
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    if (selectedTool === 'redGate') {
      if (redGates.some((g) => g.x === x && g.y === y)) {
        setRedGates(redGates.filter((g) => !(g.x === x && g.y === y)));
      } else if (!hasDuoCollision(x, y, 'redGate')) {
        setRedGates([...redGates, { x, y, switchId: 0 }]);
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    if (selectedTool === 'switch') {
      if (switches.some((s) => s.x === x && s.y === y)) {
        setSwitches(switches.filter((s) => !(s.x === x && s.y === y)));
      } else if (!hasDuoCollision(x, y, 'switch')) {
        const swId = nextSwitchIdRef.current++;
        setSwitches([...switches, { x, y, id: swId }]);
      }
      setHasCompletedPlaythrough(false);
      return;
    }

    const newGrid = grid.map((row) => [...row]);
    if (selectedTool === 'floor') {
      newGrid[y][x] = CellType.FLOOR;
      setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
      setRedGates(redGates.filter((g) => !(g.x === x && g.y === y)));
      setSwitches(switches.filter((s) => !(s.x === x && s.y === y)));
      setGrid(newGrid);
      setHasCompletedPlaythrough(false);
    } else if (selectedTool === 'wall') {
      if (!hasDuoCollision(x, y, 'wall')) {
        newGrid[y][x] = CellType.WALL;
        setTargets(targets.filter((t) => !(t.x === x && t.y === y)));
        setBoxes(boxes.filter((b) => !(b.x === x && b.y === y)));
        setRedGates(redGates.filter((g) => !(g.x === x && g.y === y)));
        setSwitches(switches.filter((s) => !(s.x === x && s.y === y)));
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
      if (!hasDuoCollision(x, y, 'target')) {
        newGrid[y][x] = CellType.TARGET;
        if (!targets.some((t) => t.x === x && t.y === y)) {
          setTargets([...targets, { x, y }]);
        }
        setGrid(newGrid);
        setHasCompletedPlaythrough(false);
      }
    }
  }, [grid, boxes, targets, bluePlayer, redPlayer, redGates, switches, selectedTool, isPlaying, hasDuoCollision]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (isPlaying) return;
    placeTool(x, y);
  }, [isPlaying, placeTool]);

  const handleCellDrag = useCallback((x: number, y: number) => {
    if (isPlaying) return;
    if (selectedTool === 'box' || selectedTool === 'bluePlayer' || selectedTool === 'redPlayer' || selectedTool === 'redGate' || selectedTool === 'switch') return;
    placeTool(x, y);
  }, [isPlaying, selectedTool, placeTool]);

  const handleGateSwitchIdChange = useCallback((gateX: number, gateY: number, newSwitchId: number) => {
    setRedGates(redGates.map((g) => {
      if (g.x === gateX && g.y === gateY) {
        return { ...g, switchId: newSwitchId };
      }
      return g;
    }));
    setHasCompletedPlaythrough(false);
  }, [redGates]);
  const handleClearLevel = useCallback(() => {
    if (isPlaying) return;
    setGrid(Array.from({ length: gridSize.height }, () => Array.from({ length: gridSize.width }, () => CellType.FLOOR as CellType)));
    setBoxes([]);
    setTargets([]);
    setBluePlayer(null);
    setRedPlayer(null);
    setRedGates([]);
    setSwitches([]);
    setHasCompletedPlaythrough(false);
  }, [isPlaying, gridSize]);

  const handlePlay = useCallback(() => {
    if (!bluePlayer || !redPlayer || targets.length === 0) {
      setMessage('需要放置红蓝角色和至少一个目标点才能试玩');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const levelData: DuoLevelData = {
      grid: grid.map((row) => [...row]),
      bluePlayer: { ...bluePlayer },
      redPlayer: { ...redPlayer },
      blueMaxSteps,
      redMaxSteps,
      boxes: boxes.map((b) => ({ ...b })),
      targets: targets.map((t) => ({ ...t })),
      redGates: redGates.map((g) => ({ ...g })),
      switches: switches.map((s) => ({ ...s })),
    };

    setGameState(createDuoGameState(levelData));
    setIsPlaying(true);
    setActivePlayer('blue');
    setAutoSolved(false);
  }, [grid, bluePlayer, redPlayer, blueMaxSteps, redMaxSteps, boxes, targets, redGates, switches]);

  const handleStopPlay = useCallback(() => {
    setIsPlaying(false);
    setGameState(null);
    setAutoSolved(false);
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
    if (activePlayer === 'blue' && gameState.bluePlayer.isGone) {
      actualPlayer = 'red';
    } else if (activePlayer === 'red' && gameState.redPlayer.isGone) {
      actualPlayer = 'blue';
    }

    setGameState((prev) => {
      if (!prev) return prev;
      const next = moveDuoPlayer(prev, actualPlayer, direction);
      if (next.isWin && !autoSolved) {
        setMessage('恭喜！双人关卡完成！已验证可通关。');
        setHasCompletedPlaythrough(true);
        setTimeout(() => setMessage(null), 3000);
      } else if (next.isWin && autoSolved) {
        setMessage('提示通关完成（不计入成绩）');
        setTimeout(() => setMessage(null), 3000);
      }
      return next;
    });
  }, [gameState, isPlaying, activePlayer, autoSolved]);

  const handleHintStep = useCallback(
    (color: PlayerColor, direction: Direction) => {
      if (!gameState || !isPlaying) return;
      setAutoSolved(true);
      setGameState((prev) => {
        if (!prev) return prev;
        const next = moveDuoPlayer(prev, color, direction);
        if (next.isWin) {
          setMessage('提示通关完成（不计入成绩）');
          setTimeout(() => setMessage(null), 3000);
        }
        return next;
      });
    },
    [gameState, isPlaying],
  );

  const handleHintSwitchToggle = useCallback(
    (color: PlayerColor, switchX: number, switchY: number) => {
      if (!gameState || !isPlaying) return;
      setAutoSolved(true);
      setGameState((prev) => {
        if (!prev) return prev;
        return toggleSwitch(prev, switchX, switchY, color);
      });
    },
    [gameState, isPlaying],
  );

  const handleAutoSolveComplete = useCallback(() => {
    setAutoSolved(true);
  }, []);

  const handleResetPlay = useCallback(() => {
    if (!bluePlayer || !redPlayer || targets.length === 0) return;
    const levelData: DuoLevelData = {
      grid: grid.map((row) => [...row]),
      bluePlayer: { ...bluePlayer },
      redPlayer: { ...redPlayer },
      blueMaxSteps,
      redMaxSteps,
      boxes: boxes.map((b) => ({ ...b })),
      targets: targets.map((t) => ({ ...t })),
      redGates: redGates.map((g) => ({ ...g })),
      switches: switches.map((s) => ({ ...s })),
    };
    setGameState(createDuoGameState(levelData));
    setActivePlayer('blue');
    setAutoSolved(false);
  }, [grid, bluePlayer, redPlayer, blueMaxSteps, redMaxSteps, boxes, targets, redGates, switches]);

  const handleUndoPlay = useCallback(() => {
    if (!gameState || !isPlaying) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return undoDuoMove(prev);
    });
  }, [gameState, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') handleMove('up');
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') handleMove('down');
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
    if (!bluePlayer || !redPlayer || targets.length === 0) {
      setMessage('需要放置红蓝角色和至少一个目标点才能保存');
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
        blueMaxSteps,
        redMaxSteps,
        boxes: JSON.stringify(boxes),
        targets: JSON.stringify(targets),
        redGates: JSON.stringify(redGates),
        switches: JSON.stringify(switches),
        verified: hasCompletedPlaythrough,
      };

      let res;
      if (editingLevelId) {
        res = await fetch(`/api/user-duo-levels/${editingLevelId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(levelData),
        });
      } else {
        res = await fetch('/api/user-duo-levels', {
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
  }, [grid, bluePlayer, redPlayer, blueMaxSteps, redMaxSteps, boxes, targets, redGates, switches, levelName, hasCompletedPlaythrough, editingLevelId]);

  const currentLevelData: DuoLevelData | null = (bluePlayer && redPlayer && targets.length > 0)
    ? {
        grid: grid.map((row) => [...row]),
        bluePlayer: { ...bluePlayer },
        redPlayer: { ...redPlayer },
        blueMaxSteps,
        redMaxSteps,
        boxes: boxes.map((b) => ({ ...b })),
        targets: targets.map((t) => ({ ...t })),
        redGates: redGates.map((g) => ({ ...g })),
        switches: switches.map((s) => ({ ...s })),
      }
    : null;

  const displayGrid = isPlaying && gameState ? gameState.grid : grid;
  const displayBoxes = isPlaying && gameState ? gameState.boxes : boxes;
  const displayTargets = isPlaying && gameState ? gameState.targets : targets;
  const displayBlue = isPlaying && gameState ? gameState.bluePlayer.position : bluePlayer;
  const displayRed = isPlaying && gameState ? gameState.redPlayer.position : redPlayer;
  const displayBlueGone = isPlaying && gameState ? gameState.bluePlayer.isGone : false;
  const displayRedGone = isPlaying && gameState ? gameState.redPlayer.isGone : false;
  const displayRedGates = isPlaying && gameState ? gameState.redGates : redGates;
  const displaySwitches = isPlaying && gameState ? gameState.switches : switches;
  const displayActiveSwitches = isPlaying && gameState ? gameState.activeSwitches : new Set<string | number>();
  const displayBarriers = isPlaying && gameState ? gameState.oneWayBarriers : [];

  const handleSwitchClick = useCallback((swX: number, swY: number) => {
    if (!gameState || !isPlaying) return;

    let actualPlayer = activePlayer;
    if (activePlayer === 'blue' && gameState.bluePlayer.isGone) {
      actualPlayer = 'red';
    } else if (activePlayer === 'red' && gameState.redPlayer.isGone) {
      actualPlayer = 'blue';
    }

    setGameState((prev) => {
      if (!prev) return prev;
      return toggleSwitch(prev, swX, swY, actualPlayer);
    });
  }, [gameState, isPlaying, activePlayer]);

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
          <DuoEditorGrid
            grid={displayGrid}
            boxes={displayBoxes}
            targets={displayTargets}
            bluePlayer={displayBlue}
            redPlayer={displayRed}
            bluePlayerGone={displayBlueGone}
            redPlayerGone={displayRedGone}
            redGates={displayRedGates}
            switches={displaySwitches}
            activeSwitches={displayActiveSwitches}
            activePlayerColor={activePlayer}
            oneWayBarriers={displayBarriers}
            selectedArea={null}
            onCellClick={handleCellClick}
            onCellDrag={handleCellDrag}
            onSwitchClick={handleSwitchClick}
            isPlaying={isPlaying}
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
              <span className="text-sm text-slate-400 ml-3">蓝: </span>
              <span className="text-lg font-bold text-blue-400">{gameState.bluePlayer.stepsRemaining}</span>
              <span className="text-sm text-slate-400 ml-2">红: </span>
              <span className="text-lg font-bold text-red-400">{gameState.redPlayer.stepsRemaining}</span>
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
            {DUO_TOOLS.map((tool) => (
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
          <h3 className="text-sm font-medium text-white mb-3">移动点数</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">玩家 1 最大步数</label>
              <input
                type="number"
                min="1"
                max="100"
                value={blueMaxSteps}
                onChange={(e) => setBlueMaxSteps(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))}
                disabled={isPlaying}
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">玩家 2 最大步数</label>
              <input
                type="number"
                min="1"
                max="100"
                value={redMaxSteps}
                onChange={(e) => setRedMaxSteps(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))}
                disabled={isPlaying}
                className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center"
              />
            </div>
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
              <span className="text-slate-400">机关/开关:</span>
              <span className="text-white">{redGates.length}/{switches.length}</span>
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

        {!isPlaying && switches.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-white mb-2">开关ID列表</h3>
            <div className="flex flex-wrap gap-2">
              {switches.map((sw) => (
                <div key={`sw-${sw.x}-${sw.y}`} className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                  ID: {sw.id}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPlaying && redGates.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-white mb-2">机关开关ID设置</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {redGates.map((gate, idx) => (
                <div key={`gate-${gate.x}-${gate.y}`} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 w-16">({gate.x},{gate.y})</span>
                  <input
                    type="number"
                    min="0"
                    value={gate.switchId}
                    onChange={(e) => handleGateSwitchIdChange(gate.x, gate.y, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-center text-xs"
                  />
                  {typeof gate.switchId === 'number' && gate.switchId > 0 && !switches.some((s) => s.id === gate.switchId) && (
                    <span className="text-red-400 text-xs">⚠ 无效ID</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? '保存中...' : '保存关卡'}
        </button>

        {isPlaying && currentLevelData && (
          <DuoHintPanel
            levelData={currentLevelData}
            currentState={gameState}
            onStep={handleHintStep}
            onSwitchToggle={handleHintSwitchToggle}
            onAutoSolveComplete={handleAutoSolveComplete}
            onReset={handleResetPlay}
            disabled={!isPlaying || gameState?.isWin === true}
          />
        )}

        <div className="glass-card p-4 text-xs text-slate-400 leading-relaxed">
          <p className="text-slate-300 font-medium mb-2">操作说明</p>
          <p>• 选择工具后点击地图放置物品</p>
          <p>• 拖动可以连续绘制墙壁和地板</p>
          <p>• 红色机关阻止所有角色和箱子</p>
          <p>• <span className="text-green-400">开关ID:</span> 放置开关时自动分配唯一数字ID</p>
          <p>• <span className="text-green-400">机关关联:</span> 在右侧面板输入开关ID关联机关</p>
          <p>• <span className="text-green-400">一个开关可控制多个机关</span>（输入相同ID即可）</p>
          <p>• 角色走到开关旁可点击切换机关</p>
          <p>• 角色离开格子后生成单向障碍</p>
          <p>• 只能从离开方向原路返回</p>
          <p>• 障碍数量限制等于角色最大步数</p>
          <p>• 试玩模式: WASD/方向键移动</p>
          <p>• Tab 切换红蓝角色</p>
          <p>• Z 撤销一步，R 重置，Esc 退出试玩</p>
        </div>
      </div>
    </div>
  );
}