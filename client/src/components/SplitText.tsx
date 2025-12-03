"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

type SplitMode = "chars" | "words";

type Props = {
  text: string;
  className?: string;
  delay?: number; // milliseconds between letters
  duration?: number; // seconds
  ease?: string;
  splitType?: SplitMode;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  gap?: number | string;
  onLetterAnimationComplete?: () => void;
};

export default function SplitText({
  text,
  className = "",
  delay = 80,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 24 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-80px",
  textAlign = "center",
  gap = "0.25rem",
  onLetterAnimationComplete,
}: Props) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(from);
  const toRef = useRef(to);

  const parts = useMemo(() => {
    if (splitType === "words") {
      const words = text.split(" ");
      return words.map((word, idx) =>
        idx < words.length - 1 ? `${word} ` : word
      );
    }
    return Array.from(text).map((char) => (char === " " ? "\u00A0" : char));
  }, [text, splitType]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const letters = Array.from(
      el.querySelectorAll<HTMLSpanElement>("[data-split-letter]")
    );
    if (!letters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const ctx = gsap.context(() => {
              gsap.fromTo(
                letters,
                fromRef.current,
                {
                  ...toRef.current,
                  duration,
                  ease,
                  stagger: delay / 1000,
                  onComplete: onLetterAnimationComplete,
                }
              );
            }, el);
            observer.disconnect();
            return;
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration, ease, onLetterAnimationComplete, rootMargin, threshold, text, splitType]);

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        textAlign,
        gap: typeof gap === "number" ? `${gap}px` : gap,
      }}
    >
      {parts.map((part, idx) => (
        <span
          key={`${part}-${idx}`}
          data-split-letter
          className="inline-block"
          style={{
            opacity:
              typeof from.opacity === "number"
                ? (from.opacity as number)
                : undefined,
          }}
          aria-hidden="true"
        >
          {part}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </span>
  );
}
