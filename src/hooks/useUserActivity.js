import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to track user activity and idle state
 * @param {number} idleThreshold - Time in milliseconds after which user is considered idle (default: 5 minutes)
 * @param {Array} events - Array of events to listen for user activity
 */
export const useUserActivity = (
  idleThreshold = 5 * 60 * 1000,
  events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ]
) => {
  const [isActive, setIsActive] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    lastActivityRef.current = now;

    if (isIdle) {
      setIsIdle(false);
      setIsActive(true);
    }
  }, [isIdle]);

  // Set user as idle
  const setIdle = useCallback(() => {
    setIsActive(false);
    setIsIdle(true);
  }, []);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIdle();
    }, idleThreshold);
  }, [idleThreshold, setIdle]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    updateActivity();
    resetIdleTimer();
  }, [updateActivity, resetIdleTimer]);

  useEffect(() => {
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetIdleTimer();

    return () => {
      // Cleanup event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [events, handleActivity, resetIdleTimer]);

  // Force set active state (useful for manual overrides)
  const forceActive = useCallback(() => {
    setIsActive(true);
    setIsIdle(false);
    updateActivity();
    resetIdleTimer();
  }, [updateActivity, resetIdleTimer]);

  // Force set idle state (useful for manual overrides)
  const forceIdle = useCallback(() => {
    setIsActive(false);
    setIsIdle(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isActive,
    isIdle,
    lastActivity,
    forceActive,
    forceIdle,
    timeSinceLastActivity: Date.now() - lastActivityRef.current,
  };
};
