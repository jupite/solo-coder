export const CONFIG = {
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
        LOOK_AHEAD: 50,
    },
    
    TRACK: {
        WIDTH: 24,
        RADIUS: 80,
        SEGMENTS: 64,
        ROAD_HEIGHT: 0.2,
        KERB_HEIGHT: 0.15,
        KERB_WIDTH: 1.5,
    },
    
    OBSTACLES: {
        COUNT: 8,
        SIZE: 3,
        SPEED_MIN: 5,
        SPEED_MAX: 15,
        MOVE_RADIUS: 10,
        SLOW_DOWN_FACTOR: 0.8,
    },
    
    POWERUPS: {
        COUNT: 5,
        SIZE: 1.5,
        BOOST_DURATION: 3000,
        BOOST_MULTIPLIER: 1.5,
        RESPAWN_TIME: 8000,
        ROTATION_SPEED: 2,
        FLOAT_SPEED: 2,
        FLOAT_HEIGHT: 0.5,
    },
    
    CAMERA: {
        DISTANCE: 12,
        HEIGHT: 5,
        LERP_SPEED: 5,
        LOOK_AHEAD: 8,
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
