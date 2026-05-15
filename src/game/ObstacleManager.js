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
    this.lastSpawnX = 0
    this.spawnInterval = 8
    this.minSpawnInterval = 2
    this.obstacleHeightRange = { min: 2, max: 5 }
    this.nextSpawnX = 15
  }

  spawnObstacle() {
    const height = this.obstacleHeightRange.min + 
      Math.random() * (this.obstacleHeightRange.max - this.obstacleHeightRange.min)
    const obstacle = new Obstacle(this.scene, this.nextSpawnX, height)
    this.obstacles.push(obstacle)
    this.nextSpawnX += this.spawnInterval + Math.random() * 2
  }

  update(speed) {
    this.nextSpawnX -= speed * 0.16
    
    if (this.nextSpawnX <= 30) {
      this.spawnObstacle()
    }
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i]
      obstacle.mesh.position.x -= speed * 0.16
      
      if (obstacle.mesh.position.x < -20) {
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
    const targetInterval = Math.max(this.minSpawnInterval, this.spawnInterval - score * 0.05)
    this.spawnInterval = targetInterval
  }

  reset() {
    for (const obstacle of this.obstacles) {
      obstacle.remove()
    }
    this.obstacles = []
    this.nextSpawnX = 15
    this.spawnInterval = 8
  }
}