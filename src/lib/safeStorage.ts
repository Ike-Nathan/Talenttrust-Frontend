// src/lib/safeStorage.ts
/**
 * Safe storage wrapper around `localStorage` that gracefully handles SSR and errors.
 *
 * The wrapper provides three methods mirroring the standard Web Storage API:
 * - `getItem(key)` – returns the stored string or `null`.
 * - `setItem(key, value)` – stores the value; silently fails on error.
 * - `removeItem(key)` – removes the key; silently fails on error.
 *
 * All methods first check that `window` and `localStorage` are available, making the
 * module safe to import on the server side (e.g., during Next.js SSR). Errors such as
 * `SecurityError` (private‑mode browsers) or `QuotaExceededError` are caught and
 * ignored, preventing crashes.
 */

let isStorageAvailable: boolean | null = null;

function checkStorage(): boolean {
  if (isStorageAvailable !== null) return isStorageAvailable;
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      isStorageAvailable = false;
    } else {
      // Attempt a simple set/remove to verify access.
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      isStorageAvailable = true;
    }
  } catch (e) {
    isStorageAvailable = false;
  }
  return isStorageAvailable;
}

export const safeStorage = {
  /** Retrieve a string value from storage. */
  getItem(key: string): string | null {
    if (!checkStorage()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  /** Store a string value. */
  setItem(key: string, value: string): void {
    if (!checkStorage()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // Swallow errors – storage is optional.
    }
  },

  /** Remove a key from storage. */
  removeItem(key: string): void {
    if (!checkStorage()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      // Swallow errors.
    }
  },
};
