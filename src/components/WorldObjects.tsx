import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import * as THREE from "three";
import { OBJECT_CONFIGS, MAP_RADIUS, randomPosition } from "@/game/config";
import { WorldObject } from "./WorldObject";
import { useGameStore } from "@/store/gameStore";
import type { ObjectConfig } from "@/game/config";

interface Item {
  id: number;
  config: ObjectConfig;
  position: [number, number];
  absorbed: boolean;
  spawnAt: number;
  absorbing?: number;
}

const RESPAWN_MS = 8000;

export interface WorldObjectsHandle {
  checkConsume: (
    tornadoPos: THREE.Vector3,
    tornadoRadius: number
  ) => void;
}

interface Props {
  register: (handle: WorldObjectsHandle) => void;
}

type Action =
  | { type: "absorb"; id: number }
  | { type: "respawn"; id: number; position: [number, number] }
  | { type: "reset"; items: Item[] };

function reducer(state: Item[], action: Action): Item[] {
  switch (action.type) {
    case "absorb":
      return state.map((item) =>
        item.id === action.id
          ? { ...item, absorbed: true, absorbing: performance.now() }
          : item
      );
    case "respawn":
      return state.map((item) =>
        item.id === action.id
          ? {
              ...item,
              absorbed: false,
              absorbing: undefined,
              position: action.position,
              spawnAt: performance.now(),
            }
          : item
      );
    case "reset":
      return action.items;
    default:
      return state;
  }
}

export function WorldObjects({ register }: Props) {
  const level = useGameStore((s) => s.level);
  const phase = useGameStore((s) => s.phase);

  const initialItems = useMemo<Item[]>(() => {
    const arr: Item[] = [];
    let id = 1;
    OBJECT_CONFIGS.forEach((cfg) => {
      for (let i = 0; i < cfg.count; i++) {
        const pos = randomPosition(4, MAP_RADIUS - 2);
        arr.push({
          id: id++,
          config: cfg,
          position: pos,
          absorbed: false,
          spawnAt: performance.now(),
        });
      }
    });
    return arr;
  }, []);

  const [items, dispatch] = useReducer(reducer, initialItems);

  const itemsRef = useRef<Item[]>(initialItems);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    dispatch({ type: "reset", items: initialItems });
  }, [initialItems, phase]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = performance.now();
      for (const item of itemsRef.current) {
        if (item.absorbed && item.absorbing && now - item.absorbing > RESPAWN_MS) {
          const pos = randomPosition(6, MAP_RADIUS - 2);
          dispatch({ type: "respawn", id: item.id, position: pos });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const registerRef = useRef(register);
  registerRef.current = register;

  useEffect(() => {
    const handle: WorldObjectsHandle = {
      checkConsume: (tornadoPos, tornadoRadius) => {
        const currentLevel = useGameStore.getState().level;
        for (const item of itemsRef.current) {
          if (item.absorbed) continue;
          if (item.config.minLevel > currentLevel) continue;
          const dx = item.position[0] - tornadoPos.x;
          const dz = item.position[1] - tornadoPos.z;
          const dist = Math.hypot(dx, dz);
          const reach = tornadoRadius + item.config.radius * 0.7;
          if (dist < reach) {
            dispatch({ type: "absorb", id: item.id });
            useGameStore.getState().addVolume(item.config.volume);
          }
        }
      },
    };
    registerRef.current(handle);
  }, []);

  return (
    <group>
      {items.map((item) => (
        <WorldObjectEntry key={item.id} item={item} level={level} />
      ))}
    </group>
  );
}

function WorldObjectEntry({
  item,
  level,
}: {
  item: Item;
  level: number;
}) {
  const locked = item.config.minLevel > level;

  return (
    <group
      position={[item.position[0], 0, item.position[1]]}
      visible={!item.absorbed}
    >
      <WorldObject config={item.config} position={[0, 0]} locked={locked} />
    </group>
  );
}
