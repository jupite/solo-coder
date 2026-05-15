import * as THREE from 'three'

export class Obstacle {
  constructor(scene, x, height) {
    this.scene = scene
    this.mesh = null
    this.passed = false
    this.createObstacle(x, height)
  }

  createObstacle(x, height) {
    const geometry = new THREE.BoxGeometry(1, height, 1)
    const material = new THREE.MeshPhongMaterial({ color: 0xff4444 })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.set(x, height / 2, 0)
    this.scene.add(this.mesh)
  }

  getBoundingBox() {
    const box = new THREE.Box3()
    box.setFromObject(this.mesh)
    return box
  }

  remove() {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene
    this.obstacles = []
    this.spawnInterval = 12
    this.minSpawnInterval = 4
    this.obstacleHeightRange = { min: 1.5, max: 4.5 }
    this.spawnDistance = 50
  }

  spawnObstacle(playerX) {
    const height = this.obstacleHeightRange.min + 
      Math.random() * (this.obstacleHeightRange.max - this.obstacleHeightRange.min)
    const farthestObstacle = this.obstacles.length > 0 
      ? Math.max(...this.obstacles.map(o => o.mesh.position.x))
      : playerX
    const x = farthestObstacle + this.spawnInterval + Math.random() * 3
    const obstacle = new Obstacle(this.scene, x, height)
    this.obstacles.push(obstacle)
  }

  update(playerX, speed) {
    const farthestObstacle = this.obstacles.length > 0 
      ? Math.max(...this.obstacles.map(o => o.mesh.position.x))
      : playerX
    
    if (farthestObstacle < playerX + this.spawnDistance) {
      this.spawnObstacle(playerX)
    }
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i]
      
      if (obstacle.mesh.position.x < playerX - 20) {
        obstacle.remove()
        this.obstacles.splice(i, 1)
      }
    }
  }

  checkPassedObstacles(playerX) {
    let count = 0
    for (const obstacle of this.obstacles) {
      if (!obstacle.passed && obstacle.mesh.position.x < playerX - 2) {
        obstacle.passed = true
        count++
      }
    }
    return count
  }

  adjustSpawnInterval(score) {
    const targetInterval = Math.max(this.minSpawnInterval, 8 - score * 0.05)
    this.spawnInterval = targetInterval
  }

  reset() {
    for (const obstacle of this.obstacles) {
      obstacle.remove()
    }
    this.obstacles = []
    this.spawnInterval = 8
  }
}