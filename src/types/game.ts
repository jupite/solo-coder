export type GamePhase = 'ready' | 'aiming' | 'thrown' | 'roundEnd' | 'gameEnd';

export type Player = 1 | 2;

export interface Stone {
  id: string;
  player: Player;
  position: { x: number; z: number };
  velocity: { x: number; z: number };
  isMoving: boolean;
}

export interface ThrowParams {
  power: number;
  direction: number;
}

export interface GameState {
  currentPlayer: Player;
  currentRound: number;
  totalRounds: number;
  scores: { player1: number; player2: number };
  stones: Stone[];
  gamePhase: GamePhase;
  currentStoneId: string | null;
  throwParams: ThrowParams;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragEnd: { x: number; y: number } | null;
}

export interface GameActions {
  startAiming: () => void;
  setDragStart: (pos: { x: number; y: number }) => void;
  setDragEnd: (pos: { x: number; y: number }) => void;
  releaseStone: () => void;
  updateStonePosition: (id: string, pos: { x: number; z: number }, vel: { x: number; z: number }) => void;
  stopStone: (id: string) => void;
  nextTurn: () => void;
  calculateScores: () => void;
  resetGame: () => void;
  setIsDragging: (dragging: boolean) => void;
}

export const RINK_DIMENSIONS = {
  length: 45.72,
  width: 5,
  targetRadius: 1.83,
  centerToHog: 21.945,
  stoneRadius: 0.145,
  stoneHeight: 0.12,
};

export const COLORS = {
  player1: '#FF4444',
  player2: '#4444FF',
  ice: '#E8F4FC',
  iceBorder: '#B0D4F0',
  targetRed: '#CC3333',
  targetWhite: '#FFFFFF',
  targetBlue: '#3366CC',
  targetCenter: '#FFFFFF',
};
