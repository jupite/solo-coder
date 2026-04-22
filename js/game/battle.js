class BattleSystem {
    constructor(playerPokemonIds, enemyPokemonIds, ai) {
        this.playerTeam = playerPokemonIds.map(id => createPokemon(id, 50));
        this.enemyTeam = enemyPokemonIds.map(id => createPokemon(id, 50));
        this.ai = ai || new PokemonAI('medium');
        
        this.activePlayerIndex = 0;
        this.activeEnemyIndex = 0;
        
        this.turn = 0;
        this.isPlayerTurn = true;
        this.battleOver = false;
        this.winner = null;
        this.battleLog = [];
        
        this.determineFirstTurn();
    }

    get playerPokemon() {
        return this.playerTeam[this.activePlayerIndex];
    }

    get enemyPokemon() {
        return this.enemyTeam[this.activeEnemyIndex];
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

    getAvailablePokemonIndices(team) {
        return team
            .map((pokemon, index) => ({ pokemon, index }))
            .filter(({ pokemon }) => !pokemon.isFainted())
            .map(({ index }) => index);
    }

    getPlayerAvailableIndices() {
        return this.getAvailablePokemonIndices(this.playerTeam);
    }

    getEnemyAvailableIndices() {
        return this.getAvailablePokemonIndices(this.enemyTeam);
    }

    canSwitchPokemon(isPlayer) {
        const team = isPlayer ? this.playerTeam : this.enemyTeam;
        const activeIndex = isPlayer ? this.activePlayerIndex : this.activeEnemyIndex;
        
        for (let i = 0; i < team.length; i++) {
            if (i !== activeIndex && !team[i].isFainted()) {
                return true;
            }
        }
        return false;
    }

    canPlayerSwitch() {
        return this.canSwitchPokemon(true);
    }

    canEnemySwitch() {
        return this.canSwitchPokemon(false);
    }

    switchPokemon(newIndex, isPlayer) {
        const team = isPlayer ? this.playerTeam : this.enemyTeam;
        const activeIndex = isPlayer ? this.activePlayerIndex : this.activeEnemyIndex;
        
        if (newIndex < 0 || newIndex >= team.length) {
            return { success: false, message: '无效的宝可梦索引' };
        }
        
        if (newIndex === activeIndex) {
            return { success: false, message: '不能切换当前出战的宝可梦' };
        }
        
        if (team[newIndex].isFainted()) {
            return { success: false, message: `${team[newIndex].name} 已经倒下了！` };
        }
        
        const oldPokemon = team[activeIndex];
        const newPokemon = team[newIndex];
        
        if (isPlayer) {
            this.activePlayerIndex = newIndex;
        } else {
            this.activeEnemyIndex = newIndex;
        }
        
        const message = `${oldPokemon.name} 回来！${newPokemon.name} 上吧！`;
        this.battleLog.push(message);
        
        return { success: true, message, oldPokemon, newPokemon };
    }

    playerSwitchPokemon(newIndex) {
        const result = this.switchPokemon(newIndex, true);
        if (result.success) {
            this.turn++;
            this.isPlayerTurn = false;
        }
        return result;
    }

    enemySwitchPokemon(newIndex) {
        const result = this.switchPokemon(newIndex, false);
        if (result.success) {
            this.turn++;
            this.isPlayerTurn = true;
        }
        return result;
    }

    checkTeamFainted(team) {
        return team.every(pokemon => pokemon.isFainted());
    }

    checkBattleOver() {
        const playerAllFainted = this.checkTeamFainted(this.playerTeam);
        const enemyAllFainted = this.checkTeamFainted(this.enemyTeam);
        
        if (playerAllFainted) {
            this.battleOver = true;
            this.winner = 'enemy';
            this.battleLog.push('你的所有宝可梦都倒下了！');
            return true;
        }
        
        if (enemyAllFainted) {
            this.battleOver = true;
            this.winner = 'player';
            this.battleLog.push('敌方所有宝可梦都倒下了！');
            return true;
        }
        
        return false;
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
            this.battleLog.push(`${this.enemyPokemon.name} 倒下了！`);
            
            const availableEnemyIndices = this.getEnemyAvailableIndices();
            if (availableEnemyIndices.length > 0) {
                this.battleLog.push('请选择下一只宝可梦！');
                this.isPlayerTurn = false;
            } else {
                this.battleOver = true;
                this.winner = 'player';
            }
        } else {
            this.isPlayerTurn = false;
        }
        
        return result;
    }

    enemyTurn() {
        if (this.battleOver || this.isPlayerTurn) {
            return null;
        }
        
        if (this.enemyPokemon.isFainted()) {
            const availableEnemyIndices = this.getEnemyAvailableIndices();
            if (availableEnemyIndices.length === 0) {
                this.battleOver = true;
                this.winner = 'player';
                return { message: '敌方没有可用的宝可梦了！', damage: 0 };
            }
            
            const switchResult = this.enemySwitchPokemon(availableEnemyIndices[0]);
            return { message: switchResult.message, damage: 0, isSwitch: true };
        }
        
        if (this.canEnemySwitch() && Math.random() < 0.2) {
            const availableIndices = this.getEnemyAvailableIndices().filter(i => i !== this.activeEnemyIndex);
            if (availableIndices.length > 0) {
                const targetIndex = this.ai.selectTargetPokemon(
                    availableIndices.map(i => this.enemyTeam[i]),
                    this.playerPokemon
                );
                if (targetIndex) {
                    const newIndex = this.enemyTeam.indexOf(targetIndex);
                    if (newIndex !== -1) {
                        const switchResult = this.enemySwitchPokemon(newIndex);
                        return { message: switchResult.message, damage: 0, isSwitch: true };
                    }
                }
            }
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
            this.battleLog.push(`${this.playerPokemon.name} 倒下了！`);
            
            const availablePlayerIndices = this.getPlayerAvailableIndices();
            if (availablePlayerIndices.length > 0) {
                this.battleLog.push('请选择下一只宝可梦！');
                this.isPlayerTurn = true;
            } else {
                this.battleOver = true;
                this.winner = 'enemy';
            }
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
            playerTeam: this.playerTeam.map((pokemon, index) => ({
                id: pokemon.id,
                name: pokemon.name,
                currentHp: pokemon.currentHp,
                maxHp: pokemon.maxHp,
                types: pokemon.types,
                color: pokemon.color,
                secondaryColor: pokemon.secondaryColor,
                shape: pokemon.shape,
                isActive: index === this.activePlayerIndex,
                isFainted: pokemon.isFainted()
            })),
            enemyTeam: this.enemyTeam.map((pokemon, index) => ({
                id: pokemon.id,
                name: pokemon.name,
                currentHp: pokemon.currentHp,
                maxHp: pokemon.maxHp,
                types: pokemon.types,
                isActive: index === this.activeEnemyIndex,
                isFainted: pokemon.isFainted()
            })),
            activePlayerIndex: this.activePlayerIndex,
            activeEnemyIndex: this.activeEnemyIndex,
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
