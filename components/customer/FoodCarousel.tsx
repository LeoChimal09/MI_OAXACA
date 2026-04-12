"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useI18n } from "@/components/shared/I18nProvider";

type Slide = {
  src: string;
  altKey: string;
};

// Food carousel images - local demo assets so they always render in dev.
// Replace with your own photos in /public/gallery when ready.
const SLIDES: Slide[] = [
  { src: "/gallery/demo-food-1.svg", altKey: "home.slide_1" },
  { src: "/gallery/demo-food-2.svg", altKey: "home.slide_2" },
  { src: "/gallery/demo-food-3.svg", altKey: "home.slide_3" },
  { src: "/gallery/demo-food-4.svg", altKey: "home.slide_4" },
  { src: "/gallery/demo-food-5.svg", altKey: "home.slide_5" },
  { src: "/gallery/demo-food-6.svg", altKey: "home.slide_6" },
  { src: "/gallery/demo-food-7.svg", altKey: "home.slide_7" },
  { src: "/gallery/demo-food-8.svg", altKey: "home.slide_8" },
];

const AUTO_ADVANCE_MS = 4000;

export default function FoodCarousel() {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setPaused(true);
    goTo(current - 1);
  }, [current, goTo]);

  const next = useCallback(() => {
    setPaused(true);
    goTo(current + 1);
  }, [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  // Resume auto-advance 8 s after manual interaction
  useEffect(() => {
    if (!paused) return;
    const t = setTimeout(() => setPaused(false), 8000);
    return () => clearTimeout(t);
  }, [paused, current]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl select-none"
      style={{ aspectRatio: "16/9" }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          <Image
            src={slide.src}
            alt={t(slide.altKey)}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover"
            priority={i === 0}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-5 py-3 text-sm font-medium"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
              color: "#fff",
            }}
          >
            {t(slide.altKey)}
          </div>
        </div>
      ))}

      {/* Prev */}
      <button
        onClick={prev}
        aria-label={t("home.prev_photo")}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full text-lg font-bold transition-colors"
        style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
      >
        ‹
      </button>

      {/* Next */}
      <button
        onClick={next}
        aria-label={t("home.next_photo")}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full text-lg font-bold transition-colors"
        style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setPaused(true);
              goTo(i);
            }}
            aria-label={t("home.go_to_photo", { index: i + 1 })}
            className="rounded-full transition-all"
            style={{
              width: i === current ? "20px" : "8px",
              height: "8px",
              background:
                i === current ? "var(--brand-pink)" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
