"use client";

import { useEffect, useRef, useState } from "react";

// Animates 0 → `to` once, the first time it scrolls into view.
// Honours prefers-reduced-motion by jumping straight to the final value.
export function Counter({
  to,
  duration = 1800,
  prefix,
  suffix,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || to === 0) {
      setN(to);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setN(to);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        const start = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - p, 3);
          setN(Math.round(eased * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
