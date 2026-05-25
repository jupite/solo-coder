import { useEffect, useState } from "react";
import { useGameStore, MAX_LEVEL, LEVEL_THRESHOLDS } from "@/store/gameStore";
import { OBJECT_CONFIGS } from "@/game/config";

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function HUD() {
  const level = useGameStore((s) => s.level);
  const volume = useGameStore((s) => s.volume);
  const threshold = useGameStore((s) => s.threshold);
  const startTime = useGameStore((s) => s.startTime);
  const [now, setNow] = useState(performance.now());

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const progress = Math.min(volume / threshold, 1);
  const nextTarget = OBJECT_CONFIGS.find((c) => c.minLevel === level + 1);
  const currentHighest = [...OBJECT_CONFIGS]
    .reverse()
    .find((c) => c.minLevel <= level);

  const elapsed = now - startTime;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      <div className="absolute left-4 top-4 flex items-center gap-3">
        <div className="glass rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-black title-gradient">
              Lv.{level}
            </span>
            <span className="text-xs text-storm-sky/70">
              / {MAX_LEVEL}
            </span>
          </div>
          <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-white/10">
            <div
              className="hud-bar h-full transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-white/70">
            <span>
              {volume.toFixed(0)} / {threshold.toFixed(0)}
            </span>
            <span>{formatTime(elapsed)}</span>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <div className="glass rounded-2xl px-4 py-3 text-right">
          <div className="text-xs uppercase tracking-widest text-storm-sky/70">
            当前可吞噬
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {currentHighest ? `${currentHighest.emoji} ${currentHighest.name}` : "—"}
          </div>
          <div className="mt-2 text-xs uppercase tracking-widest text-storm-sky/70">
            下一级解锁
          </div>
          <div className="mt-1 text-sm font-semibold text-storm-amber">
            {nextTarget ? `${nextTarget.emoji} ${nextTarget.name}` : "🏆 最高等级"}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="glass rounded-full px-5 py-2 text-xs text-white/80">
          <span className="mr-3">
            <kbd className="rounded bg-white/10 px-2 py-0.5">W A S D</kbd> /{" "}
            <kbd className="rounded bg-white/10 px-2 py-0.5">↑ ← ↓ →</kbd> 移动
          </span>
          <span>吞噬物体升级，达到 Lv.{MAX_LEVEL} 通关</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4">
        <div className="glass rounded-2xl px-3 py-2 text-[11px] text-white/70">
          <div className="font-display text-xs text-storm-sky">
            升级进度
          </div>
          <div className="mt-1 flex gap-1">
            {LEVEL_THRESHOLDS.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-4 rounded-sm ${
                  i < level
                    ? "bg-storm-amber"
                    : i === level
                    ? "bg-storm-cyan animate-pulse"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
