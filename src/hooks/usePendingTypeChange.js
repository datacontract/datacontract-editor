import { useState } from 'react';

/**
 * Guards a value/element type change behind a confirmation when it is destructive.
 * Non-destructive changes apply immediately; destructive ones are held as `pendingType`
 * until `confirm()` is called (or dropped with `cancel()`).
 *
 * @param {(type: string) => void} applyChange - Applies the type change.
 * @returns {{ pendingType: string|null, request: (type: string, destructive: boolean) => void, confirm: () => void, cancel: () => void }}
 */
export function usePendingTypeChange(applyChange) {
  const [pendingType, setPendingType] = useState(null);

  const request = (newType, isDestructive) => {
    if (isDestructive) {
      setPendingType(newType);
    } else {
      applyChange(newType);
    }
  };

  const confirm = () => {
    applyChange(pendingType);
    setPendingType(null);
  };

  const cancel = () => setPendingType(null);

  return { pendingType, request, confirm, cancel };
}
