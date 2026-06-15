import React, { useEffect, useRef, useState } from "react";
import { C, FONT } from "./token";
import type { StatsStripProps } from "./types";

// Handles: "50,000+", "125+", "4.8/5", "30+", "10M+"
function parseValue(raw: string): { integer: number; decimals: number; suffix: string } {
  const cleaned = raw.replace(/,/g, "");
  const match = cleaned.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { integer: 0, decimals: 0, suffix: raw };
  const num = parseFloat(match[1]);
  const decimals = (match[1].split(".")[1] ?? "").length;
  return { integer: num, decimals, suffix: match[2] ?? "" };
}

function formatNumber(val: number, decimals: number, hasCommas: boolean): string {
  if (decimals > 0) return val.toFixed(decimals);
  const floored = Math.floor(val);
  return hasCommas ? floored.toLocaleString("en-US") : String(floored);
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function CountUp({ raw, play, delay = 0 }: { raw: string; play: boolean; delay?: number }) {
  const { integer, decimals, suffix } = parseValue(raw);
  const hasCommas = raw.includes(",");
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1400;

  useEffect(() => {
    if (!play) return;

    setCurrent(0);
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const stagger = setTimeout(() => {
      const animate = (ts: number) => {
        if (startRef.current === null) startRef.current = ts;
        const p = Math.min((ts - startRef.current) / DURATION, 1);
        setCurrent(easeOutExpo(p) * integer);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setCurrent(integer);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(stagger);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [play, integer, delay]);

  return <>{formatNumber(current, decimals, hasCommas)}{suffix}</>;
}

export function StatsStrip({ stats }: StatsStripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);
  const firedRef = useRef(false);

  const fire = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setPlay(true);
  };

  useEffect(() => {
    // ----- 1. Fire 10s after mount regardless of scroll -----
    const autoTimer = setTimeout(fire, 10000);

    // ----- 2. Also fire when section scrolls into view -----
    const el = sectionRef.current;
    let obs: IntersectionObserver | null = null;

    if (el) {
      obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) fire();
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
    }

    return () => {
      clearTimeout(autoTimer);
      obs?.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="stats-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800;900&display=swap');

        .stats-section {
          background: ${C.navy};
          padding: 60px 48px;
          position: relative;
          overflow: hidden;
        }

        .stats-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,104,44,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .stats-grid {
          max-width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(${stats.length}, 1fr);
          position: relative;
          z-index: 1;
        }

        .stats-item {
          text-align: center;
          padding: 12px 20px;
          position: relative;
          transition: transform 0.3s ease;
        }

        .stats-item:hover { transform: translateY(-3px); }

        .stats-item:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0; top: 15%;
          height: 70%; width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent);
        }

        .stats-value {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 2.6rem;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.82) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: background 0.3s ease;
        }

        .stats-item:hover .stats-value {
          background: linear-gradient(135deg, #ff682c 0%, #ffb347 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .stats-label {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          margin-top: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .stats-bar {
          width: 28px; height: 2px;
          background: linear-gradient(90deg, ${C.orange}, #ffb347);
          border-radius: 2px;
          margin: 10px auto 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.7s ease;
        }

        .stats-item.played .stats-bar { transform: scaleX(1); }

        @media (max-width: 900px) {
          .stats-section { padding: 48px 24px; }
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .stats-value { font-size: 2.1rem; }
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-item::after { display: none; }
          .stats-item { padding: 18px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .stats-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.07); }
        }

        @media (max-width: 400px) {
          .stats-section { padding: 36px 16px; }
          .stats-value { font-size: 1.9rem; }
        }
      `}</style>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={stat.label} className={`stats-item${play ? " played" : ""}`}>
            <div className="stats-value">
              <CountUp raw={stat.value} play={play} delay={i * 130} />
            </div>
            <div className="stats-bar" />
            <div className="stats-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}