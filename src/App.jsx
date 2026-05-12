import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import './App.css';

const GRID_SIZE = 4;
const CELL_SIZE = 2;
const GAME_DURATION = 30;
const ANIMAL_STAY_TIME = 1000;
const INITIAL_SPAWN_INTERVAL = 1000;
const MIN_SPAWN_INTERVAL = 300;
const SPAWN_INTERVAL_DECREASE = 50;
const SCORE_NORMAL_MOLE = 10;
const SCORE_RED_MOLE = 30;
const SCORE_RABBIT = -30;
const SCORE_MISS = -5;

const ANIMAL_TYPE = {
  NORMAL_MOLE: 'normal',
  RED_MOLE: 'red',
  RABBIT: 'rabbit'
};

function App() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const cellsRef = useRef([]);
  const animationFrameRef = useRef(null);
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
  const activeCellsRef = useRef(new Map());
  const cellTimeoutsRef = useRef(new Map());

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

        const normalMole = createNormalMole();
        normalMole.position.y = -1.5;
        normalMole.visible = false;
        cellGroup.add(normalMole);

        const redMole = createRedMole();
        redMole.position.y = -1.5;
        redMole.visible = false;
        cellGroup.add(redMole);

        const rabbit = createRabbit();
        rabbit.position.y = -1.5;
        rabbit.visible = false;
        cellGroup.add(rabbit);

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

        cellGroup.userData.normalMole = normalMole;
        cellGroup.userData.redMole = redMole;
        cellGroup.userData.rabbit = rabbit;
        cellGroup.userData.hoverRing = hoverRing;
        cellGroup.userData.ground = ground;
        cellGroup.userData.groundMaterial = groundMaterial;
        cellGroup.userData.originalColor = groundMaterial.color.clone();
        cellGroup.userData.currentAnimal = null;

        gridGroup.add(cellGroup);
        cells.push(cellGroup);
      }
    }

    scene.add(gridGroup);
    cellsRef.current = cells;
  };

  const createNormalMole = () => {
    const group = new THREE.Group();
    group.userData.animalType = ANIMAL_TYPE.NORMAL_MOLE;

    const bodyGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    body.castShadow = true;
    body.userData.isAnimalPart = true;
    group.add(body);

    const headGeometry = new THREE.SphereGeometry(0.45, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xA0826D,
      roughness: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.75;
    head.castShadow = true;
    head.userData.isAnimalPart = true;
    group.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.85, 0.35);
    leftEye.userData.isAnimalPart = true;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.85, 0.35);
    rightEye.userData.isAnimalPart = true;
    group.add(rightEye);

    const noseGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.65, 0.4);
    nose.userData.isAnimalPart = true;
    group.add(nose);

    const earGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const earMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.6
    });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.35, 1.0, 0);
    leftEar.userData.isAnimalPart = true;
    group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.35, 1.0, 0);
    rightEar.userData.isAnimalPart = true;
    group.add(rightEar);

    return group;
  };

  const createRedMole = () => {
    const group = new THREE.Group();
    group.userData.animalType = ANIMAL_TYPE.RED_MOLE;

    const bodyGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFF4444,
      roughness: 0.6,
      emissive: 0x220000
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.3;
    body.castShadow = true;
    body.userData.isAnimalPart = true;
    group.add(body);

    const headGeometry = new THREE.SphereGeometry(0.45, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFF6666,
      roughness: 0.6,
      emissive: 0x330000
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.75;
    head.castShadow = true;
    head.userData.isAnimalPart = true;
    group.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.85, 0.35);
    leftEye.userData.isAnimalPart = true;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.85, 0.35);
    rightEye.userData.isAnimalPart = true;
    group.add(rightEye);

    const noseGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x880000 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.65, 0.4);
    nose.userData.isAnimalPart = true;
    group.add(nose);

    const earGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const earMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFF4444,
      roughness: 0.6
    });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.35, 1.0, 0);
    leftEar.userData.isAnimalPart = true;
    group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.35, 1.0, 0);
    rightEar.userData.isAnimalPart = true;
    group.add(rightEar);

    return group;
  };

  const createRabbit = () => {
    const group = new THREE.Group();
    group.userData.animalType = ANIMAL_TYPE.RABBIT;

    const bodyGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFFFF,
      roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25;
    body.castShadow = true;
    body.userData.isAnimalPart = true;
    group.add(body);

    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFFFF,
      roughness: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.7;
    head.castShadow = true;
    head.userData.isAnimalPart = true;
    group.add(head);

    const earGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
    const earMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFFFF,
      roughness: 0.5
    });
    const innerEarMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFCCCC,
      roughness: 0.5
    });

    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.15, 1.1, 0);
    leftEar.rotation.z = 0.2;
    leftEar.userData.isAnimalPart = true;
    group.add(leftEar);

    const leftInnerEar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16),
      innerEarMaterial
    );
    leftInnerEar.position.set(-0.15, 1.1, 0);
    leftInnerEar.rotation.z = 0.2;
    leftInnerEar.userData.isAnimalPart = true;
    group.add(leftInnerEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.15, 1.1, 0);
    rightEar.rotation.z = -0.2;
    rightEar.userData.isAnimalPart = true;
    group.add(rightEar);

    const rightInnerEar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16),
      innerEarMaterial
    );
    rightInnerEar.position.set(0.15, 1.1, 0);
    rightInnerEar.rotation.z = -0.2;
    rightInnerEar.userData.isAnimalPart = true;
    group.add(rightInnerEar);

    const eyeGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 0.75, 0.32);
    leftEye.userData.isAnimalPart = true;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 0.75, 0.32);
    rightEye.userData.isAnimalPart = true;
    group.add(rightEye);

    const noseGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCCC });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.55, 0.35);
    nose.userData.isAnimalPart = true;
    group.add(nose);

    const tailGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 0.3, -0.45);
    tail.userData.isAnimalPart = true;
    group.add(tail);

    return group;
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

    spawnAnimals();
  }, []);

  const hideAnimal = (cellIndex) => {
    const cell = cellsRef.current[cellIndex];
    if (!cell) return;

    cell.userData.normalMole.visible = false;
    cell.userData.normalMole.position.y = -1.5;
    cell.userData.redMole.visible = false;
    cell.userData.redMole.position.y = -1.5;
    cell.userData.rabbit.visible = false;
    cell.userData.rabbit.position.y = -1.5;
    cell.userData.currentAnimal = null;
    
    activeCellsRef.current.delete(cellIndex);
  };

  const showAnimal = (cellIndex, animalType) => {
    const cell = cellsRef.current[cellIndex];
    if (!cell) return;

    hideAnimal(cellIndex);

    let animal;
    switch (animalType) {
      case ANIMAL_TYPE.RED_MOLE:
        animal = cell.userData.redMole;
        break;
      case ANIMAL_TYPE.RABBIT:
        animal = cell.userData.rabbit;
        break;
      default:
        animal = cell.userData.normalMole;
    }

    animal.visible = true;
    animal.position.y = 0;
    cell.userData.currentAnimal = animalType;
    activeCellsRef.current.set(cellIndex, animalType);
  };

  const resetGame = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
    
    cellTimeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    cellTimeoutsRef.current.clear();

    cellsRef.current.forEach((_, index) => {
      hideAnimal(index);
    });

    activeCellsRef.current.clear();
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

  const getRandomAnimalTypes = (count) => {
    const types = [];
    let hasRedMole = false;
    let hasRabbit = false;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      
      if (!hasRedMole && rand < 0.1) {
        types.push(ANIMAL_TYPE.RED_MOLE);
        hasRedMole = true;
      } else if (!hasRabbit && rand < 0.2) {
        types.push(ANIMAL_TYPE.RABBIT);
        hasRabbit = true;
      } else {
        types.push(ANIMAL_TYPE.NORMAL_MOLE);
      }
    }

    return types;
  };

  const spawnAnimals = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    activeCellsRef.current.forEach((_, cellIndex) => {
      hideAnimal(cellIndex);
      const timeout = cellTimeoutsRef.current.get(cellIndex);
      if (timeout) {
        clearTimeout(timeout);
        cellTimeoutsRef.current.delete(cellIndex);
      }
    });

    const animalCount = Math.floor(Math.random() * 3) + 3;
    const availableCells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      availableCells.push(i);
    }

    const animalTypes = getRandomAnimalTypes(animalCount);

    for (let i = 0; i < animalCount; i++) {
      if (availableCells.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cellIndex = availableCells.splice(randomIndex, 1)[0];
      const animalType = animalTypes[i];

      showAnimal(cellIndex, animalType);

      const timeout = setTimeout(() => {
        hideAnimal(cellIndex);
        cellTimeoutsRef.current.delete(cellIndex);
      }, ANIMAL_STAY_TIME);
      
      cellTimeoutsRef.current.set(cellIndex, timeout);
    }

    const decreaseAmount = Math.floor(scoreRef.current / 50) * SPAWN_INTERVAL_DECREASE;
    const nextInterval = Math.max(MIN_SPAWN_INTERVAL, INITIAL_SPAWN_INTERVAL - decreaseAmount);

    spawnTimeoutRef.current = setTimeout(() => {
      if (gameStateRef.current === 'playing') {
        spawnAnimals();
      }
    }, nextInterval);
  }, []);

  const handleMouseMove = useCallback((event) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const cellMeshes = cellsRef.current.flatMap(cell => [
      cell.userData.ground,
      cell.userData.hoverRing
    ]);
    
    const intersects = raycasterRef.current.intersectObjects(cellMeshes, true);

    if (hoveredCellRef.current !== null) {
      const prevCell = cellsRef.current[hoveredCellRef.current];
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
    cellsRef.current.forEach(cell => {
      allMeshes.push(cell.userData.ground);
      allMeshes.push(cell.userData.hoverRing);
      
      if (cell.userData.normalMole.visible) {
        cell.userData.normalMole.traverse((obj) => {
          if (obj.isMesh) {
            allMeshes.push(obj);
          }
        });
      }
      if (cell.userData.redMole.visible) {
        cell.userData.redMole.traverse((obj) => {
          if (obj.isMesh) {
            allMeshes.push(obj);
          }
        });
      }
      if (cell.userData.rabbit.visible) {
        cell.userData.rabbit.traverse((obj) => {
          if (obj.isMesh) {
            allMeshes.push(obj);
          }
        });
      }
    });
    
    const intersects = raycasterRef.current.intersectObjects(allMeshes, false);

    if (intersects.length > 0) {
      let clickedCellIndex = null;
      let hitAnimalPart = false;

      for (const intersect of intersects) {
        const obj = intersect.object;
        
        if (obj.userData && obj.userData.isAnimalPart) {
          hitAnimalPart = true;
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
        const isCellActive = activeCellsRef.current.has(clickedCellIndex);
        const animalType = activeCellsRef.current.get(clickedCellIndex);

        if (isCellActive && hitAnimalPart) {
          let scoreChange = 0;
          
          switch (animalType) {
            case ANIMAL_TYPE.RED_MOLE:
              scoreChange = SCORE_RED_MOLE;
              break;
            case ANIMAL_TYPE.RABBIT:
              scoreChange = SCORE_RABBIT;
              break;
            default:
              scoreChange = SCORE_NORMAL_MOLE;
          }

          scoreRef.current += scoreChange;
          setScore(scoreRef.current);
          
          const timeout = cellTimeoutsRef.current.get(clickedCellIndex);
          if (timeout) {
            clearTimeout(timeout);
            cellTimeoutsRef.current.delete(clickedCellIndex);
          }
          
          hideAnimal(clickedCellIndex);
        } else if (!isCellActive) {
          scoreRef.current += SCORE_MISS;
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
                <p>🐹 普通地鼠：+10分</p>
                <p>🔴 红色地鼠：+30分（10%概率）</p>
                <p>🐰 兔子：-30分（10%概率，不要点！）</p>
                <p>❌ 误点空格：-5分</p>
                <p>⏱️ 游戏时间 30 秒</p>
                <p>📈 分数越高，动物出现越快！</p>
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
