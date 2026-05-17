import * as CANNON from 'cannon-es';

export class PhysicsEngine {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;
    
    this.bodies = [];
    this.materials = {
      ground: new CANNON.Material({ friction: 0.8, restitution: 0.2 }),
      ball: new CANNON.Material({ friction: 0.3, restitution: 0.3 }),
      pin: new CANNON.Material({ friction: 0.2, restitution: 0.4 })
    };
    
    this.contactMaterial = new CANNON.ContactMaterial(
      this.materials.ball,
      this.materials.pin,
      { friction: 0.3, restitution: 0.5 }
    );
    this.world.addContactMaterial(this.contactMaterial);
  }

  addBody(body) {
    this.world.addBody(body);
    this.bodies.push(body);
  }

  removeBody(body) {
    this.world.removeBody(body);
    const index = this.bodies.indexOf(body);
    if (index > -1) {
      this.bodies.splice(index, 1);
    }
  }

  clearAllBodies() {
    this.bodies.forEach(body => this.world.removeBody(body));
    this.bodies = [];
  }

  step(deltaTime) {
    this.world.step(1 / 60, deltaTime, 3);
  }

  createGroundPlane(position, rotation, size) {
    const shape = new CANNON.Plane();
    const body = new CANNON.Body({ 
      mass: 0, 
      material: this.materials.ground,
      shape: shape
    });
    body.position.copy(position);
    body.quaternion.copy(rotation);
    this.addBody(body);
    return body;
  }

  createBox(position, size, mass = 0) {
    const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const body = new CANNON.Body({ 
      mass: mass, 
      material: this.materials.ground,
      shape: shape
    });
    body.position.copy(position);
    this.addBody(body);
    return body;
  }

  createSphere(position, radius, mass = 1) {
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({ 
      mass: mass, 
      material: this.materials.ball,
      shape: shape
    });
    body.position.copy(position);
    body.linearDamping = 0.05;
    body.angularDamping = 0.1;
    this.addBody(body);
    return body;
  }

  createCylinder(position, radiusTop, radiusBottom, height, mass = 1) {
    const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 8);
    const body = new CANNON.Body({ 
      mass: mass, 
      material: this.materials.pin,
      shape: shape
    });
    body.position.copy(position);
    body.linearDamping = 0.02;
    body.angularDamping = 0.05;
    this.addBody(body);
    return body;
  }
}
