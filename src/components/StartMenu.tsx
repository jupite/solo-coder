import { useGameStore, MAX_LEVEL } from "@/store/gameStore";
import { OBJECT_CONFIGS } from "@/game/config";

export function StartMenu() {
  const start = useGameStore((s) => s.start);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-storm-night/70 backdrop-blur-md">
      <div className="glass relative w-[min(92vw,560px)] rounded-3xl p-10 text-center shadow-glow">
        <div className="pointer-events-none absolute -left-8 -top-8 text-7xl animate-floaty opacity-80">
          🌪️
        </div>
        <div className="pointer-events-none absolute -right-8 -bottom-8 text-6xl animate-floaty opacity-60">
          🚗
        </div>

        <h1 className="font-display text-5xl font-black leading-none title-gradient">
          TORNADO STORM
        </h1>
        <p className="mt-2 text-sm tracking-[0.3em] text-storm-sky/80">
          龙 卷 风 暴
        </p>

        <div className="mt-8 rounded-2xl bg-black/30 p-4 text-left text-sm text-white/80">
          <div className="mb-2 font-semibold text-storm-amber">玩法说明</div>
          <ul className="list-disc space-y-1 pl-5">
            <li>使用 <span className="font-mono text-storm-cyan">W A S D</span> 或方向键移动龙卷风</li>
            <li>吞噬体积小于自身的物体（花草、树木、车辆、房屋…）</li>
            <li>累计体积达到阈值自动升级，体积扩大解锁更大目标</li>
            <li>达到 Lv.{MAX_LEVEL} 即可通关，场内物体会定时刷新</li>
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {OBJECT_CONFIGS.slice(0, 8).map((c) => (
            <div
              key={c.kind}
              className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/80"
            >
              <span>{c.emoji}</span>
              <span>{c.name}</span>
              <span className="text-white/40">Lv.{c.minLevel}+</span>
            </div>
          ))}
        </div>

        <button
          onClick={start}
          className="btn-primary mt-8 relative text-base"
        >
          <span className="ring-pulse" />
          开 始 游 戏
        </button>

        <p className="mt-4 text-xs text-white/40">
          目标：吞噬一切，把停车场夷为平地
        </p>
      </div>
    </div>
  );
}
