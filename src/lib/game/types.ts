export type Direction = 'up' | 'down' | 'left' | 'right';

export type PlayerColor = 'blue' | 'red';

export enum CellType {
  FLOOR = 0,
  WALL = 1,
  TARGET = 2,
  BOX = 3,
  PLAYER = 4,
  BOX_ON_TARGET = 5,
  PLAYER_ON_TARGET = 6,
  RED_GATE = 7,
  SWITCH_OFF = 8,
  SWITCH_ON = 9,
}

export interface Position {
  x: number;
  y: number;
}

export interface LevelData {
  grid: CellType[][];
  player: Position;
  boxes: Position[];
  targets: Position[];
}

export interface GameState {
  grid: CellType[][];
  player: Position;
  boxes: Position[];
  targets: Position[];
  steps: number;
  isWin: boolean;
}

export interface RedGate {
  x: number;
  y: number;
  switchId: string;
}

export interface SwitchItem {
  x: number;
  y: number;
  gateId: string;
}

export interface DuoLevelData {
  grid: CellType[][];
  bluePlayer: Position;
  redPlayer: Position;
  blueMaxSteps: number;
  redMaxSteps: number;
  boxes: Position[];
  targets: Position[];
  redGates: RedGate[];
  switches: SwitchItem[];
}

export interface DuoPlayerState {
  position: Position;
  origin: Position;
  stepsRemaining: number;
  maxSteps: number;
  path: Position[];
  isGone: boolean;
}

export interface MoveHistoryEntry {
  color: PlayerColor;
  from: Position;
  to: Position;
  boxPushed?: { from: Position; to: Position };
  switchesToggledOn: string[];
  switchesToggledOff: string[];
  wasGone: boolean;
  pathTruncated?: boolean;
}

export interface DuoGameState {
  grid: CellType[][];
  bluePlayer: DuoPlayerState;
  redPlayer: DuoPlayerState;
  boxes: Position[];
  targets: Position[];
  redGates: RedGate[];
  switches: SwitchItem[];
  activeSwitches: Set<string>;
  currentTurn: PlayerColor;
  steps: number;
  isWin: boolean;
  history: MoveHistoryEntry[];
}