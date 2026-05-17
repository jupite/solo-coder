import * as THREE from 'three';

export class BowlingAlley {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.objects = [];
    
    this.alleyWidth = 1.0668;
    this.alleyLength = 18.288;
    this.alleyHeight = 0.085;
    
    this.createAlley();
    this.createGutters();
    this.createPinsArea();
  }

  createAlley() {
    const geometry = new THREE.BoxGeometry(this.alleyLength, this.alleyHeight, this.alleyWidth);
    const material = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const alley = new THREE.Mesh(geometry, material);
    alley.position.set(0, this.alleyHeight / 2, 0);
    this.scene.add(alley);
    this.objects.push(alley);

    this.physics.createBox(
      new CANNON.Vec3(0, this.alleyHeight / 2, 0),
      new CANNON.Vec3(this.alleyLength / 2, this.alleyHeight / 2, this.alleyWidth / 2),
      0
    );

    this.createStripePattern();
  }

  createStripePattern() {
    const stripeCount = 39;
    const stripeWidth = 0.4572;
    const gapWidth = 0.0508;
    
    for (let i = 0; i < stripeCount; i++) {
      const isDark = i % 2 === 0;
      const stripeGeometry = new THREE.BoxGeometry(stripeWidth, 0.086, this.alleyWidth);
      const stripeMaterial = new THREE.MeshStandardMaterial({
        color: isDark ? 0x1a1a1a : 0x333333,
        roughness: 0.7,
        metalness: 0.1
      });
      
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      const startPos = -this.alleyLength / 2 + 0.5;
      const posZ = startPos + i * (stripeWidth + gapWidth);
      stripe.position.set(posZ, this.alleyHeight / 2 + 0.001, 0);
      this.scene.add(stripe);
      this.objects.push(stripe);
    }
  }

  createGutters() {
    const gutterHeight = 0.15;
    const gutterWidth = 0.1;
    
    const gutterMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.9,
      metalness: 0.2
    });

    const leftGutter = new THREE.Mesh(
      new THREE.BoxGeometry(this.alleyLength, gutterHeight, gutterWidth),
      gutterMaterial
    );
    leftGutter.position.set(0, gutterHeight / 2, -this.alleyWidth / 2 - gutterWidth / 2);
    this.scene.add(leftGutter);
    this.objects.push(leftGutter);

    const rightGutter = new THREE.Mesh(
      new THREE.BoxGeometry(this.alleyLength, gutterHeight, gutterWidth),
      gutterMaterial
    );
    rightGutter.position.set(0, gutterHeight / 2, this.alleyWidth / 2 + gutterWidth / 2);
    this.scene.add(rightGutter);
    this.objects.push(rightGutter);

    this.physics.createBox(
      new CANNON.Vec3(0, gutterHeight / 2, -this.alleyWidth / 2 - gutterWidth / 2),
      new CANNON.Vec3(this.alleyLength / 2, gutterHeight / 2, gutterWidth / 2),
      0
    );

    this.physics.createBox(
      new CANNON.Vec3(0, gutterHeight / 2, this.alleyWidth / 2 + gutterWidth / 2),
      new CANNON.Vec3(this.alleyLength / 2, gutterHeight / 2, gutterWidth / 2),
      0
    );
  }

  createPinsArea() {
    const pinsAreaRadius = 1.5;
    const pinsAreaHeight = 0.1;
    
    const pinsAreaGeometry = new THREE.CylinderGeometry(
      pinsAreaRadius,
      pinsAreaRadius,
      pinsAreaHeight,
      32
    );
    const pinsAreaMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const pinsArea = new THREE.Mesh(pinsAreaGeometry, pinsAreaMaterial);
    pinsArea.position.set(this.alleyLength / 2 - 1.0, pinsAreaHeight / 2, 0);
    pinsArea.rotation.x = -Math.PI / 2;
    this.scene.add(pinsArea);
    this.objects.push(pinsArea);

    this.physics.createBox(
      new CANNON.Vec3(this.alleyLength / 2 - 1.0, pinsAreaHeight / 2, 0),
      new CANNON.Vec3(pinsAreaRadius, pinsAreaHeight / 2, pinsAreaRadius),
      0
    );
  }

  getPinsPosition() {
    return new THREE.Vector3(this.alleyLength / 2 - 1.0, 0.3, 0);
  }

  getBallStartPosition() {
    return new THREE.Vector3(-this.alleyLength / 2 + 2.0, 0.1, 0);
  }

  getAlleyDimensions() {
    return {
      width: this.alleyWidth,
      length: this.alleyLength,
      height: this.alleyHeight
    };
  }

  dispose() {
    this.objects.forEach(obj => {
      obj.geometry.dispose();
      obj.material.dispose();
      this.scene.remove(obj);
    });
    this.objects = [];
  }
}
