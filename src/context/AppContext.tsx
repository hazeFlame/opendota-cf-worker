import React, { createContext, useContext, useState, useEffect } from "react";
import { type Character } from "../routes/-components/chat/types";

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
  characters: Character[];
  charactersLoading: boolean;
  refreshCharacters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(true);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const loadCharacters = async () => {
    setCharactersLoading(true);
    try {
      const apiBase = import.meta.env.VITE_GUESTBOOK_API_BASE || "";
      const response = await fetch(`${apiBase}/api/characters`);
      const data = await response.json() as { characters?: Character[] };
      setCharacters(data.characters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCharactersLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  return (
    <AppContext.Provider value={{
      isDark,
      toggleTheme,
      characters,
      charactersLoading,
      refreshCharacters: loadCharacters
    }}>
      {children}
    </AppContext.Provider>
  );
}
