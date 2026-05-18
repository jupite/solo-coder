export const GAME_CONFIG = {
  RINK_LENGTH: 45,
  RINK_WIDTH: 5,
  HOUSE_CENTER_Z: -20,
  HOUSE_RADIUSES: [0.305, 0.61, 0.915, 1.22],
  HOUSE_COLORS: [0xffffff, 0x1e88e5, 0xffffff, 0xff5722],

  STONE_RADIUS: 0.15,
  STONE_HEIGHT: 0.2,
  STONE_MASS: 1,

  FRICTION: 0.015,
  MIN_VELOCITY: 0.001,
  MAX_POWER: 20,
  POWER_MULTIPLIER: 0.08,

  STONES_PER_PLAYER: 5,

  THROW_START_Z: 20,
  THROW_START_X: 0,

  CAMERA_DEFAULT: {
    position: { x: 0, y: 15, z: 25 },
    target: { x: 0, y: 0, z: -5 },
  },
  CAMERA_TOP: {
    position: { x: 0, y: 35, z: 0 },
    target: { x: 0, y: 0, z: -5 },
  },
}
