"use client";

import { useState, useEffect } from "react";
import Sokoban from "@/components/Sokoban";
import { GameState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  // const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    "notSubmitting" | "submitting" | "submitted"
  >("notSubmitting");
  const [mapDataString, setMapDataString] = useState(() =>
    JSON.stringify(mapData)
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Store any verification errors here.
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);

  // Add these new state variables
  const [showNameModal, setShowNameModal] = useState(false);
  const [levelName, setLevelName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [moderationLoading, setModerationLoading] = useState(false);

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
      console.error("Error parsing map data:", error);
    }
  }

  async function handleSubmit(name: string) {
    if (submissionStatus !== "notSubmitting") return;
    setSubmissionStatus("submitting");
    await fetch("/api/submit-level", {
      method: "POST",
      body: JSON.stringify({ user_name: name, layout: mapData }),
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
    setShowNameModal(false);
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

  // Add this function to handle the modal submit
  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!levelName.trim()) return;

    // Reset any previous errors
    setNameError(null);
    setModerationLoading(true);

    try {
      // Check if the level name is appropriate
      const response = await fetch("/api/moderate-level-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ levelName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNameError("Error checking level name. Please try again.");
        setModerationLoading(false);
        return;
      }

      if (!data.appropriate) {
        setNameError("Please choose an appropriate level name.");
        setModerationLoading(false);
        return;
      }

      // If the name passes moderation, proceed with submission
      handleSubmit(levelName);
    } catch (error) {
      console.error("Error during moderation check:", error);
      setNameError("Error checking level name. Please try again.");
    } finally {
      setModerationLoading(false);
    }
  }

  return (
    <div className="w-full overflow-x-auto p-4">
      <Card className="min-w-fit w-full max-w-[95vw] mx-auto">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-orelo text-2xl">
                Level Editor
              </CardTitle>
              <CardDescription>
                Click tiles to change their type
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-start sm:items-center gap-4">
              {!testing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="width">W:</Label>
                    <Input
                      id="width"
                      className="w-14"
                      type="number"
                      min="1"
                      max="99"
                      value={width}
                      onChange={(e) => handleSizeChange(Number(e.target.value), height)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="height">H:</Label>
                    <Input
                      id="height"
                      className="w-14"
                      type="number"
                      min="1"
                      max="99"
                      value={height}
                      onChange={(e) => handleSizeChange(width, Number(e.target.value))}
                    />
                  </div>
                  <Button onClick={handleTestLevel}>Test Level</Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setTesting(false);
                      setPlaying("notPlaying");
                      setSubmissionStatus("notSubmitting");
                      // setFinalScore(null);
                    }}
                  >
                    Back to Editor
                  </Button>
                  {playing === "won" && (
                    <>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(mapData));
                          setCopied(true);
                        }}
                      >
                        {copied ? "Copied!" : "Copy Map"}
                      </Button>
                      {submissionStatus === "notSubmitting" && (
                        <Button onClick={() => setShowNameModal(true)}>Submit map</Button>
                      )}
                      {submissionStatus === "submitting" && (
                        <Button disabled>
                          <Loader size={"1em"} width={"80px"} height={"0px"} />
                        </Button>
                      )}
                      {submissionStatus === "submitted" && (
                        <Button disabled variant="neutral">
                          Submitted!
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 mt-2 w-full">
          <div className="hidden">
            <label>Map Data (JSON):</label>
            <textarea
              className="block w-full h-[200px]"
              value={mapDataString}
              onChange={(e) => handleMapDataStringChange(e.target.value)}
            />
          </div>

          {!testing && (
            <div className="space-y-4">
              {verificationErrors.length > 0 && (
                <div className="text-red-500 mb-4">
                  <strong>Errors:</strong>
                  <ul className="list-disc pl-4">
                    {verificationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                className="grid gap-0.5 p-0.5 bg-muted rounded-lg mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${mapData[0].length}, minmax(40px, 50px))`,
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
                        className="aspect-square flex items-center justify-center text-4xl cursor-pointer bg-background select-none hover:bg-accent transition-colors"
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
            <div className="space-y-4">

              <Sokoban

                mapData={mapData}
                playing={playing}
                setPlaying={setPlaying}
                // setFinalScore={setFinalScore}
                finalScore={null}
                setFinalScore={() => { }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent>
          <form onSubmit={handleModalSubmit}>
            <DialogHeader>
              <DialogTitle>Name Your Level</DialogTitle>
              <DialogDescription>
                Give your level a name before submitting it.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Input
                id="levelName"
                value={levelName}
                onChange={(e) => {
                  setLevelName(e.target.value);
                  setNameError(null); // Clear error when user types
                }}
                placeholder="Enter level name..."
                className="w-full"
                autoFocus
              />
              {nameError && (
                <div className="text-red-500 mt-2 text-sm">
                  {nameError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="neutral"
                onClick={() => setShowNameModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!levelName.trim() || moderationLoading}
              >
                {moderationLoading ? (
                  <Loader size={"1em"} width={"80px"} height={"0px"} />
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
