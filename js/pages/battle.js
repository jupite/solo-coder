class BattlePage {
    constructor(game) {
        this.game = game;
        this.battleSystem = null;
        this.renderer = null;
        this.animationTime = 0;
        this.is3DAnimating = false;
        this.isBattleProcessing = false;
        this.playerPokemon = null;
        this.enemyPokemon = null;
        this.playerShapes = {};
        this.enemyShapes = {};
        this.playerPosition = { x: 2, y: 0.3, z: 0 };
        this.enemyPosition = { x: -2, y: 0.3, z: 0 };
        this.playerShake = { x: 0, y: 0, z: 0 };
        this.enemyShake = { x: 0, y: 0, z: 0 };
        
        this.init();
    }

    init() {
        this.battleCanvas = document.getElementById('battle-canvas');
        this.playerNameEl = document.getElementById('player-name');
        this.enemyNameEl = document.getElementById('enemy-name');
        this.playerHpBar = document.getElementById('player-hp-bar');
        this.enemyHpBar = document.getElementById('enemy-hp-bar');
        this.playerHpText = document.getElementById('player-hp-text');
        this.enemyHpText = document.getElementById('enemy-hp-text');
        this.moveButtons = document.querySelectorAll('.move-btn');
        this.battleMessage = document.getElementById('battle-message');
        
        this.bindEvents();
    }

    bindEvents() {
        this.moveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;
                
                const moveIndex = parseInt(e.target.dataset.move);
                this.executePlayerMove(moveIndex);
            });
        });
    }

    startBattle(playerPokemonId, enemyPokemonId) {
        this.playerPokemon = createPokemon(playerPokemonId, 50);
        this.enemyPokemon = createPokemon(enemyPokemonId, 50);
        
        const ai = new PokemonAI('medium');
        this.battleSystem = new BattleSystem(this.playerPokemon, this.enemyPokemon, ai);
        
        this.updateUI();
        this.initRenderer();
        
        if (this.battleSystem.isPlayerTurn) {
            this.battleMessage.textContent = `轮到 ${this.playerPokemon.name} 行动！`;
        } else {
            this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
            setTimeout(() => this.executeEnemyTurn(), 1000);
        }
        
        this.startAnimation();
    }

    initRenderer() {
        try {
            this.renderer = new WebGLRenderer(this.battleCanvas);
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        } catch (e) {
            console.error('无法创建 WebGL 上下文:', e);
        }
    }

    resizeCanvas() {
        if (!this.renderer) return;
        
        const container = this.battleCanvas.parentElement;
        const width = container.clientWidth;
        const height = 500;
        
        this.renderer.resize(width, height);
    }

    startAnimation() {
        this.is3DAnimating = true;
        
        const animate = () => {
            if (!this.battleSystem) {
                this.is3DAnimating = false;
                return;
            }
            
            this.animationTime = Date.now() * 0.001;
            
            this.playerShake.x *= 0.9;
            this.playerShake.y *= 0.9;
            this.playerShake.z *= 0.9;
            this.enemyShake.x *= 0.9;
            this.enemyShake.y *= 0.9;
            this.enemyShake.z *= 0.9;
            
            this.renderBattleScene();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    renderBattleScene() {
        if (!this.renderer) return;
        
        const gl = this.renderer.gl;
        const canvas = this.renderer.canvas;
        
        this.renderer.clear(0.3, 0.6, 0.9, 1.0);
        this.renderer.setViewport(canvas.width, canvas.height);
        this.renderer.useProgram();
        
        const aspect = canvas.width / canvas.height;
        this.renderer.projectionMatrix = this.renderer.perspectiveMatrix(Math.PI / 4, aspect, 0.1, 100);
        this.renderer.modelViewMatrix = this.renderer.lookAt([0, 2, 6], [0, 0.5, 0], [0, 1, 0]);
        
        this.renderer.setLighting(
            [5, 5, 5],
            [1.0, 1.0, 1.0],
            0.3,
            0.6,
            0.3,
            32
        );
        
        this.drawBattleGround();
        
        if (this.playerPokemon && !this.playerPokemon.isFainted()) {
            this.drawPokemon(this.playerPokemon, this.playerPosition, this.playerShake, true);
        }
        
        if (this.enemyPokemon && !this.enemyPokemon.isFainted()) {
            this.drawPokemon(this.enemyPokemon, this.enemyPosition, this.enemyShake, false);
        }
    }

    drawBattleGround() {
        const ground = new Cube(this.renderer, [0.4, 0.8, 0.4, 1.0], 1);
        
        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                let groundMatrix = this.renderer.translateMatrix(i * 0.9, -0.6, j * 0.9);
                groundMatrix = this.renderer.multiplyMatrices(groundMatrix, this.renderer.scaleMatrix(0.8, 0.2, 0.8));
                this.renderer.drawShape(ground, groundMatrix);
            }
        }
    }

    drawPokemon(pokemon, position, shake, isPlayer) {
        const color = pokemon.color;
        const secondaryColor = pokemon.secondaryColor || color;
        
        const body = new Sphere(this.renderer, color, 0.5, 16);
        const head = new Sphere(this.renderer, color, 0.4, 16);
        const eyeWhite = new Sphere(this.renderer, [1.0, 1.0, 1.0, 1.0], 0.1, 8);
        const eyeBlack = new Sphere(this.renderer, [0.0, 0.0, 0.0, 1.0], 0.05, 8);
        
        const bobY = Math.sin(this.animationTime * 2) * 0.05;
        const baseX = position.x + shake.x;
        const baseY = position.y + shake.y + bobY;
        const baseZ = position.z + shake.z;
        
        let bodyMatrix = this.renderer.translateMatrix(baseX, baseY, baseZ);
        bodyMatrix = this.renderer.multiplyMatrices(bodyMatrix, this.renderer.scaleMatrix(1.2, 1.2, 1.2));
        this.renderer.drawShape(body, bodyMatrix);
        
        let headMatrix = this.renderer.translateMatrix(baseX, baseY + 0.5, baseZ);
        headMatrix = this.renderer.multiplyMatrices(headMatrix, this.renderer.scaleMatrix(1.1, 1.1, 1.1));
        this.renderer.drawShape(head, headMatrix);
        
        const eyeOffsetX = isPlayer ? 0.12 : -0.12;
        
        let leftEyeMatrix = this.renderer.translateMatrix(baseX - 0.12 + eyeOffsetX * 0.5, baseY + 0.55, baseZ + 0.3);
        this.renderer.drawShape(eyeWhite, leftEyeMatrix);
        
        let rightEyeMatrix = this.renderer.translateMatrix(baseX + 0.12 + eyeOffsetX * 0.5, baseY + 0.55, baseZ + 0.3);
        this.renderer.drawShape(eyeWhite, rightEyeMatrix);
        
        let leftPupilMatrix = this.renderer.translateMatrix(baseX - 0.1 + eyeOffsetX, baseY + 0.55, baseZ + 0.35);
        this.renderer.drawShape(eyeBlack, leftPupilMatrix);
        
        let rightPupilMatrix = this.renderer.translateMatrix(baseX + 0.14 + eyeOffsetX, baseY + 0.55, baseZ + 0.35);
        this.renderer.drawShape(eyeBlack, rightPupilMatrix);
        
        if (pokemon.shape === 'pikachu' || pokemon.shape === 'raichu') {
            const ear = new Cone(this.renderer, secondaryColor, 0.12, 0.35, 8);
            
            let leftEarMatrix = this.renderer.translateMatrix(baseX - 0.2, baseY + 0.8, baseZ);
            leftEarMatrix = this.renderer.multiplyMatrices(leftEarMatrix, this.renderer.rotateZMatrix(-0.4));
            this.renderer.drawShape(ear, leftEarMatrix);
            
            let rightEarMatrix = this.renderer.translateMatrix(baseX + 0.2, baseY + 0.8, baseZ);
            rightEarMatrix = this.renderer.multiplyMatrices(rightEarMatrix, this.renderer.rotateZMatrix(0.4));
            this.renderer.drawShape(ear, rightEarMatrix);
        }
    }

    executePlayerMove(moveIndex) {
        if (!this.battleSystem || this.battleSystem.battleOver || !this.battleSystem.isPlayerTurn || this.isBattleProcessing) return;
        
        const move = this.playerPokemon.moves[moveIndex];
        if (!move || move.currentPp <= 0) {
            this.battleMessage.textContent = `${move ? move.name : '该招式'} 的PP已用尽！`;
            return;
        }
        
        this.isBattleProcessing = true;
        this.disableMoveButtons();
        
        const result = this.battleSystem.playerTurn(moveIndex);
        
        if (result) {
            this.battleMessage.textContent = result.message;
            
            if (!result.missed && result.damage > 0) {
                this.shakeEnemy();
            }
            
            this.updateUI();
            
            setTimeout(() => {
                if (this.battleSystem.battleOver) {
                    this.endBattle();
                } else {
                    this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
                    setTimeout(() => this.executeEnemyTurn(), 1000);
                }
            }, 1500);
        }
    }

    executeEnemyTurn() {
        if (!this.battleSystem || this.battleSystem.battleOver || this.battleSystem.isPlayerTurn) return;
        
        const result = this.battleSystem.enemyTurn();
        
        if (result) {
            this.battleMessage.textContent = result.message;
            
            if (!result.missed && result.damage > 0) {
                this.shakePlayer();
            }
            
            this.updateUI();
            
            setTimeout(() => {
                if (this.battleSystem.battleOver) {
                    this.endBattle();
                } else {
                    this.battleMessage.textContent = `轮到 ${this.playerPokemon.name} 行动！`;
                    this.isBattleProcessing = false;
                    this.enableMoveButtons();
                }
            }, 1500);
        }
    }

    shakePlayer() {
        this.playerShake.x = (Math.random() - 0.5) * 0.2;
        this.playerShake.y = (Math.random() - 0.5) * 0.2;
        this.playerShake.z = (Math.random() - 0.5) * 0.2;
    }

    shakeEnemy() {
        this.enemyShake.x = (Math.random() - 0.5) * 0.2;
        this.enemyShake.y = (Math.random() - 0.5) * 0.2;
        this.enemyShake.z = (Math.random() - 0.5) * 0.2;
    }

    updateUI() {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        
        this.playerNameEl.textContent = state.playerPokemon.name;
        this.enemyNameEl.textContent = state.enemyPokemon.name;
        
        const playerHpPercent = (state.playerPokemon.currentHp / state.playerPokemon.maxHp) * 100;
        const enemyHpPercent = (state.enemyPokemon.currentHp / state.enemyPokemon.maxHp) * 100;
        
        this.playerHpBar.style.width = `${playerHpPercent}%`;
        this.enemyHpBar.style.width = `${enemyHpPercent}%`;
        
        this.playerHpText.textContent = `${state.playerPokemon.currentHp}/${state.playerPokemon.maxHp}`;
        this.enemyHpText.textContent = `${state.enemyPokemon.currentHp}/${state.enemyPokemon.maxHp}`;
        
        this.updateHpBarColor(this.playerHpBar, playerHpPercent);
        this.updateHpBarColor(this.enemyHpBar, enemyHpPercent);
        
        state.playerPokemon.moves.forEach((move, index) => {
            if (index < this.moveButtons.length) {
                const button = this.moveButtons[index];
                button.textContent = `${move.name} (${move.currentPp}/${move.maxPp})`;
                button.style.backgroundColor = this.getTypeColor(move.type);
                button.disabled = move.currentPp <= 0;
            }
        });
    }

    updateHpBarColor(hpBar, percent) {
        hpBar.classList.remove('low', 'critical');
        
        if (percent <= 20) {
            hpBar.classList.add('critical');
        } else if (percent <= 50) {
            hpBar.classList.add('low');
        }
    }

    getTypeColor(type) {
        const colors = {
            normal: '#A8A878',
            fire: '#F08030',
            water: '#6890F0',
            electric: '#F8D030',
            grass: '#78C850',
            ice: '#98D8D8',
            fighting: '#C03028',
            poison: '#A040A0',
            ground: '#E0C068',
            flying: '#A890F0',
            psychic: '#F85888',
            bug: '#A8B820',
            rock: '#B8A038',
            ghost: '#705898',
            dragon: '#7038F8',
            dark: '#705848',
            steel: '#B8B8D0',
            fairy: '#EE99AC'
        };
        return colors[type] || colors.normal;
    }

    disableMoveButtons() {
        this.moveButtons.forEach(button => {
            button.disabled = true;
        });
    }

    enableMoveButtons() {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        state.playerPokemon.moves.forEach((move, index) => {
            if (index < this.moveButtons.length) {
                this.moveButtons[index].disabled = move.currentPp <= 0;
            }
        });
    }

    endBattle() {
        this.disableMoveButtons();
        
        if (this.battleSystem.winner === 'player') {
            this.battleMessage.textContent = `恭喜！你赢得了战斗！`;
        } else {
            this.battleMessage.textContent = `很遗憾，你输掉了战斗...`;
        }
        
        setTimeout(() => {
            this.game.showResultPage(
                this.battleSystem.winner === 'player',
                this.playerPokemon,
                this.enemyPokemon,
                this.battleSystem.turn
            );
        }, 2000);
    }

    show() {
        document.getElementById('selection-page').classList.remove('active');
        document.getElementById('battle-page').classList.add('active');
        document.getElementById('result-page').classList.remove('active');
    }

    hide() {
        document.getElementById('battle-page').classList.remove('active');
        this.is3DAnimating = false;
        this.isBattleProcessing = false;
        this.battleSystem = null;
    }
}
