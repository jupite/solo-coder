import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { GameScene } from "@/components/GameScene";
import { HUD } from "@/components/HUD";
import { StartMenu } from "@/components/StartMenu";
import { GameOver } from "@/components/GameOver";

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="relative h-full w-full overflow-hidden">
              <GameScene />
              {phase === "playing" && <HUD />}
              {phase === "menu" && <StartMenu />}
              {phase === "gameover" && <GameOver />}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
