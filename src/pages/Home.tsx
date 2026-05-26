import { GameScene } from '@/components/Game/GameScene';
import { ScorePanel } from '@/components/UI/ScorePanel';
import { PowerIndicator } from '@/components/UI/PowerIndicator';
import { PreviewWindow } from '@/components/UI/PreviewWindow';
import { GameOverModal } from '@/components/UI/GameOverModal';
import { GameHint } from '@/components/UI/GameHint';
import { useGameLoop } from '@/hooks/useGameLoop';

export default function Home() {
  useGameLoop();

  return (
    <div className="w-full h-screen relative overflow-hidden bg-slate-950">
      <GameScene />

      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <ScorePanel />
        </div>

        <div className="pointer-events-auto">
          <PreviewWindow />
        </div>

        <GameHint />

        <PowerIndicator />

        <GameOverModal />
      </div>
    </div>
  );
}
