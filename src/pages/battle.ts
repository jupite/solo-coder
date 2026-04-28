import { WebGLRenderer } from '../webgl/renderer';
import { Sphere, Ellipsoid, Cone, Cylinder, LightningTail, Flame, Wing, Shell, PlantBulb } from '../webgl/shapes';
import { getPokemonModel, ModelElement } from '../webgl/pokemon-models';
import { renderBackground } from '../webgl/backgrounds';
import { Pokemon } from '../pokemon/pokemon';
import { BattleSystem, BattleAction, ActionType } from '../game/battle';
import { PokemonType, BattleState, PokemonState } from '../types';

export interface Game {
    showResultPage: (isWin: boolean, playerPokemon: PokemonState, enemyPokemon: PokemonState, turns: number) => void;
}

export class BattlePage {
    game: Game;
    battleSystem: BattleSystem | null = null;
    playerPokemon: PokemonState | null = null;
    enemyPokemon: PokemonState | null = null;
    
    battleCanvas: HTMLCanvasElement | null = null;
    renderer: WebGLRenderer | null = null;
    
    battleMessage: HTMLElement | null = null;
    playerActiveName: HTMLElement | null = null;
    enemyActiveName: HTMLElement | null = null;
    playerActiveHpBar: HTMLElement | null = null;
    enemyActiveHpBar: HTMLElement | null = null;
    playerActiveHpText: HTMLElement | null = null;
    enemyActiveHpText: HTMLElement | null = null;
    moveButtons: HTMLButtonElement[] = [];
    switchPokemonBtn: HTMLButtonElement | null = null;
    backpackBtn: HTMLButtonElement | null = null;
    playerTeamList: HTMLElement | null = null;
    enemyTeamList: HTMLElement | null = null;
    switchModal: HTMLElement | null = null;
    switchOptions: HTMLElement | null = null;
    
    is3DAnimating = false;
    isBattleProcessing = false;
    isSwitchModalOpen = false;
    isForcedSwitch = false;
    
    playerShake = { x: 0, y: 0, z: 0 };
    enemyShake = { x: 0, y: 0, z: 0 };
    activePlayerIndex = 0;
    activeEnemyIndex = 0;
    
    animationTime = 0;
    currentAnimation: 'idle' | 'attack' | 'damage' | 'switch' = 'idle';
    attackAnimationProgress = 0;
    damageAnimationProgress = 0;
    
    backgroundName = 'default';

    constructor(game: Game) {
        this.game = game;
        this.init();
    }

    init(): void {
        this.battleCanvas = document.getElementById('battle-canvas') as HTMLCanvasElement;
        this.battleMessage = document.getElementById('battle-message');
        this.playerActiveName = document.getElementById('player-active-name');
        this.enemyActiveName = document.getElementById('enemy-active-name');
        this.playerActiveHpBar = document.getElementById('player-active-hp-bar');
        this.enemyActiveHpBar = document.getElementById('enemy-active-hp-bar');
        this.playerActiveHpText = document.getElementById('player-active-hp-text');
        this.enemyActiveHpText = document.getElementById('enemy-active-hp-text');
        this.moveButtons = Array.from(document.querySelectorAll('.move-btn'));
        this.switchPokemonBtn = document.getElementById('switch-pokemon-btn') as HTMLButtonElement;
        this.backpackBtn = document.getElementById('backpack-btn') as HTMLButtonElement;
        this.playerTeamList = document.getElementById('player-team-list');
        this.enemyTeamList = document.getElementById('enemy-team-list');
        this.switchModal = document.getElementById('switch-modal');
        this.switchOptions = document.getElementById('switch-options');
        
        this.bindEvents();
        this.initRenderer();
    }

    initRenderer(): void {
        if (!this.battleCanvas) return;
        
        try {
            this.renderer = new WebGLRenderer(this.battleCanvas);
            this.renderLoop();
        } catch (e) {
            console.error('无法创建 WebGL 渲染器:', e);
        }
    }

    bindEvents(): void {
        this.moveButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (!this.isBattleProcessing && !this.isSwitchModalOpen) {
                    this.selectMove(index);
                }
            });
        });
        
        this.switchPokemonBtn?.addEventListener('click', () => {
            if (!this.isBattleProcessing && !this.isSwitchModalOpen) {
                this.openSwitchModal(false);
            }
        });
        
        this.switchOptions?.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const pokemonCard = target?.closest('.switch-option') as HTMLElement;
            if (pokemonCard) {
                const index = parseInt(pokemonCard.dataset.index || '');
                if (!isNaN(index)) {
                    this.selectSwitch(index);
                }
            }
        });
        
        document.getElementById('close-switch-modal')?.addEventListener('click', () => {
            this.closeSwitchModal();
        });
    }

    startBattle(playerPokemon: Pokemon[], enemyPokemon: Pokemon[]): void {
        const playerIds = playerPokemon.map(p => p.id);
        const enemyIds = enemyPokemon.map(p => p.id);
        this.battleSystem = new BattleSystem(playerIds, enemyIds);
        const state = this.battleSystem.getBattleState();
        
        this.playerPokemon = state.playerPokemon;
        this.enemyPokemon = state.enemyPokemon;
        this.activePlayerIndex = state.activePlayerIndex;
        this.activeEnemyIndex = state.activeEnemyIndex;
        
        this.hideSwitchModal();
        this.show();
        this.updateUI();
        this.battleMessage!.textContent = '战斗开始！';
        
        setTimeout(() => {
            this.processTurn();
        }, 1500);
    }

    processTurn(): void {
        if (!this.battleSystem) return;
        
        this.isBattleProcessing = true;
        this.disableMoveButtons();
        
        const state = this.battleSystem.getBattleState();
        
        if (state.playerPokemon.currentHp <= 0) {
            this.handleFaintedPokemon(true);
            return;
        }
        
        if (state.enemyPokemon.currentHp <= 0) {
            this.handleFaintedPokemon(false);
            return;
        }
        
        if (state.playerPokemon.stats.speed >= state.enemyPokemon.stats.speed) {
            this.playerTurn();
        } else {
            this.enemyTurn();
        }
    }

    playerTurn(): void {
        if (!this.battleSystem) return;
        
        this.battleMessage!.textContent = `轮到 ${this.battleSystem.getBattleState().playerPokemon.name} 行动！`;
        this.isBattleProcessing = false;
        this.enableMoveButtons();
        this.updateSwitchButton();
    }

    selectMove(moveIndex: number): void {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        const move = state.playerPokemon.moves[moveIndex];
        
        if (!move || move.currentPp <= 0) return;
        
        const action: BattleAction = {
            type: ActionType.USE_MOVE,
            moveIndex
        };
        
        this.executePlayerAction(action);
    }

    selectSwitch(pokemonIndex: number): void {
        if (!this.battleSystem) return;
        
        const action: BattleAction = {
            type: ActionType.SWITCH,
            pokemonIndex
        };
        
        this.closeSwitchModal();
        this.executePlayerAction(action);
    }

    executePlayerAction(action: BattleAction): void {
        if (!this.battleSystem) return;
        
        this.disableMoveButtons();
        this.isBattleProcessing = true;
        
        if (action.type === ActionType.USE_MOVE) {
            const move = this.battleSystem.getBattleState().playerPokemon.moves[action.moveIndex];
            this.battleMessage!.textContent = `${this.playerPokemon!.name} 使用了 ${move.name}！`;
            this.currentAnimation = 'attack';
            this.attackAnimationProgress = 0;
            
            setTimeout(() => {
                this.battleSystem!.executeAction('player', action);
                this.handleBattleResult();
            }, 1000);
        } else if (action.type === ActionType.SWITCH) {
            this.battleMessage!.textContent = `${this.playerPokemon!.name} 返回！`;
            this.currentAnimation = 'switch';
            
            setTimeout(() => {
                this.battleSystem!.executeAction('player', action);
                this.currentAnimation = 'idle';
                this.updateUI();
                this.enemyTurn();
            }, 1500);
        }
    }

    enemyTurn(): void {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        this.battleMessage!.textContent = `轮到 ${state.enemyPokemon.name} 行动！`;
        
        setTimeout(() => {
            const enemyAction = this.battleSystem!.getEnemyAction();
            const move = state.enemyPokemon.moves[enemyAction.moveIndex];
            
            this.battleMessage!.textContent = `${state.enemyPokemon.name} 使用了 ${move.name}！`;
            this.currentAnimation = 'attack';
            this.attackAnimationProgress = 0;
            
            setTimeout(() => {
                this.battleSystem!.executeAction('enemy', enemyAction);
                this.handleBattleResult();
            }, 1000);
        }, 1500);
    }

    handleBattleResult(): void {
        if (!this.battleSystem) return;
        
        this.currentAnimation = 'damage';
        this.damageAnimationProgress = 0;
        
        const state = this.battleSystem.getBattleState();
        
        if (state.enemyPokemon.currentHp <= 0) {
            this.battleMessage!.textContent = `${state.enemyPokemon.name} 倒下了！`;
            this.shakeEnemy();
            
            setTimeout(() => {
                if (this.battleSystem!.hasMoreEnemies()) {
                    this.battleSystem!.switchEnemyPokemon();
                    this.updateUI();
                    this.processTurn();
                } else {
                    this.endBattle();
                }
            }, 1500);
        } else if (state.playerPokemon.currentHp <= 0) {
            this.battleMessage!.textContent = `${state.playerPokemon.name} 倒下了！`;
            this.shakePlayer();
            this.handleFaintedPokemon(true);
        } else {
            setTimeout(() => {
                this.updateUI();
                this.processTurn();
            }, 1000);
        }
    }

    handleFaintedPokemon(isPlayer: boolean): void {
        if (!this.battleSystem) return;
        
        if (isPlayer) {
            const availableIndices = this.battleSystem.getPlayerAvailableIndices();
            if (availableIndices.length > 0) {
                this.battleMessage!.textContent = `${this.playerPokemon!.name} 倒下了！请选择下一只宝可梦！`;
                this.openSwitchModal(true);
                this.isBattleProcessing = false;
            } else {
                this.endBattle();
            }
        } else {
            const availableIndices = this.battleSystem.getEnemyAvailableIndices();
            if (availableIndices.length > 0) {
                this.battleMessage!.textContent = `${this.enemyPokemon!.name} 倒下了！`;
                setTimeout(() => {
                    this.battleSystem!.switchEnemyPokemon();
                    this.updateUI();
                    this.processTurn();
                }, 1500);
            } else {
                this.endBattle();
            }
        }
    }

    shakePlayer(): void {
        this.playerShake.x = (Math.random() - 0.5) * 0.2;
        this.playerShake.y = (Math.random() - 0.5) * 0.2;
        this.playerShake.z = (Math.random() - 0.5) * 0.2;
    }

    shakeEnemy(): void {
        this.enemyShake.x = (Math.random() - 0.5) * 0.2;
        this.enemyShake.y = (Math.random() - 0.5) * 0.2;
        this.enemyShake.z = (Math.random() - 0.5) * 0.2;
    }

    updateUI(): void {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        
        this.activePlayerIndex = state.activePlayerIndex;
        this.activeEnemyIndex = state.activeEnemyIndex;
        
        this.playerPokemon = state.playerPokemon;
        this.enemyPokemon = state.enemyPokemon;
        
        if (this.playerActiveName) {
            this.playerActiveName.textContent = state.playerPokemon.name;
        }
        if (this.enemyActiveName) {
            this.enemyActiveName.textContent = state.enemyPokemon.name;
        }
        
        const playerHpPercent = (state.playerPokemon.currentHp / state.playerPokemon.maxHp) * 100;
        const enemyHpPercent = (state.enemyPokemon.currentHp / state.enemyPokemon.maxHp) * 100;
        
        if (this.playerActiveHpBar) {
            this.playerActiveHpBar.style.width = `${playerHpPercent}%`;
        }
        if (this.enemyActiveHpBar) {
            this.enemyActiveHpBar.style.width = `${enemyHpPercent}%`;
        }
        
        if (this.playerActiveHpText) {
            this.playerActiveHpText.textContent = `${state.playerPokemon.currentHp}/${state.playerPokemon.maxHp}`;
        }
        if (this.enemyActiveHpText) {
            this.enemyActiveHpText.textContent = `${state.enemyPokemon.currentHp}/${state.enemyPokemon.maxHp}`;
        }
        
        this.updateSmallHpBarColor(this.playerActiveHpBar!, playerHpPercent);
        this.updateSmallHpBarColor(this.enemyActiveHpBar!, enemyHpPercent);
        
        state.playerPokemon.moves.forEach((move, index) => {
            if (index < this.moveButtons.length) {
                const button = this.moveButtons[index];
                button.textContent = `${move.name} (${move.currentPp}/${move.maxPp})`;
                button.style.backgroundColor = this.getTypeColor(move.type);
                button.disabled = move.currentPp <= 0;
            }
        });
        
        this.renderTeamSidebar();
        this.updateSwitchButton();
    }

    updateSwitchButton(): void {
        if (!this.battleSystem || !this.switchPokemonBtn) {
            if (this.switchPokemonBtn) {
                this.switchPokemonBtn.disabled = true;
            }
            return;
        }
        
        const canSwitch = this.battleSystem.canPlayerSwitch();
        this.switchPokemonBtn.disabled = !canSwitch;
        
        if (canSwitch) {
            this.switchPokemonBtn.classList.remove('disabled');
        } else {
            this.switchPokemonBtn.classList.add('disabled');
        }
    }

    updateSmallHpBarColor(hpBar: HTMLElement, percent: number): void {
        hpBar.classList.remove('low', 'critical');
        
        if (percent <= 20) {
            hpBar.classList.add('critical');
        } else if (percent <= 50) {
            hpBar.classList.add('low');
        }
    }

    getTypeColor(type: PokemonType): string {
        const colors: Record<PokemonType, string> = {
            [PokemonType.NORMAL]: '#A8A878',
            [PokemonType.FIRE]: '#F08030',
            [PokemonType.WATER]: '#6890F0',
            [PokemonType.ELECTRIC]: '#F8D030',
            [PokemonType.GRASS]: '#78C850',
            [PokemonType.ICE]: '#98D8D8',
            [PokemonType.FIGHTING]: '#C03028',
            [PokemonType.POISON]: '#A040A0',
            [PokemonType.GROUND]: '#E0C068',
            [PokemonType.FLYING]: '#A890F0',
            [PokemonType.PSYCHIC]: '#F85888',
            [PokemonType.BUG]: '#A8B820',
            [PokemonType.ROCK]: '#B8A038',
            [PokemonType.GHOST]: '#705898',
            [PokemonType.DRAGON]: '#7038F8',
            [PokemonType.DARK]: '#705848',
            [PokemonType.STEEL]: '#B8B8D0',
            [PokemonType.FAIRY]: '#EE99AC'
        };
        return colors[type] || colors[PokemonType.NORMAL];
    }

    disableMoveButtons(): void {
        this.moveButtons.forEach(button => {
            button.disabled = true;
        });
        if (this.switchPokemonBtn) {
            this.switchPokemonBtn.disabled = true;
        }
    }

    enableMoveButtons(): void {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        state.playerPokemon.moves.forEach((move, index) => {
            if (index < this.moveButtons.length) {
                this.moveButtons[index].disabled = move.currentPp <= 0;
            }
        });
        this.updateSwitchButton();
    }

    renderTeamSidebar(): void {
        if (!this.playerTeamList || !this.enemyTeamList || !this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        
        // 渲染玩家后备队伍
        let playerHtml = '';
        state.playerTeam.forEach((pokemon, index) => {
            if (index === state.activePlayerIndex) return;
            const isFainted = pokemon.currentHp <= 0;
            const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
            const hpClass = hpPercent > 50 ? '' : hpPercent > 20 ? 'low' : 'critical';
            
            playerHtml += `
                <div class="team-pokemon-small ${isFainted ? 'fainted' : ''}" data-index="${index}">
                    <div class="team-name">${pokemon.name}</div>
                    <div class="team-hp">
                        <div class="team-hp-bar">
                            <div class="team-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                        </div>
                        <span class="team-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</span>
                    </div>
                </div>
            `;
        });
        
        this.playerTeamList.innerHTML = playerHtml;
        
        // 渲染对手后备队伍
        let enemyHtml = '';
        state.enemyTeam.forEach((pokemon, index) => {
            if (index === state.activeEnemyIndex) return;
            const isFainted = pokemon.currentHp <= 0;
            const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
            const hpClass = hpPercent > 50 ? '' : hpPercent > 20 ? 'low' : 'critical';
            
            enemyHtml += `
                <div class="team-pokemon-small ${isFainted ? 'fainted' : ''}" data-index="${index}">
                    <div class="team-name">${pokemon.name}</div>
                    <div class="team-hp">
                        <div class="team-hp-bar">
                            <div class="team-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                        </div>
                        <span class="team-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</span>
                    </div>
                </div>
            `;
        });
        
        this.enemyTeamList.innerHTML = enemyHtml;
    }

    openSwitchModal(isForced: boolean): void {
        if (!this.switchModal || !this.switchOptions || !this.battleSystem) return;
        
        this.isSwitchModalOpen = true;
        this.isForcedSwitch = isForced;
        
        const state = this.battleSystem.getBattleState();
        
        let html = '';
        state.playerTeam.forEach((pokemon, index) => {
            if (index === state.activePlayerIndex) return;
            if (pokemon.currentHp <= 0) return;
            
            const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
            const hpClass = hpPercent > 50 ? '' : hpPercent > 20 ? 'low' : 'critical';
            
            html += `
                <div class="switch-option" data-index="${index}">
                    <div class="switch-option-name">${pokemon.name} Lv.${pokemon.level || 50}</div>
                    <div class="switch-option-hp">
                        <div class="switch-hp-bar-bg">
                            <div class="switch-hp-bar-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                        </div>
                        <div class="switch-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</div>
                    </div>
                </div>
            `;
        });
        
        this.switchOptions.innerHTML = html;
        this.switchModal.style.display = 'block';
    }

    closeSwitchModal(): void {
        if (!this.isForcedSwitch) {
            this.hideSwitchModal();
        }
    }

    hideSwitchModal(): void {
        if (this.switchModal) {
            this.switchModal.style.display = 'none';
        }
        this.isSwitchModalOpen = false;
        this.isForcedSwitch = false;
    }

    endBattle(): void {
        this.disableMoveButtons();
        
        if (!this.battleSystem) return;
        
        if (this.battleSystem.winner === 'player') {
            this.battleMessage!.textContent = '恭喜！你赢得了战斗！';
        } else {
            this.battleMessage!.textContent = '很遗憾，你输掉了战斗...';
        }
        
        setTimeout(() => {
            this.game.showResultPage(
                this.battleSystem.winner === 'player',
                this.playerPokemon!,
                this.enemyPokemon!,
                this.battleSystem.turn
            );
        }, 2000);
    }

    renderLoop(): void {
        if (!this.renderer || !this.battleCanvas) return;
        
        this.animationTime += 0.016;
        
        this.renderBattle();
        
        requestAnimationFrame(() => this.renderLoop());
    }

    renderBattle(): void {
        if (!this.renderer || !this.battleCanvas) return;
        
        renderBackground(this.renderer, this.backgroundName, this.animationTime);
        
        if (this.playerPokemon) {
            this.renderPokemon(
                this.renderer,
                this.playerPokemon,
                -1.5,
                -0.5 + this.playerShake.y,
                0,
                0.8,
                0,
                true
            );
        }
        
        if (this.enemyPokemon) {
            this.renderPokemon(
                this.renderer,
                this.enemyPokemon,
                1.5,
                0.5 + this.enemyShake.y,
                0,
                0.8,
                Math.PI,
                false
            );
        }
        
        this.playerShake = { x: 0, y: 0, z: 0 };
        this.enemyShake = { x: 0, y: 0, z: 0 };
    }

    renderPokemon(renderer: WebGLRenderer, pokemon: PokemonState, x: number, y: number, z: number, scale: number, rotationY: number, isPlayer: boolean): void {
        const model = getPokemonModel(pokemon.shape || 'default');
        const color = pokemon.color || [0.5, 0.5, 0.5];
        const secondaryColor = pokemon.secondaryColor || color;
        const elements = model.elements;
        
        const bobY = Math.sin(this.animationTime * 2) * 0.05;
        let animY = y + bobY;
        
        if (this.currentAnimation === 'attack') {
            if (isPlayer) {
                animY += Math.sin(this.attackAnimationProgress * Math.PI) * 0.3;
            } else {
                animY += Math.sin(this.attackAnimationProgress * Math.PI) * 0.3;
            }
            this.attackAnimationProgress += 0.1;
        }
        
        if (this.currentAnimation === 'damage') {
            animY += Math.sin(this.damageAnimationProgress * Math.PI * 4) * 0.1;
            this.damageAnimationProgress += 0.05;
        }
        
        for (const [key, element] of Object.entries(elements)) {
            const elems: ModelElement[] = Array.isArray(element) ? element : [element];
            
            for (const elem of elems) {
                const pos = elem.position || { x: 0, y: 0, z: 0 };
                const rot = elem.rotation || { x: 0, y: 0, z: 0 };
                const elemColor = elem.color || (elem.useSecondaryColor ? secondaryColor : color);
                
                let matrix = renderer.translateMatrix(x + pos.x, animY + pos.y, z + pos.z);
                matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(rotationY));
                
                if (rot.z !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateZMatrix(rot.z));
                if (rot.x !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateXMatrix(rot.x));
                if (rot.y !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(rot.y));
                
                matrix = renderer.multiplyMatrices(matrix, renderer.scaleMatrix(scale, scale, scale));
                
                const shape = this.createShape(renderer, elem, elemColor, secondaryColor);
                renderer.drawShape(shape, matrix);
            }
        }
    }

    createShape(renderer: WebGLRenderer, element: ModelElement, color: number[], secondaryColor: number[]): { positionBuffer: WebGLBuffer; colorBuffer: WebGLBuffer; normalBuffer: WebGLBuffer; indexBuffer: WebGLBuffer; vertexCount: number } {
        const scale = element.scale;
        
        switch (element.type) {
            case 'sphere':
                return new Sphere(renderer, color, typeof scale === 'number' ? scale : 0.3, 12);
            case 'ellipsoid':
                const eScale = scale as { x?: number; y?: number; z?: number } || {};
                return new Ellipsoid(renderer, color, eScale.x || 0.5, eScale.y || 0.5, eScale.z || 0.5, 12);
            case 'cone':
                const cScale = scale as { radius?: number; height?: number } || {};
                return new Cone(renderer, color, cScale.radius || 0.1, cScale.height || 0.3, 8);
            case 'cylinder':
                const cyScale = scale as { radius?: number; height?: number } || {};
                return new Cylinder(renderer, color, cyScale.radius || 0.1, cyScale.height || 0.3, 8);
            case 'lightning':
                return new LightningTail(renderer, color, typeof scale === 'number' ? scale : 1.0);
            case 'flame':
                return new Flame(renderer, color, typeof scale === 'number' ? scale : 1.0, 8);
            case 'wing':
                return new Wing(renderer, color, typeof scale === 'number' ? scale : 1.0, 8);
            case 'shell':
                return new Shell(renderer, color, typeof scale === 'number' ? scale : 1.0, 8);
            case 'plantBulb':
                return new PlantBulb(renderer, color, secondaryColor, typeof scale === 'number' ? scale : 1.0, 8);
            default:
                return new Sphere(renderer, color, 0.3, 12);
        }
    }

    show(): void {
        document.getElementById('selection-page')?.classList.remove('active');
        document.getElementById('battle-page')?.classList.add('active');
        document.getElementById('result-page')?.classList.remove('active');
    }

    hide(): void {
        document.getElementById('battle-page')?.classList.remove('active');
        this.is3DAnimating = false;
        this.isBattleProcessing = false;
        this.isSwitchModalOpen = false;
        this.isForcedSwitch = false;
        this.battleSystem = null;
        if (this.switchModal) {
            this.switchModal.style.display = 'none';
        }
    }
}