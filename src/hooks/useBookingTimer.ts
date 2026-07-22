import { useState, useEffect } from 'react';

const START = 9 * 60 + 51; // 09:51

export function useBookingTimer() {
  const [seconds, setSeconds] = useState(START);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const urgent = seconds < 120;

  return { label, urgent, seconds };
}
