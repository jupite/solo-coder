'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ResourceNode as ResourceNodeType } from '@/store/gameStore'

interface ResourceNodeProps {
  resource: ResourceNodeType
}

export function ResourceNode({ resource }: ResourceNodeProps) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    meshRef.current.position.y = resource.position[1] + Math.sin(time * 2 + resource.position[0]) * 0.02
  })

  const healthPercent = resource.health / resource.maxHealth

  if (resource.type === 'wood') {
    return (
      <group ref={meshRef} position={resource.position as [number, number, number]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0, 4, 0]} castShadow>
          <coneGeometry args={[1.5, 2.5, 8]} />
          <meshStandardMaterial color="#228b22" />
        </mesh>
        <mesh position={[0, 5.2, 0]} castShadow>
          <coneGeometry args={[1.2, 2, 8]} />
          <meshStandardMaterial color="#32cd32" />
        </mesh>
        {healthPercent < 1 && (
          <mesh position={[0, 5.5, 0]}>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="red" />
          </mesh>
        )}
      </group>
    )
  }

  if (resource.type === 'stone') {
    return (
      <group ref={meshRef} position={resource.position as [number, number, number]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <dodecahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
        <mesh position={[0.3, 0.3, 0.3]} castShadow>
          <dodecahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      </group>
    )
  }

  if (resource.type === 'flint') {
    return (
      <group ref={meshRef} position={resource.position as [number, number, number]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.15, 0.25, 0]} castShadow>
          <octahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    )
  }

  if (resource.type === 'twig') {
    return (
      <group ref={meshRef} position={resource.position as [number, number, number]}>
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 4]} />
          <meshStandardMaterial color="#8b7355" />
        </mesh>
        <mesh position={[0.1, 0.15, 0.1]} rotation={[Math.PI / 2, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 4]} />
          <meshStandardMaterial color="#9b8465" />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={meshRef} position={resource.position as [number, number, number]}>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 1.2) * 0.2,
            0.15 + Math.random() * 0.1,
            Math.cos(i * 1.2) * 0.2,
          ]}
          castShadow
        >
          <coneGeometry args={[0.05, 0.3, 4]} />
          <meshStandardMaterial color="#7cfc00" />
        </mesh>
      ))}
    </group>
  )
}
