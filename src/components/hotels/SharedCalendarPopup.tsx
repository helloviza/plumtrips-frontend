import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── STYLE TOKENS ──────────────────────────────────────────────
const C = {
  orange:  "#FF682C",
  slate:   "rgba(255,255,255,0.38)",
  divider: "rgba(255,255,255,0.07)",
  border:  "rgba(255,255,255,0.10)",
};

// ─── PORTAL POSITION HOOK ──────────────────────────────────────
export function usePortalPos(
  anchorRef: React.RefObject<HTMLElement | null>,
  open: boolean
) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, anchorHeight: 0 });
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    function measure() {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, anchorHeight: r.height });
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, anchorRef]);
  return pos;
}

// ─── CALENDAR POPUP ────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function SharedCalendarPopup({
  value, value2, isRange, min, onChange, onClose, anchorRef,
}: {
  value: string; value2?: string; isRange?: boolean; min?: string;
  onChange: (d1: string, d2?: string) => void; onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const today = new Date();
  
  function toStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const todayStr = toStr(today.getFullYear(), today.getMonth(), today.getDate());
  const minStr = min ?? todayStr;
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, true);

  const parse = (s: string) => (s ? new Date(s + "T00:00:00") : null);
  const [hovering, setHovering] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">(
    value ? (isRange && !value2 ? "to" : "from") : "from"
  );
  const [vy, setVy]   = useState(() => { const d = parse(value); return d ? d.getFullYear() : today.getFullYear(); });
  const [vm, setVm]   = useState(() => { const d = parse(value); return d ? d.getMonth() : today.getMonth(); });
  const [vy2, setVy2] = useState(() => vm === 11 ? vy + 1 : vy);
  const [vm2, setVm2] = useState(() => vm === 11 ? 0 : vm + 1);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose, anchorRef]);

  function advance(dir: 1 | -1) {
    let m = vm + dir, y = vy;
    if (m > 11) { m = 0; y++; } if (m < 0) { m = 11; y--; }
    setVm(m); setVy(y);
    let m2 = m + 1, y2 = y; if (m2 > 11) { m2 = 0; y2++; }
    setVm2(m2); setVy2(y2);
  }

  function clickDay(s: string) {
    if (s < minStr) return;
    if (!isRange) { onChange(s); onClose(); return; }
    if (selecting === "from") { 
      if (value2 && s < value2) {
        onChange(s, value2);
      } else {
        onChange(s, ""); 
      }
      setSelecting("to"); 
    }
    else {
      if (s < value) onChange(s, value);
      else onChange(value, s);
      onClose();
    }
  }

  function renderMonth(y: number, m: number) {
    const days = new Date(y, m + 1, 0).getDate();
    const first = new Date(y, m, 1).getDay();
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const s = toStr(y, m, d);
      const disabled = s < minStr;
      const sel = s === value || (isRange && s === value2);
      const inRange = isRange && value && value2 && s > value && s < value2;
      const hov =
        isRange && value && !value2 && hovering && selecting === "to" &&
        ((s > value && s < hovering) || (s > hovering && s < value));
      const isToday = s === todayStr;
      cells.push(
        <button key={d} type="button" disabled={disabled}
          onMouseEnter={() => setHovering(s)} onMouseLeave={() => setHovering(null)}
          onMouseDown={(e) => e.preventDefault()} onClick={() => clickDay(s)}
          style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: (inRange || hov) && !disabled ? "rgba(255,104,44,0.10)" : "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 1 }}
        >
          <span style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12, fontWeight: 700, background: sel ? C.orange : "transparent", color: sel ? "white" : isToday && !disabled ? C.orange : disabled ? "#9ca3af" : "#0d2d5e", outline: isToday && !sel && !disabled ? `2px solid ${C.orange}` : "none", outlineOffset: -2 }}>
            {d}
          </span>
        </button>
      );
    }
    return cells;
  }

  const POPUP_H = isRange ? 460 : 400;
  
  // Smart vertical positioning
  let popupTop = pos.top + pos.anchorHeight + 6; // default below
  if (popupTop + POPUP_H > window.innerHeight - 8) {
    popupTop = pos.top - POPUP_H - 6; // pop above if no room
  }
  popupTop = Math.max(8, popupTop); // always keep on screen

  const popupLeft = Math.min(pos.left, window.innerWidth - (isRange ? 576 : 288) - 8);

  return createPortal(
    <div ref={popupRef} className="w-[calc(100vw-16px)] md:w-auto md:min-w-[560px]" style={{ position: "absolute", top: popupTop, left: Math.max(8, popupLeft), zIndex: 99999, background: "white", borderRadius: 12, border: "1px solid #d0dff0", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", overflow: "hidden" }}>
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", background: "#f4f7fc" }}>
          {[{ key: "from" as const, label: "Check-in", v: value }, { key: "to" as const, label: "Check-out", v: value2 ?? "" }].map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{ flex: 1, padding: "12px 20px", textAlign: "left", background: "transparent", border: "none", borderBottom: selecting === key ? `2px solid ${C.orange}` : "2px solid transparent", cursor: "pointer" }}
            >
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8fafd4", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0d2d5e" }}>
                {v ? new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col md:flex-row">
        {[{ y: vy, m: vm }, { y: vy2, m: vm2 }].map((cal, idx) => (
          <div key={idx} className={`${idx === 0 ? "border-b md:border-b-0 md:border-r border-[#e8eef8]" : ""} ${idx === 1 ? "hidden md:block" : ""}`} style={{ flex: 1, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              {idx === 0 ? (
                <button type="button" onClick={() => advance(-1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
              ) : <div style={{ width: 28 }} />}
              
              <span style={{ fontSize: 14, fontWeight: 900, color: "#0d2d5e" }}>{MONTHS[cal.m]} {cal.y}</span>
              
              {idx === 0 ? (
                <>
                  <button type="button" className="md:hidden flex items-center justify-center w-[28px] h-[28px] rounded-full border-none bg-transparent cursor-pointer" onClick={() => advance(1)}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <div className="hidden md:block" style={{ width: 28 }} />
                </>
              ) : (
                <button type="button" onClick={() => advance(1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#8fafd4", padding: "4px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
              {renderMonth(cal.y, cal.m)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #e8eef8", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f4f7fc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: "#8fafd4", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.orange)} onMouseLeave={e => (e.currentTarget.style.color = "#8fafd4")}>
          Clear dates
        </button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: C.orange, border: "none", cursor: "pointer" }}>
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}
