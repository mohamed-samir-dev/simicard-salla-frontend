"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const RL_KEY = "checkout_rl";
export const RL_MAX = 4;
const RL_WINDOW_MS = 5 * 60 * 1000;

function getRLData() {
  try {
    const raw = sessionStorage.getItem(RL_KEY);
    return raw ? JSON.parse(raw) : { count: 0, windowStart: 0 };
  } catch { return { count: 0, windowStart: 0 }; }
}

export function useRateLimit() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calcSecondsLeft = useCallback(() => {
    const { count, windowStart } = getRLData();
    const elapsed = Date.now() - windowStart;
    if (count >= RL_MAX && elapsed < RL_WINDOW_MS) return Math.ceil((RL_WINDOW_MS - elapsed) / 1000);
    return 0;
  }, []);

  const startTimer = useCallback((secs: number) => {
    setSecondsLeft(secs);
    setBlocked(secs > 0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (secs <= 0) return;
    intervalRef.current = setInterval(() => {
      const s = calcSecondsLeft();
      setSecondsLeft(s);
      if (s <= 0) { setBlocked(false); clearInterval(intervalRef.current!); }
    }, 1000);
  }, [calcSecondsLeft]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") startTimer(calcSecondsLeft());
    };
    document.addEventListener("visibilitychange", onVisible);
    startTimer(calcSecondsLeft());
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [calcSecondsLeft, startTimer]);

  const recordAttempt = useCallback((serverRetryAfterMs?: number) => {
    if (serverRetryAfterMs) {
      sessionStorage.setItem(RL_KEY, JSON.stringify({ count: RL_MAX, windowStart: Date.now() - (RL_WINDOW_MS - serverRetryAfterMs) }));
      startTimer(Math.ceil(serverRetryAfterMs / 1000));
      return;
    }
    const now = Date.now();
    const { count, windowStart } = getRLData();
    const elapsed = now - windowStart;
    const newData = elapsed >= RL_WINDOW_MS ? { count: 1, windowStart: now } : { count: count + 1, windowStart };
    sessionStorage.setItem(RL_KEY, JSON.stringify(newData));
    if (newData.count >= RL_MAX) startTimer(Math.ceil((RL_WINDOW_MS - (now - newData.windowStart)) / 1000));
  }, [startTimer]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return { blocked, secondsLeft, fmtTime: fmt(secondsLeft), recordAttempt };
}
