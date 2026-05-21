import * as THREE from 'three';
import { GAME_CONFIG } from '../config/config.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 30);

    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.CAMERA.fov,
      window.innerWidth / window.innerHeight,
      GAME_CONFIG.CAMERA.near,
      GAME_CONFIG.CAMERA.far
    );
    this.camera.position.set(
      GAME_CONFIG.CAMERA.position.x,
      GAME_CONFIG.CAMERA.position.y,
      GAME_CONFIG.CAMERA.position.z
    );
    this.camera.lookAt(
      GAME_CONFIG.CAMERA.target.x,
      GAME_CONFIG.CAMERA.target.y,
      GAME_CONFIG.CAMERA.target.z
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    this.setupLights();
    this.setupBackground();

    window.addEventListener('resize', () => this.onResize());
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(GAME_CONFIG.LIGHTS.ambient, 0.5);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.3);
    mainLight.position.set(0, 10, 5);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    GAME_CONFIG.LIGHTS.pointLights.forEach((lightConfig) => {
      const pointLight = new THREE.PointLight(lightConfig.color, lightConfig.intensity, 15);
      pointLight.position.set(
        lightConfig.position.x,
        lightConfig.position.y,
        lightConfig.position.z
      );
      pointLight.castShadow = true;
      this.scene.add(pointLight);
    });
  }

  setupBackground() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);

    this.stars = stars;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getDelta() {
    return this.clock.getDelta();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
