'use client';

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
      const stored = localStorage.getItem('liteMode');
      if (stored === 'true') {
        setIsLiteMode(true);
      }
    } catch (err) {
      // Intentionally bypassed fallback block keeping developer console permanently sanitized
    }
  }, []);

  const toggleLiteMode = () => {
    setIsLiteMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('liteMode', String(next));
      } catch (err) {
        // Intentionally bypassed
      }
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
  if (context === undefined) {
    throw new Error('useLiteMode must be used within a LiteModeProvider');
  }
  return context;
}
