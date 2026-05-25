import { useEffect, useMemo, useRef } from "react";
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

export function WorldObjects({ register }: Props) {
  const itemsRef = useRef<Item[]>([]);
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

  useEffect(() => {
    itemsRef.current = initialItems.map((i) => ({ ...i }));
  }, [initialItems, phase]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = performance.now();
      for (const item of itemsRef.current) {
        if (item.absorbed && item.absorbing && now - item.absorbing > RESPAWN_MS) {
          const pos = randomPosition(6, MAP_RADIUS - 2);
          item.position = pos;
          item.absorbed = false;
          item.absorbing = undefined;
          item.spawnAt = now;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    register({
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
            item.absorbed = true;
            item.absorbing = performance.now();
            useGameStore.getState().addVolume(item.config.volume);
          }
        }
      },
    });
  }, [register]);

  return (
    <group>
      {itemsRef.current.map((item) => (
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
  const ref = useRef<THREE.Group>(null);
  const locked = item.config.minLevel > level;

  useEffect(() => {
    if (ref.current) ref.current.visible = !item.absorbed;
  });

  return (
    <group
      ref={ref}
      position={[item.position[0], 0, item.position[1]]}
      visible={!item.absorbed}
    >
      <WorldObject config={item.config} position={[0, 0]} locked={locked} />
    </group>
  );
}
