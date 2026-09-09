import { useCallback, useRef } from 'react';

/**
 * Custom hook to prevent infinite re-renders by providing stable callbacks
 * and managing cleanup properly
 */
export const useStableState = () => {
  const cleanupRef = useRef<(() => void)[]>([]);

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
    const fnRef = useRef(fn);
    const depsRef = useRef(deps);
    
    // Update function if dependencies changed
    if (!depsRef.current || deps.some((dep, index) => dep !== depsRef.current[index])) {
      fnRef.current = fn;
      depsRef.current = deps;
    }
    
    return useCallback((...args: T): R => {
      return fnRef.current(...args);
    }, []);
  }, []);

  return {
    addCleanup,
    runCleanup,
    stableCallback
  };
};