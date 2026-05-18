import * as THREE from 'three'
import { GAME_CONFIG } from '../config'
import { Stone } from '../scene/Stone'
import type { ScoreDetail, Team } from '../types'

export class Scoring {
  static calculateScore(
    stones: Stone[],
    houseCenter: THREE.Vector3,
  ): {
    playerScore: number
    aiScore: number
    details: ScoreDetail[]
  } {
    const details: ScoreDetail[] = []
    const { HOUSE_RADIUSES } = GAME_CONFIG
    const maxRadius = HOUSE_RADIUSES[HOUSE_RADIUSES.length - 1]

    const stonesInHouse = stones
      .filter((stone) => {
        const pos = stone.getPosition()
        const dx = pos.x - houseCenter.x
        const dz = pos.z - houseCenter.z
        const distance = Math.sqrt(dx * dx + dz * dz)
        return distance <= maxRadius
      })
      .map((stone) => {
        const pos = stone.getPosition()
        const dx = pos.x - houseCenter.x
        const dz = pos.z - houseCenter.z
        const distance = Math.sqrt(dx * dx + dz * dz)
        return { stone, distance }
      })
      .sort((a, b) => a.distance - b.distance)

    stonesInHouse.forEach(({ stone, distance }) => {
      const score = this.getDistanceScore(distance)
      details.push({
        team: stone.team,
        distance,
        score,
      })
    })

    let playerScore = 0
    let aiScore = 0

    const playerStones = stonesInHouse.filter((s) => s.stone.team === 'player')
    const aiStones = stonesInHouse.filter((s) => s.stone.team === 'ai')

    if (playerStones.length > 0 && aiStones.length > 0) {
      const closestPlayer = playerStones[0].distance
      const closestAi = aiStones[0].distance

      if (closestPlayer < closestAi) {
        playerStones.forEach((s) => {
          if (s.distance < closestAi) {
            playerScore += this.getDistanceScore(s.distance)
          }
        })
      } else if (closestAi < closestPlayer) {
        aiStones.forEach((s) => {
          if (s.distance < closestPlayer) {
            aiScore += this.getDistanceScore(s.distance)
          }
        })
      }
    } else if (playerStones.length > 0) {
      playerStones.forEach((s) => {
        playerScore += this.getDistanceScore(s.distance)
      })
    } else if (aiStones.length > 0) {
      aiStones.forEach((s) => {
        aiScore += this.getDistanceScore(s.distance)
      })
    }

    return { playerScore, aiScore, details }
  }

  static getDistanceScore(distance: number): number {
    const { HOUSE_RADIUSES } = GAME_CONFIG

    if (distance <= HOUSE_RADIUSES[0]) return 10
    if (distance <= HOUSE_RADIUSES[1]) return 8
    if (distance <= HOUSE_RADIUSES[2]) return 6
    if (distance <= HOUSE_RADIUSES[3]) return 4
    return 0
  }

  static getClosestStone(
    stones: Stone[],
    houseCenter: THREE.Vector3,
    team?: Team,
  ): { stone: Stone; distance: number } | null {
    const filteredStones = team ? stones.filter((s) => s.team === team) : stones

    let closest: { stone: Stone; distance: number } | null = null

    filteredStones.forEach((stone) => {
      const pos = stone.getPosition()
      const dx = pos.x - houseCenter.x
      const dz = pos.z - houseCenter.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (!closest || distance < closest.distance) {
        closest = { stone, distance }
      }
    })

    return closest
  }
}
