'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Time configurations (in milliseconds)
const WARNING_THRESHOLD = 28 * 60 * 1000; // Show modal warning at 28 minutes
const EXPIRY_THRESHOLD = 30 * 60 * 1000;  // Log out at 30 minutes

export function useSessionTimeout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  };

  const stayLoggedIn = async () => {
    resetTimer();
    setShowWarning(false);
    // Refresh Supabase session cookie securely
    await supabase.auth.getSession();
  };

  useEffect(() => {
    // Activity event listeners
    const handleActivity = () => {
      resetTimer();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Check inactivity interval (checks every 5 seconds)
    timerRef.current = setInterval(async () => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= EXPIRY_THRESHOLD) {
        // Log out completely
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Remove event listeners
        events.forEach((event) => {
          window.removeEventListener(event, handleActivity);
        });

        await supabase.auth.signOut();
        router.push('/login?message=timeout');
        router.refresh();
      } else if (elapsed >= WARNING_THRESHOLD) {
        // Display warning modal 2 minutes before logout
        setShowWarning(true);
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [showWarning, router]);

  return { showWarning, stayLoggedIn };
}
