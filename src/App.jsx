import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import './App.css';

const GRID_SIZE = 4;
const CELL_SIZE = 2;
const GAME_DURATION = 30;
const MOLE_STAY_TIME = 1000;
const INITIAL_SPAWN_INTERVAL = 1000;
const MIN_SPAWN_INTERVAL = 300;
const SPAWN_INTERVAL_DECREASE = 50;
const SCORE_PER_HIT = 10;
const SCORE_PER_MISS = -5;

function App() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const moleCellsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const gameIntervalRef = useRef(null);
  const spawnTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredCellRef = useRef(null);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('whackMoleHighScore') || '0');
  });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState('idle');
  const [finalScore, setFinalScore] = useState(0);
  
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const gameStateRef = useRef('idle');
  const activeMoleIndexRef = useRef(null);
  const moleTimeoutRef = useRef(null);

  const initThree = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    createGrid(scene);
    animate();

    window.addEventListener('resize', handleResize);
  }, []);

  const createGrid = (scene) => {
    const cells = [];
    const gridGroup = new THREE.Group();
    const offset = (GRID_SIZE - 1) * CELL_SIZE / 2;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = col * CELL_SIZE - offset;
        const z = row * CELL_SIZE - offset;

        const cellGroup = new THREE.Group();
        cellGroup.position.set(x, 0, z);
        cellGroup.userData = { row, col, index: row * GRID_SIZE + col };

        const groundGeometry = new THREE.CylinderGeometry(CELL_SIZE * 0.45, CELL_SIZE * 0.45, 0.3, 32);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x8B4513,
          roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.y = -0.15;
        ground.receiveShadow = true;
        cellGroup.add(ground);

        const holeGeometry = new THREE.CircleGeometry(CELL_SIZE * 0.4, 32);
        const holeMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x2c1810,
          roughness: 0.9
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.rotation.x = -Math.PI / 2;
        hole.position.y = 0.001;
        cellGroup.add(hole);

        const mole = createMole();
        mole.position.y = -1.5;
        cellGroup.add(mole);

        const hoverRingGeometry = new THREE.RingGeometry(CELL_SIZE * 0.42, CELL_SIZE * 0.48, 32);
        const hoverRingMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFFFF00,
          transparent: true,
          opacity: 0
        });
        const hoverRing = new THREE.Mesh(hoverRingGeometry, hoverRingMaterial);
        hoverRing.rotation.x = -Math.PI / 2;
        hoverRing.position.y = 0.002;
        cellGroup.add(hoverRing);

        cellGroup.userData.mole = mole;
        cellGroup.userData.hoverRing = hoverRing;
        cellGroup.userData.ground = ground;
        cellGroup.userData.groundMaterial = groundMaterial;
        cellGroup.userData.originalColor = groundMaterial.color.clone();

        gridGroup.add(cellGroup);
        cells.push(cellGroup);
      }
    }

    scene.add(gridGroup);
    moleCellsRef.current = cells;
  };

  const createMole = () => {
    const moleGroup = new THREE.Group();
    moleGroup.userData.isMole = true;

    const bodyGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    body.castShadow = true;
    body.userData.isMolePart = true;
    moleGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.45, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xA0826D,
      roughness: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.75;
    head.castShadow = true;
    head.userData.isMolePart = true;
    moleGroup.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.85, 0.35);
    leftEye.userData.isMolePart = true;
    moleGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.85, 0.35);
    rightEye.userData.isMolePart = true;
    moleGroup.add(rightEye);

    const noseGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.65, 0.4);
    nose.userData.isMolePart = true;
    moleGroup.add(nose);

    const earGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const earMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.6
    });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.35, 1.0, 0);
    leftEar.userData.isMolePart = true;
    moleGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.35, 1.0, 0);
    rightEar.userData.isMolePart = true;
    moleGroup.add(rightEar);

    return moleGroup;
  };

  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleResize = () => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !rendererRef.current) return;

    cameraRef.current.aspect = container.clientWidth / container.clientHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(container.clientWidth, container.clientHeight);
  };

  const startGame = useCallback(() => {
    resetGame();
    setGameState('playing');
    gameStateRef.current = 'playing';
    setTimeLeft(GAME_DURATION);
    timeLeftRef.current = GAME_DURATION;
    setScore(0);
    scoreRef.current = 0;

    countdownIntervalRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        endGame();
      }
    }, 1000);

    spawnMole();
  }, []);

  const resetGame = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
    if (moleTimeoutRef.current) {
      clearTimeout(moleTimeoutRef.current);
      moleTimeoutRef.current = null;
    }

    moleCellsRef.current.forEach(cell => {
      const mole = cell.userData.mole;
      if (mole) {
        mole.position.y = -1.5;
      }
    });

    activeMoleIndexRef.current = null;
  };

  const endGame = () => {
    resetGame();
    gameStateRef.current = 'ended';
    setGameState('ended');
    setFinalScore(scoreRef.current);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('whackMoleHighScore', scoreRef.current.toString());
    }
  };

  const spawnMole = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    if (activeMoleIndexRef.current !== null) {
      const cell = moleCellsRef.current[activeMoleIndexRef.current];
      if (cell && cell.userData.mole) {
        cell.userData.mole.position.y = -1.5;
      }
    }

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
    } while (newIndex === activeMoleIndexRef.current && GRID_SIZE * GRID_SIZE > 1);

    activeMoleIndexRef.current = newIndex;
    
    const cell = moleCellsRef.current[newIndex];
    if (cell && cell.userData.mole) {
      cell.userData.mole.position.y = 0;
    }

    moleTimeoutRef.current = setTimeout(() => {
      if (activeMoleIndexRef.current === newIndex) {
        const moleCell = moleCellsRef.current[newIndex];
        if (moleCell && moleCell.userData.mole) {
          moleCell.userData.mole.position.y = -1.5;
        }
        activeMoleIndexRef.current = null;
      }
    }, MOLE_STAY_TIME);

    const decreaseAmount = Math.floor(scoreRef.current / 50) * SPAWN_INTERVAL_DECREASE;
    const nextInterval = Math.max(MIN_SPAWN_INTERVAL, INITIAL_SPAWN_INTERVAL - decreaseAmount);

    spawnTimeoutRef.current = setTimeout(() => {
      if (gameStateRef.current === 'playing') {
        spawnMole();
      }
    }, nextInterval);
  }, []);

  const showMole = (index) => {
    const cell = moleCellsRef.current[index];
    if (!cell) return;

    const mole = cell.userData.mole;
    if (mole) {
      animateMole(mole, 0, 300);
    }
  };

  const hideMole = (index) => {
    const cell = moleCellsRef.current[index];
    if (!cell) return;

    const mole = cell.userData.mole;
    if (mole) {
      animateMole(mole, -1.5, 200);
    }
  };

  const animateMole = (mole, targetY, duration) => {
    const startY = mole.position.y;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      mole.position.y = startY + (targetY - startY) * easeProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const handleMouseMove = useCallback((event) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const cellMeshes = moleCellsRef.current.flatMap(cell => [
      cell.userData.ground,
      cell.userData.hoverRing
    ]);
    
    const intersects = raycasterRef.current.intersectObjects(cellMeshes, true);

    if (hoveredCellRef.current !== null) {
      const prevCell = moleCellsRef.current[hoveredCellRef.current];
      if (prevCell) {
        prevCell.userData.hoverRing.material.opacity = 0;
        prevCell.userData.groundMaterial.color.copy(prevCell.userData.originalColor);
      }
      hoveredCellRef.current = null;
    }

    if (intersects.length > 0) {
      let cell = null;
      for (const intersect of intersects) {
        let obj = intersect.object;
        while (obj.parent && !obj.userData.hasOwnProperty('index')) {
          obj = obj.parent;
        }
        if (obj.userData.hasOwnProperty('index')) {
          cell = obj;
          break;
        }
      }

      if (cell) {
        cell.userData.hoverRing.material.opacity = 0.6;
        cell.userData.groundMaterial.color.set(0xCD853F);
        hoveredCellRef.current = cell.userData.index;
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'default';
      }
    } else {
      container.style.cursor = 'default';
    }
  }, []);

  const handleClick = useCallback((event) => {
    if (gameStateRef.current !== 'playing') return;

    const container = containerRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const allMeshes = [];
    moleCellsRef.current.forEach(cell => {
      allMeshes.push(cell.userData.ground);
      allMeshes.push(cell.userData.hoverRing);
      cell.userData.mole.traverse((obj) => {
        if (obj.isMesh) {
          allMeshes.push(obj);
        }
      });
    });
    
    const intersects = raycasterRef.current.intersectObjects(allMeshes, false);

    if (intersects.length > 0) {
      let clickedCellIndex = null;
      let hitMolePart = false;

      for (const intersect of intersects) {
        const obj = intersect.object;
        
        if (obj.userData && obj.userData.isMolePart) {
          hitMolePart = true;
          let parent = obj.parent;
          while (parent) {
            if (parent.userData && typeof parent.userData.index === 'number') {
              clickedCellIndex = parent.userData.index;
              break;
            }
            parent = parent.parent;
          }
          break;
        }
        
        let parent = obj.parent;
        while (parent) {
          if (parent.userData && typeof parent.userData.index === 'number') {
            clickedCellIndex = parent.userData.index;
            break;
          }
          parent = parent.parent;
        }
        
        if (clickedCellIndex !== null) {
          break;
        }
      }

      if (clickedCellIndex !== null) {
        const isMoleActive = activeMoleIndexRef.current === clickedCellIndex;

        if (isMoleActive && hitMolePart) {
          scoreRef.current += SCORE_PER_HIT;
          setScore(scoreRef.current);
          
          if (moleTimeoutRef.current) {
            clearTimeout(moleTimeoutRef.current);
            moleTimeoutRef.current = null;
          }
          
          const cell = moleCellsRef.current[clickedCellIndex];
          if (cell && cell.userData.mole) {
            cell.userData.mole.position.y = -1.5;
          }
          activeMoleIndexRef.current = null;
        } else if (!isMoleActive) {
          scoreRef.current += SCORE_PER_MISS;
          setScore(scoreRef.current);
        }
      }
    }
  }, []);

  useEffect(() => {
    initThree();
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('click', handleClick);
    }

    return () => {
      resetGame();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('click', handleClick);
      }
    };
  }, [initThree, handleMouseMove, handleClick]);

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="score-panel">
          <div className="score-item">
            <span className="label">分数</span>
            <span className="value">{score}</span>
          </div>
          <div className="score-item">
            <span className="label">最高分</span>
            <span className="value high-score">{highScore}</span>
          </div>
          <div className="score-item">
            <span className="label">时间</span>
            <span className={`value time ${timeLeft <= 10 ? 'warning' : ''}`}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="game-area">
        <div ref={containerRef} className="three-container" />
        
        {gameState === 'idle' && (
          <div className="overlay">
            <div className="overlay-content">
              <h1>🎮 打地鼠游戏</h1>
              <div className="rules">
                <p>📌 点击冒出的地鼠得 10 分</p>
                <p>❌ 误点空白格子扣 5 分</p>
                <p>⏱️ 游戏时间 30 秒</p>
                <p>📈 分数越高，地鼠出现越快！</p>
              </div>
              <button className="start-btn" onClick={startGame}>
                开始游戏
              </button>
            </div>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="overlay">
            <div className="overlay-content">
              <h1>🎉 游戏结束</h1>
              <div className="final-score">
                <p className="final-label">你的得分</p>
                <p className="final-value">{finalScore}</p>
                {finalScore >= highScore && finalScore > 0 && (
                  <p className="new-record">🏆 新纪录！</p>
                )}
              </div>
              <button className="start-btn" onClick={startGame}>
                再玩一次
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="game-footer">
        <p>使用 React + Three.js 构建</p>
      </div>
    </div>
  );
}

export default App;
