import { useState, useEffect, useRef } from "react";

export default function StopWatch({
  playing, setFinalTime
}: {
  playing: "notPlaying" | "playing" | "won";
  setFinalTime: React.Dispatch<React.SetStateAction<number>>
}) {
  const [mm, setMm] = useState(0);
  const [ss, setSs] = useState(0);
  const [ms, setMs] = useState(0);
  const timerRef = useRef<number | null>(null); // Explicitly define type
  useEffect(() => {
    console.log(playing);
    if (playing === "playing") {
      // Stop => Running
      timerRef.current = window.setInterval(() => {
        setMs((prevMs) => {
          let newMs = prevMs + 1;
          if (newMs >= 100) {
            setSs((prevSs) => {
              let newSs = prevSs + 1;
              if (newSs >= 60) {
                setMm((prevMm) => prevMm + 1);
                return 0;
              }
              return newSs;
            });
            return 0;
          }
          return newMs;
        });
      }, 10);
    } else if (playing === "won") {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null; // Reset to null to avoid type mismatch
        setFinalTime(ms+(ss*100)+(mm*6000));
      }
    }
  }, [playing]);

  const format = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div className="stop-watch">
        <span>{format(mm)}</span>:<span>{format(ss)}</span>:
        <span>{format(ms)}</span>
    </div>
  );
}
