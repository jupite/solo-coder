import * as THREE from 'three';

export interface GameState {
  score: { home: number; away: number };
  time: number;
  isPlaying: boolean;
  isPaused: boolean;
  ballPosition: THREE.Vector3;
  ballVelocity: THREE.Vector3;
  ballOwnedBy: string | null;
  players: Player[];
  controlledPlayerId: string;
}

export interface Player {
  id: string;
  team: 'home' | 'away';
  role: 'forward' | 'midfielder' | 'goalkeeper';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  isControlled: boolean;
  hasBall: boolean;
  state: 'idle' | 'running' | 'kicking' | 'tackling';
  speed: number;
  color: string;
}

export interface Team {
  name: string;
  color: string;
  players: Player[];
}
