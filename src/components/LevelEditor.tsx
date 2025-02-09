"use client";

import { useState, useEffect } from "react";
import Sokoban from "@/components/Sokoban";
import { FinalScore, GameState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

export default function LevelEditor() {
  const [width, setWidth] = useState(7);
  const [height, setHeight] = useState(5);
  const [mapData, setMapData] = useState([
    [1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 4, 3, 0, 1],
    [1, 1, 2, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ]);

  const [testing, setTesting] = useState(false);
  const [playing, setPlaying] = useState<GameState>("notPlaying");
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    "notSubmitting" | "submitting" | "submitted"
  >("notSubmitting");
  // Store JSON version of map data for direct editing.
  const [mapDataString, setMapDataString] = useState(() =>
    JSON.stringify(mapData)
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Store any verification errors here.
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);

  useEffect(() => {
    // Keep the JSON editor in sync whenever mapData changes from in-game clicks.
    setMapDataString(JSON.stringify(mapData));
  }, [mapData]);

  function generateMap(
    w: number,
    h: number,
    biggerX: boolean,
    biggerY: boolean
  ) {
    return Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
          return 1;
        }
        if ((biggerY && y === h - 2) || (biggerX && x === w - 2)) {
          return 0;
        }
        if (mapData[y] && mapData[y][x] !== undefined) {
          return mapData[y][x];
        }
        return 0;
      })
    );
  }

  function handleCellClick(y: number, x: number) {
    // Clone the 2D array deeply
    const oldMapData = mapData.map((row) => [...row]);
    const glyph = oldMapData[y][x];

    // Force the borders to be walls
    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
      oldMapData[y][x] = 1;
    } else if (glyph > 3) {
      oldMapData[y][x] = 0;
    } else {
      oldMapData[y][x] = glyph + 1;
    }

    setMapData(oldMapData);
  }

  function handleSizeChange(newWidth: number, newHeight: number) {
    const biggerX = newWidth > width;
    const biggerY = newHeight > height;
    setWidth(newWidth);
    setHeight(newHeight);
    setMapData(generateMap(newWidth, newHeight, biggerX, biggerY));
  }

  // --- Verification Logic: add more checks here as needed. ---
  function verifyMapData(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let playerCount = 0;
    let boxCount = 0;
    let goalCount = 0;

    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        const cell = mapData[y][x];
        if (cell === 4) {
          playerCount++;
        } else if (cell === 2) {
          boxCount++;
        } else if (cell === 3) {
          goalCount++;
        }
      }
    }

    // Check #1: Exactly one player
    if (playerCount !== 1) {
      errors.push(`Must have exactly 1 player, but found ${playerCount}.`);
    }

    // Check #2: boxes >= goals
    if (boxCount < goalCount) {
      errors.push(
        `There must be as many or more boxes (${boxCount}) than goals (${goalCount}).`
      );
    }

    // Extend here for additional checks

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Called when the user edits the JSON text area.
  function handleMapDataStringChange(newString: string) {
    setMapDataString(newString);
    try {
      const parsedMap = JSON.parse(newString);
      if (Array.isArray(parsedMap)) {
        const newHeight = parsedMap.length;
        const newWidth = newHeight > 0 ? parsedMap[0].length : 0;

        // Update the mapData state
        setMapData(parsedMap);

        // If JSON-based dimensions differ from current, adjust them.
        if (newWidth !== width || newHeight !== height) {
          handleSizeChange(newWidth, newHeight);
        }
      }
    } catch (error) {
      // Invalid JSON, do nothing or show error as needed.
    }
  }

  async function handleSubmit() {
    if (submissionStatus !== "notSubmitting") return;
    setSubmissionStatus("submitting");
    await fetch("/api/submit-level", {
      method: "POST",
      body: JSON.stringify({ user_name: "testing", layout: mapData }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success === true) {
          setSubmissionStatus("submitted");
          setVerificationErrors([]);
        } else {
          setSubmissionStatus("notSubmitting");
          setVerificationErrors(["Failed to submit level :("]);
        }
      });
  }

  // Called when the user clicks "Verify Level"
  function handleVerify() {
    const result = verifyMapData();
    if (!result.valid) {
      setVerificationErrors(result.errors);
    } else {
      setVerificationErrors([]);
      alert("Map verification passed!"); // or any success indication
    }
  }

  // Called when user wants to begin testing the level.
  function handleTestLevel() {
    const result = verifyMapData();
    if (!result.valid) {
      setVerificationErrors(result.errors);
      return;
    }
    setVerificationErrors([]);
    setTesting(true);
  }

  return (
    <div>
      <div className="hidden">
        <label>Map Data (JSON):</label>
        <textarea
          style={{ display: "block", width: "100%", height: "200px" }}
          value={mapDataString}
          onChange={(e) => handleMapDataStringChange(e.target.value)}
        />
      </div>

      {!testing && (
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <Button onClick={handleVerify}>Verify Level</Button>{" "}
            <Button onClick={handleTestLevel}>Test Level</Button>
          </div>
          <div>
            <label>
              Width:
              <input
                className="w-12"
                type="number"
                min="3"
                value={width}
                onChange={(e) =>
                  handleSizeChange(Number(e.target.value), height)
                }
              />
            </label>
            <label>
              Height:
              <input
                className="w-12"
                type="number"
                min="3"
                value={height}
                onChange={(e) =>
                  handleSizeChange(width, Number(e.target.value))
                }
              />
            </label>
          </div>
          {verificationErrors.length > 0 && (
            <div style={{ color: "red", marginBottom: "1rem" }}>
              <strong>Errors:</strong>
              <ul>
                {verificationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${mapData[0].length}, 50px)`,
              gap: "2px",
              padding: "2px",
            }}
          >
            {mapData.map((thisRow, y) => {
              return thisRow.map((_, x) => {
                const cellValue = mapData[y][x];
                const isWall = cellValue === 1;
                const isBox = cellValue === 2;
                const isGoal = cellValue === 3;
                const isPlayer = cellValue === 4;

                let emoji = " "; // Default floor
                if (isWall) emoji = "⬛";
                else if (isBox) emoji = "📦";
                else if (isGoal) emoji = "🍒";
                else if (isPlayer) emoji = "🧍";

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(y, x)}
                    style={{
                      width: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 44,
                      cursor: "pointer",
                      backgroundColor: "#f0f0f0",
                      userSelect: "none",
                    }}
                  >
                    {emoji}
                  </div>
                );
              });
            })}
          </div>
        </div>
      )}

      {testing && (
        <div>
          <Button
            onClick={() => {
              setTesting(false);
              setPlaying("notPlaying");
              setSubmissionStatus("notSubmitting");
              setFinalScore(null);
            }}
          >
            Back to Editor
          </Button>
          {playing === "won" && (
            <div className="mt-5 mb-2">
              <div style={{ color: "green", fontSize: 24, marginBottom: 10 }}>
                🎉 You Win! 🎉
              </div>
              <div>
                Time: {finalScore?.time} Moves: {finalScore?.steps}
              </div>
              <Button
                className="mr-3"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(mapData));
                  setCopied(true);
                }}
              >
                {copied ? "Copied!" : "Copy Map"}
              </Button>
              {submissionStatus === "notSubmitting" && (
                <Button onClick={() => handleSubmit()}>Submit map</Button>
              )}
              {submissionStatus === "submitting" && (
                <Button>
                  <Loader size={"1em"} width={"80px"} height={"0px"} />
                </Button>
              )}
              {submissionStatus === "submitted" && (
                <Button disabled variant="neutral">
                  Submitted!
                </Button>
              )}
            </div>
          )}

          <div>
            <Sokoban
              mapData={mapData}
              playing={playing}
              setPlaying={setPlaying}
              setFinalScore={setFinalScore}
            />
          </div>
        </div>
      )}
    </div>
  );
}
