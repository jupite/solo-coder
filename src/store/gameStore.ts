import { create } from 'zustand';
import * as THREE from 'three';
import { GameState, Player } from '../types';
import {
  FIELD_LENGTH,
  FIELD_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  TEAM_HOME_COLOR,
  TEAM_AWAY_COLOR,
  GOALKEEPER_COLOR,
  BALL_RADIUS,
} from '../utils/constants';

const createInitialPlayers = (): Player[] => {
  const players: Player[] = [];

  const homePositions = [
    { x: 0, z: -35, role: 'goalkeeper' as const },
    { x: -10, z: -15, role: 'midfielder' as const },
    { x: 10, z: -15, role: 'forward' as const },
  ];

  const awayPositions = [
    { x: 0, z: 35, role: 'goalkeeper' as const },
    { x: -10, z: 15, role: 'midfielder' as const },
    { x: 10, z: 15, role: 'forward' as const },
  ];

  homePositions.forEach((pos, i) => {
    players.push({
      id: `home-${i}`,
      team: 'home',
      role: pos.role,
      position: new THREE.Vector3(pos.x, PLAYER_HEIGHT / 2, pos.z),
      velocity: new THREE.Vector3(),
      targetPosition: new THREE.Vector3(pos.x, PLAYER_HEIGHT / 2, pos.z),
      isControlled: i === 2,
      hasBall: false,
      state: 'idle',
      speed: PLAYER_SPEED,
      color: pos.role === 'goalkeeper' ? GOALKEEPER_COLOR : TEAM_HOME_COLOR,
    });
  });

  awayPositions.forEach((pos, i) => {
    players.push({
      id: `away-${i}`,
      team: 'away',
      role: pos.role,
      position: new THREE.Vector3(pos.x, PLAYER_HEIGHT / 2, pos.z),
      velocity: new THREE.Vector3(),
      targetPosition: new THREE.Vector3(pos.x, PLAYER_HEIGHT / 2, pos.z),
      isControlled: false,
      hasBall: false,
      state: 'idle',
      speed: PLAYER_SPEED,
      color: pos.role === 'goalkeeper' ? GOALKEEPER_COLOR : TEAM_AWAY_COLOR,
    });
  });

  return players;
};

interface GameStore extends GameState {
  setScore: (team: 'home' | 'away', score: number) => void;
  setTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setBallPosition: (position: THREE.Vector3) => void;
  setBallVelocity: (velocity: THREE.Vector3) => void;
  setBallOwnedBy: (playerId: string | null) => void;
  setPlayers: (players: Player[]) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  setControlledPlayerId: (id: string) => void;
  setChargePower: (power: number) => void;
  setIsCharging: (isCharging: boolean) => void;
  resetGame: () => void;
  resetPositions: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  score: { home: 0, away: 0 },
  time: 0,
  isPlaying: true,
  isPaused: false,
  ballPosition: new THREE.Vector3(0, BALL_RADIUS, 0),
  ballVelocity: new THREE.Vector3(),
  ballOwnedBy: null,
  players: createInitialPlayers(),
  controlledPlayerId: 'home-2',
  chargePower: 0,
  isCharging: false,

  setScore: (team, score) =>
    set((state) => ({ score: { ...state.score, [team]: score } })),

  setTime: (time) => set({ time }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setIsPaused: (isPaused) => set({ isPaused }),

  setBallPosition: (position) => set({ ballPosition: position.clone() }),

  setBallVelocity: (velocity) => set({ ballVelocity: velocity.clone() }),

  setBallOwnedBy: (playerId) => set({ ballOwnedBy: playerId }),

  setPlayers: (players) => set({ players }),

  updatePlayer: (id, updates) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  setControlledPlayerId: (id) => set({ controlledPlayerId: id }),

  setChargePower: (power) => set({ chargePower: power }),

  setIsCharging: (isCharging) => set({ isCharging }),

  resetGame: () =>
    set({
      score: { home: 0, away: 0 },
      time: 0,
      isPlaying: true,
      isPaused: false,
      ballPosition: new THREE.Vector3(0, BALL_RADIUS, 0),
      ballVelocity: new THREE.Vector3(),
      ballOwnedBy: null,
      players: createInitialPlayers(),
      controlledPlayerId: 'home-2',
      chargePower: 0,
      isCharging: false,
    }),

  resetPositions: () =>
    set((state) => ({
      ballPosition: new THREE.Vector3(0, BALL_RADIUS, 0),
      ballVelocity: new THREE.Vector3(),
      ballOwnedBy: null,
      players: createInitialPlayers().map((p, i) => ({
        ...p,
        position: state.players[i]?.position.clone() || p.position,
      })),
    })),
}));
