'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PlacedBuilding, BuildingType, useGameStore, ResourceType } from '@/store/gameStore'

interface BuildingProps {
  building: PlacedBuilding
  onInteract?: (id: string) => void
}

export function Building({ building, onInteract }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { addBuildingFuel, showMessage, removeFromInventory, inventory, draggedItem, setDraggedItem } = useGameStore()
  const [isHovered, setIsHovered] = useState(false)

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime
    if (building.type === 'campfire' && building.fuel > 0) {
      const scale = 1 + Math.sin(time * 8) * 0.05
      const flame = groupRef.current.getObjectByName('flame')
      if (flame) flame.scale.set(scale, scale + Math.sin(time * 12) * 0.1, scale)
    }
  })

  const handlePointerUp = () => {
    if (draggedItem && building.type === 'campfire' && ['wood', 'twig', 'grass'].includes(draggedItem.type)) {
      const item = inventory[draggedItem.index]
      if (item && item.type === draggedItem.type && item.count >= draggedItem.count) {
        const success = addBuildingFuel(building.id, draggedItem.type as ResourceType, draggedItem.count)
        if (success) {
          removeFromInventory(draggedItem.index, draggedItem.count)
        }
      }
      setDraggedItem(null)
    }
  }

  return (
    <group
      ref={groupRef}
      position={building.position as [number, number, number]}
      rotation={[0, building.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (onInteract) onInteract(building.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
        document.body.style.cursor = draggedItem && building.type === 'campfire' ? 'copy' : 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setIsHovered(false)
        document.body.style.cursor = 'default'
      }}
      onPointerUp={handlePointerUp}
    >
      {building.type === 'campfire' && <CampfireModel fuel={building.fuel} maxFuel={building.maxFuel} isHovered={isHovered} />}
      {building.type === 'chest' && <ChestModel isHovered={isHovered} />}
    </group>
  )
}

function CampfireModel({ fuel, maxFuel, isHovered }: { fuel: number; maxFuel: number; isHovered: boolean }) {
  const hasFuel = fuel > 0
  const fuelPercentage = fuel / maxFuel

  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`log-${i}`}
          position={[
            Math.sin((i / 6) * Math.PI * 2) * 0.3,
            0.1,
            Math.cos((i / 6) * Math.PI * 2) * 0.3,
          ]}
          rotation={[Math.PI / 2, (i / 6) * Math.PI * 2, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
          <meshStandardMaterial color={hasFuel ? '#5c3317' : '#3a3a3a'} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.1, 12]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {hasFuel && (
        <group position={[0, 0.25, 0]} name="flame">
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.2, 0.7, 8]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.12, 0.5, 8]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.06, 0.1, 0.06]}>
            <coneGeometry args={[0.08, 0.35, 6]} />
            <meshBasicMaterial color="#ff3300" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
      {hasFuel && (
        <pointLight position={[0, 1.2, 0]} color="#ff8800" intensity={2} distance={10} decay={2} />
      )}
      
      {isHovered && (
        <group position={[0, 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.2, 0.15]} />
            <meshBasicMaterial color="#333" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.6 + fuelPercentage * 0.6, 0, 0.01]}>
            <planeGeometry args={[fuelPercentage * 1.2, 0.12]} />
            <meshBasicMaterial color={fuelPercentage > 0.3 ? '#ff6600' : '#ff3300'} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  )
}

function ChestModel({ isHovered }: { isHovered: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.6]} />
        <meshStandardMaterial color={isHovered ? '#a0522d' : '#8b4513'} />
      </mesh>
      <mesh position={[0, 0.25, 0.31]} castShadow>
        <boxGeometry args={[0.75, 0.45, 0.02]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>
      <mesh position={[0, 0.525, 0]} castShadow>
        <boxGeometry args={[0.85, 0.08, 0.65]} />
        <meshStandardMaterial color="#6b3410" />
      </mesh>
      <mesh position={[0, 0.3, 0.32]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.12, 0.31]}>
        <boxGeometry args={[0.1, 0.04, 0.02]} />
        <meshStandardMaterial color="#808080" metalness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.3, 0.31]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.02]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>
      <mesh position={[-0.35, 0.3, 0.31]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.02]} />
        <meshStandardMaterial color="#5c3317" />
      </mesh>
    </group>
  )
}

interface PlacementPreviewProps {
  type: BuildingType
  position: [number, number, number]
  rotation: number
  isValid: boolean
  snapToGrid: boolean
}

export function PlacementPreview({ type, position, rotation, isValid, snapToGrid }: PlacementPreviewProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime
    groupRef.current.position.y = position[1] + Math.sin(time * 3) * 0.05
  })

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]} rotation={[0, rotation, 0]}>
      {type === 'campfire' && <CampfireModel fuel={100} maxFuel={200} isHovered={false} />}
      {type === 'chest' && <ChestModel isHovered={false} />}

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.65, 32]} />
        <meshBasicMaterial
          color={isValid ? '#00ff00' : '#ff0000'}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {snapToGrid && (
        <gridHelper
          args={[2, 2, isValid ? '#00ff00' : '#ff0000', isValid ? '#00ff0044' : '#ff000044']}
          position={[0, 0.02, 0]}
        />
      )}

      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={isValid ? '#00ff00' : '#ff0000'}
          transparent
          opacity={0.15}
        />
      </mesh>

      {!isValid && (
        <mesh position={[0, 2, 0]}>
          <planeGeometry args={[1, 0.3]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
