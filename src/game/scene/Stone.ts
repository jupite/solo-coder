import * as THREE from 'three'
import { GAME_CONFIG } from '../config'
import type { Team } from '../types'

export class Stone {
  mesh: THREE.Group
  velocity: THREE.Vector2
  isMoving: boolean
  team: Team
  id: string

  constructor(team: Team, id: string) {
    this.team = team
    this.id = id
    this.velocity = new THREE.Vector2(0, 0)
    this.isMoving = false
    this.mesh = new THREE.Group()
    this.createStone()
  }

  private createStone() {
    const { STONE_RADIUS, STONE_HEIGHT } = GAME_CONFIG

    const bodyGeometry = new THREE.CylinderGeometry(
      STONE_RADIUS,
      STONE_RADIUS,
      STONE_HEIGHT,
      32,
    )
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.team === 'player' ? 0xffd700 : 0xe53935,
      roughness: 0.3,
      metalness: 0.7,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.castShadow = true
    body.receiveShadow = true
    this.mesh.add(body)

    const handleGeometry = new THREE.CylinderGeometry(
      STONE_RADIUS * 0.3,
      STONE_RADIUS * 0.3,
      STONE_HEIGHT * 0.5,
      16,
    )
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
    })
    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.position.y = STONE_HEIGHT * 0.5
    handle.castShadow = true
    this.mesh.add(handle)

    const topGeometry = new THREE.CylinderGeometry(
      STONE_RADIUS * 0.8,
      STONE_RADIUS * 0.8,
      STONE_HEIGHT * 0.1,
      32,
    )
    const topMaterial = new THREE.MeshStandardMaterial({
      color: this.team === 'player' ? 0x2196f3 : 0x4caf50,
      roughness: 0.2,
    })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.y = STONE_HEIGHT * 0.35
    top.castShadow = true
    this.mesh.add(top)

    const edgeGeometry = new THREE.TorusGeometry(STONE_RADIUS, 0.02, 8, 32)
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x424242,
      roughness: 0.5,
    })
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial)
    edge.rotation.x = Math.PI / 2
    edge.position.y = -STONE_HEIGHT / 2
    this.mesh.add(edge)
  }

  setPosition(x: number, z: number) {
    this.mesh.position.set(x, GAME_CONFIG.STONE_HEIGHT / 2, z)
  }

  setVelocity(vx: number, vz: number) {
    this.velocity.set(vx, vz)
    this.isMoving = this.velocity.length() > GAME_CONFIG.MIN_VELOCITY
  }

  update(deltaTime: number) {
    if (!this.isMoving) return

    const { FRICTION, MIN_VELOCITY, RINK_WIDTH, RINK_LENGTH } = GAME_CONFIG

    this.velocity.multiplyScalar(1 - FRICTION * deltaTime * 60)

    if (this.velocity.length() < MIN_VELOCITY) {
      this.velocity.set(0, 0)
      this.isMoving = false
      return
    }

    const newX = this.mesh.position.x + this.velocity.x * deltaTime * 60
    const newZ = this.mesh.position.z + this.velocity.y * deltaTime * 60

    const halfWidth = RINK_WIDTH / 2 - GAME_CONFIG.STONE_RADIUS
    if (newX < -halfWidth || newX > halfWidth) {
      this.velocity.x *= -0.8
      this.mesh.position.x = Math.max(-halfWidth, Math.min(halfWidth, newX))
    } else {
      this.mesh.position.x = newX
    }

    const halfLength = RINK_LENGTH / 2 - GAME_CONFIG.STONE_RADIUS
    if (newZ < -halfLength || newZ > halfLength) {
      this.velocity.y *= -0.8
      this.mesh.position.z = Math.max(-halfLength, Math.min(halfLength, newZ))
    } else {
      this.mesh.position.z = newZ
    }

    this.mesh.rotation.x += this.velocity.y * deltaTime * 5
    this.mesh.rotation.z -= this.velocity.x * deltaTime * 5
  }

  stop() {
    this.velocity.set(0, 0)
    this.isMoving = false
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  getMesh(): THREE.Group {
    return this.mesh
  }
}
