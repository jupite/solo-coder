'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

const MOVE_SPEED = 0.15
const MAP_SIZE = 100
const INTERACTION_RANGE = 3

export function Player() {
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const keys = useRef<Set<string>>(new Set())
  const [isAttacking, setIsAttacking] = useState(false)
  const [isGathering, setIsGathering] = useState(false)

  const {
    playerPosition,
    setPlayerPosition,
    gatherResource,
    attack,
    resources,
    equippedTool,
    showMessage,
    buildings,
    openContainer,
    placement,
  } = useGameStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keys.current.add(key)

      if (placement.isActive) return

      if (key === 'f' && !isAttacking) {
        e.preventDefault()
        setIsAttacking(true)
        attack()
        setTimeout(() => setIsAttacking(false), 300)
        showMessage('⚔️ 攻击！', 'info')
      }

      if (e.key === ' ' && !isGathering) {
        e.preventDefault()
        setIsGathering(true)

        let nearestId: string | null = null
        let nearestDist = Infinity

        for (const resource of resources) {
          const dist = Math.sqrt(
            Math.pow(resource.position[0] - playerPosition[0], 2) +
            Math.pow(resource.position[2] - playerPosition[2], 2)
          )
          if (dist < INTERACTION_RANGE && dist < nearestDist) {
            nearestId = resource.id
            nearestDist = dist
          }
        }

        if (nearestId) {
          const result = gatherResource(nearestId, equippedTool)
          showMessage(result.message, result.success ? 'success' : 'error')
        } else {
          showMessage('❌ 附近没有可采集的资源', 'error')
        }

        setTimeout(() => setIsGathering(false), 500)
      }

      if (key === 'e') {
        let nearestBuilding: { id: string; type: string } | null = null
        let nearestDist = Infinity

        for (const building of buildings) {
          const dist = Math.sqrt(
            Math.pow(building.position[0] - playerPosition[0], 2) +
            Math.pow(building.position[2] - playerPosition[2], 2)
          )
          if (dist < INTERACTION_RANGE + 1 && dist < nearestDist) {
            nearestBuilding = { id: building.id, type: building.type }
            nearestDist = dist
          }
        }

        if (nearestBuilding) {
          if (nearestBuilding.type === 'chest') {
            openContainer(nearestBuilding.id)
            showMessage('📦 打开了箱子', 'info')
          } else if (nearestBuilding.type === 'campfire') {
            showMessage('🔥 火堆正在燃烧', 'info')
          }
        }
      }

      if (key === 'm') {
        useGameStore.getState().toggleMap()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isAttacking, isGathering, gatherResource, attack, resources, playerPosition, equippedTool, showMessage, buildings, openContainer, placement.isActive])

  useFrame(() => {
    if (!meshRef.current) return

    let dx = 0
    let dz = 0

    if (keys.current.has('w') || keys.current.has('arrowup')) dz -= MOVE_SPEED
    if (keys.current.has('s') || keys.current.has('arrowdown')) dz += MOVE_SPEED
    if (keys.current.has('a') || keys.current.has('arrowleft')) dx -= MOVE_SPEED
    if (keys.current.has('d') || keys.current.has('arrowright')) dx += MOVE_SPEED

    const halfMap = MAP_SIZE / 2 - 1
    const newX = Math.max(-halfMap, Math.min(halfMap, playerPosition[0] + dx))
    const newZ = Math.max(-halfMap, Math.min(halfMap, playerPosition[2] + dz))

    if (dx !== 0 || dz !== 0) {
      setPlayerPosition([newX, 1, newZ])
    }

    meshRef.current.position.set(newX, 1, newZ)

    camera.position.set(newX - 12, 14, newZ + 12)
    camera.lookAt(newX, 0, newZ)
  })

  return (
    <group ref={meshRef} position={playerPosition as [number, number, number]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>

      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#f5cba7" />
      </mesh>

      <mesh
        position={[0.4, 0.5, isAttacking ? -0.5 : 0.2]}
        rotation={[isAttacking ? -Math.PI / 2 : 0, 0, Math.PI / 4]}
      >
        <boxGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {equippedTool && (
        <group
          position={[0.6, 0.7, isGathering ? -0.3 : 0.3]}
          rotation={[isGathering ? -Math.PI / 3 : 0, 0, Math.PI / 6]}
        >
          {equippedTool === 'axe' && (
            <>
              <mesh position={[0, 0, -0.1]}>
                <boxGeometry args={[0.08, 0.08, 0.5]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              <mesh position={[0, 0.1, -0.35]}>
                <boxGeometry args={[0.25, 0.15, 0.05]} />
                <meshStandardMaterial color="#708090" metalness={0.8} />
              </mesh>
            </>
          )}
          {equippedTool === 'pickaxe' && (
            <>
              <mesh position={[0, 0, -0.1]}>
                <boxGeometry args={[0.08, 0.08, 0.5]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              <mesh position={[0, 0.12, -0.35]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.3, 0.08, 0.05]} />
                <meshStandardMaterial color="#708090" metalness={0.8} />
              </mesh>
            </>
          )}
          {equippedTool === 'torch' && (
            <>
              <mesh position={[0, 0, -0.1]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              <mesh position={[0, 0.35, -0.3]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color="#ff6600" transparent opacity={0.8} />
              </mesh>
              <pointLight position={[0, 0.35, -0.3]} color="#ff6600" intensity={1} distance={8} />
            </>
          )}
        </group>
      )}

      {isGathering && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color="yellow" transparent opacity={0.6} />
        </mesh>
      )}

      {resources.map((resource) => {
        const dist = Math.sqrt(
          Math.pow(resource.position[0] - playerPosition[0], 2) +
          Math.pow(resource.position[2] - playerPosition[2], 2)
        )
        if (dist >= INTERACTION_RANGE) return null

        return (
          <mesh
            key={`indicator-${resource.id}`}
            position={[
              resource.position[0],
              resource.type === 'wood' ? 6 : resource.type === 'stone' ? 1.5 : 0.8,
              resource.position[2],
            ]}
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
          </mesh>
        )
      })}

    </group>
  )
}
