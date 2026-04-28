import { WebGLRenderer } from '../webgl/renderer';
import { Sphere, Ellipsoid, Cone, Cylinder, LightningTail, Flame, Wing, Shell, PlantBulb } from '../webgl/shapes';
import { getPokemonModel, ModelElement } from '../webgl/pokemon-models';
import { PokemonType } from '../types';

export interface PokemonState {
    id?: number;
    name: string;
    level?: number;
    currentHp: number;
    maxHp: number;
    types: PokemonType[];
    color?: number[];
    secondaryColor?: number[];
    shape?: string;
}

export interface Game {
    showSelectionPage: () => void;
}

export class ResultPage {
    game: Game;
    playerRenderer: WebGLRenderer | null = null;
    enemyRenderer: WebGLRenderer | null = null;
    
    resultTitle: HTMLElement | null = null;
    resultStats: HTMLElement | null = null;
    playAgainBtn: HTMLElement | null = null;
    backToSelectionBtn: HTMLElement | null = null;

    constructor(game: Game) {
        this.game = game;
        this.init();
    }

    init(): void {
        this.resultTitle = document.getElementById('result-title');
        this.resultStats = document.getElementById('result-stats');
        this.playAgainBtn = document.getElementById('play-again');
        this.backToSelectionBtn = document.getElementById('back-to-selection');
        
        this.bindEvents();
    }

    bindEvents(): void {
        this.playAgainBtn?.addEventListener('click', () => {
            this.game.showSelectionPage();
        });
        
        this.backToSelectionBtn?.addEventListener('click', () => {
            this.game.showSelectionPage();
        });
    }

    showResult(isWin: boolean, playerPokemon: PokemonState, enemyPokemon: PokemonState, turns: number): void {
        if (!this.resultTitle) return;
        
        if (isWin) {
            this.resultTitle.textContent = '胜利！';
            this.resultTitle.className = 'win';
        } else {
            this.resultTitle.textContent = '失败...';
            this.resultTitle.className = 'lose';
        }
        
        this.renderPokemonPreview('player', playerPokemon);
        this.renderPokemonPreview('enemy', enemyPokemon);
        
        this.updateStats(isWin, playerPokemon, enemyPokemon, turns);
        
        this.show();
    }

    renderPokemonPreview(side: 'player' | 'enemy', pokemon: PokemonState): void {
        const canvasId = side === 'player' ? 'result-player-canvas' : 'result-enemy-canvas';
        const statsId = side === 'player' ? 'result-player-stats' : 'result-enemy-stats';
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const statsEl = document.getElementById(statsId);
        
        if (!canvas || !statsEl) return;
        
        statsEl.innerHTML = this.createStatsHTML(pokemon);
        
        try {
            const renderer = new WebGLRenderer(canvas);
            
            if (side === 'player') {
                this.playerRenderer = renderer;
            } else {
                this.enemyRenderer = renderer;
            }
            
            const animate = () => {
                if (!canvas.isConnected) return;
                
                this.renderPokemon3D(renderer, pokemon, Date.now() * 0.001);
                requestAnimationFrame(animate);
            };
            animate();
        } catch (e) {
            console.error('无法创建 WebGL 上下文:', e);
            this.renderPokemon2D(canvas, pokemon);
        }
    }

    createStatsHTML(pokemon: PokemonState): string {
        const typeNames: Record<PokemonType, string> = {
            [PokemonType.NORMAL]: '一般',
            [PokemonType.FIRE]: '火',
            [PokemonType.WATER]: '水',
            [PokemonType.ELECTRIC]: '电',
            [PokemonType.GRASS]: '草',
            [PokemonType.ICE]: '冰',
            [PokemonType.FIGHTING]: '格斗',
            [PokemonType.POISON]: '毒',
            [PokemonType.GROUND]: '地面',
            [PokemonType.FLYING]: '飞行',
            [PokemonType.PSYCHIC]: '超能力',
            [PokemonType.BUG]: '虫',
            [PokemonType.ROCK]: '岩石',
            [PokemonType.GHOST]: '幽灵',
            [PokemonType.DRAGON]: '龙',
            [PokemonType.DARK]: '恶',
            [PokemonType.STEEL]: '钢',
            [PokemonType.FAIRY]: '妖精'
        };
        
        return `
            <p><strong>名称:</strong> ${pokemon.name}</p>
            <p><strong>等级:</strong> ${pokemon.level || 50}</p>
            <p><strong>剩余HP:</strong> ${pokemon.currentHp}/${pokemon.maxHp}</p>
            <p><strong>属性:</strong> ${pokemon.types.map(t => typeNames[t] || t).join(' / ')}</p>
        `;
    }

    renderPokemon3D(renderer: WebGLRenderer, pokemon: PokemonState, time: number): void {
        const gl = renderer.gl;
        const canvas = renderer.canvas;
        
        renderer.clear(0.95, 0.95, 0.98, 1.0);
        renderer.setViewport(canvas.width, canvas.height);
        renderer.useProgram();
        
        const aspect = canvas.width / canvas.height;
        renderer.projectionMatrix = renderer.perspectiveMatrix(Math.PI / 4, aspect, 0.1, 100);
        renderer.modelViewMatrix = renderer.lookAt([0, 0, 2.5], [0, 0, 0], [0, 1, 0]);
        
        renderer.setLighting(
            [5, 5, 5],
            [1.0, 1.0, 1.0],
            0.3,
            0.6,
            0.3,
            32
        );
        
        this.drawPokemonShape(renderer, pokemon, time);
    }

    drawPokemonShape(renderer: WebGLRenderer, pokemon: PokemonState, time: number): void {
        const model = getPokemonModel(pokemon.shape || 'default');
        const color = pokemon.color || [0.5, 0.5, 0.5];
        const secondaryColor = pokemon.secondaryColor || color;
        const elements = model.elements;
        
        const bobY = Math.sin(time * 2) * 0.05;
        const rotateY = Math.sin(time * 0.5) * 0.3;
        
        for (const [key, element] of Object.entries(elements)) {
            const elems: ModelElement[] = Array.isArray(element) ? element : [element];
            
            for (const elem of elems) {
                const pos = elem.position || { x: 0, y: 0, z: 0 };
                const rot = elem.rotation || { x: 0, y: 0, z: 0 };
                const elemColor = elem.color || (elem.useSecondaryColor ? secondaryColor : color);
                
                let matrix = renderer.translateMatrix(pos.x, bobY + pos.y, pos.z);
                matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(rotateY));
                
                if (rot.z !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateZMatrix(rot.z));
                if (rot.x !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateXMatrix(rot.x));
                if (rot.y !== 0) matrix = renderer.multiplyMatrices(matrix, renderer.rotateYMatrix(rot.y));
                
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

    renderPokemon2D(canvas: HTMLCanvasElement, pokemon: PokemonState): void {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, '#f5f5f5');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        ctx.save();
        ctx.translate(width/2, height/2);
        
        const color = pokemon.color || [0.5, 0.5, 0.5];
        const secondaryColor = pokemon.secondaryColor || color;
        
        ctx.fillStyle = `rgb(${Math.floor(color[0]*255)}, ${Math.floor(color[1]*255)}, ${Math.floor(color[2]*255)})`;
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgb(${Math.floor(secondaryColor[0]*255)}, ${Math.floor(secondaryColor[1]*255)}, ${Math.floor(secondaryColor[2]*255)})`;
        ctx.beginPath();
        ctx.arc(-20, -35, 18, 0, Math.PI * 2);
        ctx.arc(20, -35, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-15, -5, 10, 0, Math.PI * 2);
        ctx.arc(15, -5, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-12, -5, 5, 0, Math.PI * 2);
        ctx.arc(18, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 8, 12, 0, Math.PI);
        ctx.stroke();
        
        ctx.restore();
    }

    updateStats(isWin: boolean, playerPokemon: PokemonState, enemyPokemon: PokemonState, turns: number): void {
        if (!this.resultStats) return;
        
        const winText = isWin ? '胜利' : '失败';
        const winColor = isWin ? '#4caf50' : '#f44336';
        
        this.resultStats.innerHTML = `
            <p><strong>战斗结果:</strong> <span style="color: ${winColor}; font-weight: bold;">${winText}</span></p>
            <p><strong>回合数:</strong> ${turns}</p>
            <p><strong>你的宝可梦:</strong> ${playerPokemon.name}</p>
            <p><strong>对手宝可梦:</strong> ${enemyPokemon.name}</p>
            <p><strong>你的宝可梦剩余HP:</strong> ${playerPokemon.currentHp}/${playerPokemon.maxHp}</p>
            <p><strong>对手宝可梦剩余HP:</strong> ${enemyPokemon.currentHp}/${enemyPokemon.maxHp}</p>
        `;
    }

    show(): void {
        document.getElementById('selection-page')?.classList.remove('active');
        document.getElementById('battle-page')?.classList.remove('active');
        document.getElementById('result-page')?.classList.add('active');
    }

    hide(): void {
        document.getElementById('result-page')?.classList.remove('active');
    }
}