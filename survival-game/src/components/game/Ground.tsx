'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MAP_SIZE = 100

export function Ground() {
  const groundRef = useRef<THREE.Mesh>(null)

  return (
    <group>
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE, 50, 50]} />
        <meshStandardMaterial color="#5d8a3e" />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_SIZE - 2, MAP_SIZE - 2]} />
        <meshStandardMaterial color="#6b9b4a" transparent opacity={0.3} />
      </mesh>

      {[...Array(100)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * MAP_SIZE * 0.95,
            0.02,
            (Math.random() - 0.5) * MAP_SIZE * 0.95,
          ]}
        >
          <circleGeometry args={[0.1 + Math.random() * 0.2, 6]} />
          <meshStandardMaterial
            color={Math.random() > 0.5 ? '#4a7a2e' : '#7ab85a'}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      <group position={[MAP_SIZE / 2 - 0.5, 1, 0]}>
        {[...Array(20)].map((_, i) => (
          <mesh key={i} position={[0, i * 0.5, (i - 10) * 0.5]}>
            <boxGeometry args={[1, 0.5, 0.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
      <group position={[-MAP_SIZE / 2 + 0.5, 1, 0]}>
        {[...Array(20)].map((_, i) => (
          <mesh key={i} position={[0, i * 0.5, (i - 10) * 0.5]}>
            <boxGeometry args={[1, 0.5, 0.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
      <group position={[0, 1, MAP_SIZE / 2 - 0.5]}>
        {[...Array(20)].map((_, i) => (
          <mesh key={i} position={[(i - 10) * 0.5, i * 0.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 1]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
      <group position={[0, 1, -MAP_SIZE / 2 + 0.5]}>
        {[...Array(20)].map((_, i) => (
          <mesh key={i} position={[(i - 10) * 0.5, i * 0.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 1]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
      </group>
    </group>
  )
}
