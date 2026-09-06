"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export default function useBoardSize(container: RefObject<HTMLDivElement | null>, rows: number, cols: number) {
  const [size, setSize] = useState(24);
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      const viewport = window.visualViewport;
      const top = element.getBoundingClientRect().top;
      const width = Math.min(element.clientWidth, viewport?.width ?? window.innerWidth) - 10;
      // Reserve room for stats, actions, borders, and the phone's bottom safe area.
      const height = (viewport?.height ?? window.innerHeight) - Math.max(0, top) - 150;
      setSize(Math.max(1, Math.floor(Math.min(50, width / cols, Math.max(rows, height) / rows))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [container, rows, cols]);
  return size;
}
