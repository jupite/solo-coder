import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        this.world.solver.iterations = 10;
        
        this.bodies = [];
        
        this.createGround();
        this.createPlatform();
    }
    
    createGround() {
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: groundShape,
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.3
            })
        });
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        groundBody.position.y = 0;
        this.world.addBody(groundBody);
        this.bodies.push(groundBody);
    }
    
    createPlatform() {
        const platformShape = new CANNON.Box(new CANNON.Vec3(10, 0.5, 10));
        const platformBody = new CANNON.Body({
            mass: 0,
            shape: platformShape,
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.2
            })
        });
        platformBody.position.y = 0.5;
        this.world.addBody(platformBody);
        this.bodies.push(platformBody);
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
    
    update(deltaTime) {
        this.world.step(1 / 60, deltaTime, 3);
    }
}
