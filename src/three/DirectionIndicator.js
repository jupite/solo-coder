import * as THREE from 'three';
import { MoveDirection } from '../game/types.js';
import { GameConfig } from '../game/GameConfig.js';

export class DirectionIndicator {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.group = new THREE.Group();
    this.arrowX = null;
    this.arrowZ = null;
    this.currentDirection = MoveDirection.X;
    this.height = 0;

    this.createArrows();
    this.sceneManager.add(this.group);
    this.setVisible(false);
  }

  createArrows() {
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });

    this.arrowX = this.createArrow(arrowMaterial);
    this.arrowX.rotation.y = Math.PI / 2;
    this.group.add(this.arrowX);

    this.arrowZ = this.createArrow(arrowMaterial);
    this.arrowZ.rotation.x = Math.PI / 2;
    this.group.add(this.arrowZ);
  }

  createArrow(material) {
    const group = new THREE.Group();

    const shaftGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
    const shaft = new THREE.Mesh(shaftGeometry, material);
    shaft.position.y = 0.5;
    group.add(shaft);

    const headGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 1.2;
    group.add(head);

    return group;
  }

  setDirection(direction) {
    this.currentDirection = direction;
    this.arrowX.visible = direction === MoveDirection.X;
    this.arrowZ.visible = direction === MoveDirection.Z;
  }

  setHeight(layer) {
    this.height = layer * GameConfig.BLOCK_HEIGHT + 1;
    this.group.position.y = this.height;
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  update(deltaTime) {
  }

  dispose() {
    this.sceneManager.remove(this.group);
  }
}
