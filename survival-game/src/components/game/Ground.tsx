'use client'

import { useMemo } from 'react'

const MAP_SIZE = 100

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function Ground() {
  const grassPatches = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      position: [
        (seededRandom(i * 3) - 0.5) * MAP_SIZE * 0.95,
        0.02,
        (seededRandom(i * 3 + 1) - 0.5) * MAP_SIZE * 0.95,
      ] as [number, number, number],
      radius: 0.1 + seededRandom(i * 3 + 2) * 0.2,
      color: seededRandom(i * 7) > 0.5 ? '#4a7a2e' : '#7ab85a',
    })),
    []
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE, 50, 50]} />
        <meshStandardMaterial color="#5d8a3e" />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_SIZE - 2, MAP_SIZE - 2]} />
        <meshStandardMaterial color="#6b9b4a" transparent opacity={0.3} />
      </mesh>

      {grassPatches.map((patch, i) => (
        <mesh key={i} position={patch.position}>
          <circleGeometry args={[patch.radius, 6]} />
          <meshStandardMaterial
            color={patch.color}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      <group position={[MAP_SIZE / 2 - 0.5, 1, 0]}>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh key={i} position={[0, i * 0.5, (i - 10) * 0.5]}>
            <boxGeometry args={[1, 0.5, 0.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
      <group position={[-MAP_SIZE / 2 + 0.5, 1, 0]}>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh key={i} position={[0, i * 0.5, (i - 10) * 0.5]}>
            <boxGeometry args={[1, 0.5, 0.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
      <group position={[0, 1, MAP_SIZE / 2 - 0.5]}>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh key={i} position={[(i - 10) * 0.5, i * 0.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 1]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
      <group position={[0, 1, -MAP_SIZE / 2 + 0.5]}>
        {Array.from({ length: 20 }, (_, i) => (
          <mesh key={i} position={[(i - 10) * 0.5, i * 0.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 1]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
    </group>
  )
}
