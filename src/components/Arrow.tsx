import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { GRAVITY } from '../utils/physics'

interface ArrowProps {
  id: string
  initialPosition: THREE.Vector3
  initialVelocity: THREE.Vector3
}

export function Arrow({ id, initialPosition, initialVelocity }: ArrowProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const positionRef = useRef(new THREE.Vector3().copy(initialPosition))
  const velocityRef = useRef(new THREE.Vector3().copy(initialVelocity))

  const arrows = useGameStore((state) => state.arrows)
  const deactivateArrow = useGameStore((state) => state.deactivateArrow)
  const targets = useGameStore((state) => state.targets)
  const hitTarget = useGameStore((state) => state.hitTarget)
  const addScore = useGameStore((state) => state.addScore)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const arrow = arrows.find((a) => a.id === id)
    if (!arrow || !arrow.isActive) return

    velocityRef.current.y -= GRAVITY * delta
    positionRef.current.add(velocityRef.current.clone().multiplyScalar(delta))

    meshRef.current.position.copy(positionRef.current)

    const speed = velocityRef.current.length()
    if (speed > 0.1) {
      const direction = velocityRef.current.clone().normalize()
      const angle = Math.atan2(direction.y, direction.z)
      meshRef.current.rotation.x = angle
    }

    for (const target of targets) {
      if (target.isHit) continue
      const distance = positionRef.current.distanceTo(target.position)
      if (distance < 0.8) {
        const horizontalDistance = Math.sqrt(
          Math.pow(positionRef.current.x - target.position.x, 2) +
          Math.pow(positionRef.current.y - target.position.y, 2)
        )
        let score = 0
        if (horizontalDistance <= 0.15) score = 10
        else if (horizontalDistance <= 0.35) score = 8
        else if (horizontalDistance <= 0.55) score = 6
        else if (horizontalDistance <= 0.75) score = 4
        else score = 2

        addScore(score)
        hitTarget(target.id)
        deactivateArrow(id)
        break
      }
    }

    if (positionRef.current.y < 0 || positionRef.current.z > 50 || positionRef.current.z < -200) {
      deactivateArrow(id)
    }
  })

  return (
    <mesh ref={meshRef} position={initialPosition.toArray()} castShadow>
      <coneGeometry args={[0.05, 0.8, 8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
  )
}
