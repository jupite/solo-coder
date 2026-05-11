import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '\\'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' ']
];

export default function KeyboardScene() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const keysMeshRef = useRef([]);
  const [typedText, setTypedText] = useState('');
  const audioContextRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4fc3f7, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x16213e });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const keyboardGroup = new THREE.Group();
    const keyWidth = 1.2;
    const keyHeight = 1.2;
    const keyDepth = 0.5;
    const gap = 0.1;
    const keyMaterials = {
      keyCap: new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3, metalness: 0.1 }),
      letter: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 })
    };

    const allKeys = [];
    let totalWidth = 0;
    KEYBOARD_ROWS.forEach(row => {
      const rowWidth = row.length * keyWidth + (row.length - 1) * gap;
      if (rowWidth > totalWidth) totalWidth = rowWidth;
    });

    const keyboardBaseWidth = totalWidth + 2;
    const keyboardBaseDepth = KEYBOARD_ROWS.length * (keyHeight + gap) + 2;
    
    const keyboardBase = new THREE.Mesh(
      new THREE.BoxGeometry(keyboardBaseWidth, 0.3, keyboardBaseDepth),
      new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.5 })
    );
    keyboardBase.position.y = 0.15;
    keyboardBase.castShadow = true;
    keyboardBase.receiveShadow = true;
    keyboardGroup.add(keyboardBase);

    KEYBOARD_ROWS.forEach((row, rowIndex) => {
      const rowWidth = row.length * keyWidth + (row.length - 1) * gap;
      const startX = -rowWidth / 2 + keyWidth / 2;
      const startZ = -(KEYBOARD_ROWS.length * (keyHeight + gap)) / 2 + rowIndex * (keyHeight + gap);

      row.forEach((key, colIndex) => {
        const keyGroup = new THREE.Group();
        const actualWidth = key === ' ' ? keyWidth * 6 : keyWidth;
        
        const keyCap = new THREE.Mesh(
          new THREE.BoxGeometry(actualWidth, keyDepth, keyHeight),
          keyMaterials.keyCap
        );
        keyCap.position.y = keyDepth / 2 + 0.3;
        keyCap.castShadow = true;
        keyGroup.add(keyCap);

        if (key !== ' ') {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(0, 0, 128, 128);
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 80px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(key.toUpperCase(), 64, 64);
          
          const texture = new THREE.CanvasTexture(canvas);
          const letterMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(actualWidth * 0.8, keyHeight * 0.8),
            new THREE.MeshStandardMaterial({ map: texture, transparent: true })
          );
          letterMesh.position.y = keyDepth + 0.31;
          letterMesh.rotation.x = -Math.PI / 2;
          keyGroup.add(letterMesh);
        }

        keyGroup.position.x = startX + colIndex * (keyWidth + gap);
        keyGroup.position.z = startZ;
        
        keyGroup.userData = {
          key: key,
          originalY: 0,
          isPressed: false
        };

        keyboardGroup.add(keyGroup);
        allKeys.push({ group: keyGroup, keyCap: keyCap, letter: key });
      });
    });

    keysMeshRef.current = allKeys;
    scene.add(keyboardGroup);

    const monitorGroup = new THREE.Group();
    
    const monitorBack = new THREE.Mesh(
      new THREE.BoxGeometry(14, 9, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 })
    );
    monitorBack.position.set(0, 5, -7);
    monitorBack.castShadow = true;
    monitorGroup.add(monitorBack);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 600;
    const screenCtx = screenCanvas.getContext('2d');
    screenCtx.fillStyle = '#0f0f1a';
    screenCtx.fillRect(0, 0, 1024, 600);
    screenCtx.fillStyle = '#00ff88';
    screenCtx.font = 'bold 40px "Courier New", monospace';
    screenCtx.textAlign = 'left';
    screenCtx.textBaseline = 'top';
    screenCtx.fillText('> _', 50, 50);
    
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(12.5, 7.5),
      new THREE.MeshStandardMaterial({ 
        map: screenTexture,
        emissive: 0x00ff88,
        emissiveIntensity: 0.1
      })
    );
    screen.position.set(0, 5, -6.55);
    monitorGroup.add(screen);

    const monitorStand = new THREE.Mesh(
      new THREE.BoxGeometry(2, 3, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 })
    );
    monitorStand.position.set(0, 2.5, -7);
    monitorStand.castShadow = true;
    monitorGroup.add(monitorStand);

    const monitorBase = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.3, 2),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 })
    );
    monitorBase.position.set(0, 0.15, -7);
    monitorBase.castShadow = true;
    monitorBase.receiveShadow = true;
    monitorGroup.add(monitorBase);

    scene.add(monitorGroup);

    const updateScreen = (text) => {
      const ctx = screenCanvas.getContext('2d');
      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(0, 0, 1024, 600);
      
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 36px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      const maxCharsPerLine = 50;
      const lineHeight = 50;
      const lines = [];
      let currentLine = '';
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
          lines.push(currentLine);
          currentLine = '';
        } else {
          currentLine += text[i];
          if (currentLine.length >= maxCharsPerLine) {
            lines.push(currentLine);
            currentLine = '';
          }
        }
      }
      if (currentLine) lines.push(currentLine);
      
      const startY = 50;
      lines.slice(-10).forEach((line, index) => {
        ctx.fillText('> ' + line, 50, startY + index * lineHeight);
      });
      ctx.fillText('> _', 50, startY + lines.slice(-10).length * lineHeight);
      
      screenTexture.needsUpdate = true;
    };

    updateScreen('');

    const playKeySound = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    };

    const animateKeyPress = (keyObject) => {
      if (keyObject.group.userData.isPressed) return;
      
      keyObject.group.userData.isPressed = true;
      playKeySound();
      
      let letter = keyObject.group.userData.key;
      if (letter === ' ') letter = ' ';
      
      setTypedText(prev => {
        const newText = prev + letter;
        updateScreen(newText);
        return newText;
      });

      const animate = () => {
        const progress = 0;
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();

      keyObject.keyCap.position.y = 0.1 + 0.3;
      setTimeout(() => {
        keyObject.keyCap.position.y = keyObject.keyCap.geometry.parameters.height / 2 + 0.3;
        keyObject.group.userData.isPressed = false;
      }, 150);
    };

    const handleClick = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      const keyCaps = allKeys.map(k => k.keyCap);
      const intersects = raycasterRef.current.intersectObjects(keyCaps);
      
      if (intersects.length > 0) {
        const clickedKeyCap = intersects[0].object;
        const keyObject = allKeys.find(k => k.keyCap === clickedKeyCap);
        if (keyObject) {
          animateKeyPress(keyObject);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      camera.position.x = Math.sin(time * 0.2) * 0.5;
      camera.lookAt(0, 2, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#00ff88',
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px 20px',
        borderRadius: '8px',
        border: '1px solid #00ff88',
        maxWidth: '400px'
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
          🎮 3D 交互式键盘 & 显示器
        </div>
        <div>点击键盘上的按键进行输入</div>
        <div>敲击的字母会显示在显示器上</div>
        <div style={{ marginTop: '10px', opacity: 0.7 }}>
          已输入: {typedText.length} 个字符
        </div>
      </div>
    </div>
  );
}
