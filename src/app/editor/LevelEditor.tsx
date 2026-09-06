"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play, Undo2, Eraser, ArrowLeft, Copy, Check, Minus, Plus } from "lucide-react";
import Sokoban from "@/components/Sokoban";
import { GameState } from "@/lib/types";
import DifficultyRating from "@/components/DifficultyRating";
import GuineaPigArt, { type ArtKind } from "@/components/GuineaPigArt";
import { CREATOR_NAME_MAX_LENGTH, LEVEL_NAME_MAX_LENGTH, difficultyLabels, type Difficulty } from "@/lib/levelMetadata";
import { EDITOR_MIN_SIZE, EDITOR_MAX_SIZE, tileLabels, resizeMap, paintTile, parseMap, mapErrors } from "@/lib/editor";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import TileSprite, { tileKindFromMapValue } from "@/components/TileSprite";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const initialMap = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 4, 3, 0, 1],
  [1, 1, 2, 2, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];
const artKinds: ArtKind[] = ["floor", "wall", "carrot", "bowl", "guinea-pig"];

export default function LevelEditor() {
  const [mapData, setMapData] = useState(initialMap);
  const mapRef = useRef(mapData);
  const [past, setPast] = useState<number[][][]>([]);
  const [tool, setTool] = useState(1);
  const [testing, setTesting] = useState(false);
  const [playing, setPlaying] = useState<GameState>("notPlaying");
  const [submissionStatus, setSubmissionStatus] = useState<"notSubmitting" | "submitting" | "submitted">("notSubmitting");
  const [mapDataString, setMapDataString] = useState(JSON.stringify(initialMap));
  const [copied, setCopied] = useState(false);
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [levelName, setLevelName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [nameError, setNameError] = useState<string | null>(null);
  const submissionLoading = submissionStatus === "submitting";
  const pointer = useRef<number | null>(null);
  const strokeRecorded = useRef(false);
  const width = mapData[0].length;
  const height = mapData.length;
  const counts = mapData.flat().reduce((result, cell) => { result[cell]++; return result; }, [0,0,0,0,0]);

  useEffect(() => {
    try { setCreatorName(localStorage.getItem("sokodle-creator-name") || ""); } catch { /* Storage may be disabled. */ }
  }, []);

  function commit(next: number[][], remember = true) {
    const previous = mapRef.current;
    if (next === previous) return;
    if (remember) setPast(items => [...items.slice(-49), previous]);
    mapRef.current = next;
    setMapData(next);
    setMapDataString(JSON.stringify(next));
    setVerificationErrors([]);
    setCopied(false);
    setSubmissionStatus("notSubmitting");
  }

  function undoEdit() {
    if (!past.length) return;
    commit(past[past.length - 1], false);
    setPast(items => items.slice(0, -1));
  }

  function paint(x: number, y: number) {
    const next = paintTile(mapRef.current, x, y, tool);
    if (next === mapRef.current) return;
    commit(next, !strokeRecorded.current);
    strokeRecorded.current = true;
  }

  function paintAt(element: Element | null) {
    const tile = element?.closest<HTMLElement>("[data-editor-cell]");
    if (tile) paint(Number(tile.dataset.x), Number(tile.dataset.y));
  }

  function changeSize(axis: "width" | "height", delta: number) {
    const nextWidth = axis === "width" ? width + delta : width;
    const nextHeight = axis === "height" ? height + delta : height;
    commit(resizeMap(mapData, nextWidth, nextHeight));
  }

  function handleTestLevel() {
    const errors = mapErrors(mapData);
    setVerificationErrors(errors);
    if (errors.length) return;
    setPlaying("notPlaying");
    setTesting(true);
  }

  async function copyMap() {
    try { await navigator.clipboard.writeText(JSON.stringify(mapData)); setCopied(true); }
    catch { setVerificationErrors(["Couldn't copy. You can select the map text below."]); }
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!levelName.trim() || !creatorName.trim() || submissionStatus !== "notSubmitting") return;
    setNameError(null);
    setSubmissionStatus("submitting");
    try {
      const response = await fetch("/api/submit-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: levelName.trim(), creator_name: creatorName.trim(), difficulty, layout: mapData }),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) {
        setNameError(data.error || "Couldn't submit the level. Please try again.");
        setSubmissionStatus("notSubmitting");
        return;
      }
      try { localStorage.setItem("sokodle-creator-name", creatorName.trim()); } catch { /* Storage may be disabled. */ }
      setSubmissionStatus("submitted");
      setVerificationErrors([]);
      setShowNameModal(false);
    } catch {
      setNameError("Couldn't submit the level. Check your connection and try again.");
      setSubmissionStatus("notSubmitting");
    }
  }

  return (
    <main className={`w-full px-3 pb-8 sm:px-6 ${testing ? "max-w-[640px]" : "max-w-[1080px]"}`}>
      <header className="flex items-center justify-between gap-3 py-4 sm:py-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">{testing ? "Test your level" : "Level editor"}</h1>
          <p className="mt-1 text-sm opacity-70">{testing ? "Solve it to unlock sharing." : "Pick a tile. Make a puzzle."}</p>
        </div>
        {!testing && <Button onClick={handleTestLevel}><Play /> Test <span className="hidden sm:inline">level</span></Button>}
        {testing && <Button variant="neutral" onClick={() => { setTesting(false); setPlaying("notPlaying"); }}><ArrowLeft /> Edit</Button>}
      </header>

      {testing ? (
        <section className="rounded-xl border-2 border-border bg-[#b8cc94]/30 p-2 sm:p-4">
          <Sokoban mapData={mapData} playing={playing} setPlaying={setPlaying} finalScore={null} setFinalScore={() => {}} />
          {playing === "won" && <div className="mt-3 flex justify-center gap-3 pb-2">
            <Button variant="neutral" onClick={copyMap}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy map"}</Button>
            <Button onClick={() => setShowNameModal(true)} disabled={submissionStatus !== "notSubmitting"}>
              {submissionStatus === "submitted" ? <><Check /> Submitted</> : <>Share level <ArrowRight /></>}
            </Button>
          </div>}
        </section>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section>
              <h2 className="mb-2 text-sm font-bold">Tiles</h2>
              <div className="grid grid-cols-5 gap-2 md:grid-cols-2">
                {[4, 2, 3, 1, 0].map(value => (
                  <button key={value} type="button" aria-pressed={tool === value} aria-label={`Paint ${tileLabels[value].toLowerCase()}`}
                    onClick={() => setTool(value)}
                    className={`flex min-h-[78px] flex-col items-center justify-center gap-1 rounded-lg border-2 px-1 py-2 text-[11px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-xs ${tool === value ? "border-border bg-main shadow-[2px_2px_0_#293c32]" : "border-[#293c32]/20 bg-bw hover:border-[#293c32]/60"}`}>
                    <span className="block h-9 w-9 [&_svg]:h-full [&_svg]:w-full">
                      {value === 0 ? <Eraser className="p-2" /> : <GuineaPigArt kind={artKinds[value]} frame={0} />}
                    </span>
                    {tileLabels[value]}
                  </button>
                ))}
              </div>
            </section>
            <section className="flex flex-wrap items-center gap-3 md:block md:space-y-3">
              <h2 className="w-full text-sm font-bold">Board size</h2>
              {(["width", "height"] as const).map(axis => {
                const value = axis === "width" ? width : height;
                return <div key={axis} className="flex items-center gap-2">
                  <span className="w-11 text-xs capitalize opacity-70">{axis}</span>
                  <button className="flex h-9 w-9 items-center justify-center rounded border border-[#293c32]/30 bg-bw disabled:opacity-30" aria-label={`Decrease ${axis}`} disabled={value <= EDITOR_MIN_SIZE} onClick={() => changeSize(axis, -1)}><Minus size={14} /></button>
                  <output className="w-5 text-center text-sm font-bold tabular-nums" aria-label={axis}>{value}</output>
                  <button className="flex h-9 w-9 items-center justify-center rounded border border-[#293c32]/30 bg-bw disabled:opacity-30" aria-label={`Increase ${axis}`} disabled={value >= EDITOR_MAX_SIZE} onClick={() => changeSize(axis, 1)}><Plus size={14} /></button>
                </div>;
              })}
            </section>
          </aside>

          <section className="min-w-0 rounded-xl border-2 border-border bg-[#b8cc94]/25 p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-xs opacity-70">Tap or drag to paint</p>
              <div className="flex gap-2">
                <button type="button" onClick={undoEdit} disabled={!past.length} className="flex items-center gap-1 rounded px-2 py-1 text-xs font-bold hover:bg-bw disabled:opacity-30"><Undo2 size={14} /> Undo</button>
                <button type="button" className="rounded px-2 py-1 text-xs font-bold hover:bg-bw" onClick={() => commit(resizeMap([[1,1],[1,1]], width, height))}>Clear</button>
              </div>
            </div>
            <div className="sokodle-board mx-auto grid touch-none select-none overflow-hidden"
              style={{ width: `min(100%, ${width * 48}px)`, gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
              onPointerDown={event => {
                if (event.button !== 0 || !event.isPrimary) return;
                pointer.current = event.pointerId;
                strokeRecorded.current = false;
                event.currentTarget.setPointerCapture(event.pointerId);
                paintAt(event.target as Element);
                event.preventDefault();
              }}
              onPointerMove={event => { if (pointer.current === event.pointerId) paintAt(document.elementFromPoint(event.clientX, event.clientY)); }}
              onPointerUp={event => { pointer.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
              onPointerCancel={() => { pointer.current = null; }}
              onLostPointerCapture={() => { pointer.current = null; }}>
              {mapData.map((row, y) => row.map((cell, x) => (
                <button type="button" key={`${x}-${y}`} data-editor-cell data-x={x} data-y={y}
                  aria-label={`Row ${y + 1}, column ${x + 1}: ${tileLabels[cell]}`}
                  disabled={!x || !y || x === width - 1 || y === height - 1}
                  onClick={event => { if (event.detail === 0) { strokeRecorded.current = false; paint(x, y); } }}
                  className="editor-tile relative block aspect-square min-w-0 overflow-hidden hover:brightness-110 disabled:cursor-default">
                  <TileSprite kind={tileKindFromMapValue(cell)} phase={(x + y * 2) % 3} />
                </button>
              )))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs opacity-70">
              <span>{counts[2]} carrots · {counts[3]} bowls · {counts[4]} guinea pig{counts[4] === 1 ? "" : "s"}</span>
              <span>Outer walls stay put.</span>
            </div>
            {verificationErrors.length > 0 && <div role="alert" className="mt-4 rounded-lg bg-[#f4d7b9] p-3 text-sm">{verificationErrors.map(error => <p key={error}>{error}</p>)}</div>}
          </section>

          <details className="rounded-lg border border-[#293c32]/20 bg-bw p-4 md:col-start-2">
            <summary className="cursor-pointer text-sm font-bold">Import / export a map</summary>
            <Label htmlFor="map-data" className="mt-3 block text-xs opacity-70">Map JSON</Label>
            <textarea id="map-data" value={mapDataString} onChange={event => setMapDataString(event.target.value)} spellCheck={false}
              className="mt-2 h-28 w-full resize-y rounded border border-[#293c32]/30 bg-bg p-3 font-mono text-xs" />
            <div className="mt-2 flex gap-3">
              <Button size="sm" variant="neutral" onClick={() => { try { commit(parseMap(mapDataString)); } catch (error) { setVerificationErrors([error instanceof Error ? error.message : "Couldn't import the map."]); } }}>Import map</Button>
              <Button size="sm" variant="neutral" onClick={copyMap}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy map"}</Button>
            </div>
          </details>
          <p className="text-sm opacity-70 md:col-start-2">Solve your level before sharing it. <Link className="underline underline-offset-4" href="/userlevels">Browse user levels</Link></p>
        </div>
      )}

      <Dialog open={showNameModal} onOpenChange={(open) => { if (!submissionLoading) setShowNameModal(open); }}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-24px)] overflow-y-auto">
          <form onSubmit={handleModalSubmit}>
            <DialogHeader>
              <DialogTitle>Share Your Level</DialogTitle>
              <DialogDescription>
                Add a name, a creator credit, and a difficulty.
              </DialogDescription>
            </DialogHeader>

            <fieldset className="space-y-4 py-4" disabled={submissionLoading}>
              <div className="space-y-2">
                <Label htmlFor="levelName">Level name</Label>
                <Input
                  id="levelName"
                  value={levelName}
                  onChange={(e) => { setLevelName(e.target.value); setNameError(null); }}
                  placeholder="Enter level name..."
                  maxLength={LEVEL_NAME_MAX_LENGTH}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creatorName">Made by</Label>
                <Input
                  id="creatorName"
                  value={creatorName}
                  onChange={(e) => { setCreatorName(e.target.value); setNameError(null); }}
                  placeholder="Your username"
                  autoComplete="nickname"
                  maxLength={CREATOR_NAME_MAX_LENGTH}
                  required
                />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Difficulty</legend>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map(value => (
                    <label key={value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={value}
                        checked={difficulty === value}
                        onChange={() => setDifficulty(value)}
                        className="peer sr-only"
                        aria-label={`${difficultyLabels[value]}: ${value} guinea ${value === 1 ? "pig" : "pigs"}`}
                      />
                      <span className="flex min-h-20 flex-col items-center justify-center rounded-md border-2 border-[#293c32]/30 px-1 py-2 peer-checked:border-border peer-checked:bg-main peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                        <DifficultyRating value={value} />
                        <span className="text-sm">{difficultyLabels[value]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {nameError && <p role="alert" className="text-red-700 text-sm">{nameError}</p>}
            </fieldset>

            <DialogFooter>
              <Button
                type="button"
                variant="neutral"
                disabled={submissionLoading}
                onClick={() => setShowNameModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!levelName.trim() || !creatorName.trim() || submissionLoading}
              >
                {submissionLoading ? (
                  <Loader size={"1em"} width={"80px"} height={"0px"} />
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
