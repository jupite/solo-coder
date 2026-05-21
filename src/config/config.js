export const GAME_CONFIG = {
  LANES: [
    { color: 0xFF3366, key: 'f', position: -2 },
    { color: 0x3366FF, key: 'g', position: 0 },
    { color: 0xFFCC00, key: 'h', position: 2 }
  ],
  
  NOTE: {
    speed: 8,
    spawnY: 10,
    hitY: 0,
    removeY: -2,
    hitTolerance: 0.2,
    radius: 0.4
  },
  
  SCORE: {
    hitPoints: 10,
    missPenalty: 5,
    feverThreshold: 10,
    feverMultiplier: 2
  },
  
  SPAWN: {
    minInterval: 0.6,
    maxInterval: 1.5
  },
  
  PARTICLES: {
    count: 20,
    speed: 5,
    life: 0.8,
    size: 0.1
  },
  
  CAMERA: {
    fov: 60,
    near: 0.1,
    far: 100,
    position: { x: 0, y: 5, z: 8 },
    target: { x: 0, y: 0, z: 0 }
  },
  
  LIGHTS: {
    ambient: 0x404040,
    pointLights: [
      { color: 0xFF3366, position: { x: -2, y: 5, z: 3 }, intensity: 2 },
      { color: 0x3366FF, position: { x: 0, y: 5, z: 3 }, intensity: 2 },
      { color: 0xFFCC00, position: { x: 2, y: 5, z: 3 }, intensity: 2 }
    ]
  }
};
