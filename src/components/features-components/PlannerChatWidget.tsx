import { TransparentVideo } from "./TransparentVideo";
import { C, FONT } from "./token";
import dogAnimationVideo from "../../assets/dog_animation.mp4";
import { usePlannerChat } from "./PlannerChatContext";

function IconChatBubble() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4h16v11H8l-4 4V4z"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L18 18M18 6L6 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11L21 3L13 21L11 13L3 11Z" fill="#fff" />
    </svg>
  );
}

// A quiet, premium orbiting label — a hairline circle with widely-tracked
// uppercase text that drifts around it slowly. Designed to read as a
// considered brand mark, not a spinning attention-grab.
function CircularFabLabel({ text, visible }: { text: string; visible: boolean }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const unit = `${text}   ·   `;
  const repeated = unit.repeat(Math.max(2, Math.ceil(circumference / (unit.length * 6.4))));

  return (
    <svg
      className={`plumml-fab-ring ${visible ? "is-visible" : "is-hidden"}`}
      viewBox="0 0 156 156"
      width="156"
      height="156"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="plumml-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffcf9e" />
          <stop offset="55%" stopColor={C.orange} />
          <stop offset="100%" stopColor="#d9591a" />
        </linearGradient>
        <path
          id="plumml-fab-ring-path"
          d={`M 78,78 m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
        />
      </defs>

      {/* hairline circle frame */}
      <circle
        cx="78"
        cy="78"
        r={radius - 12}
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />

      <text
        fill="url(#plumml-ring-gradient)"
        fontFamily={FONT}
        fontSize="10.5"
        letterSpacing="3.2"
        fontWeight={600}
        style={{ textTransform: "uppercase" }}
      >
        <textPath href="#plumml-fab-ring-path" startOffset="0%">
          {repeated}
        </textPath>
      </text>
    </svg>
  );
}

// Floating chat widget: fixed to the bottom-right of the VIEWPORT.
// Mounted once at the app/page root (not inside AIPlanner) so it stays
// visible across the whole page and shares state via PlannerChatProvider.
export function PlannerChatWidget() {
  const {
    chatLog,
    isLoading,
    isWidgetOpen,
    hasUnread,
    chatInput,
    chatBodyRef,
    setChatInput,
    setIsWidgetOpen,
    setHasUnread,
    handleSendChatInput,
  } = usePlannerChat();

  return (
    <>
      <style>{`
        .plumml-fab-wrap {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 156px;
          height: 156px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .plumml-fab-wrap > * {
          pointer-events: auto;
        }
        .plumml-fab-ring {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          animation: plumml-ring-drift 46s linear infinite;
          transition: opacity 0.5s ease, transform 0.5s ease;
          transform-origin: center;
        }
        .plumml-fab-ring.is-visible {
          opacity: 1;
        }
        .plumml-fab-ring.is-hidden {
          opacity: 0;
          transform: scale(0.92);
          animation-play-state: paused;
        }
        @keyframes plumml-ring-drift {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .plumml-fab {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(145deg, ${C.orange} 0%, #d9591a 100%);
          box-shadow: 0 16px 34px rgba(217,89,26,0.42), inset 0 1px 0 rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .plumml-fab:hover {
          transform: scale(1.05);
          box-shadow: 0 18px 38px rgba(217,89,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .plumml-fab-badge {
          position: absolute;
          top: 32px;
          right: 32px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ff3b3b;
          border: 2px solid ${C.navyDeep};
          z-index: 2;
        }
        .plumml-chat-panel {
          position: fixed;
          bottom: 122px;
          right: 24px;
          width: 340px;
          max-width: calc(100vw - 32px);
          height: 460px;
          max-height: calc(100vh - 164px);
          background: ${C.navyDeep};
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }
        .plumml-chat-header {
          padding: 14px 16px;
          background: linear-gradient(135deg, ${C.navy} 0%, ${C.navyDeep} 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
        }
        .plumml-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .plumml-chat-message {
          border-radius: 16px;
          padding: 10px 14px;
          line-height: 1.5;
          font-family: ${FONT};
          font-size: 13px;
          max-width: 85%;
          white-space: pre-wrap;
        }
        .plumml-chat-message.user {
          background: ${C.orange};
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .plumml-chat-message.assistant {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .plumml-chat-empty {
          margin: auto;
          text-align: center;
          font-family: ${FONT};
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          padding: 0 20px;
        }
        .plumml-chat-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(0,0,0,0.15);
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .plumml-chat-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-family: ${FONT};
          font-size: 13px;
          outline: none;
        }
        .plumml-chat-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: ${C.orange};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .plumml-chat-panel {
            right: 16px;
            bottom: 100px;
            width: calc(100vw - 32px);
          }
          .plumml-fab-wrap { right: 12px; bottom: 12px; width: 132px; height: 132px; }
          .plumml-fab { width: 60px; height: 60px; }
        }
      `}</style>

      {isWidgetOpen && (
        <div className="plumml-chat-panel" role="dialog" aria-label="Trip planner chat support">
          <TransparentVideo
            src={dogAnimationVideo}
            style={{
              position: "absolute",
              bottom: "100%",
              marginBottom: -2,
              left: "50%",
              transform: "translateX(-50%)",
              width: 200,
              height: "auto",
              maxHeight: 200,
              zIndex: 1002,
              pointerEvents: "none",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
            }}
            tolerance={35}
          />
          <div className="plumml-chat-header">
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#fff" }}>
                Pluto AI Trip Planner
              </div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                {isLoading ? "Typing…" : "We're here to help"}
              </div>
            </div>
            <button
              onClick={() => setIsWidgetOpen(false)}
              aria-label="Close chat"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IconClose />
            </button>
          </div>

          <div className="plumml-chat-body" ref={chatBodyRef}>
            {chatLog.length === 0 && !isLoading && (
              <div className="plumml-chat-empty">
                Fill in the planner form or just type below to start planning your trip.
              </div>
            )}
            {chatLog.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`plumml-chat-message ${item.role}`}>
                {item.text}
              </div>
            ))}
            {isLoading && (
              <div className="plumml-chat-message assistant">Sending to planner…</div>
            )}
          </div>

          <div className="plumml-chat-input-row">
            <input
              className="plumml-chat-input"
              placeholder="Type a message…"
              aria-label="Chat message"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendChatInput();
                }
              }}
              disabled={isLoading}
            />
            <button
              className="plumml-chat-send"
              onClick={handleSendChatInput}
              disabled={isLoading || !chatInput.trim()}
              aria-label="Send message"
              style={{ opacity: isLoading || !chatInput.trim() ? 0.6 : 1 }}
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}

      <div className="plumml-fab-wrap">
        <CircularFabLabel text="Pluto AI Trip Planner" visible={!isWidgetOpen} />
        <button
          className="plumml-fab"
          onClick={() => {
            setIsWidgetOpen((open) => !open);
            setHasUnread(false);
          }}
          aria-label="Toggle chat support"
        >
          <IconChatBubble />
        </button>
        {hasUnread && <span className="plumml-fab-badge" />}
      </div>
    </>
  );
}