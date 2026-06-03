'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/store/gameStore'

const MOVE_SPEED = 0.15
const MAP_SIZE = 100

export function Player() {
  const meshRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const keys = useRef<Set<string>>(new Set())
  const [isAttacking, setIsAttacking] = useState(false)
  const [isGathering, setIsGathering] = useState(false)
  
  const {
    playerPosition,
    setPlayerPosition,
    damageResource,
    resources,
    equippedTool,
  } = useGameStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase())
      
      if (e.key.toLowerCase() === 'f' && !isAttacking) {
        setIsAttacking(true)
        setTimeout(() => setIsAttacking(false), 300)
        
        const damage = equippedTool === 'axe' || equippedTool === 'pickaxe' ? 15 : 5
        resources.forEach((resource) => {
          const dist = Math.sqrt(
            Math.pow(resource.position[0] - playerPosition[0], 2) +
            Math.pow(resource.position[2] - playerPosition[2], 2)
          )
          if (dist < 3) {
            damageResource(resource.id, damage)
          }
        })
      }
      
      if (e.key === ' ' && !isGathering) {
        e.preventDefault()
        setIsGathering(true)
        setTimeout(() => setIsGathering(false), 500)
        
        resources.forEach((resource) => {
          const dist = Math.sqrt(
            Math.pow(resource.position[0] - playerPosition[0], 2) +
            Math.pow(resource.position[2] - playerPosition[2], 2)
          )
          if (dist < 3) {
            damageResource(resource.id, 10)
          }
        })
      }
      
      if (e.key.toLowerCase() === 'm') {
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
  }, [isAttacking, isGathering, damageResource, resources, playerPosition, equippedTool])

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

    camera.position.set(newX - 10, 12, newZ + 10)
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
        <mesh
          position={[0.6, 0.7, isAttacking ? -0.3 : 0.3]}
          rotation={[isAttacking ? -Math.PI / 3 : 0, 0, Math.PI / 6]}
        >
          {equippedTool === 'axe' && (
            <>
              <boxGeometry args={[0.08, 0.08, 0.6]} />
              <meshStandardMaterial color="#8b4513" />
            </>
          )}
          {equippedTool === 'pickaxe' && (
            <>
              <boxGeometry args={[0.08, 0.08, 0.6]} />
              <meshStandardMaterial color="#8b4513" />
            </>
          )}
          {equippedTool === 'torch' && (
            <>
              <cylinderGeometry args={[0.03, 0.03, 0.4]} />
              <meshStandardMaterial color="#8b4513" />
            </>
          )}
        </mesh>
      )}
      
      {isGathering && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color="yellow" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}
