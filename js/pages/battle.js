class BattlePage {
    constructor(game) {
        this.game = game;
        this.battleSystem = null;
        this.renderer = null;
        this.animationTime = 0;
        this.is3DAnimating = false;
        this.isBattleProcessing = false;
        this.playerTeam = [];
        this.enemyTeam = [];
        this.activePlayerIndex = 0;
        this.activeEnemyIndex = 0;
        this.playerShake = { x: 0, y: 0, z: 0 };
        this.enemyShake = { x: 0, y: 0, z: 0 };
        this.isSwitchModalOpen = false;
        this.isForcedSwitch = false;
        this.playerActiveRenderer = null;
        this.enemyActiveRenderer = null;
        
        this.viewMode = '45deg';
        this.patternType = this.getRandomPattern();
        
        this.init();
    }
    
    getRandomPattern() {
        const patterns = ['spiral', 'star', 'rings'];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    get playerPokemon() {
        if (!this.battleSystem) return null;
        return this.battleSystem.playerPokemon;
    }

    get enemyPokemon() {
        if (!this.battleSystem) return null;
        return this.battleSystem.enemyPokemon;
    }

    init() {
        this.battleCanvas = document.getElementById('battle-canvas');
        this.playerActiveCanvas = document.getElementById('player-active-canvas');
        this.enemyActiveCanvas = document.getElementById('enemy-active-canvas');
        this.playerActiveName = document.getElementById('player-active-name');
        this.enemyActiveName = document.getElementById('enemy-active-name');
        this.playerActiveHpBar = document.getElementById('player-active-hp-bar');
        this.enemyActiveHpBar = document.getElementById('enemy-active-hp-bar');
        this.playerActiveHpText = document.getElementById('player-active-hp-text');
        this.enemyActiveHpText = document.getElementById('enemy-active-hp-text');
        this.moveButtons = document.querySelectorAll('.move-btn');
        this.battleMessage = document.getElementById('battle-message');
        this.playerTeamList = document.getElementById('player-team-list');
        this.enemyTeamList = document.getElementById('enemy-team-list');
        this.switchPokemonBtn = document.getElementById('switch-pokemon-btn');
        this.switchModal = document.getElementById('switch-modal');
        this.switchModalTitle = document.getElementById('switch-modal-title');
        this.switchOptions = document.getElementById('switch-options');
        this.cancelSwitchBtn = document.getElementById('cancel-switch-btn');
        this.viewToggleBtn = document.getElementById('view-toggle-btn');
        
        this.bindEvents();
    }

    bindEvents() {
        this.moveButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;
                if (this.isSwitchModalOpen) return;
                
                const moveIndex = parseInt(e.target.dataset.move);
                this.executePlayerMove(moveIndex);
            });
        });
        
        this.switchPokemonBtn.addEventListener('click', () => {
            if (this.isBattleProcessing || !this.battleSystem || !this.battleSystem.isPlayerTurn) return;
            if (!this.battleSystem.canPlayerSwitch()) return;
            
            this.openSwitchModal(false);
        });
        
        this.cancelSwitchBtn.addEventListener('click', () => {
            if (this.isForcedSwitch) return;
            this.closeSwitchModal();
        });
        
        this.viewToggleBtn.addEventListener('click', () => {
            this.toggleViewMode();
        });
    }
    
    toggleViewMode() {
        const modes = ['45deg', 'top', 'side'];
        const currentIndex = modes.indexOf(this.viewMode);
        this.viewMode = modes[(currentIndex + 1) % modes.length];
        
        const modeNames = {
            '45deg': '45度视角',
            'top': '俯视角',
            'side': '侧面视角'
        };
        this.viewToggleBtn.textContent = modeNames[this.viewMode];
    }

    startBattle(playerPokemonIds, enemyPokemonIds) {
        const ai = new PokemonAI('medium');
        this.battleSystem = new BattleSystem(playerPokemonIds, enemyPokemonIds, ai);
        
        this.updateUI();
        this.initRenderer();
        this.initSideRenderers();
        
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

    initSideRenderers() {
        try {
            this.playerActiveRenderer = new WebGLRenderer(this.playerActiveCanvas);
            this.enemyActiveRenderer = new WebGLRenderer(this.enemyActiveCanvas);
        } catch (e) {
            console.error('无法创建侧边栏 WebGL 上下文:', e);
        }
    }

    resizeCanvas() {
        if (!this.renderer) return;
        
        const container = this.battleCanvas.parentElement;
        const width = container.clientWidth;
        const height = 600;
        
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
            this.renderSidePokemon();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    renderSidePokemon() {
        if (this.playerActiveRenderer && this.playerPokemon) {
            this.renderMiniPokemon(this.playerActiveRenderer, this.playerPokemon, true);
        }
        if (this.enemyActiveRenderer && this.enemyPokemon) {
            this.renderMiniPokemon(this.enemyActiveRenderer, this.enemyPokemon, false);
        }
    }

    renderMiniPokemon(renderer, pokemon, isPlayer) {
        const canvas = renderer.canvas;
        const time = this.animationTime;
        
        renderer.clear(0.95, 0.95, 0.97, 1.0);
        renderer.setViewport(canvas.width, canvas.height);
        renderer.useProgram();
        
        const aspect = canvas.width / canvas.height;
        renderer.projectionMatrix = renderer.perspectiveMatrix(Math.PI / 4, aspect, 0.1, 100);
        renderer.modelViewMatrix = renderer.lookAt([0, 0, 2.5], [0, 0, 0], [0, 1, 0]);
        
        renderer.setLighting(
            [3, 3, 3],
            [1.0, 1.0, 1.0],
            0.3,
            0.6,
            0.3,
            32
        );
        
        this.drawMiniPokemonShape(renderer, pokemon, time, isPlayer);
    }

    drawMiniPokemonShape(renderer, pokemon, time, isPlayer) {
        const color = pokemon.color;
        const secondaryColor = pokemon.secondaryColor || color;
        
        const body = new Sphere(renderer, color, 0.4, 12);
        const head = new Sphere(renderer, color, 0.32, 12);
        const eyeWhite = new Sphere(renderer, [1.0, 1.0, 1.0, 1.0], 0.08, 6);
        const eyeBlack = new Sphere(renderer, [0.0, 0.0, 0.0, 1.0], 0.04, 6);
        
        const bobY = Math.sin(time * 2) * 0.03;
        const baseY = bobY;
        
        let bodyMatrix = renderer.translateMatrix(0, baseY, 0);
        bodyMatrix = renderer.multiplyMatrices(bodyMatrix, renderer.scaleMatrix(1.1, 1.1, 1.1));
        renderer.drawShape(body, bodyMatrix);
        
        let headMatrix = renderer.translateMatrix(0, baseY + 0.4, 0);
        headMatrix = renderer.multiplyMatrices(headMatrix, renderer.scaleMatrix(1.0, 1.0, 1.0));
        renderer.drawShape(head, headMatrix);
        
        const eyeOffsetX = isPlayer ? 0.1 : -0.1;
        
        let leftEyeMatrix = renderer.translateMatrix(-0.1 + eyeOffsetX * 0.5, baseY + 0.45, 0.25);
        renderer.drawShape(eyeWhite, leftEyeMatrix);
        
        let rightEyeMatrix = renderer.translateMatrix(0.1 + eyeOffsetX * 0.5, baseY + 0.45, 0.25);
        renderer.drawShape(eyeWhite, rightEyeMatrix);
        
        let leftPupilMatrix = renderer.translateMatrix(-0.08 + eyeOffsetX, baseY + 0.45, 0.3);
        renderer.drawShape(eyeBlack, leftPupilMatrix);
        
        let rightPupilMatrix = renderer.translateMatrix(0.12 + eyeOffsetX, baseY + 0.45, 0.3);
        renderer.drawShape(eyeBlack, rightPupilMatrix);
        
        if (pokemon.shape === 'pikachu' || pokemon.shape === 'raichu') {
            const ear = new Cone(renderer, secondaryColor, 0.1, 0.3, 6);
            
            let leftEarMatrix = renderer.translateMatrix(-0.15, baseY + 0.65, 0);
            leftEarMatrix = renderer.multiplyMatrices(leftEarMatrix, renderer.rotateZMatrix(-0.3));
            renderer.drawShape(ear, leftEarMatrix);
            
            let rightEarMatrix = renderer.translateMatrix(0.15, baseY + 0.65, 0);
            rightEarMatrix = renderer.multiplyMatrices(rightEarMatrix, renderer.rotateZMatrix(0.3));
            renderer.drawShape(ear, rightEarMatrix);
        }
    }

    renderBattleScene() {
        if (!this.renderer) return;
        
        const gl = this.renderer.gl;
        const canvas = this.renderer.canvas;
        
        this.renderer.clear(0.3, 0.6, 0.9, 1.0);
        this.renderer.setViewport(canvas.width, canvas.height);
        this.renderer.useProgram();
        
        const aspect = canvas.width / canvas.height;
        this.renderer.projectionMatrix = this.renderer.perspectiveMatrix(Math.PI / 3, aspect, 0.1, 100);
        
        const viewConfig = {
            '45deg': { eye: [-3, 6, 7], target: [0, 0.8, 0], up: [0, 1, 0] },
            'top': { eye: [0, 15, 0], target: [0, 0, 0], up: [0, 0, -1] },
            'side': { eye: [8, 4, 0], target: [0, 0.8, 0], up: [0, 1, 0] }
        };
        
        const config = viewConfig[this.viewMode] || viewConfig['45deg'];
        this.renderer.modelViewMatrix = this.renderer.lookAt(config.eye, config.target, config.up);
        
        this.renderer.setLighting(
            [5, 5, 5],
            [1.0, 1.0, 1.0],
            0.3,
            0.6,
            0.3,
            32
        );
        
        this.drawBattleArena();
        
        if (this.playerPokemon && !this.playerPokemon.isFainted()) {
            this.drawPokemon(this.playerPokemon, { x: -2, y: 0.6, z: 1.5 }, this.playerShake, true);
        }
        
        if (this.enemyPokemon && !this.enemyPokemon.isFainted()) {
            this.drawPokemon(this.enemyPokemon, { x: 2, y: 0.6, z: -1.5 }, this.enemyShake, false);
        }
    }

    drawBattleArena() {
        const platformRadius = 4;
        const platformHeight = 0.2;
        
        const outerRing = new Disc(this.renderer, [0.3, 0.3, 0.5, 1.0], platformRadius + 0.3, 64, platformHeight * 0.8);
        let outerRingMatrix = this.renderer.translateMatrix(0, -platformHeight * 0.8, 0);
        this.renderer.drawShape(outerRing, outerRingMatrix);
        
        const mainPlatform = new Disc(this.renderer, [0.4, 0.5, 0.6, 1.0], platformRadius, 64, platformHeight);
        let mainMatrix = this.renderer.translateMatrix(0, -platformHeight, 0);
        this.renderer.drawShape(mainPlatform, mainMatrix);
        
        const centerDisc = new Disc(this.renderer, [0.5, 0.6, 0.7, 1.0], platformRadius * 0.8, 64, platformHeight * 0.5);
        let centerMatrix = this.renderer.translateMatrix(0, -platformHeight * 0.5, 0);
        this.renderer.drawShape(centerDisc, centerMatrix);
        
        const pattern = new PatternShape(this.renderer, this.patternType, platformRadius * 0.7);
        this.renderer.drawShape(pattern, this.renderer.identityMatrix());
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

    renderTeamSidebar() {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        
        this.renderPlayerTeamList(state.playerTeam);
        this.renderEnemyTeamList(state.enemyTeam);
    }

    renderPlayerTeamList(playerTeam) {
        this.playerTeamList.innerHTML = '';
        
        playerTeam.forEach((pokemon, index) => {
            if (pokemon.isActive) return;
            
            const card = document.createElement('div');
            card.className = `team-pokemon-small ${pokemon.isFainted ? 'fainted' : ''}`;
            card.dataset.index = index;
            
            const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
            const hpColor = hpPercent <= 20 ? 'critical' : hpPercent <= 50 ? 'low' : '';
            
            card.innerHTML = `
                <div class="team-name">${pokemon.name}</div>
                <div class="team-hp">
                    <div class="team-hp-bar">
                        <div class="team-hp-fill ${hpColor}" style="width: ${hpPercent}%"></div>
                    </div>
                    <div class="team-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</div>
                </div>
            `;
            
            if (!pokemon.isFainted) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    if (this.isSwitchModalOpen || this.isBattleProcessing || !this.battleSystem.isPlayerTurn) return;
                    if (!this.battleSystem.canPlayerSwitch()) return;
                    this.quickSwitchPokemon(index);
                });
            }
            
            this.playerTeamList.appendChild(card);
        });
    }

    renderEnemyTeamList(enemyTeam) {
        this.enemyTeamList.innerHTML = '';
        
        enemyTeam.forEach((pokemon, index) => {
            if (pokemon.isActive) return;
            
            const card = document.createElement('div');
            card.className = `team-pokemon-small ${pokemon.isFainted ? 'fainted' : ''}`;
            
            const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
            const hpColor = hpPercent <= 20 ? 'critical' : hpPercent <= 50 ? 'low' : '';
            
            card.innerHTML = `
                <div class="team-name">${pokemon.name}</div>
                <div class="team-hp">
                    <div class="team-hp-bar">
                        <div class="team-hp-fill ${hpColor}" style="width: ${hpPercent}%"></div>
                    </div>
                    <div class="team-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</div>
                </div>
            `;
            
            this.enemyTeamList.appendChild(card);
        });
    }

    openSwitchModal(isForced) {
        if (!this.battleSystem) return;
        
        this.isForcedSwitch = isForced;
        
        const state = this.battleSystem.getBattleState();
        this.switchOptions.innerHTML = '';
        
        if (isForced) {
            this.switchModalTitle.textContent = `${this.playerPokemon.name} 倒下了！请选择下一只宝可梦`;
            this.cancelSwitchBtn.style.display = 'none';
        } else {
            this.switchModalTitle.textContent = '选择要切换的宝可梦';
            this.cancelSwitchBtn.style.display = 'block';
        }
        
        state.playerTeam.forEach((pokemon, index) => {
            if (pokemon.isActive || pokemon.isFainted) return;
            
            const option = document.createElement('div');
            option.className = 'switch-option';
            option.dataset.index = index;
            
            const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
            const hpColor = hpPercent <= 20 ? 'critical' : hpPercent <= 50 ? 'low' : '';
            
            option.innerHTML = `
                <div class="switch-option-name">${pokemon.name}</div>
                <div class="switch-option-hp">
                    <div class="switch-hp-bar-bg">
                        <div class="switch-hp-bar-fill ${hpColor}" style="width: ${hpPercent}%"></div>
                    </div>
                    <div class="switch-hp-text">${pokemon.currentHp}/${pokemon.maxHp}</div>
                </div>
            `;
            
            option.addEventListener('click', () => {
                this.executePlayerSwitch(index);
            });
            
            this.switchOptions.appendChild(option);
        });
        
        this.switchModal.style.display = 'block';
        this.isSwitchModalOpen = true;
        this.disableMoveButtons();
    }

    closeSwitchModal() {
        this.switchModal.style.display = 'none';
        this.isSwitchModalOpen = false;
        this.isForcedSwitch = false;
        this.enableMoveButtons();
    }

    quickSwitchPokemon(newIndex) {
        if (!this.battleSystem || !this.battleSystem.isPlayerTurn) return;
        if (this.isBattleProcessing) return;
        if (!this.battleSystem.canPlayerSwitch()) return;
        
        this.isBattleProcessing = true;
        this.disableMoveButtons();
        
        const result = this.battleSystem.playerSwitchPokemon(newIndex);
        
        if (result.success) {
            this.activePlayerIndex = newIndex;
            this.battleMessage.textContent = result.message;
            this.updateUI();
            
            setTimeout(() => {
                this.battleMessage.textContent = `轮到 ${this.enemyPokemon.name} 行动！`;
                setTimeout(() => this.executeEnemyTurn(), 1000);
            }, 1500);
        } else {
            this.battleMessage.textContent = result.message;
            this.isBattleProcessing = false;
            this.enableMoveButtons();
        }
    }

    executePlayerSwitch(newIndex) {
        this.closeSwitchModal();
        this.quickSwitchPokemon(newIndex);
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
        this.switchPokemonBtn.disabled = true;
        
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
            
            if (result.isSwitch) {
                this.activeEnemyIndex = this.battleSystem.activeEnemyIndex;
            } else if (!result.missed && result.damage > 0) {
                this.shakePlayer();
            }
            
            this.updateUI();
            
            setTimeout(() => {
                if (this.battleSystem.battleOver) {
                    this.endBattle();
                } else if (this.playerPokemon.isFainted()) {
                    const availableIndices = this.battleSystem.getPlayerAvailableIndices();
                    if (availableIndices.length > 0) {
                        this.battleMessage.textContent = `${this.playerPokemon.name} 倒下了！请选择下一只宝可梦！`;
                        this.openSwitchModal(true);
                        this.isBattleProcessing = false;
                    } else {
                        this.endBattle();
                    }
                } else {
                    this.battleMessage.textContent = `轮到 ${this.playerPokemon.name} 行动！`;
                    this.isBattleProcessing = false;
                    this.enableMoveButtons();
                    this.updateSwitchButton();
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
        
        this.activePlayerIndex = state.activePlayerIndex;
        this.activeEnemyIndex = state.activeEnemyIndex;
        
        this.playerActiveName.textContent = state.playerPokemon.name;
        this.enemyActiveName.textContent = state.enemyPokemon.name;
        
        const playerHpPercent = (state.playerPokemon.currentHp / state.playerPokemon.maxHp) * 100;
        const enemyHpPercent = (state.enemyPokemon.currentHp / state.enemyPokemon.maxHp) * 100;
        
        this.playerActiveHpBar.style.width = `${playerHpPercent}%`;
        this.enemyActiveHpBar.style.width = `${enemyHpPercent}%`;
        
        this.playerActiveHpText.textContent = `${state.playerPokemon.currentHp}/${state.playerPokemon.maxHp}`;
        this.enemyActiveHpText.textContent = `${state.enemyPokemon.currentHp}/${state.enemyPokemon.maxHp}`;
        
        this.updateSmallHpBarColor(this.playerActiveHpBar, playerHpPercent);
        this.updateSmallHpBarColor(this.enemyActiveHpBar, enemyHpPercent);
        
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

    updateSwitchButton() {
        if (!this.battleSystem) {
            this.switchPokemonBtn.disabled = true;
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

    updateSmallHpBarColor(hpBar, percent) {
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
        if (this.switchPokemonBtn) {
            this.switchPokemonBtn.disabled = true;
        }
    }

    enableMoveButtons() {
        if (!this.battleSystem) return;
        
        const state = this.battleSystem.getBattleState();
        state.playerPokemon.moves.forEach((move, index) => {
            if (index < this.moveButtons.length) {
                this.moveButtons[index].disabled = move.currentPp <= 0;
            }
        });
        this.updateSwitchButton();
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
        this.isSwitchModalOpen = false;
        this.isForcedSwitch = false;
        this.battleSystem = null;
        if (this.switchModal) {
            this.switchModal.style.display = 'none';
        }
    }
}
