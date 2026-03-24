import { useState, useRef, useCallback, useEffect } from 'react';
import { hapticAlert } from '../lib/haptics.js';

export function useRestTimer(defaultSeconds = 90) {
  const [isActive,   setIsActive]   = useState(false);
  const [remaining,  setRemaining]  = useState(defaultSeconds);
  const [duration,   setDuration]   = useState(defaultSeconds);
  const intervalRef  = useRef(null);
  const endTimeRef   = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const sendNotification = useCallback((label = 'Rest complete') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Beyond — Rest Complete', {
        body: label,
        icon: '/icons/icon-192.png',
        vibrate: [200, 100, 200],
      });
    }
  }, []);

  const start = useCallback((seconds) => {
    const dur = seconds ?? duration;
    clearTimer();
    endTimeRef.current = Date.now() + dur * 1000;
    setDuration(dur);
    setRemaining(dur);
    setIsActive(true);

    // Request notification permission on first use
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        clearTimer();
        setIsActive(false);
        hapticAlert();
        sendNotification();
      }
    }, 250); // 250ms tick is smooth without being expensive
  }, [duration, clearTimer, sendNotification]);

  const stop = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setRemaining(duration);
  }, [clearTimer, duration]);

  const addTime = useCallback((seconds) => {
    if (!isActive) return;
    endTimeRef.current += seconds * 1000;
    setRemaining((r) => r + seconds);
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  const progress = duration > 0 ? (duration - remaining) / duration : 0;

  return { isActive, remaining, duration, progress, start, stop, addTime };
}
