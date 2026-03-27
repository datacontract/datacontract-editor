import { createJSONStorage } from 'zustand/middleware';

const VALID_STRATEGIES = ['localStorage', 'sessionStorage', 'none'];

function getStorage(strategy) {
  switch (strategy) {
    case 'localStorage': return localStorage;
    case 'sessionStorage': return sessionStorage;
    default: return null;
  }
}

export function getStorageConfig(strategy = 'sessionStorage') {
  if (!VALID_STRATEGIES.includes(strategy)) {
    console.warn('Invalid persistence strategy, falling back to "sessionStorage":', strategy);
    strategy = 'sessionStorage';
  }
  const storage = getStorage(strategy);
  if (!storage) return null;
  return createJSONStorage(() => storage);
}
