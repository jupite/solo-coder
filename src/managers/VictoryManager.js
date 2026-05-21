import * as THREE from 'three';

class VictoryManager {
  constructor(sceneManager, pieceManager) {
    this.sceneManager = sceneManager;
    this.pieceManager = pieceManager;
    
    this.startTime = null;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.isVictory = false;
    
    this.timerElement = document.getElementById('timer');
    this.victoryScreen = document.getElementById('victory-screen');
    this.finalTimeElement = document.getElementById('final-time');
    this.pieceCounter = document.getElementById('piece-counter');
    
    this.victoryParticles = [];
    this.victoryLights = [];
    
    this.start();
  }

  start() {
    this.startTime = Date.now();
    this.isRunning = true;
    this.isVictory = false;
    this.updateTimer();
  }

  updateTimer() {
    if (!this.isRunning || this.isVictory) return;
    
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    this.timerElement.textContent = this.formatTime(this.elapsedTime);
    
    const completed = this.pieceManager.getCompletedCount();
    const total = this.pieceManager.getTotalCount();
    this.pieceCounter.textContent = `已完成: ${completed} / ${total}`;
    
    if (this.pieceManager.isAllSnapped()) {
      this.triggerVictory();
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  triggerVictory() {
    if (this.isVictory) return;
    
    this.isVictory = true;
    this.isRunning = false;
    
    this.finalTimeElement.textContent = `用时: ${this.formatTime(this.elapsedTime)}`;
    
    setTimeout(() => {
      this.victoryScreen.classList.add('show');
    }, 500);
    
    this.playVictoryAnimation();
  }

  playVictoryAnimation() {
    this.createVictoryParticles();
    this.createVictoryLights();
    this.animateStatue();
    
    const animate = () => {
      if (!this.isVictory) return;
      
      this.updateVictoryParticles();
      this.updateVictoryLights();
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  createVictoryParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.3 + 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    this.victoryParticles = new THREE.Points(geometry, material);
    this.sceneManager.scene.add(this.victoryParticles);
  }

  updateVictoryParticles() {
    if (!this.victoryParticles) return;
    
    const positions = this.victoryParticles.geometry.attributes.position.array;
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += 0.02 + Math.sin(time + i) * 0.01;
      
      if (positions[i * 3 + 1] > 15) {
        positions[i * 3 + 1] = 0;
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
    
    this.victoryParticles.geometry.attributes.position.needsUpdate = true;
    this.victoryParticles.rotation.y = time * 0.1;
  }

  createVictoryLights() {
    const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0xffe66d];
    
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(colors[i], 2, 15);
      const angle = (i / 4) * Math.PI * 2;
      light.position.set(
        Math.cos(angle) * 5,
        5,
        Math.sin(angle) * 5
      );
      this.sceneManager.scene.add(light);
      this.victoryLights.push(light);
    }
  }

  updateVictoryLights() {
    const time = Date.now() * 0.001;
    
    this.victoryLights.forEach((light, i) => {
      const angle = time * 0.5 + (i / 4) * Math.PI * 2;
      light.position.x = Math.cos(angle) * 5;
      light.position.z = Math.sin(angle) * 5;
      light.position.y = 5 + Math.sin(time * 2 + i) * 2;
      light.intensity = 2 + Math.sin(time * 3 + i) * 1;
    });
  }

  animateStatue() {
    const pieces = this.pieceManager.getPieces();
    const startTime = Date.now();
    const duration = 2000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      pieces.forEach((piece, i) => {
        const delay = i * 100;
        if (elapsed > delay) {
          const pieceProgress = Math.min((elapsed - delay) / duration, 1);
          const pieceEased = 1 - Math.pow(1 - pieceProgress, 3);
          
          piece.scale.setScalar(0.9 + pieceEased * 0.1);
        }
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.floatAnimation();
      }
    };
    
    animate();
  }

  floatAnimation() {
    const pieces = this.pieceManager.getPieces();
    
    const animate = () => {
      if (!this.isVictory) return;
      
      const time = Date.now() * 0.001;
      
      pieces.forEach((piece, i) => {
        const baseY = piece.userData.targetPosition.y;
        piece.position.y = baseY + Math.sin(time * 2 + i * 0.5) * 0.05;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  reset() {
    this.isVictory = false;
    this.victoryScreen.classList.remove('show');
    
    if (this.victoryParticles) {
      this.sceneManager.scene.remove(this.victoryParticles);
      this.victoryParticles.geometry.dispose();
      this.victoryParticles.material.dispose();
      this.victoryParticles = null;
    }
    
    this.victoryLights.forEach(light => {
      this.sceneManager.scene.remove(light);
    });
    this.victoryLights = [];
    
    this.start();
  }
}

export default VictoryManager;
