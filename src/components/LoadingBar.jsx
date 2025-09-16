import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Progress } from "./ui/progress";

const Ctx = createContext(null);

// Utilidades
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function LoadingBarProvider({ children }) {
  const [progress, setProgress] = useState(0);     // 0..100
  const [active, setActive] = useState(0);         // contador de tareas activas
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const durationRef = useRef(0);
  const prefillRef = useRef(0);
  const manualTargetRef = useRef(0); // <- objetivo sugerido por set()

  // Config de simulación
  const BASE = 2;            // antes 12 (prefill mínimo)
  const MAX_SIM = 98;        // antes 96 (no llegar a 100 hasta done)
  const MIN_MS = 60_000;
  const MAX_MS = 90_000;
  const TICK_MS = 400;       // antes 250 (pasos más “pausados”)
  const HIDE_DELAY = 220;     // tiempo para ocultarse tras 100%

  // start puede recibir { durationMs, prefill }
  const start = (opts) => {
    setActive((c) => {
      const next = c + 1;
      if (next === 1) {
        startTimeRef.current = Date.now();
        manualTargetRef.current = 0; // reset hints en cada inicio
        const customDuration = typeof opts === "number" ? opts : opts?.durationMs;
        durationRef.current = customDuration ?? rand(MIN_MS, MAX_MS);
        const customPrefill = typeof opts === "object" && opts?.prefill != null ? clamp(opts.prefill, 0, 20) : BASE;
        prefillRef.current = customPrefill;
        setProgress((p) => (p === 0 ? customPrefill : p));
      }
      return next;
    });
  };

  // Ahora set() solo marca un objetivo; no adelanta de golpe el progreso
  const set = (v) => {
    manualTargetRef.current = clamp(v ?? 0, 0, 99);
  };

  const done = () => {
    setActive((c) => Math.max(0, c - 1));
  };

  // Simulación lineal (proporcional al tiempo)
  useEffect(() => {
    if (active > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const duration = durationRef.current || MAX_MS;
        const t = clamp(elapsed / duration, 0, 1); // 0..1 lineal

        const simTarget = clamp(
          prefillRef.current + t * (MAX_SIM - prefillRef.current),
          prefillRef.current,
          MAX_SIM
        );
        const desired = Math.max(simTarget, manualTargetRef.current);

        const totalTicks = Math.max(1, duration / TICK_MS);
        const stepPerTick = (MAX_SIM - prefillRef.current) / totalTicks;

        setProgress((prev) => {
          // avanzar como máximo un paso por tick, sin retroceder
          const next = Math.min(desired, prev + stepPerTick);
          return next <= prev ? prev : next;
        });
      }, TICK_MS);
    }

    if (active === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setProgress(100);
      const t = setTimeout(() => {
        setProgress(0);
        startTimeRef.current = 0;
        durationRef.current = 0;
        prefillRef.current = BASE;
        manualTargetRef.current = 0;
      }, HIDE_DELAY);
      return () => clearTimeout(t);
    }
  }, [active]);

  const value = useMemo(
    () => ({
      start,
      set,
      done,
      isActive: active > 0,
      progress,
    }),
    [active, progress]
  );

  return (
    <Ctx.Provider value={value}>
      {/* Eliminado: barra fija superior */}
      {children}
    </Ctx.Provider>
  );
}

export function useLoadingBar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLoadingBar must be used within LoadingBarProvider");
  return ctx;
}