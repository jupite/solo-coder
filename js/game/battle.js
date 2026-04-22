class BattleSystem {
    constructor(playerPokemon, enemyPokemon, ai) {
        this.playerPokemon = playerPokemon;
        this.enemyPokemon = enemyPokemon;
        this.ai = ai || new PokemonAI('medium');
        
        this.turn = 0;
        this.isPlayerTurn = true;
        this.battleOver = false;
        this.winner = null;
        this.battleLog = [];
        
        this.determineFirstTurn();
    }

    determineFirstTurn() {
        if (this.playerPokemon.stats.speed > this.enemyPokemon.stats.speed) {
            this.isPlayerTurn = true;
        } else if (this.enemyPokemon.stats.speed > this.playerPokemon.stats.speed) {
            this.isPlayerTurn = false;
        } else {
            this.isPlayerTurn = Math.random() < 0.5;
        }
    }

    calculateDamage(move, attacker, defender) {
        if (!move.power || move.power === 0) {
            return { damage: 0, effectiveness: 1, critical: false, missed: false };
        }
        
        if (Math.random() * 100 > move.accuracy) {
            return { damage: 0, effectiveness: 1, critical: false, missed: true };
        }
        
        let attackStat;
        let defenseStat;
        
        if (move.category === 'physical') {
            attackStat = attacker.stats.attack;
            defenseStat = defender.stats.defense;
        } else {
            attackStat = attacker.stats.specialAttack;
            defenseStat = defender.stats.specialDefense;
        }
        
        const stab = getStab(move.type, attacker.types);
        
        let totalEffectiveness = 1;
        for (const defenderType of defender.types) {
            totalEffectiveness *= getTypeEffectiveness(move.type, defenderType);
        }
        
        const critical = Math.random() < 0.0625;
        const criticalMultiplier = critical ? 1.5 : 1;
        
        const randomFactor = 0.85 + Math.random() * 0.15;
        
        const baseDamage = ((2 * attacker.level / 5 + 2) * move.power * (attackStat / defenseStat) / 50 + 2);
        const damage = Math.floor(baseDamage * stab * totalEffectiveness * criticalMultiplier * randomFactor);
        
        return {
            damage: Math.max(1, damage),
            effectiveness: totalEffectiveness,
            critical,
            missed: false
        };
    }

    executeMove(move, attacker, defender) {
        const result = this.calculateDamage(move, attacker, defender);
        let message = `${attacker.name} 使用了 ${move.name}！`;
        
        if (result.missed) {
            message += ' 但是没有命中...';
        } else {
            if (result.critical) {
                message += ' 击中要害！';
            }
            
            if (result.effectiveness > 1) {
                message += ' 效果拔群！';
            } else if (result.effectiveness < 1 && result.effectiveness > 0) {
                message += ' 效果不佳...';
            } else if (result.effectiveness === 0) {
                message += ' 但是没有效果...';
            }
            
            if (result.damage > 0) {
                defender.takeDamage(result.damage);
                message += ` 造成了 ${result.damage} 点伤害！`;
            }
        }
        
        this.battleLog.push(message);
        return { message, ...result, move };
    }

    playerTurn(moveIndex) {
        if (this.battleOver || !this.isPlayerTurn) {
            return null;
        }
        
        const move = this.playerPokemon.moves[moveIndex];
        if (!move || move.currentPp <= 0) {
            return null;
        }
        
        move.currentPp--;
        
        const result = this.executeMove(move, this.playerPokemon, this.enemyPokemon);
        
        this.turn++;
        
        if (this.enemyPokemon.isFainted()) {
            this.battleOver = true;
            this.winner = 'player';
            this.battleLog.push(`${this.enemyPokemon.name} 倒下了！`);
        } else {
            this.isPlayerTurn = false;
        }
        
        return result;
    }

    enemyTurn() {
        if (this.battleOver || this.isPlayerTurn) {
            return null;
        }
        
        const move = this.ai.selectMove(this.enemyPokemon, this.playerPokemon);
        
        if (!move) {
            this.battleLog.push(`${this.enemyPokemon.name} 没有可用的招式了！`);
            this.turn++;
            this.isPlayerTurn = true;
            return { message: `${this.enemyPokemon.name} 没有可用的招式了！`, damage: 0 };
        }
        
        const moveIndex = this.enemyPokemon.moves.indexOf(move);
        if (moveIndex !== -1) {
            this.enemyPokemon.moves[moveIndex].currentPp--;
        }
        
        const result = this.executeMove(move, this.enemyPokemon, this.playerPokemon);
        
        this.turn++;
        
        if (this.playerPokemon.isFainted()) {
            this.battleOver = true;
            this.winner = 'enemy';
            this.battleLog.push(`${this.playerPokemon.name} 倒下了！`);
        } else {
            this.isPlayerTurn = true;
        }
        
        return result;
    }

    getBattleState() {
        return {
            turn: this.turn,
            isPlayerTurn: this.isPlayerTurn,
            battleOver: this.battleOver,
            winner: this.winner,
            playerPokemon: {
                name: this.playerPokemon.name,
                currentHp: this.playerPokemon.currentHp,
                maxHp: this.playerPokemon.maxHp,
                types: this.playerPokemon.types,
                moves: this.playerPokemon.moves.map(m => ({
                    name: m.name,
                    type: m.type,
                    power: m.power,
                    currentPp: m.currentPp,
                    maxPp: m.pp
                }))
            },
            enemyPokemon: {
                name: this.enemyPokemon.name,
                currentHp: this.enemyPokemon.currentHp,
                maxHp: this.enemyPokemon.maxHp,
                types: this.enemyPokemon.types
            },
            battleLog: this.battleLog.slice(-5)
        };
    }
}
