import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type AuthStep = "mobile" | "emailLogin" | "emailRegister";
type AuthMode = "personal" | "biz";

type UiCtx = {
  authOpen: boolean;
  authStep: AuthStep;
  authMode: AuthMode;
  authModeLocked: boolean;
  openAuth: (step?: AuthStep, mode?: AuthMode, lockMode?: boolean) => void;
  closeAuth: () => void;
  setAuthStep: (s: AuthStep) => void;
  setAuthMode: (m: AuthMode) => void;
};

const UiContext = createContext<UiCtx | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("mobile");
  const [authMode, setAuthMode] = useState<AuthMode>("personal");
  const [authModeLocked, setAuthModeLocked] = useState(false);

  function openAuth(step: AuthStep = "mobile", mode: AuthMode = "personal", lockMode = false) {
    setAuthMode(mode);
    setAuthModeLocked(lockMode);
    setAuthStep(step);
    setAuthOpen(true);
  }
  function closeAuth() {
    setAuthOpen(false);
    setAuthModeLocked(false); // unlock next time by default
  }

  const value: UiCtx = useMemo(
    () => ({
      authOpen,
      authStep,
      authMode,
      authModeLocked,
      openAuth,
      closeAuth,
      setAuthStep,
      setAuthMode,
    }),
    [authOpen, authStep, authMode, authModeLocked]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("UiContext not found");
  return ctx;
}
