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

  const archShape = useMemo(() => {
    const shape = new THREE.Shape()
    const outerRadius = 1.5
    const innerRadius = 1.2
    const pillarWidth = 0.3
    const totalWidth = 4
    const totalHeight = 3.5
    
    shape.moveTo(0, 0)
    shape.lineTo(0, totalHeight - outerRadius)
    
    for (let i = 0; i <= 32; i++) {
      const angle = (Math.PI * i) / 32
      const x = pillarWidth + outerRadius + Math.cos(angle) * outerRadius
      const y = totalHeight - outerRadius + Math.sin(angle) * outerRadius
      shape.lineTo(x, y)
    }
    
    shape.lineTo(totalWidth, 0)
    shape.lineTo(totalWidth - pillarWidth, 0)
    
    const rightInnerX = totalWidth - pillarWidth - innerRadius
    shape.lineTo(rightInnerX + innerRadius, 0)
    
    for (let i = 32; i >= 0; i--) {
      const angle = (Math.PI * i) / 32
      const x = rightInnerX + Math.cos(angle) * innerRadius
      const y = totalHeight - outerRadius + (outerRadius - innerRadius) + Math.sin(angle) * innerRadius
      shape.lineTo(x, y)
    }
    
    shape.lineTo(pillarWidth, totalHeight - outerRadius + (outerRadius - innerRadius))
    shape.lineTo(pillarWidth, 0)
    shape.lineTo(0, 0)
    
    return shape
  }, [])

  const archExtrudeSettings = useMemo(() => ({
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 3,
  }), [])

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

  const halfWidth = 2

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[halfWidth, 0, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[archShape, archExtrudeSettings]} />
        <meshStandardMaterial 
          color="#f0f0f0"
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>

      <mesh position={[halfWidth, 1.5, -0.4]} castShadow>
        <boxGeometry args={[0.6, 3, 0.3]} />
        <meshStandardMaterial 
          color="#e8e8e8"
          metalness={0.1}
          roughness={0.65}
        />
      </mesh>

      <mesh position={[halfWidth, 3.1, -0.15]} castShadow>
        <boxGeometry args={[4.2, 0.4, 1.0]} />
        <meshStandardMaterial 
          color="#d8d8d8"
          metalness={0.1}
          roughness={0.55}
        />
      </mesh>

      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.6, 1.0]} />
        <meshStandardMaterial 
          color="#d0d0d0"
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      <mesh position={[halfWidth * 2, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.6, 1.0]} />
        <meshStandardMaterial 
          color="#d0d0d0"
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      <mesh position={[halfWidth, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.0, 32]} />
        <meshBasicMaterial 
          color={isDead ? '#88ccff' : '#cccccc'} 
          transparent 
          opacity={isDead ? 0.4 : 0.2} 
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight 
        name="gateLight"
        position={[halfWidth, 2.5, 0]} 
        color={isDead ? '#88ccff' : '#ffffee'} 
        intensity={isDead ? 2.5 : 1.5} 
        distance={12} 
        decay={2}
        castShadow 
      />
    </group>
  )
}
