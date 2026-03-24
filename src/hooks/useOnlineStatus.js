import { useEffect, useState } from 'react';
import { processSyncQueue } from '../lib/sync.js';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Flush pending sync queue as soon as we're back online
      try {
        await processSyncQueue();
      } catch (err) {
        console.error('[useOnlineStatus] sync failed:', err);
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
