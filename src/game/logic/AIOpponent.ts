import { GAME_CONFIG } from '../config'
import { Stone } from '../scene/Stone'
import type { Team } from '../types'

export class AIOpponent {
  calculateThrow(
    stones: Stone[],
    playerStonesThrown: number,
    aiStonesThrown: number,
  ): { power: number; angle: number } {
    const houseCenterZ = GAME_CONFIG.HOUSE_CENTER_Z
    const validStones = stones.filter((s) => !s.isOutOfBounds)
    const playerStones = validStones.filter((s) => s.team === 'player' && !s.isMoving)
    const aiStones = validStones.filter((s) => s.team === 'ai' && !s.isMoving)

    const closestPlayerStone = this.findClosestToHouse(playerStones)
    const closestAiStone = this.findClosestToHouse(aiStones)

    const playerInHouse = closestPlayerStone?.distance ?? Infinity < GAME_CONFIG.HOUSE_RADIUSES[3]
    const aiInHouse = closestAiStone?.distance ?? Infinity < GAME_CONFIG.HOUSE_RADIUSES[3]

    if (aiStonesThrown < 2) {
      return this.aimForHouse()
    }

    if (playerInHouse && !aiInHouse) {
      if (closestPlayerStone && Math.random() > 0.3) {
        return this.aimToHit(closestPlayerStone.stone)
      }
    }

    if (aiStonesThrown >= 3) {
      if (playerInHouse && aiInHouse) {
        if (closestPlayerStone && closestAiStone) {
          if (closestPlayerStone.distance < closestAiStone.distance) {
            if (Math.random() > 0.4) {
              return this.aimToHit(closestPlayerStone.stone)
            }
          }
        }
      }
      if (!aiInHouse) {
        return this.aimForHouse()
      }
    }

    return this.aimForHouse()
  }

  private findClosestToHouse(stones: Stone[]): { stone: Stone; distance: number } | null {
    const houseCenter = GAME_CONFIG.HOUSE_CENTER_Z
    let closest: { stone: Stone; distance: number } | null = null

    stones
      .filter((s) => !s.isOutOfBounds)
      .forEach((stone) => {
        const pos = stone.getPosition()
        const dx = pos.x
        const dz = pos.z - houseCenter
        const distance = Math.sqrt(dx * dx + dz * dz)
        if (!closest || distance < closest.distance) {
          closest = { stone, distance }
        }
      })

    return closest
  }

  private aimForHouse(): { power: number; angle: number } {
    const basePower = 2.2 + Math.random() * 0.6
    const angle = (Math.random() - 0.5) * 0.15
    return { power: basePower, angle }
  }

  private aimToHit(targetStone: Stone): { power: number; angle: number } {
    const targetPos = targetStone.getPosition()
    const startX = GAME_CONFIG.THROW_START_X
    const startZ = GAME_CONFIG.THROW_START_Z

    const dx = targetPos.x - startX
    const dz = targetPos.z - startZ
    const angle = Math.atan2(dx, dz)

    const distance = Math.sqrt(dx * dx + dz * dz)
    const power = Math.min(GAME_CONFIG.MAX_POWER, distance * 0.12 + Math.random() * 0.5)

    return { power, angle }
  }

  createThrow(
    stones: Stone[],
    playerStonesThrown: number,
    aiStonesThrown: number,
    team: Team,
    id: string,
  ): Stone {
    const { power, angle } = this.calculateThrow(stones, playerStonesThrown, aiStonesThrown)
    const stone = new Stone(team, id)
    stone.setPosition(GAME_CONFIG.THROW_START_X, GAME_CONFIG.THROW_START_Z)

    const vx = Math.sin(angle) * power
    const vz = -Math.cos(angle) * power
    stone.setVelocity(vx, vz)

    return stone
  }
}
