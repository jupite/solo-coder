import * as THREE from 'three';

export const PowerUpType = {
  MULTI_BALL: 'multi_ball',
  SLOW_DOWN: 'slow_down',
  SPEED_UP: 'speed_up',
  WIDE_PADDLE: 'wide_paddle'
};

const PowerUpConfig = {
  [PowerUpType.MULTI_BALL]: {
    color: 0xffd700,
    duration: 0,
    dropChance: 0.15,
    icon: '🔮'
  },
  [PowerUpType.SLOW_DOWN]: {
    color: 0x4ecdc4,
    duration: 10,
    dropChance: 0.12,
    icon: '🐢'
  },
  [PowerUpType.SPEED_UP]: {
    color: 0xff6b6b,
    duration: 8,
    dropChance: 0.1,
    icon: '⚡'
  },
  [PowerUpType.WIDE_PADDLE]: {
    color: 0x95e1d3,
    duration: 15,
    dropChance: 0.12,
    icon: '📏'
  }
};

export class PowerUp {
  constructor(scene, position, type) {
    this.scene = scene;
    this.type = type;
    this.position = { ...position };
    this.config = PowerUpConfig[type];
    this.speed = 2;
    this.isActive = true;
    this.rotationSpeed = 2;
    this.bobOffset = Math.random() * Math.PI * 2;

    this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.OctahedronGeometry(0.5, 0);
    const material = new THREE.MeshStandardMaterial({
      color: this.config.color,
      metalness: 0.6,
      roughness: 0.2,
      emissive: this.config.color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.castShadow = true;

    const glowGeometry = new THREE.OctahedronGeometry(0.7, 0);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      transparent: true,
      opacity: 0.2
    });
    this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glow);

    this.scene.add(this.mesh);
  }

  update(deltaTime) {
    if (!this.isActive) return;

    this.position.y -= this.speed * deltaTime;
    this.mesh.rotation.x += this.rotationSpeed * deltaTime;
    this.mesh.rotation.y += this.rotationSpeed * deltaTime;

    const bob = Math.sin(Date.now() * 0.005 + this.bobOffset) * 0.1;
    this.mesh.position.set(this.position.x, this.position.y + bob, this.position.z);

    if (this.position.y < -1) {
      this.isActive = false;
    }
  }

  checkPaddleCollision(paddle) {
    if (!this.isActive) return false;

    const dx = this.position.x - paddle.position.x;
    const dz = this.position.z - paddle.position.z;
    const dy = this.position.y - paddle.position.y;

    const halfWidth = paddle.width / 2 + 0.5;
    const halfDepth = paddle.depth / 2 + 0.5;
    const halfHeight = paddle.height / 2 + 0.5;

    if (Math.abs(dx) < halfWidth && Math.abs(dz) < halfDepth && Math.abs(dy) < halfHeight) {
      this.isActive = false;
      return true;
    }
    return false;
  }

  destroy() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export class PowerUpManager {
  constructor(scene) {
    this.scene = scene;
    this.powerUps = [];
    this.activeEffects = [];
  }

  tryDropPowerUp(position) {
    const rand = Math.random();
    let cumulativeChance = 0;

    for (const type of Object.values(PowerUpType)) {
      cumulativeChance += PowerUpConfig[type].dropChance;
      if (rand < cumulativeChance) {
        const powerUp = new PowerUp(this.scene, position, type);
        this.powerUps.push(powerUp);
        return;
      }
    }
  }

  update(deltaTime, paddle, game) {
    this.powerUps.forEach(powerUp => {
      powerUp.update(deltaTime);

      if (powerUp.isActive && powerUp.checkPaddleCollision(paddle)) {
        this.applyPowerUp(powerUp.type, game);
      }
    });

    this.powerUps = this.powerUps.filter(p => {
      if (!p.isActive) {
        p.destroy();
        return false;
      }
      return true;
    });

    this.updateActiveEffects(deltaTime, game);
  }

  applyPowerUp(type, game) {
    const config = PowerUpConfig[type];

    switch (type) {
      case PowerUpType.MULTI_BALL:
        game.spawnExtraBalls(2);
        break;
      case PowerUpType.SLOW_DOWN:
        this.addEffect(type, config.duration, game);
        game.setGlobalSpeedMultiplier(0.5);
        break;
      case PowerUpType.SPEED_UP:
        this.addEffect(type, config.duration, game);
        game.setGlobalSpeedMultiplier(1.5);
        break;
      case PowerUpType.WIDE_PADDLE:
        this.addEffect(type, config.duration, game);
        game.setPaddleWidth(5);
        break;
    }
  }

  addEffect(type, duration, game) {
    this.activeEffects = this.activeEffects.filter(e => e.type !== type);
    this.activeEffects.push({
      type,
      remainingTime: duration,
      totalTime: duration
    });
  }

  updateActiveEffects(deltaTime, game) {
    this.activeEffects.forEach(effect => {
      effect.remainingTime -= deltaTime;
    });

    const expired = this.activeEffects.filter(e => e.remainingTime <= 0);
    expired.forEach(effect => {
      this.removeEffect(effect.type, game);
    });

    this.activeEffects = this.activeEffects.filter(e => e.remainingTime > 0);
  }

  removeEffect(type, game) {
    switch (type) {
      case PowerUpType.SLOW_DOWN:
      case PowerUpType.SPEED_UP:
        game.setGlobalSpeedMultiplier(1);
        break;
      case PowerUpType.WIDE_PADDLE:
        game.setPaddleWidth(3);
        break;
    }
  }

  getActiveEffects() {
    return this.activeEffects;
  }

  clear() {
    this.powerUps.forEach(p => p.destroy());
    this.powerUps = [];
    this.activeEffects = [];
  }
}
