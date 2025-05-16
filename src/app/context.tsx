"use client";
import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  activePubKey: string | null;
  setActivePubKey: (key: string | null) => void;
  balance: any | null;
  setBalance: (balance: any | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activePubKey, setActivePubKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<any | null>(null);

  return (
    <AppContext.Provider value={{ activePubKey, setActivePubKey, balance, setBalance }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 