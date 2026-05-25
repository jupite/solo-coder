import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

interface TargetProps {
  id: string
  initialPosition: THREE.Vector3
  type: 'static' | 'moving'
  moveRange: number
  moveSpeed: number
}

export function Target({ id, initialPosition, type, moveRange, moveSpeed }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const targets = useGameStore((state) => state.targets)
  const updateTargetPosition = useGameStore((state) => state.updateTargetPosition)

  const target = targets.find((t) => t.id === id)
  const isHit = target?.isHit || false

  useFrame((state) => {
    if (!groupRef.current || isHit) return

    const time = state.clock.elapsedTime

    if (type === 'moving') {
      const x = initialPosition.x + Math.sin(time * moveSpeed) * moveRange
      const newPos = new THREE.Vector3(x, initialPosition.y, initialPosition.z)
      groupRef.current.position.copy(newPos)
      updateTargetPosition(id, newPos)
    }
  })

  if (isHit) return null

  return (
    <group ref={groupRef} position={initialPosition.toArray()}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <cylinderGeometry args={[1.0, 1.0, 0.05, 32]} />
        <meshStandardMaterial color="#000080" />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshStandardMaterial color="#000080" />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
        <meshStandardMaterial color="#DC143C" />
      </mesh>
      <mesh position={[0, 0, 0.24]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial color="#DC143C" />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[0, 0, 0.36]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    </group>
  )
}
