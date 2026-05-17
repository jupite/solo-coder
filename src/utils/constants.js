export const PHYSICS = {
  gravity: -9.82,
  ballRadius: 0.3,
  platformSize: 10,
  platformThickness: 0.3,
  maxTilt: 25,
  friction: 0.05,
  restitution: 0.3,
  ballMass: 1,
  fixedTimeStep: 1 / 60,
};

export const GAME = {
  maxScore: 5,
  resetDelay: 1500,
  holeRadius: 0.6,
  holeYOffset: 0.01,
};

export const COLORS = {
  background: 0x0a1628,
  platform: 0x2a3a4a,
  platformEdge: 0x4a5a6a,
  ball: 0xc0c0c0,
  targetHole: 0xffd700,
  targetHoleInner: 0x0a1628,
  success: '#00ff88',
  fail: '#ff5544',
};

export const CAMERA = {
  fov: 60,
  near: 0.1,
  far: 1000,
  position: { x: 0, y: 12, z: 12 },
};
