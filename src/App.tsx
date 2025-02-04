import { useState } from "react";
import "./App.css";
import LevelEditor from "./components/LevelEditor";

import Sokoban from "./components/Sokoban";
import { FinalScore, GameState } from "./types";
import WelcomeModal from "./components/WelcomeModal";
import { Label } from "./components/ui/label";
import { Checkbox } from "./components/ui/checkbox";
import Nav from "./components/Nav";


// Example usage
const App = () => {
  const exampleMap = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 4, 3, 0, 1],
    [1, 1, 2, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  const [playing, setPlaying] = useState<GameState>(
    "notPlaying"
  );
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);

  return (
    <>
      <Nav/>
      <div style={{ padding: 20 }}>
        <h2>🍒 Sokodle 📦</h2>
        <WelcomeModal/>
        <div style={{ marginBottom: 20 }}>
          Use arrow keys or tap squares to move | Z to undo
        </div>
        {playing == "won" && (
          <div>
          <div style={{ color: "green", fontSize: 24, marginBottom: 10 }}>
            🎉 You Win! 🎉
          </div>
          <div> Time: {finalScore?.time} Moves: {finalScore?.steps}</div>
        </div>
        )}
        <Sokoban mapData={exampleMap} playing={playing} setPlaying={setPlaying} setFinalScore={setFinalScore}/>
        <br/><br/><br/>
        <LevelEditor/>
      </div>
    </>
  );
};

export default App;
