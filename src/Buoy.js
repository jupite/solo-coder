import * as THREE from 'three';

class Buoy {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.baseY = 0.2;
        this.isSinking = false;
        this.sinkProgress = 0;
        this.floatOffset = 0;
        this.visible = false;
        
        this.init();
    }

    init() {
        const buoyGroup = new THREE.Group();

        const bodyGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6B35,
            roughness: 0.5,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0;
        body.castShadow = true;
        buoyGroup.add(body);

        const stripeGeometry = new THREE.TorusGeometry(0.25, 0.03, 8, 16);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.rotation.x = Math.PI / 2;
        stripe.castShadow = true;
        buoyGroup.add(stripe);

        const topGeometry = new THREE.ConeGeometry(0.1, 0.3, 16);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            roughness: 0.6,
            emissive: 0x330000
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.35;
        top.castShadow = true;
        buoyGroup.add(top);

        const lineGeometry = new THREE.CylinderGeometry(0.01, 0.01, 5, 8);
        const lineMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.7
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.y = -2.5;
        buoyGroup.add(line);

        this.mesh = buoyGroup;
        this.mesh.position.set(0, -10, 0);
        this.scene.add(this.mesh);
    }

    castTo(position) {
        this.mesh.position.set(position.x, this.baseY, position.z);
        this.visible = true;
        this.isSinking = false;
        this.sinkProgress = 0;
        this.floatOffset = Math.random() * Math.PI * 2;
    }

    startSinking() {
        this.isSinking = true;
        this.sinkProgress = 0;
    }

    reset() {
        this.mesh.position.set(0, -10, 0);
        this.visible = false;
        this.isSinking = false;
        this.sinkProgress = 0;
    }

    update(deltaTime, elapsedTime) {
        if (!this.visible) return;

        if (this.isSinking) {
            this.sinkProgress = Math.min(this.sinkProgress + deltaTime * 2, 1);
            const sinkY = this.baseY - this.sinkProgress * 0.5;
            this.mesh.position.y = sinkY + Math.sin(elapsedTime * 15 + this.floatOffset) * 0.05;
            this.mesh.rotation.z = Math.sin(elapsedTime * 10) * 0.3 * this.sinkProgress;
        } else {
            this.mesh.position.y = this.baseY + Math.sin(elapsedTime * 2 + this.floatOffset) * 0.08;
            this.mesh.rotation.z = Math.sin(elapsedTime * 1.5 + this.floatOffset) * 0.1;
        }
    }

    getPosition() {
        return this.mesh.position.clone();
    }

    isVisible() {
        return this.visible;
    }

    isHooked() {
        return this.isSinking;
    }
}

export default Buoy;
