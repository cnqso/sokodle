"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { UserLevel } from "@/lib/types";

interface UserLevelsContextType {
  levels: UserLevel[];
  fetchLevels: () => void;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}
const UserLevelsContext = createContext<UserLevelsContextType | undefined>(undefined);
export function useUserLevels() {
  const context = useContext(UserLevelsContext);
  if (!context) throw new Error("useUserLevels requires UserLevelsProvider");
  return context;
}

export function UserLevelsProvider({ children }: { children: ReactNode }) {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offset = useRef(0);
  const request = useRef<AbortController | null>(null);
  const more = useRef(true);

  const fetchLevels = useCallback(async () => {
    if (request.current || !more.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/user-levels?offset=${offset.current}&limit=12`, { signal: controller.signal });
      if (!response.ok) throw new Error("Couldn't load the levels. Please try again.");
      const data: UserLevel[] = await response.json();
      if (controller.signal.aborted) return;
      setLevels(previous => [...previous, ...data.filter(level => !previous.some(item => item.user_level_id === level.user_level_id))]);
      offset.current += data.length;
      more.current = data.length === 12;
      setHasMore(more.current);
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Couldn't load the levels.");
    } finally {
      if (request.current === controller) { request.current = null; setLoading(false); }
    }
  }, []);

  useEffect(() => {
    void fetchLevels();
    return () => { request.current?.abort(); request.current = null; };
  }, [fetchLevels]);

  return <UserLevelsContext.Provider value={{ levels, fetchLevels, loading, error, hasMore }}>{children}</UserLevelsContext.Provider>;
}
