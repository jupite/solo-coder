import { PokemonType, ItemData, BattleState, DamageResult, MoveResult, ItemResult, SwitchResult, getTypeEffectiveness, getStab } from '../types';
import { Pokemon, createPokemon } from '../pokemon/pokemon';
import { PokemonAI, Difficulty } from './ai';

export enum ActionType {
    USE_MOVE = 'use_move',
    SWITCH = 'switch',
    USE_ITEM = 'use_item'
}

export interface BattleAction {
    type: ActionType;
    moveIndex?: number;
    pokemonIndex?: number;
    itemIndex?: number;
}

export class BattleSystem {
    playerTeam: Pokemon[];
    enemyTeam: Pokemon[];
    ai: PokemonAI;
    playerBackpack: ItemData[];
    
    activePlayerIndex: number;
    activeEnemyIndex: number;
    
    turn: number;
    isPlayerTurn: boolean;
    battleOver: boolean;
    winner: 'player' | 'enemy' | null;
    battleLog: string[];

    constructor(playerPokemonIds: number[], enemyPokemonIds: number[], ai?: PokemonAI, playerBackpack: ItemData[] = []) {
        this.playerTeam = playerPokemonIds.map(id => createPokemon(id, 50));
        this.enemyTeam = enemyPokemonIds.map(id => createPokemon(id, 50));
        this.ai = ai || new PokemonAI('medium');
        this.playerBackpack = playerBackpack;
        
        this.activePlayerIndex = 0;
        this.activeEnemyIndex = 0;
        
        this.turn = 0;
        this.isPlayerTurn = true;
        this.battleOver = false;
        this.winner = null;
        this.battleLog = [];
        
        this.determineFirstTurn();
    }

    get playerPokemon(): Pokemon {
        return this.playerTeam[this.activePlayerIndex];
    }

    get enemyPokemon(): Pokemon {
        return this.enemyTeam[this.activeEnemyIndex];
    }

    private determineFirstTurn(): void {
        if (this.playerPokemon.stats.speed > this.enemyPokemon.stats.speed) {
            this.isPlayerTurn = true;
        } else if (this.enemyPokemon.stats.speed > this.playerPokemon.stats.speed) {
            this.isPlayerTurn = false;
        } else {
            this.isPlayerTurn = Math.random() < 0.5;
        }
    }

    calculateDamage(move: { type: PokemonType; power: number; accuracy: number; category: string }, attacker: Pokemon, defender: Pokemon): DamageResult {
        if (!move.power || move.power === 0) {
            return { damage: 0, effectiveness: 1, critical: false, missed: false };
        }
        
        if (Math.random() * 100 > move.accuracy) {
            return { damage: 0, effectiveness: 1, critical: false, missed: true };
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

    private executeMove(move: { type: PokemonType; power: number; accuracy: number; category: string; name: string }, attacker: Pokemon, defender: Pokemon): { message: string } & DamageResult {
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
        return { message, ...result };
    }

    private getAvailablePokemonIndices(team: Pokemon[]): number[] {
        return team
            .map((pokemon, index) => ({ pokemon, index }))
            .filter(({ pokemon }) => !pokemon.isFainted())
            .map(({ index }) => index);
    }

    getPlayerAvailableIndices(): number[] {
        return this.getAvailablePokemonIndices(this.playerTeam);
    }

    getEnemyAvailableIndices(): number[] {
        return this.getAvailablePokemonIndices(this.enemyTeam);
    }

    private canSwitchPokemon(isPlayer: boolean): boolean {
        const team = isPlayer ? this.playerTeam : this.enemyTeam;
        const activeIndex = isPlayer ? this.activePlayerIndex : this.activeEnemyIndex;
        
        for (let i = 0; i < team.length; i++) {
            if (i !== activeIndex && !team[i].isFainted()) {
                return true;
            }
        }
        return false;
    }

    canPlayerSwitch(): boolean {
        return this.canSwitchPokemon(true);
    }

    canEnemySwitch(): boolean {
        return this.canSwitchPokemon(false);
    }

    private switchPokemon(newIndex: number, isPlayer: boolean): SwitchResult {
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
        
        const oldPokemonState = {
            id: oldPokemon.id,
            name: oldPokemon.name,
            currentHp: oldPokemon.currentHp,
            maxHp: oldPokemon.maxHp,
            types: oldPokemon.types,
            moves: oldPokemon.moves.map(m => ({
                name: m.name,
                type: m.type,
                power: m.power,
                currentPp: m.currentPp,
                maxPp: m.pp
            }))
        };
        
        const newPokemonState = {
            id: newPokemon.id,
            name: newPokemon.name,
            currentHp: newPokemon.currentHp,
            maxHp: newPokemon.maxHp,
            types: newPokemon.types,
            moves: newPokemon.moves.map(m => ({
                name: m.name,
                type: m.type,
                power: m.power,
                currentPp: m.currentPp,
                maxPp: m.pp
            }))
        };
        
        return { success: true, message, oldPokemon: oldPokemonState, newPokemon: newPokemonState };
    }

    playerSwitchPokemon(newIndex: number): SwitchResult {
        const result = this.switchPokemon(newIndex, true);
        if (result.success) {
            this.turn++;
            this.isPlayerTurn = false;
        }
        return result;
    }

    enemySwitchPokemon(newIndex: number): SwitchResult {
        const result = this.switchPokemon(newIndex, false);
        if (result.success) {
            this.turn++;
            this.isPlayerTurn = true;
        }
        return result;
    }

    private checkTeamFainted(team: Pokemon[]): boolean {
        return team.every(pokemon => pokemon.isFainted());
    }

    checkBattleOver(): boolean {
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

    playerTurn(moveIndex: number): MoveResult | null {
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
        
        return { ...result, move };
    }

    useItem(itemIndex: number): ItemResult | null {
        if (this.battleOver || !this.isPlayerTurn) {
            return null;
        }
        
        if (itemIndex < 0 || itemIndex >= this.playerBackpack.length) {
            return null;
        }
        
        const item = this.playerBackpack[itemIndex];
        let message = '';
        let result = { damage: 0, missed: false };
        
        switch (item.type) {
            case 'heal':
                const healAmount = item.effect;
                const oldHp = this.playerPokemon.currentHp;
                this.playerPokemon.heal(healAmount);
                const actualHeal = this.playerPokemon.currentHp - oldHp;
                message = `使用了 ${item.name}！回复了 ${actualHeal} 点HP！`;
                break;
            
            case 'damage':
                const damageAmount = item.effect;
                this.enemyPokemon.takeDamage(damageAmount);
                message = `使用了 ${item.name}！对 ${this.enemyPokemon.name} 造成了 ${damageAmount} 点伤害！`;
                result.damage = damageAmount;
                break;
            
            case 'buff':
                if (item.stat === 'evasion') {
                    message = `使用了 ${item.name}！提升了闪避率！`;
                } else if (item.stat) {
                    const statName = item.stat;
                    const boostAmount = item.effect;
                    if (statName in this.playerPokemon.stats) {
                        (this.playerPokemon.stats as unknown as Record<string, number>)[statName] *= (1 + boostAmount);
                        message = `使用了 ${item.name}！提升了 ${this.getStatName(statName)}！`;
                    }
                }
                break;
        }
        
        this.playerBackpack.splice(itemIndex, 1);
        
        this.battleLog.push(message);
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
        
        return { message, ...result, item };
    }

    private getStatName(stat: string): string {
        const statNames: Record<string, string> = {
            attack: '攻击力',
            defense: '防御力',
            specialAttack: '特攻',
            specialDefense: '特防',
            evasion: '闪避率'
        };
        return statNames[stat] || stat;
    }

    enemyTurn(): { message: string; damage: number; isSwitch?: boolean } | null {
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
        
        return { message: result.message, damage: result.damage };
    }

    getBattleState(): BattleState {
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
                color: pokemon.color,
                secondaryColor: pokemon.secondaryColor,
                shape: pokemon.shape,
                isActive: index === this.activeEnemyIndex,
                isFainted: pokemon.isFainted()
            })),
            activePlayerIndex: this.activePlayerIndex,
            activeEnemyIndex: this.activeEnemyIndex,
            playerPokemon: {
                id: this.playerPokemon.id,
                name: this.playerPokemon.name,
                currentHp: this.playerPokemon.currentHp,
                maxHp: this.playerPokemon.maxHp,
                types: this.playerPokemon.types,
                color: this.playerPokemon.color,
                secondaryColor: this.playerPokemon.secondaryColor,
                shape: this.playerPokemon.shape,
                moves: this.playerPokemon.moves.map(m => ({
                    name: m.name,
                    type: m.type,
                    power: m.power,
                    currentPp: m.currentPp,
                    maxPp: m.pp
                })),
                stats: this.playerPokemon.stats
            },
            enemyPokemon: {
                id: this.enemyPokemon.id,
                name: this.enemyPokemon.name,
                currentHp: this.enemyPokemon.currentHp,
                maxHp: this.enemyPokemon.maxHp,
                types: this.enemyPokemon.types,
                color: this.enemyPokemon.color,
                secondaryColor: this.enemyPokemon.secondaryColor,
                shape: this.enemyPokemon.shape,
                moves: this.enemyPokemon.moves.map(m => ({
                    name: m.name,
                    type: m.type,
                    power: m.power,
                    currentPp: m.currentPp,
                    maxPp: m.pp
                })),
                stats: this.enemyPokemon.stats
            },
            playerBackpack: this.playerBackpack,
            battleLog: this.battleLog.slice(-5)
        };
    }

    executeAction(actor: 'player' | 'enemy', action: BattleAction): MoveResult | SwitchResult | ItemResult | null {
        if (actor === 'player') {
            switch (action.type) {
                case ActionType.USE_MOVE:
                    return this.playerTurn(action.moveIndex ?? 0);
                case ActionType.SWITCH:
                    return this.playerSwitchPokemon(action.pokemonIndex ?? 0);
                case ActionType.USE_ITEM:
                    return this.useItem(action.itemIndex ?? 0);
            }
        } else {
            switch (action.type) {
                case ActionType.USE_MOVE:
                    return this.enemyTurn() as unknown as MoveResult;
                case ActionType.SWITCH:
                    return this.enemySwitchPokemon(action.pokemonIndex ?? 0);
            }
        }
        return null;
    }

    getEnemyAction(): BattleAction {
        const move = this.ai.selectMove(this.enemyPokemon, this.playerPokemon);
        if (move) {
            const moveIndex = this.enemyPokemon.moves.indexOf(move);
            return { type: ActionType.USE_MOVE, moveIndex };
        }
        return { type: ActionType.USE_MOVE, moveIndex: 0 };
    }

    hasMoreEnemies(): boolean {
        return this.getEnemyAvailableIndices().length > 0;
    }

    switchEnemyPokemon(): void {
        const availableIndices = this.getEnemyAvailableIndices().filter(i => i !== this.activeEnemyIndex);
        if (availableIndices.length > 0) {
            this.enemySwitchPokemon(availableIndices[0]);
        }
    }
}