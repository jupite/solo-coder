'use client';

import { Suspense, useEffect, useCallback } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrthographicCamera, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Board } from './Board';
import { Wall } from './Wall';
import { CellType } from '@/lib/game/types';
import { Box } from './Box';
import { Player } from './Player';
import { RedPlayer } from './RedPlayer';
import { Target } from './Target';
import { RedGate } from './RedGate';
import type { DuoGameState, DuoLevelData, OneWayBarrier, Position } from '@/lib/game/types';
import * as THREE from 'three';

interface DuoGameCanvasProps {
  gameState: DuoGameState;
  levelData: DuoLevelData;
  onSwitchClick?: (switchX: number, switchY: number) => void;
  activePlayerColor: 'blue' | 'red';
}

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

function OneWayBarrierMarker({ barrier }: { barrier: OneWayBarrier }) {
  const color = barrier.color === 'blue' ? '#60a5fa' : '#f87171';
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
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
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

function StepsDisplay({ position, steps, maxSteps, color, isGone }: { position: Position; steps: number; maxSteps: number; color: string; isGone: boolean }) {
  if (isGone) return null;
  const textColor = steps <= 3 ? '#ef4444' : steps <= maxSteps * 0.3 ? '#f59e0b' : color;
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[-0.35, 0.5, 0.2]}>
        <planeGeometry args={[0.55, 0.22]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      <Text
        position={[-0.35, 0.5, 0.21]}
        fontSize={0.14}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
        font={null as any}
      >
        {`${steps}/${maxSteps}`}
      </Text>
    </group>
  );
}

function DisappearEffect({ position, color }: { position: Position; color: string }) {
  return (
    <group position={[position.x, 0, position.y]}>
      <mesh position={[0, 0.3, 0]}>
        <ringGeometry args={[0.2, 0.4, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={2} distance={2} />
    </group>
  );
}

function ClickableSwitch({
  position,
  isActive,
  isClickable,
  onClick,
}: {
  position: Position;
  isActive: boolean;
  isClickable: boolean;
  onClick: () => void;
}) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isClickable) {
      onClick();
    }
  };

  return (
    <group position={[position.x, 0, position.y]} onClick={handleClick}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial color="#3a2a0a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshStandardMaterial
          color={isClickable ? (isActive ? '#22c55e' : '#eab308') : (isActive ? '#64748b' : '#475569')}
          emissive={isClickable ? (isActive ? '#22c55e' : '#eab308') : '#1e293b'}
          emissiveIntensity={isClickable ? 0.8 : 0.3}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.06]} />
        <meshStandardMaterial
          color={isActive ? '#22c55e' : '#ef4444'}
          emissive={isActive ? '#22c55e' : '#ef4444'}
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
      {isClickable && (
        <mesh position={[0, 0.06, 0]}>
          <ringGeometry args={[0.38, 0.42, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function InnerCanvas({
  gameState,
  levelData,
  onSwitchClick,
  activePlayerColor,
  centerX,
  centerZ,
  cameraDistance,
  zoom,
}: DuoGameCanvasProps & { centerX: number; centerZ: number; cameraDistance: number; zoom: number }) {
  const isGateOpen = (gateX: number, gateY: number) => {
    const gate = gameState.redGates.find((g) => g.x === gateX && g.y === gateY);
    if (!gate) return false;
    return gameState.activeSwitches.has(gate.switchId);
  };

  const isSwitchActive = (swX: number, swY: number) => {
    const sw = gameState.switches.find((s) => s.x === swX && s.y === swY);
    if (!sw) return false;
    return gameState.activeSwitches.has(sw.gateId);
  };

  const isSwitchClickableForPlayer = (swX: number, swY: number) => {
    const player = activePlayerColor === 'blue' ? gameState.bluePlayer : gameState.redPlayer;
    if (player.isGone) return false;

    const dx = Math.abs(player.position.x - swX);
    const dy = Math.abs(player.position.y - swY);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  const handleSwitchClick = useCallback(
    (swX: number, swY: number) => {
      onSwitchClick?.(swX, swY);
    },
    [onSwitchClick],
  );

  return (
    <>
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

      <Suspense fallback={null}>
        <Board grid={levelData.grid} />

        {gameState.oneWayBarriers.map((barrier, idx) => (
          <OneWayBarrierMarker key={`barrier-${idx}`} barrier={barrier} />
        ))}

        {gameState.redGates.map((gate, idx) => (
          <RedGate
            key={`gate-${idx}`}
            position={{ x: gate.x, y: gate.y }}
            isOpen={isGateOpen(gate.x, gate.y)}
          />
        ))}

        {gameState.switches.map((sw, idx) => (
          <ClickableSwitch
            key={`sw-${idx}`}
            position={{ x: sw.x, y: sw.y }}
            isActive={isSwitchActive(sw.x, sw.y)}
            isClickable={isSwitchClickableForPlayer(sw.x, sw.y)}
            onClick={() => handleSwitchClick(sw.x, sw.y)}
          />
        ))}

        {gameState.boxes.map((pos, idx) => {
          const isOnTarget = gameState.targets.some(
            (t) => t.x === pos.x && t.y === pos.y,
          );
          return <Box key={`box-${idx}`} position={pos} isOnTarget={isOnTarget} />;
        })}

        {!gameState.bluePlayer.isGone && (
          <Player position={gameState.bluePlayer.position} direction="down" />
        )}
        {!gameState.redPlayer.isGone && (
          <RedPlayer position={gameState.redPlayer.position} direction="down" />
        )}

        {gameState.bluePlayer.isGone && (
          <DisappearEffect position={gameState.bluePlayer.position} color="#3b82f6" />
        )}
        {gameState.redPlayer.isGone && (
          <DisappearEffect position={gameState.redPlayer.position} color="#ef4444" />
        )}

        <StepsDisplay
          position={gameState.bluePlayer.position}
          steps={gameState.bluePlayer.stepsRemaining}
          maxSteps={gameState.bluePlayer.maxSteps}
          color="#3b82f6"
          isGone={gameState.bluePlayer.isGone}
        />
        <StepsDisplay
          position={gameState.redPlayer.position}
          steps={gameState.redPlayer.stepsRemaining}
          maxSteps={gameState.redPlayer.maxSteps}
          color="#ef4444"
          isGone={gameState.redPlayer.isGone}
        />

        {levelData.targets.map((pos, idx) => (
          <Target key={`target-${idx}`} position={pos} />
        ))}

        {levelData.grid.map((row, r) =>
          row.map((cell, c) =>
            cell === CellType.WALL ? (
              <Wall key={`w-${r}-${c}`} position={{ x: c, y: r }} />
            ) : null,
          ),
        )}
      </Suspense>

      <EffectComposer>
        <Bloom intensity={0.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export function DuoGameCanvas({ gameState, levelData, onSwitchClick, activePlayerColor }: DuoGameCanvasProps) {
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
        <InnerCanvas
          gameState={gameState}
          levelData={levelData}
          onSwitchClick={onSwitchClick}
          activePlayerColor={activePlayerColor}
          centerX={centerX}
          centerZ={centerZ}
          cameraDistance={cameraDistance}
          zoom={zoom}
        />
      </Canvas>
    </div>
  );
}