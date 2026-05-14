import React, { createContext, useContext, useState, useEffect } from "react";
import { type Character } from "../routes/-components/chat/types";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
};

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
  user: AuthUser | null;
  authLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
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

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const apiBase = import.meta.env.VITE_GUESTBOOK_API_BASE || "";

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const loadMe = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/auth/me`, {
        credentials: "include"
      });
      const data = await response.json() as { user?: AuthUser | null };
      setUser(data.user || null);
      return data.user || null;
    } catch (err) {
      console.error(err);
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const loadCharacters = async () => {
    if (!user) {
      setCharacters([]);
      setCharactersLoading(false);
      return;
    }

    setCharactersLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/characters`, {
        credentials: "include"
      });
      const data = await response.json() as { characters?: Character[] };
      if (!response.ok) {
        if (response.status === 401) setUser(null);
        setCharacters([]);
        return;
      }
      setCharacters(data.characters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCharactersLoading(false);
    }
  };

  const loginWithGoogle = () => {
    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.href = `${apiBase}/api/auth/google?redirect=${encodeURIComponent(redirect)}`;
  };

  const logout = async () => {
    await fetch(`${apiBase}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
    setCharacters([]);
    window.location.href = "/";
  };

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadCharacters();
    }
  }, [authLoading, user?.id]);

  return (
    <AppContext.Provider value={{
      isDark,
      toggleTheme,
      user,
      authLoading,
      loginWithGoogle,
      logout,
      characters,
      charactersLoading,
      refreshCharacters: loadCharacters
    }}>
      {children}
    </AppContext.Provider>
  );
}
