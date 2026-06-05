'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, Monster as MonsterType } from '@/store/gameStore'

const MONSTER_MOVE_SPEED = 0.05
const MONSTER_ATTACK_COOLDOWN = 1500

interface MonsterProps {
  monster: MonsterType
}

export function Pigman({ monster }: MonsterProps) {
  const meshRef = useRef<THREE.Group>(null)
  const { playerPosition, takeDamage, updateMonster, showMessage } = useGameStore()

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(monster.position[0], 0, monster.position[2])
    }
  }, [])

  useFrame(() => {
    if (!meshRef.current) return

    const dist = Math.sqrt(
      Math.pow(monster.position[0] - playerPosition[0], 2) +
      Math.pow(monster.position[2] - playerPosition[2], 2)
    )

    let newPosition = [...monster.position] as [number, number, number]
    let newAggro = monster.isAggro

    if (dist < monster.detectRange || monster.isAggro) {
      newAggro = true

      if (dist > monster.attackRange) {
        const dx = playerPosition[0] - monster.position[0]
        const dz = playerPosition[2] - monster.position[2]
        const length = Math.sqrt(dx * dx + dz * dz)
        const normalizedDx = dx / length
        const normalizedDz = dz / length

        newPosition = [
          monster.position[0] + normalizedDx * MONSTER_MOVE_SPEED,
          0,
          monster.position[2] + normalizedDz * MONSTER_MOVE_SPEED,
        ]

        const angle = Math.atan2(dx, dz)
        meshRef.current.rotation.y = angle
      } else {
        const now = Date.now()
        if (now - monster.lastAttackTime > MONSTER_ATTACK_COOLDOWN) {
          takeDamage(monster.damage)
          updateMonster(monster.id, { lastAttackTime: now })
        }
      }
    } else {
      if (Math.random() < 0.01) {
        const randomAngle = Math.random() * Math.PI * 2
        newPosition = [
          monster.position[0] + Math.cos(randomAngle) * 0.1,
          0,
          monster.position[2] + Math.sin(randomAngle) * 0.1,
        ]
      }
    }

    if (newPosition[0] !== monster.position[0] || newPosition[2] !== monster.position[2] || newAggro !== monster.isAggro) {
      updateMonster(monster.id, { position: newPosition, isAggro: newAggro })
    }

    meshRef.current.position.set(newPosition[0], 0, newPosition[2])
  })

  const healthPercentage = monster.health / monster.maxHealth

  return (
    <group ref={meshRef} position={monster.position as [number, number, number]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.7, 4, 8]} />
        <meshStandardMaterial color={monster.isAggro ? '#ff6b6b' : '#f5b041'} />
      </mesh>

      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#f5b041" />
      </mesh>

      <mesh position={[-0.15, 1.25, 0.25]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.15, 1.25, 0.25]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      <mesh position={[0, 1, 0.4]}>
        <boxGeometry args={[0.1, 0.05, 0.08]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      <mesh position={[0.5, 0.6, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[0.5, 0.95, 0]}>
        <boxGeometry args={[0.2, 0.08, 0.05]} />
        <meshStandardMaterial color="#708090" metalness={0.8} />
      </mesh>

      <group position={[0, 1.7, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.05, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.6 * healthPercentage, 0.05, 0.1]} />
          <meshStandardMaterial color={healthPercentage > 0.5 ? '#2ecc71' : healthPercentage > 0.25 ? '#f39c12' : '#e74c3c'} />
        </mesh>
      </group>

      {monster.isAggro && (
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  )
}

export function MonsterManager() {
  const { monsters } = useGameStore()

  return (
    <>
      {monsters.map((monster) => (
        <Pigman key={monster.id} monster={monster} />
      ))}
    </>
  )
}
