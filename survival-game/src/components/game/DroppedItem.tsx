'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DroppedItem as DroppedItemType, ITEM_ICONS } from '@/store/gameStore'

interface DroppedItemProps {
  item: DroppedItemType
  onClick: () => void
}

export function DroppedItem({ item, onClick }: DroppedItemProps) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    meshRef.current.position.y = item.position[1] + Math.sin(time * 3) * 0.1
    meshRef.current.rotation.y = time * 2
  })

  const itemColor: Record<string, string> = {
    wood: '#8b4513',
    stone: '#808080',
    flint: '#4a4a4a',
    twig: '#8b7355',
    grass: '#7cfc00',
    meat: '#cd5c5c',
    seed: '#8b4513',
    charcoal: '#2d2d2d',
  }

  const color = itemColor[item.type] || '#ffffff'

  return (
    <group 
      ref={meshRef} 
      position={item.position as [number, number, number]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <planeGeometry args={[0.5, 0.15]} />
        <meshBasicMaterial color="white" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}
