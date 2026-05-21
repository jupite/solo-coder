import * as THREE from 'three';

class PieceManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.pieces = [];
    this.targetPositions = [];
    this.targetRotations = [];
    this.snappedPieces = new Set();
    
    this.createStatuePieces();
    this.createTargetMarkers();
  }

  createStatuePieces() {
    const pieceConfigs = this.getPieceConfigs();
    
    pieceConfigs.forEach((config, index) => {
      const group = new THREE.Group();
      
      config.geometries.forEach(geoConfig => {
        const geometry = this.createGeometry(geoConfig);
        const material = new THREE.MeshStandardMaterial({
          color: geoConfig.color || 0x8b7355,
          roughness: 0.6,
          metalness: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.copy(geoConfig.position || new THREE.Vector3());
        if (geoConfig.rotation) {
          mesh.rotation.set(geoConfig.rotation.x, geoConfig.rotation.y, geoConfig.rotation.z);
        }
        group.add(mesh);
      });
      
      const edges = this.createEdges(group);
      group.add(edges);
      
      const startPos = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        0.5 + Math.random() * 2,
        (Math.random() - 0.5) * 10
      );
      group.position.copy(startPos);
      group.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      group.userData = {
        index: index,
        targetPosition: config.targetPosition.clone(),
        targetRotation: config.targetRotation.clone(),
        isDragging: false,
        isSnapped: false,
        originalMaterial: null,
        highlightEdges: edges
      };
      
      this.pieces.push(group);
      this.targetPositions.push(config.targetPosition.clone());
      this.targetRotations.push(config.targetRotation.clone());
      this.sceneManager.scene.add(group);
    });
  }

  createGeometry(config) {
    switch (config.type) {
      case 'box':
        return new THREE.BoxGeometry(config.width, config.height, config.depth);
      case 'cylinder':
        return new THREE.CylinderGeometry(config.radiusTop, config.radiusBottom, config.height, config.segments || 32);
      case 'sphere':
        return new THREE.SphereGeometry(config.radius, config.segments || 32, config.segments || 32);
      case 'cone':
        return new THREE.ConeGeometry(config.radius, config.height, config.segments || 32);
      case 'torus':
        return new THREE.TorusGeometry(config.radius, config.tube, config.segments || 16, config.radialSegments || 32);
      case 'custom':
        return this.createCustomGeometry(config);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  createCustomGeometry(config) {
    const geometry = new THREE.BufferGeometry();
    const shape = new THREE.Shape();
    
    if (config.shape === 'horse_body') {
      const points = [
        new THREE.Vector2(-1.5, -0.5),
        new THREE.Vector2(-1.5, 0.5),
        new THREE.Vector2(-1, 1),
        new THREE.Vector2(0, 1.2),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(1.5, 0.5),
        new THREE.Vector2(1.5, -0.5),
        new THREE.Vector2(1, -1),
        new THREE.Vector2(-1, -1)
      ];
      shape.moveTo(points[0].x, points[0].y);
      points.forEach(p => shape.lineTo(p.x, p.y));
      shape.closePath();
    } else if (config.shape === 'horse_head') {
      shape.moveTo(-0.4, -0.3);
      shape.lineTo(-0.4, 0.3);
      shape.lineTo(-0.2, 0.5);
      shape.lineTo(0.3, 0.4);
      shape.lineTo(0.5, 0.2);
      shape.lineTo(0.5, -0.2);
      shape.lineTo(0.3, -0.4);
      shape.lineTo(-0.2, -0.3);
      shape.closePath();
    } else {
      shape.absarc(0, 0, 1, 0, Math.PI * 2, true);
    }
    
    const extrudeSettings = {
      depth: config.depth || 1,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 5
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  createEdges(group) {
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x64c8ff,
      transparent: true,
      opacity: 0,
      linewidth: 2
    });
    
    const edgesGroup = new THREE.Group();
    group.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const edges = new THREE.EdgesGeometry(child.geometry);
        const line = new THREE.LineSegments(edges, edgeMaterial);
        line.position.copy(child.position);
        line.rotation.copy(child.rotation);
        edgesGroup.add(line);
      }
    });
    
    return edgesGroup;
  }

  getPieceConfigs() {
    return [
      {
        targetPosition: new THREE.Vector3(0, 1.2, 0),
        targetRotation: new THREE.Euler(0, 0, 0),
        geometries: [
          {
            type: 'custom',
            shape: 'horse_body',
            depth: 1.2,
            color: 0x8b4513,
            position: new THREE.Vector3(0, 0, 0)
          }
        ]
      },
      {
        targetPosition: new THREE.Vector3(1.2, 1.2, 0),
        targetRotation: new THREE.Euler(0, 0, 0),
        geometries: [
          {
            type: 'custom',
            shape: 'horse_head',
            depth: 0.8,
            color: 0x8b4513,
            position: new THREE.Vector3(0, 0.2, 0)
          },
          {
            type: 'cylinder',
            radiusTop: 0.08,
            radiusBottom: 0.08,
            height: 0.4,
            color: 0x654321,
            position: new THREE.Vector3(0.2, 0.6, 0),
            rotation: new THREE.Vector3(0.3, 0, 0)
          }
        ]
      },
      {
        targetPosition: new THREE.Vector3(-0.8, 0.2, 0.5),
        targetRotation: new THREE.Euler(0, 0, 0),
        geometries: [
          {
            type: 'cylinder',
            radiusTop: 0.15,
            radiusBottom: 0.18,
            height: 1.2,
            color: 0x8b4513,
            position: new THREE.Vector3(0, 0, 0)
          },
          {
            type: 'box',
            width: 0.25,
            height: 0.1,
            depth: 0.25,
            color: 0x654321,
            position: new THREE.Vector3(0, -0.6, 0)
          }
        ]
      },
      {
        targetPosition: new THREE.Vector3(0.8, 0.2, 0.5),
        targetRotation: new THREE.Euler(0, 0, 0),
        geometries: [
          {
            type: 'cylinder',
            radiusTop: 0.15,
            radiusBottom: 0.18,
            height: 1.2,
            color: 0x8b4513,
            position: new THREE.Vector3(0, 0, 0)
          },
          {
            type: 'box',
            width: 0.25,
            height: 0.1,
            depth: 0.25,
            color: 0x654321,
            position: new THREE.Vector3(0, -0.6, 0)
          }
        ]
      },
      {
        targetPosition: new THREE.Vector3(-0.8, 0.2, -0.5),
        targetRotation: new THREE.Euler(0, 0, 0),
        geometries: [
          {
            type: 'cylinder',
            radiusTop: 0.15,
            radiusBottom: 0.18,
            height: 1.2,
            color: 0x8b4513,
            position: new THREE.Vector3(0, 0, 0)
          },
          {
            type: 'box',
            width: 0.25,
            height: 0.1,
            depth: 0.25,
            color: 0x654321,
            position: new THREE.Vector3(0, -0.6, 0)
          }
        ]
      },
      {
        targetPosition: new THREE.Vector3(0.8, 0.2, -0.5),
        targetRotation: new THREE.Euler(0, 0, 0),
        geometries: [
          {
            type: 'cylinder',
            radiusTop: 0.15,
            radiusBottom: 0.18,
            height: 1.2,
            color: 0x8b4513,
            position: new THREE.Vector3(0, 0, 0)
          },
          {
            type: 'box',
            width: 0.25,
            height: 0.1,
            depth: 0.25,
            color: 0x654321,
            position: new THREE.Vector3(0, -0.6, 0)
          }
        ]
      }
    ];
  }

  createTargetMarkers() {
    this.targetMarkers = [];
    
    this.targetPositions.forEach((pos, index) => {
      const geometry = new THREE.RingGeometry(0.8, 1, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x64c8ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(pos);
      ring.position.y = 0.62;
      this.sceneManager.scene.add(ring);
      this.targetMarkers.push(ring);
    });
  }

  getPieces() {
    return this.pieces;
  }

  getSnappablePieces() {
    return this.pieces.filter(p => !p.userData.isSnapped);
  }

  getCompletedCount() {
    return this.snappedPieces.size;
  }

  getTotalCount() {
    return this.pieces.length;
  }

  isAllSnapped() {
    return this.snappedPieces.size === this.pieces.length;
  }

  setPieceSnapped(piece) {
    piece.userData.isSnapped = true;
    this.snappedPieces.add(piece.userData.index);
    
    piece.userData.highlightEdges.traverse((child) => {
      if (child.isLineSegments) {
        child.material.opacity = 0.8;
        child.material.color.set(0x00ff88);
      }
    });
  }

  highlightPiece(piece, highlight) {
    piece.userData.highlightEdges.traverse((child) => {
      if (child.isLineSegments) {
        child.material.opacity = highlight ? 0.6 : 0;
        child.material.color.set(highlight ? 0xffd700 : 0x64c8ff);
      }
    });
  }
}

export default PieceManager;
