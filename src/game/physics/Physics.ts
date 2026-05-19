import { Stone } from '../scene/Stone'
import { GAME_CONFIG } from '../config'

export class Physics {
  stones: Stone[] = []

  addStone(stone: Stone) {
    this.stones.push(stone)
  }

  removeStone(stone: Stone) {
    const index = this.stones.indexOf(stone)
    if (index > -1) {
      this.stones.splice(index, 1)
    }
  }

  update(deltaTime: number) {
    this.stones.forEach((stone) => stone.update(deltaTime))
    this.checkCollisions()
  }

  checkCollisions() {
    const { STONE_RADIUS } = GAME_CONFIG
    const minDistance = STONE_RADIUS * 2

    for (let i = 0; i < this.stones.length; i++) {
      for (let j = i + 1; j < this.stones.length; j++) {
        const stone1 = this.stones[i]
        const stone2 = this.stones[j]

        if (stone1.isOutOfBounds || stone2.isOutOfBounds) continue

        const pos1 = stone1.getPosition()
        const pos2 = stone2.getPosition()

        const dx = pos2.x - pos1.x
        const dz = pos2.z - pos1.z
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (distance < minDistance && distance > 0) {
          this.handleCollision(stone1, stone2, dx, dz, distance)
        }
      }
    }
  }

  private handleCollision(
    stone1: Stone,
    stone2: Stone,
    dx: number,
    dz: number,
    distance: number,
  ) {
    const { STONE_RADIUS, STONE_MASS } = GAME_CONFIG
    const minDistance = STONE_RADIUS * 2

    const nx = dx / distance
    const nz = dz / distance

    const overlap = minDistance - distance
    const separationX = (nx * overlap) / 2
    const separationZ = (nz * overlap) / 2

    stone1.mesh.position.x -= separationX
    stone1.mesh.position.z -= separationZ
    stone2.mesh.position.x += separationX
    stone2.mesh.position.z += separationZ

    const v1x = stone1.velocity.x
    const v1z = stone1.velocity.y
    const v2x = stone2.velocity.x
    const v2z = stone2.velocity.y

    const dvx = v2x - v1x
    const dvz = v2z - v1z

    const dvDotN = dvx * nx + dvz * nz

    if (dvDotN > 0) return

    const restitution = 0.9
    const impulse = (-(1 + restitution) * dvDotN) / (1 / STONE_MASS + 1 / STONE_MASS)

    const impulseX = impulse * nx
    const impulseZ = impulse * nz

    stone1.velocity.x -= impulseX / STONE_MASS
    stone1.velocity.y -= impulseZ / STONE_MASS
    stone2.velocity.x += impulseX / STONE_MASS
    stone2.velocity.y += impulseZ / STONE_MASS

    stone1.isMoving = stone1.velocity.length() > GAME_CONFIG.MIN_VELOCITY
    stone2.isMoving = stone2.velocity.length() > GAME_CONFIG.MIN_VELOCITY
  }

  allStonesStopped(): boolean {
    return this.stones.every((stone) => !stone.isMoving)
  }

  clearStones() {
    this.stones = []
  }
}
