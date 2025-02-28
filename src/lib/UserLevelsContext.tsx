import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserLevel } from "@/lib/types";

interface UserLevelsContextType {
  levels: UserLevel[];
  fetchLevels: () => void;
  loading: boolean;
  hasMore: boolean;
  // Optionally add other state and setters if needed
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

  const fetchLevels = async () => {
    setLoading(true);
    console.log("fetching levels!")
    try {
      const response = await fetch(`/api/user-levels?offset=${offset}&limit=10`);
      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }
      const data = await response.json();
      setLevels((prev) => [...prev, ...data]);
      if (data.length < 10) {
        setHasMore(false);
      }
      setOffset((prev) => prev + 10);
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  return (
    <UserLevelsContext.Provider value={{ levels, fetchLevels, loading, hasMore }}>
      {children}
    </UserLevelsContext.Provider>
  );
};

