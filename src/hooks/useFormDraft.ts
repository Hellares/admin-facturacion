import { useEffect, useCallback } from 'react';

/**
 * Auto-saves form data to localStorage as a draft.
 * Restores on mount, clears on successful submit.
 */
export function useFormDraft<T>(key: string, watch: () => T, reset: (data: T) => void) {
  const storageKey = `form_draft_${key}`;

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved) as T;
        reset(data);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save draft periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const data = watch();
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Ignore serialization errors
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [storageKey, watch]);

  // Clear draft (call after successful submit)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Check if draft exists
  const hasDraft = useCallback(() => {
    return !!localStorage.getItem(storageKey);
  }, [storageKey]);

  return { clearDraft, hasDraft };
}
