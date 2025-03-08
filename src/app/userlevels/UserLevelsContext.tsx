import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserLevel } from "@/lib/types";

interface UserLevelsContextType {
  levels: UserLevel[];
  fetchLevels: () => void;
  loading: boolean;
  hasMore: boolean;
  resetLevels: () => void;
}

const UserLevelsContext = createContext<UserLevelsContextType | undefined>(undefined);

export const useUserLevels = () => {
  const context = useContext(UserLevelsContext);
  if (!context) {
    throw new Error("useUserLevels must be used within a UserLevelsProvider");
  }
  return context;
};

export const UserLevelsProvider = ({ children }: { children: ReactNode }) => {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);

  const resetLevels = () => {
    setLevels([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false);
  };

  const fetchLevels = async () => {
    if (loading || !mounted) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/user-levels?offset=${offset}&limit=10`);
      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }
      const data: UserLevel[] = await response.json();
      
      setLevels(prev => {
        // Check for duplicates
        const newLevels = data.filter(newLevel => 
          !prev.some(existingLevel => 
            existingLevel.user_level_id === newLevel.user_level_id
          )
        );
        return [...prev, ...newLevels];
      });

      if (data.length < 10) {
        setHasMore(false);
      }
      setOffset(prev => prev + 10);
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle initial mount
  useEffect(() => {
    let isMounted = true;
    setMounted(true);
    resetLevels();

    return () => {
      isMounted = false;
      setMounted(false);
      resetLevels();
    };
  }, []);

  // Handle fetching after mount
  useEffect(() => {
    if (mounted && levels.length === 0) {
      fetchLevels();
    }
  }, [mounted]);

  return (
    <UserLevelsContext.Provider value={{ levels, fetchLevels, loading, hasMore, resetLevels }}>
      {children}
    </UserLevelsContext.Provider>
  );
};

