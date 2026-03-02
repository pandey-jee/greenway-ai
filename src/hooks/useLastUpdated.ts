import { useState, useEffect } from 'react';

/**
 * Hook to track and format the last update time
 * Updates every second for real-time display
 */
export const useLastUpdated = (deps?: any[]) => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [displayTime, setDisplayTime] = useState<string>('just now');

  useEffect(() => {
    setLastUpdated(new Date());
  }, deps);

  useEffect(() => {
    const updateDisplay = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

      if (diffInSeconds < 60) {
        setDisplayTime('just now');
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setDisplayTime(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        setDisplayTime(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else {
        setDisplayTime(lastUpdated.toLocaleTimeString());
      }
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return { lastUpdated, displayTime };
};
