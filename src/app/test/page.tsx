"use client";
import { useEffect, useState } from "react";

export default function DailyLevel() {

  const [level, setLevel] = useState(null);
  const date = '2025-02-06'
  useEffect(() => {
    fetch(`/api/daily-level?date=${date}`)
      .then((res) => res.json())
      .then((data) => setLevel(data));
  }, [date]);

  return <pre>{level ? JSON.stringify(level, null, 2) : "Loading..."}</pre>;
}