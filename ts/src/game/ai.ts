import type { Pokemon, PokemonMove, PokemonType } from '../types';
import { getTypeEffectiveness, getStab } from '../pokemon/types';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export class PokemonAI {
  difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  selectMove(aiPokemon: Pokemon, playerPokemon: Pokemon): PokemonMove | null {
    const availableMoves = aiPokemon.getAvailableMoves();

    if (availableMoves.length === 0) {
      return null;
    }

    switch (this.difficulty) {
      case 'easy':
        return this.selectRandomMove(availableMoves);
      case 'medium':
        return this.selectSemiSmartMove(availableMoves, aiPokemon, playerPokemon);
      case 'hard':
        return this.selectSmartMove(availableMoves, aiPokemon, playerPokemon);
      default:
        return this.selectRandomMove(availableMoves);
    }
  }

  selectRandomMove(moves: PokemonMove[]): PokemonMove {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  selectSemiSmartMove(moves: PokemonMove[], aiPokemon: Pokemon, playerPokemon: Pokemon): PokemonMove {
    const moveScores = moves.map(move => {
      let score = Math.random() * 30;

      if (move.power > 0) {
        const effectiveness = this.calculateTotalEffectiveness(move.type, playerPokemon.types);

        if (effectiveness > 1) {
          score += 40;
        } else if (effectiveness < 1 && effectiveness > 0) {
          score -= 20;
        } else if (effectiveness === 0) {
          score -= 100;
        }

        score += move.power * 0.5;
      }

      if (aiPokemon.moves.includes(move) && aiPokemon.types.includes(move.type)) {
        score += 15;
      }

      return { move, score };
    });

    moveScores.sort((a, b) => b.score - a.score);

    const topMoves = moveScores.slice(0, Math.min(3, moveScores.length));
    const randomTopMove = topMoves[Math.floor(Math.random() * topMoves.length)];

    return randomTopMove.move;
  }

  selectSmartMove(moves: PokemonMove[], aiPokemon: Pokemon, playerPokemon: Pokemon): PokemonMove {
    const moveScores = moves.map(move => {
      let score = 0;

      if (move.power > 0) {
        const effectiveness = this.calculateTotalEffectiveness(move.type, playerPokemon.types);

        if (effectiveness > 1) {
          score += 60;
        } else if (effectiveness < 1 && effectiveness > 0) {
          score -= 30;
        } else if (effectiveness === 0) {
          score -= 200;
        }

        score += move.power * 0.8;

        if (move.accuracy < 100) {
          score -= (100 - move.accuracy) * 0.5;
        }
      }

      if (aiPokemon.types.includes(move.type)) {
        score += 20;
      }

      const predictedDamage = this.estimateDamage(move, aiPokemon, playerPokemon);
      score += predictedDamage * 0.1;

      if (playerPokemon.currentHp / playerPokemon.maxHp < 0.3) {
        const highPowerMoves = moves.filter(m => m.power >= 80);
        if (highPowerMoves.includes(move)) {
          score += 30;
        }
      }

      return { move, score };
    });

    moveScores.sort((a, b) => b.score - a.score);

    return moveScores[0].move;
  }

  calculateTotalEffectiveness(moveType: PokemonType, defenderTypes: PokemonType[]): number {
    let totalEffectiveness = 1;

    for (const defenderType of defenderTypes) {
      totalEffectiveness *= getTypeEffectiveness(moveType, defenderType);
    }

    return totalEffectiveness;
  }

  estimateDamage(move: PokemonMove, attacker: Pokemon, defender: Pokemon): number {
    if (!move.power || move.power === 0) {
      return 0;
    }

    let attackStat: number;
    let defenseStat: number;

    if (move.category === 'physical') {
      attackStat = attacker.stats.attack;
      defenseStat = defender.stats.defense;
    } else {
      attackStat = attacker.stats.specialAttack;
      defenseStat = defender.stats.specialDefense;
    }

    const stab = getStab(move.type, attacker.types);
    const effectiveness = this.calculateTotalEffectiveness(move.type, defender.types);

    const baseDamage = ((2 * attacker.level / 5 + 2) * move.power * (attackStat / defenseStat) / 50 + 2);
    const estimatedDamage = Math.floor(baseDamage * stab * effectiveness);

    return estimatedDamage;
  }

  selectTargetPokemon(availablePokemon: Pokemon[], opponentPokemon: Pokemon): Pokemon | null {
    if (availablePokemon.length === 0) {
      return null;
    }

    if (availablePokemon.length === 1) {
      return availablePokemon[0];
    }

    const pokemonScores = availablePokemon.map(pokemon => {
      let score = Math.random() * 20;

      for (const type of pokemon.types) {
        for (const opponentType of opponentPokemon.types) {
          const effectiveness = getTypeEffectiveness(type, opponentType);
          if (effectiveness > 1) {
            score += 30;
          } else if (effectiveness < 1 && effectiveness > 0) {
            score -= 15;
          } else if (effectiveness === 0) {
            score -= 50;
          }
        }
      }

      score += (pokemon.currentHp / pokemon.maxHp) * 40;

      return { pokemon, score };
    });

    pokemonScores.sort((a, b) => b.score - a.score);

    return pokemonScores[0].pokemon;
  }
}