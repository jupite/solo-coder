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
    this.nextSpawnX = 30
  }

  spawnObstacle(x) {
    const height = this.obstacleHeightRange.min + 
      Math.random() * (this.obstacleHeightRange.max - this.obstacleHeightRange.min)
    const obstacle = new Obstacle(this.scene, x, height)
    this.obstacles.push(obstacle)
  }

  update(playerX, speed) {
    while (this.nextSpawnX < playerX + 80) {
      this.spawnObstacle(this.nextSpawnX)
      this.nextSpawnX += this.spawnInterval + Math.random() * 4
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
    this.spawnInterval = Math.max(this.minSpawnInterval, 12 - score * 0.02)
  }

  reset() {
    for (const obstacle of this.obstacles) {
      obstacle.remove()
    }
    this.obstacles = []
    this.nextSpawnX = 30
    this.spawnInterval = 12
  }
}