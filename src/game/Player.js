import * as THREE from 'three'

export class Player {
  constructor(scene) {
    this.scene = scene
    this.mesh = null
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.isJumping = false
    this.jumpForce = 3.5
    this.gravity = 1.5
    this.initialY = 2
    this.createPlayer()
  }

  createPlayer() {
    const group = new THREE.Group()
    
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 1)
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90d9 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 2
    group.add(body)
    
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16)
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 3.5
    group.add(head)
    
    const leftArmGeometry = new THREE.BoxGeometry(0.3, 1, 0.3)
    const leftArmMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90d9 })
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial)
    leftArm.position.set(-1, 2, 0)
    group.add(leftArm)
    
    const rightArmGeometry = new THREE.BoxGeometry(0.3, 1, 0.3)
    const rightArmMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90d9 })
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial)
    rightArm.position.set(1, 2, 0)
    group.add(rightArm)
    
    const legGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4)
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5a87 })
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.4, 0.6, 0)
    group.add(leftLeg)
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.4, 0.6, 0)
    group.add(rightLeg)
    
    this.mesh = group
    this.scene.add(this.mesh)
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true
      this.velocity.y = this.jumpForce
    }
  }

  update(speed) {
    if (this.isJumping) {
      this.velocity.y -= this.gravity
      this.mesh.position.y += this.velocity.y
      
      if (this.mesh.position.y <= this.initialY) {
        this.mesh.position.y = this.initialY
        this.isJumping = false
        this.velocity.y = 0
      }
    }
    
    this.mesh.position.x += speed * 0.05
  }

  getBoundingBox() {
    const box = new THREE.Box3()
    box.setFromObject(this.mesh)
    return box
  }

  reset() {
    this.mesh.position.set(0, this.initialY, 0)
    this.velocity.set(0, 0, 0)
    this.isJumping = false
  }
}