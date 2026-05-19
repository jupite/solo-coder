import * as THREE from 'three'

export class IceCreamBall {
  constructor(radius = 1, color = null) {
    this.radius = radius
    this.color = color || this.getRandomColor()
    this.mesh = null
    this.isFalling = true
    this.isStacked = false
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.angularVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    )
    this.init()
  }

  getRandomColor() {
    const colors = [
      0xFF6B6B,
      0x4ECDC4,
      0xFFE66D,
      0xFF8C42,
      0xA8E6CF,
      0xFFD93D,
      0xFF6B9D,
      0xC084FC,
      0x95E1D3,
      0xF38181
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  init() {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.3,
      metalness: 0.1
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    const highlightGeometry = new THREE.SphereGeometry(this.radius * 0.95, 32, 32)
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.3
    })
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial)
    highlight.position.set(-this.radius * 0.3, this.radius * 0.3, this.radius * 0.3)
    highlight.scale.set(0.4, 0.4, 0.4)
    this.mesh.add(highlight)
  }

  setPosition(x, y, z = 0) {
    this.mesh.position.set(x, y, z)
  }

  getPosition() {
    return this.mesh.position.clone()
  }

  getRadius() {
    return this.radius
  }

  getMesh() {
    return this.mesh
  }

  setStacked() {
    this.isFalling = false
    this.isStacked = true
    this.velocity.set(0, 0, 0)
    this.angularVelocity.set(0, 0, 0)
  }

  update(deltaTime, gravity) {
    if (this.isFalling) {
      this.velocity.y -= gravity * deltaTime
      this.mesh.position.y += this.velocity.y * deltaTime
      this.mesh.rotation.x += this.angularVelocity.x
      this.mesh.rotation.y += this.angularVelocity.y
      this.mesh.rotation.z += this.angularVelocity.z
    }
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
