import { useEffect, useRef } from 'react';

interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  action: boolean;
  switch: boolean;
  pause: boolean;
}

export const useKeyboard = () => {
  const stateRef = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    action: false,
    switch: false,
    pause: false,
  });

  const actionQueueRef = useRef(false);
  const switchQueueRef = useRef(false);
  const pauseQueueRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      switch (key) {
        case 'w':
        case 'arrowup':
          stateRef.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          stateRef.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          stateRef.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          stateRef.current.right = true;
          break;
        case 'shift':
          stateRef.current.sprint = true;
          break;
        case ' ':
          stateRef.current.action = true;
          actionQueueRef.current = true;
          e.preventDefault();
          break;
        case 'tab':
          stateRef.current.switch = true;
          switchQueueRef.current = true;
          e.preventDefault();
          break;
        case 'escape':
          stateRef.current.pause = true;
          pauseQueueRef.current = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      switch (key) {
        case 'w':
        case 'arrowup':
          stateRef.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          stateRef.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          stateRef.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          stateRef.current.right = false;
          break;
        case 'shift':
          stateRef.current.sprint = false;
          break;
        case ' ':
          stateRef.current.action = false;
          break;
        case 'tab':
          stateRef.current.switch = false;
          break;
        case 'escape':
          stateRef.current.pause = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const consumeAction = () => {
    const wasPressed = actionQueueRef.current;
    actionQueueRef.current = false;
    return wasPressed;
  };

  const consumeSwitch = () => {
    const wasPressed = switchQueueRef.current;
    switchQueueRef.current = false;
    return wasPressed;
  };

  const consumePause = () => {
    const wasPressed = pauseQueueRef.current;
    pauseQueueRef.current = false;
    return wasPressed;
  };

  return {
    state: stateRef,
    consumeAction,
    consumeSwitch,
    consumePause,
  };
};
