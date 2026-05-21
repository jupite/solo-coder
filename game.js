// ============ 全局变量 ============
let scene, camera, renderer;
let terrain, terrainGeometry;
let motorcycle, wheelFront, wheelRear;
let checkpoints = [];
let collectedCheckpoints = 0;
let totalCheckpoints = 0;

// 游戏状态
let gameState = 'menu'; // menu, playing, finished
let score = 0;
let startTime = 0;
let bestTime = null;
let currentTime = 0;

// 摩托车状态
let bikePosition = { x: 0, y: 0, z: 0 };
let bikeVelocity = { x: 0, y: 0, z: 0 };
let bikeSpeed = 0;
let bikeAngle = 0;
let bikeTilt = 0;
let isGrounded = true;
let isJumping = false;
let verticalVelocity = 0;

// 翻转状态
let flipAngle = 0;
let flipDirection = 0;
let flipCount = 0;
let isFlipping = false;

// 物理参数
const GRAVITY = -25;
const JUMP_FORCE = 15;
const ACCELERATION = 30;
const BRAKE_FORCE = 50;
const MAX_SPEED = 80;
const TILT_SPEED = 2;
const TILT_MAX = 0.5;
const GROUND_FRICTION = 0.98;
const AIR_FRICTION = 0.995;

// 地形参数
const TRACK_WIDTH = 20;
const TRACK_LENGTH = 2000;
const TERRAIN_SEGMENTS = 400;

// 高度函数 - 使用多个正弦波叠加生成自然地形
function getTerrainHeight(x, z) {
    const height1 = Math.sin(x * 0.02) * 3;
    const height2 = Math.sin(x * 0.05 + 1) * 1.5;
    const height3 = Math.sin(x * 0.1 + 2) * 0.8;
    const height4 = Math.cos(x * 0.03) * 2;
    const height5 = Math.sin(x * 0.08 + z * 0.1) * 1;
    return height1 + height2 + height3 + height4 + height5;
}

// 获取地形坡度
function getTerrainSlope(x, z) {
    const dx = 0.1;
    const h1 = getTerrainHeight(x - dx, z);
    const h2 = getTerrainHeight(x + dx, z);
    return (h2 - h1) / (2 * dx);
}

// ============ 初始化场景 ============
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, -15);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    // 创建地形
    createTerrain();

    // 创建摩托车
    createMotorcycle();

    // 创建检查点
    createCheckpoints();

    // 添加环境装饰
    createEnvironment();

    // 事件监听
    setupEventListeners();

    // 加载最佳时间
    loadBestTime();

    // 渲染循环
    animate();
}

// ============ 创建地形 ============
function createTerrain() {
    const width = TRACK_WIDTH + 40;
    const length = TRACK_LENGTH;
    const widthSegments = 40;
    const lengthSegments = TERRAIN_SEGMENTS;

    terrainGeometry = new THREE.PlaneGeometry(width, length, widthSegments, lengthSegments);
    terrainGeometry.rotateX(-Math.PI / 2);

    const positions = terrainGeometry.attributes.position.array;
    const colors = [];
    
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const height = getTerrainHeight(x, z);
        positions[i + 1] = height;

        const color = new THREE.Color();
        if (height > 4) {
            color.setHSL(0.1, 0.2, 0.9);
        } else if (height > 2) {
            color.setHSL(0.3, 0.5, 0.4);
        } else if (height > 0) {
            color.setHSL(0.35, 0.6, 0.35);
        } else {
            color.setHSL(0.4, 0.7, 0.3);
        }
        colors.push(color.r, color.g, color.b);
    }

    terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({ vertexColors: true });
    terrain = new THREE.Mesh(terrainGeometry, material);
    terrain.position.z = -TRACK_LENGTH / 2 + 100;
    terrain.receiveShadow = true;
    scene.add(terrain);

    const trackGeometry = new THREE.PlaneGeometry(TRACK_WIDTH, TRACK_LENGTH);
    trackGeometry.rotateX(-Math.PI / 2);
    
    const trackPositions = trackGeometry.attributes.position.array;
    for (let i = 0; i < trackPositions.length; i += 3) {
        const x = trackPositions[i];
        const z = trackPositions[i + 2];
        trackPositions[i + 1] = getTerrainHeight(x, z) + 0.1;
    }
    trackGeometry.computeVertexNormals();

    const trackMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B7355,
        transparent: true,
        opacity: 0.8
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.position.z = -TRACK_LENGTH / 2 + 100;
    track.receiveShadow = true;
    scene.add(track);
}

// ============ 创建摩托车 ============
function createMotorcycle() {
    motorcycle = new THREE.Group();

    const bodyGroup = new THREE.Group();
    
    const frameGeometry = new THREE.BoxGeometry(0.3, 0.2, 2);
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0xFF4500, shininess: 100 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 0.5;
    frame.castShadow = true;
    bodyGroup.add(frame);

    const tankGeometry = new THREE.BoxGeometry(0.5, 0.35, 0.8);
    const tankMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6600, shininess: 100 });
    const tank = new THREE.Mesh(tankGeometry, tankMaterial);
    tank.position.set(0, 0.65, 0.2);
    tank.castShadow = true;
    bodyGroup.add(tank);

    const seatGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.6);
    const seatMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 0.7, -0.3);
    bodyGroup.add(seat);

    const engineGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(0, 0.35, 0.3);
    bodyGroup.add(engine);

    const exhaustGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8);
    const exhaustMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0.3, 0.2, -0.5);
    bodyGroup.add(exhaust);

    const riderGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.4);
    const riderMaterial = new THREE.MeshPhongMaterial({ color: 0x333366 });
    const rider = new THREE.Mesh(riderGeometry, riderMaterial);
    rider.position.set(0, 1.1, -0.2);
    rider.castShadow = true;
    bodyGroup.add(rider);

    const helmetGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const helmetMaterial = new THREE.MeshPhongMaterial({ color: 0xFF3300 });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.set(0, 1.65, -0.2);
    helmet.castShadow = true;
    bodyGroup.add(helmet);

    motorcycle.add(bodyGroup);
    motorcycle.userData.body = bodyGroup;

    wheelFront = createWheel();
    wheelFront.position.set(0, 0.3, 1.2);
    motorcycle.add(wheelFront);

    wheelRear = createWheel();
    wheelRear.position.set(0, 0.3, -1.2);
    motorcycle.add(wheelRear);

    const forkGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const forkMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const forkLeft = new THREE.Mesh(forkGeometry, forkMaterial);
    forkLeft.position.set(-0.15, 0.5, 1.1);
    motorcycle.add(forkLeft);
    const forkRight = new THREE.Mesh(forkGeometry, forkMaterial);
    forkRight.position.set(0.15, 0.5, 1.1);
    motorcycle.add(forkRight);

    const handleGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.05);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 1, 1.2);
    motorcycle.add(handle);

    motorcycle.position.set(0, 2, 0);
    scene.add(motorcycle);
}

function createWheel() {
    const wheelGroup = new THREE.Group();

    const tireGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
    tireGeometry.rotateX(Math.PI / 2);
    const tireMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const tire = new THREE.Mesh(tireGeometry, tireMaterial);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rimGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.26, 12);
    rimGeometry.rotateX(Math.PI / 2);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    wheelGroup.add(rim);

    const hubGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    hubGeometry.rotateX(Math.PI / 2);
    const hubMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    wheelGroup.add(hub);

    const spokeMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    for (let i = 0; i < 6; i++) {
        const spokeGeometry = new THREE.BoxGeometry(0.02, 0.35, 0.02);
        const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
        spoke.rotation.z = (i / 6) * Math.PI * 2;
        wheelGroup.add(spoke);
    }

    return wheelGroup;
}

// ============ 创建检查点 ============
function createCheckpoints() {
    totalCheckpoints = 8;
    const checkpointPositions = [
        { x: 0, z: -200 },
        { x: 0, z: -450 },
        { x: 0, z: -700 },
        { x: 0, z: -950 },
        { x: 0, z: -1200 },
        { x: 0, z: -1450 },
        { x: 0, z: -1700 },
        { x: 0, z: -1900 }
    ];

    checkpointPositions.forEach((pos, index) => {
        const checkpoint = createFlag(index);
        checkpoint.position.set(pos.x, getTerrainHeight(pos.x, pos.z) + 2, pos.z);
        checkpoint.userData.collected = false;
        checkpoint.userData.index = index;
        checkpoints.push(checkpoint);
        scene.add(checkpoint);
    });

    updateCheckpointDisplay();
}

function createFlag(index) {
    const flagGroup = new THREE.Group();

    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2.5;
    pole.castShadow = true;
    flagGroup.add(pole);

    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500, 0xFF69B4];
    const flagGeometry = new THREE.PlaneGeometry(2, 1.2);
    const flagMaterial = new THREE.MeshPhongMaterial({ 
        color: colors[index % colors.length], 
        side: THREE.DoubleSide 
    });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(1, 4, 0);
    flagGroup.add(flag);

    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    flagGroup.add(base);

    return flagGroup;
}

// ============ 创建环境装饰 ============
function createEnvironment() {
    const treeGeometry = new THREE.ConeGeometry(2, 8, 8);
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);

    for (let i = 0; i < 100; i++) {
        const treeGroup = new THREE.Group();
        
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        treeGroup.add(trunk);

        const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
        tree.position.y = 6;
        treeGroup.add(tree);

        const x = (Math.random() > 0.5 ? 1 : -1) * (TRACK_WIDTH / 2 + 5 + Math.random() * 20);
        const z = -Math.random() * TRACK_LENGTH;
        const y = getTerrainHeight(x, z);
        
        treeGroup.position.set(x, y, z);
        treeGroup.scale.setScalar(0.5 + Math.random() * 0.5);
        treeGroup.castShadow = true;
        scene.add(treeGroup);
    }

    for (let i = 0; i < 200; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.5, 0);
        const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x696969 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        const x = (Math.random() > 0.5 ? 1 : -1) * (TRACK_WIDTH / 2 + 3 + Math.random() * 25);
        const z = -Math.random() * TRACK_LENGTH;
        const y = getTerrainHeight(x, z);
        
        rock.position.set(x, y + 0.5, z);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        scene.add(rock);
    }
}

// ============ 事件监听 ============
const keys = {};

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ============ 游戏控制 ============
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameState = 'playing';
    resetGame();
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    resetGame();
    gameState = 'playing';
}

function resetGame() {
    score = 0;
    collectedCheckpoints = 0;
    startTime = Date.now();
    currentTime = 0;
    
    bikePosition = { x: 0, y: 5, z: 0 };
    bikeVelocity = { x: 0, y: 0, z: 0 };
    bikeSpeed = 0;
    bikeAngle = 0;
    bikeTilt = 0;
    isGrounded = true;
    isJumping = false;
    verticalVelocity = 0;
    flipAngle = 0;
    flipDirection = 0;
    flipCount = 0;
    isFlipping = false;

    checkpoints.forEach(cp => {
        cp.userData.collected = false;
        cp.visible = true;
    });

    updateScoreDisplay();
    updateCheckpointDisplay();
}

// ============ 更新逻辑 ============
function update(deltaTime) {
    if (gameState !== 'playing') return;

    currentTime = Date.now() - startTime;
    updateTimeDisplay();

    handleInput(deltaTime);
    updatePhysics(deltaTime);
    updateMotorcycle();
    updateCamera();
    checkCheckpoints();
    checkGameOver();
}

function handleInput(deltaTime) {
    if (keys['KeyW']) {
        bikeSpeed += ACCELERATION * deltaTime;
    }
    if (keys['KeyS']) {
        bikeSpeed -= BRAKE_FORCE * deltaTime;
    }
    if (!keys['KeyW'] && !keys['KeyS']) {
        if (isGrounded) {
            bikeSpeed *= GROUND_FRICTION;
        } else {
            bikeSpeed *= AIR_FRICTION;
        }
    }

    bikeSpeed = Math.max(-MAX_SPEED * 0.3, Math.min(MAX_SPEED, bikeSpeed));

    if (keys['KeyA']) {
        bikeTilt = Math.min(bikeTilt + TILT_SPEED * deltaTime, TILT_MAX);
    } else if (keys['KeyD']) {
        bikeTilt = Math.max(bikeTilt - TILT_SPEED * deltaTime, -TILT_MAX);
    } else {
        bikeTilt *= 0.9;
    }

    if (keys['Space'] && isGrounded && !isJumping) {
        verticalVelocity = JUMP_FORCE;
        isGrounded = false;
        isJumping = true;
    }

    if (!isGrounded) {
        if (keys['KeyQ']) {
            flipDirection = 1;
            isFlipping = true;
        }
        if (keys['KeyE']) {
            flipDirection = -1;
            isFlipping = true;
        }
    }
}

function updatePhysics(deltaTime) {
    if (!isGrounded) {
        verticalVelocity += GRAVITY * deltaTime;
        bikePosition.y += verticalVelocity * deltaTime;
    }

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), bikeAngle);
    
    bikePosition.x += forward.x * bikeSpeed * deltaTime;
    bikePosition.z += forward.z * bikeSpeed * deltaTime;

    const groundHeight = getTerrainHeight(bikePosition.x, bikePosition.z);
    const terrainTop = groundHeight + 1;

    if (bikePosition.y <= terrainTop) {
        if (!isGrounded && verticalVelocity < -5) {
            const landingBonus = Math.abs(verticalVelocity) * 2;
            score += Math.floor(landingBonus);
            updateScoreDisplay();
        }
        
        bikePosition.y = terrainTop;
        verticalVelocity = 0;
        isGrounded = true;
        isJumping = false;

        if (isFlipping) {
            const completedFlips = Math.floor(Math.abs(flipAngle) / (Math.PI * 2));
            if (completedFlips > 0) {
                const flipScore = completedFlips * 100 * completedFlips;
                score += flipScore;
                updateScoreDisplay();
                showCombo(completedFlips);
            }
            isFlipping = false;
            flipAngle = 0;
        }
    } else {
        isGrounded = false;
    }

    if (isFlipping && !isGrounded) {
        flipAngle += flipDirection * 4 * deltaTime;
    }

    if (isGrounded && bikeSpeed > 0) {
        const slope = getTerrainSlope(bikePosition.x, bikePosition.z);
        bikeSpeed -= slope * 10 * deltaTime;
    }

    if (Math.abs(bikeSpeed) < 0.1) {
        bikeSpeed = 0;
    }

    const trackBoundary = TRACK_WIDTH / 2 - 1;
    if (bikePosition.x > trackBoundary) {
        bikePosition.x = trackBoundary;
        bikeSpeed *= 0.5;
    }
    if (bikePosition.x < -trackBoundary) {
        bikePosition.x = -trackBoundary;
        bikeSpeed *= 0.5;
    }
}

function updateMotorcycle() {
    motorcycle.position.set(bikePosition.x, bikePosition.y, bikePosition.z);

    motorcycle.rotation.y = bikeAngle;
    motorcycle.rotation.z = bikeTilt;

    if (isFlipping && !isGrounded) {
        motorcycle.userData.body.rotation.x = flipAngle;
    } else if (isGrounded) {
        motorcycle.userData.body.rotation.x *= 0.9;
    }

    const wheelRotation = bikeSpeed * 0.05;
    wheelFront.rotation.x += wheelRotation;
    wheelRear.rotation.x += wheelRotation;

    if (isGrounded) {
        const slope = getTerrainSlope(bikePosition.x, bikePosition.z);
        motorcycle.userData.body.rotation.x = -slope * 0.5;
    }
}

function updateCamera() {
    const offset = new THREE.Vector3(0, 8, 12);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), bikeAngle);

    const targetPosition = new THREE.Vector3(
        bikePosition.x + offset.x,
        bikePosition.y + offset.y,
        bikePosition.z + offset.z
    );

    camera.position.lerp(targetPosition, 0.1);
    
    const lookTarget = new THREE.Vector3(
        bikePosition.x,
        bikePosition.y + 1,
        bikePosition.z
    );
    camera.lookAt(lookTarget);
}

function checkCheckpoints() {
    checkpoints.forEach(cp => {
        if (cp.userData.collected) return;

        const dx = bikePosition.x - cp.position.x;
        const dz = bikePosition.z - cp.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 5) {
            cp.userData.collected = true;
            cp.visible = false;
            collectedCheckpoints++;
            score += 500;
            updateScoreDisplay();
            updateCheckpointDisplay();
        }
    });
}

function checkGameOver() {
    if (collectedCheckpoints >= totalCheckpoints) {
        gameState = 'finished';
        const finalTime = Date.now() - startTime;
        
        if (bestTime === null || finalTime < bestTime) {
            bestTime = finalTime;
            saveBestTime();
        }

        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalTime').textContent = '用时: ' + formatTime(finalTime);
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
}

// ============ UI更新 ============
function updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = score;
}

function updateTimeDisplay() {
    document.getElementById('timeDisplay').textContent = formatTime(currentTime);
    document.getElementById('speedDisplay').textContent = Math.abs(Math.floor(bikeSpeed * 3.6)) + ' km/h';
}

function updateCheckpointDisplay() {
    document.getElementById('checkpointDisplay').textContent = collectedCheckpoints + ' / ' + totalCheckpoints;
}

function showCombo(flips) {
    const comboDisplay = document.getElementById('comboDisplay');
    comboDisplay.textContent = flips + 'x 翻转! +' + (flips * 100 * flips);
    comboDisplay.classList.add('active');
    
    setTimeout(() => {
        comboDisplay.classList.remove('active');
    }, 1500);
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

function loadBestTime() {
    const saved = localStorage.getItem('bestTime');
    if (saved) {
        bestTime = parseInt(saved);
        document.getElementById('bestTimeDisplay').textContent = '最佳: ' + formatTime(bestTime);
    }
}

function saveBestTime() {
    if (bestTime !== null) {
        localStorage.setItem('bestTime', bestTime.toString());
        document.getElementById('bestTimeDisplay').textContent = '最佳: ' + formatTime(bestTime);
    }
}

// ============ 渲染循环 ============
let lastTime = 0;

function animate(currentTimeMs = 0) {
    requestAnimationFrame(animate);

    const deltaTime = Math.min((currentTimeMs - lastTime) / 1000, 0.1);
    lastTime = currentTimeMs;

    update(deltaTime);

    renderer.render(scene, camera);
}

// ============ 启动游戏 ============
window.onload = init;
