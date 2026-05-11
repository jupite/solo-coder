import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '\\'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' ']
];

function createKeyTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, 128, 128);
  
  if (text !== ' ') {
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), 64, 64);
  }
  
  const texture = new THREE.Texture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function KeyboardScene() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const keysRef = useRef([]);
  const screenTextureRef = useRef(null);
  const screenCanvasRef = useRef(null);
  const [typedText, setTypedText] = useState('');
  const audioContextRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 3, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(8, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4fc3f7, 0.5);
    pointLight.position.set(-8, 8, 8);
    scene.add(pointLight);

    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x16213e,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const keyboardGroup = new THREE.Group();
    const keyWidth = 1.2;
    const keyHeight = 1.2;
    const keyDepth = 0.5;
    const gap = 0.15;

    const allKeys = [];
    let totalWidth = 0;
    KEYBOARD_ROWS.forEach(row => {
      const rowWidth = row.reduce((sum, key) => {
        const w = key === ' ' ? keyWidth * 6 : keyWidth;
        return sum + w + gap;
      }, 0) - gap;
      if (rowWidth > totalWidth) totalWidth = rowWidth;
    });

    const keyboardBaseWidth = totalWidth + 2;
    const keyboardBaseDepth = KEYBOARD_ROWS.length * (keyHeight + gap) + 2;
    
    const keyboardBase = new THREE.Mesh(
      new THREE.BoxGeometry(keyboardBaseWidth, 0.4, keyboardBaseDepth),
      new THREE.MeshStandardMaterial({ 
        color: 0x2d2d2d, 
        roughness: 0.6,
        metalness: 0.2
      })
    );
    keyboardBase.position.y = 0.2;
    keyboardBase.castShadow = true;
    keyboardBase.receiveShadow = true;
    keyboardGroup.add(keyboardBase);

    const keyCapMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5, 
      roughness: 0.35, 
      metalness: 0.05
    });

    KEYBOARD_ROWS.forEach((row, rowIndex) => {
      let currentX = 0;
      row.forEach((key, colIndex) => {
        const actualWidth = key === ' ' ? keyWidth * 6 : keyWidth;
        
        if (colIndex === 0) {
          const rowWidth = row.reduce((sum, k) => {
            const w = k === ' ' ? keyWidth * 6 : keyWidth;
            return sum + w + gap;
          }, 0) - gap;
          currentX = -rowWidth / 2 + actualWidth / 2;
        } else {
          const prevKey = row[colIndex - 1];
          const prevWidth = prevKey === ' ' ? keyWidth * 6 : keyWidth;
          currentX += prevWidth / 2 + gap + actualWidth / 2;
        }

        const keyGroup = new THREE.Group();
        
        const keyCap = new THREE.Mesh(
          new THREE.BoxGeometry(actualWidth, keyDepth, keyHeight),
          keyCapMaterial.clone()
        );
        keyCap.position.y = keyDepth / 2 + 0.4;
        keyCap.castShadow = true;
        keyCap.receiveShadow = true;
        keyGroup.add(keyCap);

        if (key !== ' ') {
          const texture = createKeyTexture(key);
          const letterMaterial = new THREE.MeshStandardMaterial({ 
            map: texture,
            transparent: true,
            roughness: 0.4
          });
          const letterMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(actualWidth * 0.75, keyHeight * 0.75),
            letterMaterial
          );
          letterMesh.position.y = keyDepth + 0.401;
          letterMesh.rotation.x = -Math.PI / 2;
          keyGroup.add(letterMesh);
        }

        const startZ = -(KEYBOARD_ROWS.length * (keyHeight + gap)) / 2 + rowIndex * (keyHeight + gap);
        keyGroup.position.set(currentX, 0, startZ);
        
        keyGroup.userData = {
          key: key,
          originalY: keyCap.position.y,
          isPressed: false
        };

        keyboardGroup.add(keyGroup);
        allKeys.push({ 
          group: keyGroup, 
          keyCap: keyCap, 
          keyValue: key 
        });
      });
    });

    keysRef.current = allKeys;
    scene.add(keyboardGroup);

    const monitorGroup = new THREE.Group();
    
    const monitorBack = new THREE.Mesh(
      new THREE.BoxGeometry(15, 10, 0.8),
      new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, 
        roughness: 0.5,
        metalness: 0.3
      })
    );
    monitorBack.position.set(0, 6, -8);
    monitorBack.castShadow = true;
    monitorGroup.add(monitorBack);

    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 600;
    screenCanvasRef.current = screenCanvas;
    
    const screenCtx = screenCanvas.getContext('2d');
    screenCtx.fillStyle = '#0f0f1a';
    screenCtx.fillRect(0, 0, 1024, 600);
    screenCtx.fillStyle = '#00ff88';
    screenCtx.font = 'bold 36px "Courier New", monospace';
    screenCtx.textAlign = 'left';
    screenCtx.textBaseline = 'top';
    screenCtx.fillText('> _', 50, 50);

    const screenTexture = new THREE.Texture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.needsUpdate = true;
    screenTextureRef.current = screenTexture;

    const screenMaterial = new THREE.MeshStandardMaterial({ 
      map: screenTexture,
      emissive: 0x004422,
      emissiveIntensity: 0.3
    });
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(13.5, 8.5),
      screenMaterial
    );
    screen.position.set(0, 6, -7.55);
    monitorGroup.add(screen);

    const monitorStand = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 3.5, 0.6),
      new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a, 
        roughness: 0.6,
        metalness: 0.2
      })
    );
    monitorStand.position.set(0, 3, -8);
    monitorStand.castShadow = true;
    monitorGroup.add(monitorStand);

    const monitorBase = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.4, 2.5),
      new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a, 
        roughness: 0.6,
        metalness: 0.2
      })
    );
    monitorBase.position.set(0, 0.2, -8);
    monitorBase.castShadow = true;
    monitorBase.receiveShadow = true;
    monitorGroup.add(monitorBase);

    scene.add(monitorGroup);

    const updateScreen = (text) => {
      if (!screenCanvasRef.current) return;
      const ctx = screenCanvasRef.current.getContext('2d');
      
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
      const visibleLines = lines.slice(-10);
      visibleLines.forEach((line, index) => {
        ctx.fillText('> ' + line, 50, startY + index * lineHeight);
      });
      ctx.fillText('> _', 50, startY + visibleLines.length * lineHeight);
      
      if (screenTextureRef.current) {
        screenTextureRef.current.needsUpdate = true;
      }
    };

    const playKeySound = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.12);
      } catch (e) {
        console.log('Audio error:', e);
      }
    };

    const animateKeyPress = (keyObject) => {
      if (keyObject.group.userData.isPressed) return;
      
      keyObject.group.userData.isPressed = true;
      playKeySound();
      
      const letter = keyObject.group.userData.key;
      
      setTypedText(prev => {
        const newText = prev + letter;
        updateScreen(newText);
        return newText;
      });

      keyObject.keyCap.position.y = 0.15 + 0.4;
      setTimeout(() => {
        keyObject.keyCap.position.y = keyObject.group.userData.originalY;
        keyObject.group.userData.isPressed = false;
      }, 150);
    };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      const keyCaps = allKeys.map(k => k.keyCap);
      const intersects = raycaster.intersectObjects(keyCaps, false);
      
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
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.005;
      
      camera.position.x = Math.sin(time * 0.3) * 0.3;
      camera.position.y = 10 + Math.sin(time * 0.2) * 0.2;
      camera.lookAt(0, 3, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#00ff88',
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        background: 'rgba(0,0,0,0.8)',
        padding: '15px 20px',
        borderRadius: '8px',
        border: '1px solid #00ff88',
        maxWidth: '400px',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>
          🎮 3D 交互式键盘 & 显示器
        </div>
        <div style={{ marginBottom: '5px' }}>点击键盘上的按键进行输入</div>
        <div style={{ marginBottom: '5px' }}>敲击的字母会显示在显示器上</div>
        <div style={{ marginTop: '10px', opacity: 0.8 }}>
          已输入: {typedText.length} 个字符
        </div>
      </div>
    </div>
  );
}
