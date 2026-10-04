import { useEffect, useRef, useState } from 'react';

export function useWakeLock(isActive: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let released = false;

    async function acquireLock() {
      if (
        typeof navigator !== 'undefined' &&
        'wakeLock' in navigator &&
        isActive &&
        document.visibilityState === 'visible'
      ) {
        try {
          const sentinel = await navigator.wakeLock.request('screen');
          if (released) {
            sentinel.release();
            return;
          }
          wakeLockSentinelRef.current = sentinel;
          setIsLocked(true);

          sentinel.addEventListener('release', () => {
            setIsLocked(false);
            wakeLockSentinelRef.current = null;
          });
        } catch {
          setIsLocked(false);
        }
      }
    }

    function releaseLock() {
      released = true;
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
        wakeLockSentinelRef.current = null;
      }
      setIsLocked(false);
    }

    if (isActive) {
      acquireLock();
    } else {
      releaseLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        acquireLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  return isLocked;
}
