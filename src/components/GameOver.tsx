import { useGameStore } from "@/store/gameStore";

export function GameOver() {
  const reset = useGameStore((s) => s.reset);
  const toMenu = useGameStore((s) => s.toMenu);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="glass relative w-[min(92vw,520px)] rounded-3xl p-10 text-center shadow-glow">
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 text-7xl animate-floaty">
          🏆
        </div>
        <h2 className="font-display text-4xl font-black title-gradient">
          通 关 成 功
        </h2>
        <p className="mt-3 text-sm text-white/70">
          你已升级至最高等级，整个停车场都在为你颤抖！
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            再 玩 一 次
          </button>
          <button onClick={toMenu} className="btn-ghost">
            返 回 主 菜 单
          </button>
        </div>
      </div>
    </div>
  );
}
