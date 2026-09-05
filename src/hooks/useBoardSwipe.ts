"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";
import type { Vector } from "@/lib/types";
import { swipeDirection, SWIPE_THRESHOLD_PX } from "@/lib/swipe";

export default function useBoardSwipe(onSwipe: (direction: Vector) => void) {
  const gesture = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  function updateGesture(event: PointerEvent<HTMLDivElement>, capture: boolean) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= SWIPE_THRESHOLD_PX) suppressClick.current = true;
    if (start.moved) return;
    const direction = swipeDirection(dx, dy);
    if (!direction) return;
    start.moved = true;
    // Capture only after recognizing a swipe, preserving the original tile's
    // click target for ordinary taps. A swipe always produces exactly one move.
    if (capture) event.currentTarget.setPointerCapture(event.pointerId);
    onSwipe(direction);
  }

  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (!event.isPrimary) {
        gesture.current = null;
        suppressClick.current = true;
        return;
      }
      if (event.button !== 0) return;
      suppressClick.current = false;
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      updateGesture(event, true);
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      if (gesture.current?.id !== event.pointerId) return;
      updateGesture(event, false);
      gesture.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel() {
      gesture.current = null;
      suppressClick.current = true;
    },
    onLostPointerCapture() {
      if (gesture.current) {
        gesture.current = null;
        suppressClick.current = true;
      }
    },
    onClickCapture(event: MouseEvent<HTMLDivElement>) {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
