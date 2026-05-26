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
  const groupRef = useRef<THREE.Group>(null)
  const positionRef = useRef(new THREE.Vector3().copy(initialPosition))
  const velocityRef = useRef(new THREE.Vector3().copy(initialVelocity))

  const arrows = useGameStore((state) => state.arrows)
  const deactivateArrow = useGameStore((state) => state.deactivateArrow)
  const targets = useGameStore((state) => state.targets)
  const hitTarget = useGameStore((state) => state.hitTarget)
  const addScore = useGameStore((state) => state.addScore)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const arrow = arrows.find((a) => a.id === id)
    if (!arrow || !arrow.isActive) return

    velocityRef.current.y -= GRAVITY * delta
    positionRef.current.add(velocityRef.current.clone().multiplyScalar(delta))

    groupRef.current.position.copy(positionRef.current)

    const speed = velocityRef.current.length()
    if (speed > 0.1) {
      const direction = velocityRef.current.clone().normalize()

      const up = new THREE.Vector3(0, 1, 0)
      const arrowQuaternion = new THREE.Quaternion()
      arrowQuaternion.setFromUnitVectors(up, direction)

      groupRef.current.quaternion.copy(arrowQuaternion)
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

    if (positionRef.current.y < 0 || positionRef.current.z > 50 || positionRef.current.z < -300 || positionRef.current.x > 50 || positionRef.current.x < -50) {
      deactivateArrow(id)
    }
  })

  return (
    <group ref={groupRef} position={initialPosition.toArray()}>
      <mesh castShadow>
        <coneGeometry args={[0.06, 0.3, 8]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, -0.8, 0]} castShadow>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      <mesh position={[0.1, -0.8, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
    </group>
  )
}
