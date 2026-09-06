"use client";

import { useLayoutEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import type { Vector } from "@/lib/types";
import { swipeDirection, SWIPE_THRESHOLD_PX } from "@/lib/swipe";

export default function useBoardSwipe(onSwipe: (direction: Vector) => void, onCellTap: (x: number, y: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onSwipe, onCellTap });
  const gesture = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useLayoutEffect(() => { callbacks.current = { onSwipe, onCellTap }; });

  useLayoutEffect(() => {
    const board = ref.current;
    if (!board) return;
    let touch: { id: number; x: number; y: number; moved: boolean; dragged: boolean; cell: HTMLElement | null } | null = null;
    const preventDefault = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
    };
    const start = (event: TouchEvent) => {
      // Safari can claim history navigation before touchmove. A native,
      // non-passive listener cancels at touchstart; React's listener is passive.
      preventDefault(event);
      suppressClick.current = true;
      if (event.touches.length !== 1) { touch = null; return; }
      const point = event.touches[0];
      const cell = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cell]") : null;
      touch = { id: point.identifier, x: point.clientX, y: point.clientY, moved: false, dragged: false, cell };
    };
    const update = (point: Touch) => {
      if (!touch || touch.id !== point.identifier) return;
      const dx = point.clientX - touch.x;
      const dy = point.clientY - touch.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= SWIPE_THRESHOLD_PX) touch.dragged = true;
      if (touch.moved) return;
      const direction = swipeDirection(dx, dy);
      if (!direction) return;
      touch.moved = true;
      callbacks.current.onSwipe(direction);
    };
    const move = (event: TouchEvent) => {
      preventDefault(event);
      if (event.touches.length !== 1) { touch = null; return; }
      update(event.touches[0]);
    };
    const end = (event: TouchEvent) => {
      preventDefault(event);
      if (!touch) return;
      const point = Array.from(event.changedTouches).find(point => point.identifier === touch?.id);
      if (!point) return;
      update(point);
      const finished = touch;
      touch = null;
      // Canceling touchstart suppresses synthesized clicks, so deliver taps
      // explicitly. Pointer handlers below only handle mouse and pen input.
      if (!finished.dragged && finished.cell && board.contains(finished.cell)) {
        const [x, y] = finished.cell.dataset.cell!.split(",").map(Number);
        callbacks.current.onCellTap(x, y);
      }
    };
    const cancel = () => { touch = null; };
    board.addEventListener("touchstart", start, { passive: false });
    board.addEventListener("touchmove", move, { passive: false });
    board.addEventListener("touchend", end, { passive: false });
    board.addEventListener("touchcancel", cancel);
    return () => {
      board.removeEventListener("touchstart", start);
      board.removeEventListener("touchmove", move);
      board.removeEventListener("touchend", end);
      board.removeEventListener("touchcancel", cancel);
    };
  }, []);

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
    ref,
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType === "touch") return;
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
