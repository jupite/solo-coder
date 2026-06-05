'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ResourceNode as ResourceNodeType, TreeGrowthStage, TreeState } from '@/store/gameStore'

interface ResourceNodeProps {
  resource: ResourceNodeType
}

function renderTree(stage: TreeGrowthStage, state: TreeState) {
  const trunkHeight: Record<TreeGrowthStage, number> = {
    small: 1,
    medium: 2,
    large: 3,
    old: 2.5,
  }
  const trunkRadius: Record<TreeGrowthStage, number> = {
    small: 0.12,
    medium: 0.2,
    large: 0.35,
    old: 0.4,
  }
  const foliageRadius: Record<TreeGrowthStage, number> = {
    small: 0.7,
    medium: 1.2,
    large: 1.8,
    old: 1.5,
  }
  const foliageHeight: Record<TreeGrowthStage, number> = {
    small: 1,
    medium: 2,
    large: 3,
    old: 2.5,
  }

  const h = trunkHeight[stage]
  const r = trunkRadius[stage]
  const fr = foliageRadius[stage]
  const fh = foliageHeight[stage]

  if (state === 'stump') {
    return (
      <>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.3, 0.4, 8]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.25, 8]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
      </>
    )
  }

  if (state === 'charred') {
    return (
      <>
        <mesh position={[0, h / 2, 0]} castShadow>
          <cylinderGeometry args={[r * 0.8, r * 1.1, h, 8]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
        <mesh position={[0, h + fh * 0.3, 0]} castShadow>
          <coneGeometry args={[fr * 0.6, fh * 0.5, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </>
    )
  }

  const trunkColor = state === 'burning' ? '#ff4500' : '#8b4513'
  const foliageColor1 = state === 'burning' ? '#ff6600' : (stage === 'old' ? '#556b2f' : '#228b22')
  const foliageColor2 = state === 'burning' ? '#ffaa00' : (stage === 'old' ? '#6b8e23' : '#32cd32')

  return (
    <>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r * 0.8, r * 1.1, h, 8]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      <mesh position={[0, h + fh * 0.5, 0]} castShadow>
        <coneGeometry args={[fr, fh, 8]} />
        <meshStandardMaterial color={foliageColor1} />
      </mesh>
      {stage !== 'small' && (
        <mesh position={[0, h + fh * 0.85, 0]} castShadow>
          <coneGeometry args={[fr * 0.7, fh * 0.6, 8]} />
          <meshStandardMaterial color={foliageColor2} />
        </mesh>
      )}
      {state === 'burning' && (
        <>
          <pointLight position={[0, h + fh * 0.5, 0]} color="#ff4400" intensity={2} distance={8} />
          <mesh position={[0, h + fh * 0.6, 0]}>
            <sphereGeometry args={[fr * 0.5, 8, 8]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={0.6} />
          </mesh>
        </>
      )}
    </>
  )
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
    const stage = resource.treeGrowthStage || 'medium'
    const state = resource.treeState || 'normal'
    const totalHeight = state === 'stump' ? 0.5 : (state === 'charred' ? 3 : (stage === 'small' ? 2.5 : stage === 'medium' ? 4.5 : 6))

    return (
      <group ref={meshRef} position={resource.position as [number, number, number]}>
        {renderTree(stage, state)}
        {healthPercent < 1 && (
          <mesh position={[0, totalHeight + 0.3, 0]}>
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
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 1.2) * 0.2,
            0.15 + 0.05,
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
