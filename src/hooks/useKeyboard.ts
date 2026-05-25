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

  const actionPressedRef = useRef(false);
  const switchPressedRef = useRef(false);
  const pausePressedRef = useRef(false);

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
          if (!actionPressedRef.current) {
            stateRef.current.action = true;
            actionPressedRef.current = true;
          }
          break;
        case 'tab':
          if (!switchPressedRef.current) {
            stateRef.current.switch = true;
            switchPressedRef.current = true;
          }
          e.preventDefault();
          break;
        case 'escape':
          if (!pausePressedRef.current) {
            stateRef.current.pause = true;
            pausePressedRef.current = true;
          }
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
          actionPressedRef.current = false;
          break;
        case 'tab':
          stateRef.current.switch = false;
          switchPressedRef.current = false;
          break;
        case 'escape':
          stateRef.current.pause = false;
          pausePressedRef.current = false;
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
    const wasPressed = stateRef.current.action;
    stateRef.current.action = false;
    return wasPressed;
  };

  const consumeSwitch = () => {
    const wasPressed = stateRef.current.switch;
    stateRef.current.switch = false;
    return wasPressed;
  };

  const consumePause = () => {
    const wasPressed = stateRef.current.pause;
    stateRef.current.pause = false;
    return wasPressed;
  };

  return {
    state: stateRef,
    consumeAction,
    consumeSwitch,
    consumePause,
  };
};
