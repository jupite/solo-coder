export const GAME_CONFIG = {
  RINK_LENGTH: 45,
  RINK_WIDTH: 5,
  HOUSE_CENTER_Z: -20,
  HOUSE_RADIUSES: [0.305, 0.61, 0.915, 1.22],
  HOUSE_COLORS: [0xffffff, 0x1e88e5, 0xffffff, 0xff5722],

  STONE_RADIUS: 0.15,
  STONE_HEIGHT: 0.2,
  STONE_MASS: 1,

  FRICTION: 0.01,
  MIN_VELOCITY: 0.001,
  MAX_POWER: 3.5,
  POWER_MULTIPLIER: 0.025,

  STONES_PER_PLAYER: 5,

  THROW_START_Z: 20,
  THROW_START_X: 0,

  CAMERA_DEFAULT: {
    position: { x: 0, y: 8, z: 28 },
    target: { x: 0, y: 0, z: 15 },
  },
  CAMERA_TOP: {
    position: { x: 0, y: 45, z: 0 },
    target: { x: 0, y: 0, z: -5 },
  },
  CAMERA_THROW: {
    position: { x: 0, y: 6, z: 26 },
    target: { x: 0, y: 0, z: 20 },
  },
  CAMERA_ZOOM: {
    min: 10,
    max: 100,
    speed: 0.001,
  },
}
