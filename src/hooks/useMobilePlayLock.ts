"use client";

import { useLayoutEffect } from "react";

/** Keep the page still during play, including Safari's overscroll at the edges. */
export default function useMobilePlayLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    const media = window.matchMedia("(max-width: 767px), (pointer: coarse), (max-height: 500px) and (max-width: 1024px)");
    let locked = false;
    let scrollY = 0;
    const unlock = () => {
      if (!locked) return;
      document.documentElement.classList.remove("mobile-game-active");
      window.scrollTo(0, scrollY);
      locked = false;
    };
    const update = () => {
      if (!media.matches) { unlock(); return; }
      if (locked) return;
      scrollY = window.scrollY;
      window.scrollTo(0, 0);
      document.documentElement.classList.add("mobile-game-active");
      locked = true;
    };
    const preventScroll = (event: TouchEvent) => {
      const target = event.target;
      // Dialog forms and their virtual keyboards retain normal scrolling.
      if (!locked || (target instanceof Element && target.closest('[role="dialog"]'))) return;
      if (event.touches.length === 1 && event.cancelable) event.preventDefault();
    };
    update();
    media.addEventListener("change", update);
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("touchmove", preventScroll);
      unlock();
    };
  }, [active]);
}
