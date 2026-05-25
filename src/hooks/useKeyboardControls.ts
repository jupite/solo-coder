import { useEffect, useRef } from "react";

interface Keys {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
}

export function useKeyboardControls() {
  const ref = useRef<Keys>({
    forward: false,
    back: false,
    left: false,
    right: false,
    boost: false,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          ref.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          ref.current.back = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          ref.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          ref.current.right = true;
          break;
        case "Space":
          ref.current.boost = true;
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          ref.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          ref.current.back = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          ref.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          ref.current.right = false;
          break;
        case "Space":
          ref.current.boost = false;
          break;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return ref;
}
