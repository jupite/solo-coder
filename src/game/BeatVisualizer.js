import * as THREE from 'three';

export class BeatVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.visualizers = [];
    this.beatPulse = 0;
  }

  init() {
    const colors = [0xFF3366, 0x3366FF, 0xFFCC00];
    const positions = [-4, 0, 4];

    colors.forEach((color, index) => {
      const group = this.createVisualizerBar(color, positions[index]);
      this.scene.add(group);
      this.visualizers.push(group);
    });

    this.createBackgroundPulse();
  }

  createVisualizerBar(color, xPosition) {
    const group = new THREE.Group();
    group.position.set(xPosition, -3, -4);

    const barCount = 5;
    const barWidth = 0.3;
    const barSpacing = 0.4;

    for (let i = 0; i < barCount; i++) {
      const geometry = new THREE.BoxGeometry(barWidth, 0.5, 0.3);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
      });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = (i - (barCount - 1) / 2) * barSpacing;
      bar.userData.originalY = 0;
      bar.userData.targetScale = 1;
      group.add(bar);
    }

    return group;
  }

  createBackgroundPulse() {
    const geometry = new THREE.PlaneGeometry(50, 30);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1a0033,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    this.backgroundPulse = new THREE.Mesh(geometry, material);
    this.backgroundPulse.position.set(0, 5, -8);
    this.scene.add(this.backgroundPulse);
  }

  triggerBeat() {
    this.beatPulse = 1;

    this.visualizers.forEach((group, groupIndex) => {
      group.children.forEach((bar, barIndex) => {
        bar.userData.targetScale = 0.5 + Math.random() * 1.5;
        bar.material.opacity = 0.8;
      });
    });

    if (this.backgroundPulse) {
      this.backgroundPulse.material.opacity = 0.5;
    }
  }

  update(delta, isFever) {
    this.beatPulse = Math.max(0, this.beatPulse - delta * 2);

    this.visualizers.forEach((group) => {
      group.children.forEach((bar) => {
        const currentScale = bar.scale.y;
        const targetScale = bar.userData.targetScale;
        bar.scale.y = currentScale + (targetScale - currentScale) * delta * 10;
        bar.userData.targetScale = Math.max(0.3, targetScale - delta * 3);
        bar.material.opacity = Math.max(0.3, bar.material.opacity - delta * 2);
      });
    });

    if (this.backgroundPulse) {
      this.backgroundPulse.material.opacity = Math.max(
        0.1,
        this.backgroundPulse.material.opacity - delta * 1.5
      );

      if (isFever) {
        this.backgroundPulse.material.color.setHex(0x330033);
      } else {
        this.backgroundPulse.material.color.setHex(0x1a0033);
      }
    }
  }
}
