const CONFIG = {
    RACE: {
        TOTAL_LAPS: 3,
        COUNTDOWN_TIME: 3,
    },
    
    CAR: {
        MAX_SPEED: 80,
        ACCELERATION: 40,
        DECELERATION: 60,
        BRAKE_FORCE: 80,
        TURN_SPEED: 2.5,
        FRICTION: 0.98,
        WIDTH: 2,
        LENGTH: 4,
        HEIGHT: 1.2,
    },
    
    AI: {
        COUNT: 3,
        BASE_SPEED_MULTIPLIER: 0.85,
        SPEED_VARIANCE: 0.1,
        STEER_SPEED: 3.0,
        LOOK_AHEAD: 80,
    },
    
    TRACK: {
        WIDTH: 35,
        SEGMENTS_PER_POINT: 10,
        ROAD_HEIGHT: 0.2,
        KERB_HEIGHT: 0.15,
        KERB_WIDTH: 2,
    },
    
    OBSTACLES: {
        COUNT: 12,
        SIZE: 3,
        SPEED_MIN: 5,
        SPEED_MAX: 15,
        MOVE_RADIUS: 12,
        SLOW_DOWN_FACTOR: 0.8,
    },
    
    POWERUPS: {
        COUNT: 8,
        SIZE: 1.5,
        BOOST_DURATION: 3000,
        BOOST_MULTIPLIER: 1.5,
        RESPAWN_TIME: 8000,
        ROTATION_SPEED: 2,
        FLOAT_SPEED: 2,
        FLOAT_HEIGHT: 0.5,
    },
    
    CAMERA: {
        DISTANCE: 18,
        HEIGHT: 7,
        LERP_SPEED: 5,
        LOOK_AHEAD: 12,
    },
    
    COLORS: {
        SKY: 0x87CEEB,
        GROUND: 0x2d5a27,
        ROAD: 0x333333,
        KERB_RED: 0xcc0000,
        KERB_WHITE: 0xffffff,
        PLAYER_CAR: 0x4a9eff,
        AI_CARS: [0xff6b6b, 0x51cf66, 0xffd43b],
        OBSTACLE: 0xff4444,
        POWERUP: 0x00ffff,
    },
};

const TRACK_POINTS = [
    { x: 0, z: -150 },
    { x: 100, z: -150 },
    { x: 150, z: -100 },
    { x: 150, z: 0 },
    { x: 100, z: 80 },
    { x: 0, z: 120 },
    { x: -100, z: 100 },
    { x: -150, z: 0 },
    { x: -120, z: -80 },
    { x: -50, z: -120 },
];
