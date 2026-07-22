import { useState, useEffect } from 'react';

const START = 4 * 60 + 17;

function jitter(base: number) {
  const delta = (Math.floor(Math.random() * 6) + 1) * 49;
  return base + (Math.random() > 0.5 ? delta : -delta);
}

export function useDemandTimer() {
  const [seconds, setSeconds] = useState(START);
  const [recPrice, setRecPrice]   = useState(6888);
  const [cheapPrice, setCheapPrice] = useState(6699);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setRecPrice(p => jitter(p));
          setCheapPrice(p => jitter(p));
          return START;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const label = `${mins}:${String(secs).padStart(2, '0')}`;
  const urgent = seconds < 60;

  return { label, urgent, recPrice, cheapPrice };
}
