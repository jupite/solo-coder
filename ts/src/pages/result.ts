import type { Pokemon } from '../types';
import { WebGLRenderer } from '../webgl/renderer';
import { Sphere, Cone } from '../webgl/shapes';
import type { PokemonGame } from '../app';

export class ResultPage {
  game: PokemonGame;
  playerRenderer: WebGLRenderer | null;
  enemyRenderer: WebGLRenderer | null;

  resultTitle: HTMLHeadingElement | null;
  resultStats: HTMLDivElement | null;
  playAgainBtn: HTMLButtonElement | null;
  backToSelectionBtn: HTMLButtonElement | null;

  constructor(game: PokemonGame) {
    this.game = game;
    this.playerRenderer = null;
    this.enemyRenderer = null;

    this.resultTitle = null;
    this.resultStats = null;
    this.playAgainBtn = null;
    this.backToSelectionBtn = null;

    this.init();
  }

  init(): void {
    this.resultTitle = document.getElementById('result-title') as HTMLHeadingElement | null;
    this.resultStats = document.getElementById('result-stats') as HTMLDivElement | null;
    this.playAgainBtn = document.getElementById('play-again') as HTMLButtonElement | null;
    this.backToSelectionBtn = document.getElementById('back-to-selection') as HTMLButtonElement | null;

    this.bindEvents();
  }

  bindEvents(): void {
    if (this.playAgainBtn) {
      this.playAgainBtn.addEventListener('click', () => {
        this.game.showSelectionPage();
      });
    }

    if (this.backToSelectionBtn) {
      this.backToSelectionBtn.addEventListener('click', () => {
        this.game.showSelectionPage();
      });
    }
  }

  showResult(isWin: boolean, playerPokemon: Pokemon, enemyPokemon: Pokemon, turns: number): void {
    if (this.resultTitle) {
      if (isWin) {
        this.resultTitle.textContent = '胜利！';
        this.resultTitle.className = 'win';
      } else {
        this.resultTitle.textContent = '失败...';
        this.resultTitle.className = 'lose';
      }
    }

    this.renderPokemonPreview('player', playerPokemon);
    this.renderPokemonPreview('enemy', enemyPokemon);

    this.updateStats(isWin, playerPokemon, enemyPokemon, turns);

    this.show();
  }

  renderPokemonPreview(side: 'player' | 'enemy', pokemon: Pokemon): void {
    const canvasId = side === 'player' ? 'result-player-canvas' : 'result-enemy-canvas';
    const statsId = side === 'player' ? 'result-player-stats' : 'result-enemy-stats';
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const statsEl = document.getElementById(statsId) as HTMLDivElement;

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

  createStatsHTML(pokemon: Pokemon): string {
    const typeNames: Record<string, string> = {
      normal: '一般',
      fire: '火',
      water: '水',
      electric: '电',
      grass: '草',
      ice: '冰',
      fighting: '格斗',
      poison: '毒',
      ground: '地面',
      flying: '飞行',
      psychic: '超能力',
      bug: '虫',
      rock: '岩石',
      ghost: '幽灵',
      dragon: '龙',
      dark: '恶',
      steel: '钢',
      fairy: '妖精'
    };

    return `
      <p><strong>名称:</strong> ${pokemon.name}</p>
      <p><strong>等级:</strong> ${pokemon.level}</p>
      <p><strong>剩余HP:</strong> ${pokemon.currentHp}/${pokemon.maxHp}</p>
      <p><strong>属性:</strong> ${pokemon.types.map(t => typeNames[t] || t).join(' / ')}</p>
    `;
  }

  renderPokemon3D(renderer: WebGLRenderer, pokemon: Pokemon, time: number): void {
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

  drawPokemonShape(renderer: WebGLRenderer, pokemon: Pokemon, time: number): void {
    const color = pokemon.color;
    const secondaryColor = pokemon.secondaryColor || color;

    const body = new Sphere(renderer, color, 0.5, 16);
    const head = new Sphere(renderer, color, 0.4, 16);
    const eyeWhite = new Sphere(renderer, [1.0, 1.0, 1.0, 1.0], 0.1, 8);
    const eyeBlack = new Sphere(renderer, [0.0, 0.0, 0.0, 1.0], 0.05, 8);

    const bobY = Math.sin(time * 2) * 0.05;
    const rotateY = Math.sin(time * 0.5) * 0.3;

    let bodyMatrix = renderer.translateMatrix(0, bobY, 0);
    bodyMatrix = renderer.multiplyMatrices(bodyMatrix, renderer.rotateYMatrix(rotateY));
    bodyMatrix = renderer.multiplyMatrices(bodyMatrix, renderer.scaleMatrix(1.2, 1.2, 1.2));
    renderer.drawShape(body, bodyMatrix);

    let headMatrix = renderer.translateMatrix(0, bobY + 0.5, 0);
    headMatrix = renderer.multiplyMatrices(headMatrix, renderer.rotateYMatrix(rotateY));
    headMatrix = renderer.multiplyMatrices(headMatrix, renderer.scaleMatrix(1.1, 1.1, 1.1));
    renderer.drawShape(head, headMatrix);

    let leftEyeMatrix = renderer.translateMatrix(-0.12, bobY + 0.55, 0.3);
    leftEyeMatrix = renderer.multiplyMatrices(leftEyeMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeWhite, leftEyeMatrix);

    let rightEyeMatrix = renderer.translateMatrix(0.12, bobY + 0.55, 0.3);
    rightEyeMatrix = renderer.multiplyMatrices(rightEyeMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeWhite, rightEyeMatrix);

    let leftPupilMatrix = renderer.translateMatrix(-0.1, bobY + 0.55, 0.35);
    leftPupilMatrix = renderer.multiplyMatrices(leftPupilMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeBlack, leftPupilMatrix);

    let rightPupilMatrix = renderer.translateMatrix(0.14, bobY + 0.55, 0.35);
    rightPupilMatrix = renderer.multiplyMatrices(rightPupilMatrix, renderer.rotateYMatrix(rotateY));
    renderer.drawShape(eyeBlack, rightPupilMatrix);

    if (pokemon.shape === 'pikachu' || pokemon.shape === 'raichu') {
      const ear = new Cone(renderer, secondaryColor, 0.12, 0.35, 8);

      let leftEarMatrix = renderer.translateMatrix(-0.2, bobY + 0.8, 0);
      leftEarMatrix = renderer.multiplyMatrices(leftEarMatrix, renderer.rotateZMatrix(-0.4));
      leftEarMatrix = renderer.multiplyMatrices(leftEarMatrix, renderer.rotateYMatrix(rotateY));
      renderer.drawShape(ear, leftEarMatrix);

      let rightEarMatrix = renderer.translateMatrix(0.2, bobY + 0.8, 0);
      rightEarMatrix = renderer.multiplyMatrices(rightEarMatrix, renderer.rotateZMatrix(0.4));
      rightEarMatrix = renderer.multiplyMatrices(rightEarMatrix, renderer.rotateYMatrix(rotateY));
      renderer.drawShape(ear, rightEarMatrix);
    }
  }

  renderPokemon2D(canvas: HTMLCanvasElement, pokemon: Pokemon): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#f5f5f5');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);

    const color = pokemon.color;
    const secondaryColor = pokemon.secondaryColor || color;

    ctx.fillStyle = `rgb(${Math.floor(color[0] * 255)}, ${Math.floor(color[1] * 255)}, ${Math.floor(color[2] * 255)})`;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgb(${Math.floor(secondaryColor[0] * 255)}, ${Math.floor(secondaryColor[1] * 255)}, ${Math.floor(secondaryColor[2] * 255)})`;
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

  updateStats(isWin: boolean, playerPokemon: Pokemon, enemyPokemon: Pokemon, turns: number): void {
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
    const selectionPage = document.getElementById('selection-page');
    const battlePage = document.getElementById('battle-page');
    const resultPage = document.getElementById('result-page');

    if (selectionPage) selectionPage.classList.remove('active');
    if (battlePage) battlePage.classList.remove('active');
    if (resultPage) resultPage.classList.add('active');
  }

  hide(): void {
    const resultPage = document.getElementById('result-page');
    if (resultPage) resultPage.classList.remove('active');
  }
}