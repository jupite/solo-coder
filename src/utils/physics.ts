export const GRAVITY = 20
export const MAX_ARROW_SPEED = 60
export const MIN_ARROW_SPEED = 20
export const HORSE_SPEED = 8
export const GAME_DURATION = 30
export const TARGET_RADIUS = 1.2
export const BULLSEYE_RADIUS = 0.2

export function calculateScore(distance: number): number {
  if (distance <= BULLSEYE_RADIUS) return 10
  if (distance <= 0.4) return 8
  if (distance <= 0.6) return 6
  if (distance <= 0.8) return 4
  if (distance <= 1.0) return 2
  return 0
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}
