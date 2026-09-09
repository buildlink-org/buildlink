import { useCallback, useRef } from 'react';

/**
 * Custom hook to prevent infinite re-renders by providing stable callbacks
 * and managing cleanup properly
 */
export const useStableState = () => {
  const cleanupRef = useRef<(() => void)[]>([]);
  const fnRef = useRef<(...args: any[]) => any>(() => {});
  const depsRef = useRef<any[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  }, []);

  const runCleanup = useCallback(() => {
    cleanupRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    cleanupRef.current = [];
  }, []);

  const stableCallback = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    deps: any[] = []
  ) => {
    // Update function if dependencies changed
    if (!depsRef.current || deps.some((dep, index) => dep !== depsRef.current[index])) {
      fnRef.current = fn as (...args: any[]) => any;
      depsRef.current = deps;
    }

    return ((...args: T): R => {
      return fnRef.current(...args);
    }) as (...args: T) => R;
  }, []);

  return {
    addCleanup,
    runCleanup,
    stableCallback
  };
};