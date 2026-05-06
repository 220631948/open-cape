import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CompareItemType = 'parcel' | 'area' | 'saved-map' | 'bookmark';

export interface CompareItem {
  id: string;
  type: CompareItemType;
  title: string;
  subtitle?: string;
  projectId: string | null;
}

interface CompareContextType {
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isComparing: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);

  const addToCompare = (item: CompareItem) => {
    setCompareItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev; // Avoid duplicates
      if (prev.length >= 4) return prev; // Max 4 items
      return [...prev, item];
    });
  };

  const removeFromCompare = (id: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isComparing = (id: string) => {
    return compareItems.some((item) => item.id === id);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompareState = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompareState must be used within a CompareProvider');
  }
  return context;
};
