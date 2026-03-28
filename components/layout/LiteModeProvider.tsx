'use client';

// ─── Lite Mode: global animation toggle persisted to localStorage ─────────────
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LiteModeContextType {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
}

const LiteModeContext = createContext<LiteModeContextType | undefined>(undefined);

export function LiteModeProvider({ children }: { children: ReactNode }) {
  const [isLiteMode, setIsLiteMode] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('liteMode') === 'true') setIsLiteMode(true);
    } catch {}
  }, []);

  const toggleLiteMode = () => {
    setIsLiteMode((prev) => {
      const next = !prev;
      try { localStorage.setItem('liteMode', String(next)); } catch {}
      return next;
    });
  };

  return (
    <LiteModeContext.Provider value={{ isLiteMode, toggleLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
}

export function useLiteMode() {
  const context = useContext(LiteModeContext);
  if (!context) throw new Error('useLiteMode must be used within a LiteModeProvider');
  return context;
}
