import "./App.css";
import LevelEditor from "./components/LevelEditor";

import Sokoban from "./components/Sokoban";


// Example usage
const App = () => {
  const exampleMap = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 4, 3, 0, 1],
    [1, 1, 2, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>🍒 Sokodle 📦</h1>
      <div style={{ marginBottom: 20 }}>
        Use arrow keys or tap squares to move | Z to undo
      </div>
      <Sokoban mapData={exampleMap} />
      <br/><br/><br/>
      <LevelEditor/>
    </div>
  );
};

export default App;
