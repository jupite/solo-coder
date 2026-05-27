import { create } from 'zustand';
import { GameState, GameActions, Stone, Player, RINK_DIMENSIONS } from '@/types/game';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialStone = (player: Player, index: number): Stone => ({
  id: generateId(),
  player,
  position: {
    x: (index - 2.5) * 0.5,
    z: RINK_DIMENSIONS.length / 2 - 1,
  },
  velocity: { x: 0, z: 0 },
  isMoving: false,
});

const initialStones: Stone[] = [];

const initialState: GameState = {
  currentPlayer: 1,
  currentRound: 1,
  totalRounds: 5,
  scores: { player1: 0, player2: 0 },
  stones: initialStones,
  gamePhase: 'ready',
  currentStoneId: null,
  throwParams: { power: 0, direction: 0 },
  isDragging: false,
  dragStart: null,
  dragEnd: null,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  startAiming: () => {
    const { currentPlayer, currentRound, totalRounds } = get();
    if (currentRound > totalRounds) return;

    const newStone: Stone = {
      id: generateId(),
      player: currentPlayer,
      position: { x: 0, z: RINK_DIMENSIONS.length / 2 - 6 },
      velocity: { x: 0, z: 0 },
      isMoving: false,
    };

    set((state) => ({
      gamePhase: 'aiming',
      currentStoneId: newStone.id,
      stones: [...state.stones, newStone],
    }));
  },

  setDragStart: (pos) => set({ dragStart: pos }),

  setDragEnd: (pos) => {
    const { dragStart } = get();
    if (!dragStart) return;

    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 2, 100);
    const direction = Math.atan2(dx, dy);

    set({
      dragEnd: pos,
      throwParams: { power, direction },
    });
  },

  releaseStone: () => {
    const { throwParams, currentStoneId } = get();
    if (!currentStoneId) return;

    const powerMultiplier = throwParams.power / 100;
    const speed = powerMultiplier * 0.35;

    set((state) => ({
      gamePhase: 'thrown',
      isDragging: false,
      dragStart: null,
      dragEnd: null,
      stones: state.stones.map((stone) =>
        stone.id === currentStoneId
          ? {
              ...stone,
              velocity: {
                x: -Math.sin(throwParams.direction) * speed,
                z: -Math.cos(throwParams.direction) * speed,
              },
              isMoving: true,
            }
          : stone
      ),
    }));
  },

  updateStonePosition: (id, pos, vel) => {
    set((state) => ({
      stones: state.stones.map((stone) =>
        stone.id === id ? { ...stone, position: pos, velocity: vel } : stone
      ),
    }));
  },

  stopStone: (id) => {
    set((state) => ({
      stones: state.stones.map((stone) =>
        stone.id === id ? { ...stone, velocity: { x: 0, z: 0 }, isMoving: false } : stone
      ),
    }));
  },

  nextTurn: () => {
    const { currentPlayer, currentRound, totalRounds, calculateScores } = get();

    calculateScores();

    if (currentPlayer === 2) {
      if (currentRound >= totalRounds) {
        set({ gamePhase: 'gameEnd' });
        return;
      }
      set({
        currentPlayer: 1,
        currentRound: currentRound + 1,
        gamePhase: 'ready',
        currentStoneId: null,
        throwParams: { power: 0, direction: 0 },
      });
    } else {
      set({
        currentPlayer: 2,
        gamePhase: 'ready',
        currentStoneId: null,
        throwParams: { power: 0, direction: 0 },
      });
    }
  },

  calculateScores: () => {
    const { stones } = get();
    const targetZ = -RINK_DIMENSIONS.length / 2 + 6;
    const targetX = 0;

    const stonesInHouse = stones
      .map((stone) => ({
        ...stone,
        distance: Math.sqrt(
          Math.pow(stone.position.x - targetX, 2) + Math.pow(stone.position.z - targetZ, 2)
        ),
      }))
      .filter((stone) => stone.distance < RINK_DIMENSIONS.targetRadius + RINK_DIMENSIONS.stoneRadius)
      .sort((a, b) => a.distance - b.distance);

    if (stonesInHouse.length === 0) {
      set({ scores: { player1: 0, player2: 0 } });
      return;
    }

    const closestPlayer = stonesInHouse[0].player;
    let score = 0;

    for (const stone of stonesInHouse) {
      if (stone.player === closestPlayer) {
        score++;
      } else {
        break;
      }
    }

    set((state) => ({
      scores: {
        ...state.scores,
        [`player${closestPlayer}`]: state.scores[`player${closestPlayer}`] + score,
      },
    }));
  },

  resetGame: () => {
    set({
      ...initialState,
      stones: [],
    });
  },

  setIsDragging: (dragging) => set({ isDragging: dragging }),
}));
