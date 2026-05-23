'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
} from '@react-three/postprocessing';
import { Board } from './Board';
import { Wall } from './Wall';
import { CellType } from '@/lib/game/types';
import { Box } from './Box';
import { Player } from './Player';
import { Target } from './Target';
import type { GameState, LevelData } from '@/lib/game/types';

interface GameCanvasProps {
  gameState: GameState;
  levelData: LevelData;
}

export function GameCanvas({ gameState, levelData }: GameCanvasProps) {
  const { grid } = levelData;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const centerX = (cols - 1) / 2;
  const centerZ = (rows - 1) / 2;
  const distance = Math.max(rows, cols) * 1.1;

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrthographicCamera
          makeDefault
          position={[centerX, distance, centerZ + distance]}
          zoom={60}
          near={0.1}
          far={200}
        />

        <color attach="background" args={['#0a0f1e']} />
        <fog attach="fog" args={['#0a0f1e', distance * 2, distance * 4]} />

        <ambientLight intensity={0.5} color="#a5b4fc" />
        <directionalLight
          position={[centerX + 5, 10, centerZ + 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={null}>
          <Board grid={grid} />

          {gameState.boxes.map((pos, idx) => {
            const isOnTarget = gameState.targets.some(
              (t) => t.x === pos.x && t.y === pos.y,
            );
            return <Box key={idx} position={pos} isOnTarget={isOnTarget} />;
          })}

          <Player position={gameState.player} direction="down" />

          {levelData.targets.map((pos, idx) => (
            <Target key={idx} position={pos} />
          ))}

          {grid.map((row, r) =>
            row.map((cell, c) =>
              cell === CellType.WALL ? (
                <Wall key={`w-${r}-${c}`} position={{ x: c, y: r }} />
              ) : null,
            ),
          )}
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
