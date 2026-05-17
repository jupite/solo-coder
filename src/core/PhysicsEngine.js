import * as CANNON from 'cannon-es';
import { PHYSICS } from '../utils/constants.js';

export class PhysicsEngine {
  constructor() {
    this.world = null;
    this.bodies = new Map();
    this.init();
  }

  init() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, PHYSICS.gravity, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.solver.iterations = 10;

    this.defaultMaterial = new CANNON.Material('default');
    this.ballMaterial = new CANNON.Material('ball');
    this.platformMaterial = new CANNON.Material('platform');

    const ballPlatformContact = new CANNON.ContactMaterial(
      this.ballMaterial,
      this.platformMaterial,
      {
        friction: PHYSICS.friction,
        restitution: PHYSICS.restitution,
      }
    );
    this.world.addContactMaterial(ballPlatformContact);

    const defaultContact = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.1,
      }
    );
    this.world.addContactMaterial(defaultContact);
  }

  addBody(name, body) {
    this.bodies.set(name, body);
    this.world.addBody(body);
    return body;
  }

  removeBody(name) {
    const body = this.bodies.get(name);
    if (body) {
      this.world.removeBody(body);
      this.bodies.delete(name);
    }
  }

  getBody(name) {
    return this.bodies.get(name);
  }

  update(deltaTime) {
    this.world.step(PHYSICS.fixedTimeStep, deltaTime, 3);
  }

  dispose() {
    this.bodies.forEach(body => {
      this.world.removeBody(body);
    });
    this.bodies.clear();
  }
}
