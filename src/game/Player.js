import * as THREE from 'three';
import { Physics } from './Physics.js';

export class Player {
  constructor(scene, startPosition) {
    this.scene = scene;
    this.mesh = null;
    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3(6, -1, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.speed = 0;
    this.terrainHeight = 0;
    this.physics = new Physics();
    this.createModel();
  }

  createModel() {
    this.mesh = new THREE.Group();

    const wingWidth = 12;
    const wingDepth = 5;
    const wingArcHeight = 2;
    const wingSegments = 20;
    const ribCount = 9;

    const canopyGroup = new THREE.Group();

    const topPoints = [];
    const bottomPoints = [];
    for (let i = 0; i <= wingSegments; i++) {
      const t = i / wingSegments;
      const x = (t - 0.5) * wingWidth;
      const arcY = Math.sin(t * Math.PI) * wingArcHeight;
      const widthFactor = Math.sin(t * Math.PI) * 0.3 + 0.7;
      topPoints.push(new THREE.Vector3(x, arcY + 4, -wingDepth * 0.5 * widthFactor));
      bottomPoints.push(new THREE.Vector3(x, arcY + 3.5, wingDepth * 0.5 * widthFactor));
    }

    const cellWidth = wingWidth / (ribCount - 1);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95
    });

    for (let i = 0; i < ribCount - 1; i++) {
      const startX = -wingWidth / 2 + i * cellWidth;
      const endX = startX + cellWidth;

      const cellShape = new THREE.Shape();
      const segments = 4;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const x = startX + t * cellWidth;
        const normalizedX = (x + wingWidth / 2) / wingWidth;
        const arcY = Math.sin(normalizedX * Math.PI) * wingArcHeight;
        const widthFactor = Math.sin(normalizedX * Math.PI) * 0.3 + 0.7;
        if (j === 0) {
          cellShape.moveTo(x, arcY + 4);
        } else {
          cellShape.lineTo(x, arcY + 4);
        }
      }
      for (let j = segments; j >= 0; j--) {
        const t = j / segments;
        const x = startX + t * cellWidth;
        const normalizedX = (x + wingWidth / 2) / wingWidth;
        const arcY = Math.sin(normalizedX * Math.PI) * wingArcHeight;
        const widthFactor = Math.sin(normalizedX * Math.PI) * 0.3 + 0.7;
        cellShape.lineTo(x, arcY + 3.5);
      }

      const cellExtrude = new THREE.ExtrudeGeometry(cellShape, {
        depth: 0.02,
        bevelEnabled: false
      });
      cellExtrude.rotateX(Math.PI / 2);

      const cell = new THREE.Mesh(cellExtrude, canopyMat);
      canopyGroup.add(cell);

      const topGeo = new THREE.BufferGeometry();
      const topVerts = [];
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const x = startX + t * cellWidth;
        const normalizedX = (x + wingWidth / 2) / wingWidth;
        const arcY = Math.sin(normalizedX * Math.PI) * wingArcHeight;
        const widthFactor = Math.sin(normalizedX * Math.PI) * 0.3 + 0.7;
        topVerts.push(x, arcY + 4, -wingDepth * 0.5 * widthFactor);
        topVerts.push(x, arcY + 4, wingDepth * 0.5 * widthFactor);
      }
      topGeo.setAttribute('position', new THREE.Float32BufferAttribute(topVerts, 3));
      const topIndices = [];
      for (let j = 0; j < segments * 2; j += 2) {
        topIndices.push(j, j + 1, j + 2);
        topIndices.push(j + 1, j + 3, j + 2);
      }
      topGeo.setIndex(topIndices);
      topGeo.computeVertexNormals();

      const topPanel = new THREE.Mesh(topGeo, canopyMat);
      canopyGroup.add(topPanel);
    }

    const ribMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.5,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < ribCount; i++) {
      const t = i / (ribCount - 1);
      const x = (t - 0.5) * wingWidth;
      const arcY = Math.sin(t * Math.PI) * wingArcHeight;
      const widthFactor = Math.sin(t * Math.PI) * 0.3 + 0.7;

      const ribShape = new THREE.Shape();
      ribShape.moveTo(-0.01, arcY + 4);
      ribShape.quadraticCurveTo(0, arcY + 3.2, 0, arcY + 3.5);
      ribShape.lineTo(0, arcY + 3.5);
      ribShape.lineTo(-0.01, arcY + 3.5);

      const ribGeo = new THREE.PlaneGeometry(wingDepth * widthFactor * 0.9, wingArcHeight * 0.6, 1, 1);
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(x, arcY + 3.7, 0);
      rib.rotation.y = Math.PI / 2;
      canopyGroup.add(rib);
    }

    const leadingEdgeGeo = new THREE.TorusGeometry(wingWidth / 2 * 0.95, 0.15, 8, 32, Math.PI);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.3
    });
    const leadingEdge = new THREE.Mesh(leadingEdgeGeo, edgeMat);
    leadingEdge.position.y = 4 + wingArcHeight * 0.5;
    leadingEdge.rotation.z = Math.PI / 2;
    leadingEdge.rotation.y = Math.PI / 2;
    canopyGroup.add(leadingEdge);

    const cellMat = new THREE.MeshStandardMaterial({
      color: 0xff6666,
      side: THREE.DoubleSide,
      roughness: 0.6,
      transparent: true,
      opacity: 0.8
    });
    for (let i = 0; i < ribCount - 1; i += 2) {
      const t = (i + 0.5) / (ribCount - 1);
      const x = (t - 0.5) * wingWidth;
      const arcY = Math.sin(t * Math.PI) * wingArcHeight;
      const widthFactor = Math.sin(t * Math.PI) * 0.3 + 0.7;

      const cellEndGeo = new THREE.PlaneGeometry(0.8, wingArcHeight * 0.4);
      const cellEnd = new THREE.Mesh(cellEndGeo, cellMat);
      cellEnd.position.set(x, arcY + 3.8, wingDepth * 0.4 * widthFactor);
      canopyGroup.add(cellEnd);
    }

    this.mesh.add(canopyGroup);

    const frameGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.7,
      roughness: 0.4
    });

    const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
    const leftBar = new THREE.Mesh(barGeo, frameMat);
    leftBar.rotation.z = Math.PI / 6;
    leftBar.position.set(-0.8, 1.5, 0);
    frameGroup.add(leftBar);

    const rightBar = new THREE.Mesh(barGeo, frameMat);
    rightBar.rotation.z = -Math.PI / 6;
    rightBar.position.set(0.8, 1.5, 0);
    frameGroup.add(rightBar);

    const crossBarGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);
    const crossBar = new THREE.Mesh(crossBarGeo, frameMat);
    crossBar.rotation.z = Math.PI / 2;
    crossBar.position.set(0, 0.5, 0);
    frameGroup.add(crossBar);

    const seatGeo = new THREE.BoxGeometry(1.2, 0.1, 1);
    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8
    });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, -0.2, 0);
    frameGroup.add(seat);

    this.mesh.add(frameGroup);

    const pilotGroup = new THREE.Group();

    const bodyGeo = new THREE.CapsuleGeometry(0.35, 0.8, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3366cc,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.8;
    body.rotation.x = Math.PI / 8;
    pilotGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 0.6
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.1;
    pilotGroup.add(head);

    const helmetGeo = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.3,
      metalness: 0.5
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.y = 0.15;
    pilotGroup.add(helmet);

    const legGeo = new THREE.CapsuleGeometry(0.12, 0.6, 4, 8);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.7
    });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.2, -1.6, 0.2);
    leftLeg.rotation.x = -Math.PI / 4;
    pilotGroup.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.2, -1.6, 0.2);
    rightLeg.rotation.x = -Math.PI / 4;
    pilotGroup.add(rightLeg);

    pilotGroup.position.y = 0;
    this.mesh.add(pilotGroup);

    const ropeMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
    const ropeCount = 16;
    for (let i = 0; i < ropeCount; i++) {
      const t = i / (ropeCount - 1);
      const wingX = (t - 0.5) * wingWidth * 0.9;
      const arcY = Math.sin(t * Math.PI) * wingArcHeight;
      const widthFactor = Math.sin(t * Math.PI) * 0.3 + 0.7;

      const points = [];
      points.push(new THREE.Vector3(wingX, arcY + 3.8, wingDepth * 0.3 * widthFactor));
      points.push(new THREE.Vector3(wingX * 0.15, 0.8, 0));
      const ropeGeo = new THREE.BufferGeometry().setFromPoints(points);
      const rope = new THREE.Line(ropeGeo, ropeMat);
      this.mesh.add(rope);

      const points2 = [];
      points2.push(new THREE.Vector3(wingX, arcY + 3.8, -wingDepth * 0.3 * widthFactor));
      points2.push(new THREE.Vector3(wingX * 0.15, 0.8, 0));
      const ropeGeo2 = new THREE.BufferGeometry().setFromPoints(points2);
      const rope2 = new THREE.Line(ropeGeo2, ropeMat);
      this.mesh.add(rope2);
    }

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  update(input, dt, terrain) {
    this.terrainHeight = terrain.getHeight(this.position.x, this.position.z);
    this.physics.update(this, input, dt);

    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
  }

  reset(startPosition) {
    this.position.copy(startPosition);
    this.velocity.set(6, -1, 0);
    this.rotation.set(0, 0, 0);
    this.speed = 0;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
  }
}
