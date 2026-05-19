import * as THREE from 'three'

export class Cone {
  constructor() {
    this.mesh = null
    this.coneHeight = 3
    this.coneRadius = 1.2
    this.targetX = 0
    this.currentX = 0
    this.moveSpeed = 0.15
    this.boundary = 10
    this.init()
  }

  init() {
    const group = new THREE.Group()

    const coneGeometry = new THREE.ConeGeometry(this.coneRadius, this.coneHeight, 32)
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0xD2691E,
      roughness: 0.7,
      metalness: 0.1
    })
    const cone = new THREE.Mesh(coneGeometry, coneMaterial)
    cone.position.y = this.coneHeight / 2
    cone.castShadow = true
    cone.receiveShadow = true
    group.add(cone)

    const rimGeometry = new THREE.TorusGeometry(this.coneRadius, 0.08, 16, 32)
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.6,
      metalness: 0.2
    })
    const rim = new THREE.Mesh(rimGeometry, rimMaterial)
    rim.rotation.x = Math.PI / 2
    rim.position.y = this.coneHeight
    rim.castShadow = true
    group.add(rim)

    const linesGeometry = new THREE.ConeGeometry(this.coneRadius * 0.98, this.coneHeight, 32, 5, true)
    const linesMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.0,
      wireframe: true
    })
    const lines = new THREE.Mesh(linesGeometry, linesMaterial)
    lines.position.y = this.coneHeight / 2
    group.add(lines)

    this.mesh = group
  }

  setPosition(x) {
    this.targetX = Math.max(-this.boundary, Math.min(this.boundary, x))
  }

  update(deltaTime) {
    this.currentX += (this.targetX - this.currentX) * this.moveSpeed
    this.mesh.position.x = this.currentX
  }

  getTopY() {
    return this.coneHeight
  }

  getTopX() {
    return this.currentX
  }

  getRadius() {
    return this.coneRadius
  }

  getMesh() {
    return this.mesh
  }

  reset() {
    this.targetX = 0
    this.currentX = 0
    this.mesh.position.x = 0
  }
}
