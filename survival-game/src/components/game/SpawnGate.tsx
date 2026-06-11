'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

interface SpawnGateProps {
  position: [number, number, number]
}

export function SpawnGate({ position }: SpawnGateProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { isDead } = useGameStore()

  const leftPillar = useMemo(() => <boxGeometry args={[0.6, 3.5, 0.6]} />, [])
  const rightPillar = useMemo(() => <boxGeometry args={[0.6, 3.5, 0.6]} />, [])
  const archTop = useMemo(() => <torusGeometry args={[1.2, 0.35, 8, 24, Math.PI]} />, [])
  const baseLeft = useMemo(() => <boxGeometry args={[0.8, 0.5, 0.8]} />, [])
  const baseRight = useMemo(() => <boxGeometry args={[0.8, 0.5, 0.8]} />, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    const light = groupRef.current.getObjectByName('gateLight')
    if (light) {
      const intensity = isDead 
        ? 2.5 + Math.sin(time * 2) * 0.5 
        : 1.5 + Math.sin(time * 1.5) * 0.3
      ;(light as THREE.PointLight).intensity = intensity
    }
  })

  const gateWidth = 2.4
  const gateHeight = 3.5
  const halfWidth = gateWidth / 2

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[-halfWidth, gateHeight / 2, 0]} castShadow receiveShadow>
        {leftPillar}
        <meshStandardMaterial color="#e8e8e8" metalness={0.1} roughness={0.7} />
      </mesh>

      <mesh position={[halfWidth, gateHeight / 2, 0]} castShadow receiveShadow>
        {rightPillar}
        <meshStandardMaterial color="#e8e8e8" metalness={0.1} roughness={0.7} />
      </mesh>

      <mesh 
        position={[0, gateHeight - 0.35, 0]} 
        rotation={[0, 0, 0]} 
        castShadow 
        receiveShadow
      >
        {archTop}
        <meshStandardMaterial color="#d8d8d8" metalness={0.1} roughness={0.65} />
      </mesh>

      <mesh position={[-halfWidth, 0.25, 0]} castShadow receiveShadow>
        {baseLeft}
        <meshStandardMaterial color="#d0d0d0" metalness={0.1} roughness={0.75} />
      </mesh>

      <mesh position={[halfWidth, 0.25, 0]} castShadow receiveShadow>
        {baseRight}
        <meshStandardMaterial color="#d0d0d0" metalness={0.1} roughness={0.75} />
      </mesh>

      <pointLight 
        name="gateLight"
        position={[0, 2.5, 0]} 
        color={isDead ? '#88ccff' : '#ffffee'} 
        intensity={isDead ? 2.5 : 1.5} 
        distance={12} 
        decay={2}
        castShadow 
      />
    </group>
  )
}
