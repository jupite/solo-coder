import * as THREE from 'three';

class InteractionManager {
  constructor(sceneManager, pieceManager, snapDetector) {
    this.sceneManager = sceneManager;
    this.pieceManager = pieceManager;
    this.snapDetector = snapDetector;
    
    this.selectedPiece = null;
    this.dragPlane = null;
    this.dragOffset = new THREE.Vector3();
    this.isDragging = false;
    
    this.rotationMode = false;
    this.rotationStart = null;
    this.selectedPieceForRotation = null;
    
    this.init();
  }

  init() {
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.dragHeight = 0;
    
    const container = this.sceneManager.renderer.domElement;
    
    container.addEventListener('mousedown', (e) => this.onMouseDown(e));
    container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    container.addEventListener('mouseup', (e) => this.onMouseUp(e));
    container.addEventListener('touchstart', (e) => this.onTouchStart(e));
    container.addEventListener('touchmove', (e) => this.onTouchMove(e));
    container.addEventListener('touchend', (e) => this.onTouchEnd(e));
    
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onMouseDown(event) {
    if (event.button !== 0) return;
    
    this.sceneManager.updateMouse(event);
    const pieces = this.pieceManager.getSnappablePieces();
    const intersects = this.sceneManager.getIntersects(pieces);
    
    if (intersects.length > 0) {
      let selectedObject = intersects[0].object;
      while (selectedObject.parent && !selectedObject.userData.targetPosition) {
        selectedObject = selectedObject.parent;
      }
      
      if (selectedObject.userData.targetPosition && !selectedObject.userData.isSnapped) {
        if (this.rotationMode) {
          if (this.selectedPieceForRotation) {
            this.pieceManager.highlightPiece(this.selectedPieceForRotation, false);
          }
          this.selectedPieceForRotation = selectedObject;
          this.pieceManager.highlightPiece(this.selectedPieceForRotation, true);
        } else {
          this.selectedPiece = selectedObject;
          this.isDragging = true;
          this.sceneManager.controls.enabled = false;
          
          const intersectPoint = intersects[0].point;
          this.dragHeight = this.selectedPiece.position.y;
          this.dragOffset.set(
            this.selectedPiece.position.x - intersectPoint.x,
            0,
            this.selectedPiece.position.z - intersectPoint.z
          );
          
          this.sceneManager.scene.updateMatrixWorld();
          const planeNormal = new THREE.Vector3(0, 1, 0);
          const planePoint = new THREE.Vector3(0, this.dragHeight, 0);
          this.dragPlane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);
        }
      }
    }
  }

  onMouseMove(event) {
    this.sceneManager.updateMouse(event);
    
    if (this.isDragging && this.selectedPiece) {
      const raycaster = this.sceneManager.getRaycaster();
      raycaster.setFromCamera(this.sceneManager.mouse, this.sceneManager.camera);
      
      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
        this.selectedPiece.position.x = intersection.x + this.dragOffset.x;
        this.selectedPiece.position.z = intersection.z + this.dragOffset.z;
      }
    } else {
      const pieces = this.pieceManager.getSnappablePieces();
      const intersects = this.sceneManager.getIntersects(pieces);
      
      document.body.style.cursor = intersects.length > 0 ? 'grab' : 'default';
    }
  }

  onMouseUp(event) {
    if (this.isDragging && this.selectedPiece) {
      const snapped = this.snapDetector.trySnap(this.selectedPiece);
      
      this.isDragging = false;
      this.selectedPiece = null;
      this.sceneManager.controls.enabled = true;
    }
    
    if (this.rotationMode && this.selectedPieceForRotation) {
      this.snapDetector.trySnap(this.selectedPieceForRotation);
    }
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
    }
  }

  onTouchMove(event) {
    if (event.touches.length === 1 && this.isDragging) {
      event.preventDefault();
      const touch = event.touches[0];
      this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  onTouchEnd(event) {
    if (this.isDragging) {
      this.onMouseUp({});
    }
  }

  onKeyDown(event) {
    if (event.code === 'KeyR' && !event.repeat) {
      this.rotationMode = !this.rotationMode;
      
      if (this.rotationMode) {
        this.selectPieceForRotation();
      } else {
        if (this.selectedPieceForRotation) {
          this.pieceManager.highlightPiece(this.selectedPieceForRotation, false);
          this.selectedPieceForRotation = null;
        }
      }
      return;
    }
    
    if (this.rotationMode && this.selectedPieceForRotation) {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        this.selectedPieceForRotation.rotation.y -= Math.PI / 12;
      }
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        this.selectedPieceForRotation.rotation.y += Math.PI / 12;
      }
      if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        this.selectedPieceForRotation.rotation.x -= Math.PI / 12;
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        this.selectedPieceForRotation.rotation.x += Math.PI / 12;
      }
      if (event.code === 'KeyQ') {
        this.selectedPieceForRotation.rotation.z -= Math.PI / 12;
      }
      if (event.code === 'KeyE') {
        this.selectedPieceForRotation.rotation.z += Math.PI / 12;
      }
      if (event.code === 'KeyZ') {
        event.preventDefault();
        this.selectedPieceForRotation.position.y = Math.max(0.5, this.selectedPieceForRotation.position.y - 0.1);
      }
      if (event.code === 'KeyX') {
        event.preventDefault();
        this.selectedPieceForRotation.position.y = Math.min(10, this.selectedPieceForRotation.position.y + 0.1);
      }
      if (event.code === 'Tab') {
        event.preventDefault();
        this.selectNextPieceForRotation();
      }
    }
  }

  onKeyUp(event) {
  }

  selectPieceForRotation() {
    const pieces = this.pieceManager.getSnappablePieces();
    if (pieces.length > 0) {
      this.selectedPieceForRotation = pieces[0];
      this.pieceManager.highlightPiece(this.selectedPieceForRotation, true);
    }
  }

  selectNextPieceForRotation() {
    const pieces = this.pieceManager.getSnappablePieces();
    if (pieces.length === 0) return;
    
    const currentIndex = pieces.indexOf(this.selectedPieceForRotation);
    const nextIndex = (currentIndex + 1) % pieces.length;
    this.selectedPieceForRotation = pieces[nextIndex];
    
    pieces.forEach((p, i) => {
      this.pieceManager.highlightPiece(p, i === nextIndex);
    });
  }
}

export default InteractionManager;
