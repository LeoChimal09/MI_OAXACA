"use client";

import Link from "next/link";
import FoodCarousel from "@/components/customer/FoodCarousel";
import { useI18n } from "@/components/shared/I18nProvider";

const HOURS = [
  { day: "Monday",    hours: "Closed" },
  { day: "Tuesday",   hours: "10:00 am – 9:00 pm" },
  { day: "Wednesday", hours: "10:00 am – 9:00 pm" },
  { day: "Thursday",  hours: "10:00 am – 9:00 pm" },
  { day: "Friday",    hours: "10:00 am – 11:00 pm" },
  { day: "Saturday",  hours: "10:00 am – 7:00 pm" },
  { day: "Sunday",    hours: "10:00 am – 3:00 pm" },
];

export default function Home() {
  const { t, dayLabel } = useI18n();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div
      className="flex flex-col flex-1"
      style={{ background: "var(--background)" }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center gap-5 px-5 sm:px-6 py-16 sm:py-20 text-center">
        <div
          aria-hidden
          className="absolute -top-24 -left-20 w-80 h-80 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, rgba(245,197,24,0.55), rgba(245,197,24,0))" }}
        />
        <div
          aria-hidden
          className="absolute -top-16 -right-24 w-96 h-96 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, rgba(232,25,125,0.45), rgba(232,25,125,0))" }}
        />
        <span
          className="reveal-up text-[10px] sm:text-xs uppercase tracking-[0.25em] px-3 py-1 rounded-full border"
          style={{
            color: "var(--accent-gold)",
            borderColor: "rgba(245, 197, 24, 0.55)",
            background: "rgba(245, 197, 24, 0.08)",
          }}
        >
          {t("home.badge")}
        </span>
        <h1
          className="reveal-up text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
        >
          Mi <span style={{ color: "var(--brand-pink)" }}>Oaxaca</span>
        </h1>
        <p className="reveal-up text-lg sm:text-xl" style={{ color: "var(--accent-gold)" }}>
          Tacos y Más…
        </p>
        <p
          className="reveal-up max-w-md text-sm sm:text-base leading-7"
          style={{ color: "var(--foreground-muted)" }}
        >
          {t("home.copy")}
        </p>
        <div className="reveal-up flex flex-col sm:flex-row gap-3 sm:gap-4 mt-1 sm:mt-2 w-full sm:w-auto max-w-sm sm:max-w-none">
          <Link
            href="/menu"
            className="px-8 py-3 rounded-full text-base font-bold transition-opacity hover:opacity-90 text-center"
            style={{ background: "var(--brand-pink)", color: "#fff", boxShadow: "var(--glow-pink)" }}
          >
            {t("home.view_menu")}
          </Link>
          <a
            href="tel:+13098652843"
            className="px-8 py-3 rounded-full text-base font-bold border transition-colors hover:bg-white/10 text-center"
            style={{ borderColor: "var(--accent-teal)", color: "var(--accent-teal)" }}
          >
            (309) 865-2843
          </a>
        </div>
      </section>

      {/* ── Food Photo Gallery ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 lg:px-16 pb-14 sm:pb-16 max-w-5xl mx-auto w-full reveal-up">
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
        >
          {t("home.from_kitchen")}
        </h2>
        <FoodCarousel />
      </section>

      {/* ── About Us ─────────────────────────────────────────────────────── */}
      <section
        className="px-5 sm:px-6 py-12 sm:py-14 text-center reveal-up"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          <h2
            className="text-3xl font-black"
            style={{ color: "var(--brand-pink)", fontFamily: "var(--font-display)" }}
          >
            {t("home.about")}
          </h2>
          <p className="text-base leading-8" style={{ color: "var(--foreground-muted)" }}>
            {t("home.about_copy")}
          </p>
          <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: "var(--accent-gold)" }}>
            {t("home.about_badge")}
          </p>
        </div>
      </section>

      {/* ── Location & Hours ─────────────────────────────────────────────── */}
      <section className="px-5 sm:px-6 py-12 sm:py-14 max-w-5xl mx-auto w-full reveal-up">
        <h2
          className="text-3xl font-black text-center mb-8 sm:mb-10"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
        >
          {t("home.find_us")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Location card */}
          <div className="rounded-2xl p-5 sm:p-7 flex flex-col gap-4 surface-card">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              📍 {t("home.address")}
            </h3>
            <address className="not-italic leading-7" style={{ color: "var(--foreground-muted)" }}>
              637 1st St<br />
              Silvis, IL 61282
            </address>
            <a
              href="https://maps.google.com/?q=Mi+Oaxaca+637+1st+St+Silvis+IL+61282"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold underline underline-offset-4 w-fit"
              style={{ color: "var(--accent-teal)" }}
            >
              {t("home.maps")}
            </a>

            <h3 className="text-lg font-bold mt-2" style={{ color: "var(--foreground)" }}>
              📞 {t("home.phone")}
            </h3>
            <a
              href="tel:+13098652843"
              className="text-xl font-bold"
              style={{ color: "var(--brand-pink)" }}
            >
              (309) 865-2843
            </a>

            <h3 className="text-lg font-bold mt-4" style={{ color: "var(--foreground)" }}>
              💌 {t("home.email")}
            </h3>
            <a
              href="mailto:mioaxacarestaurant25@gmail.com"
              className="text-sm underline underline-offset-2"
              style={{ color: "var(--accent-teal)" }}
            >
              mioaxacarestaurant25@gmail.com
            </a>
            <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
              {t("home.catering")}
            </p>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>
                📱 {t("home.follow")}
              </h3>
              <a
                href="https://www.facebook.com/people/MI-Oaxaca/100082848057035/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                style={{
                  background: "#1877F2",
                  color: "#fff",
                }}
              >
                👍 {t("home.facebook")}
              </a>
            </div>
          </div>

          {/* Hours card */}
          <div className="rounded-2xl p-5 sm:p-7 flex flex-col gap-3 surface-card">
            <h3 className="text-lg font-bold mb-1" style={{ color: "var(--foreground)" }}>
              🕐 {t("home.hours")}
            </h3>
            {HOURS.map(({ day, hours }) => {
              const isToday = day === today;
              const isClosed = hours === "Closed";
              return (
                <div
                  key={day}
                  className="flex justify-between items-center text-sm py-1.5 px-2 rounded-lg"
                  style={{
                    background: isToday ? "rgba(232,25,125,0.1)" : "transparent",
                    borderLeft: isToday ? "3px solid var(--brand-pink)" : "3px solid transparent",
                  }}
                >
                  <span
                    className="font-medium"
                    style={{ color: isToday ? "var(--brand-pink)" : "var(--foreground)" }}
                  >
                    {dayLabel(day)}
                    {isToday && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: "var(--brand-pink)", color: "#fff" }}>
                        {t("home.today")}
                      </span>
                    )}
                  </span>
                  <span style={{ color: isClosed ? "var(--accent-red)" : "var(--foreground-muted)" }}>
                    {dayLabel(hours)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 sm:px-6 py-4 text-xs mt-auto"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          color: "var(--foreground-muted)",
        }}
      >
        <span>© {new Date().getFullYear()} {t("home.footer")}</span>
        <span>📞 (309) 865-2843</span>
      </footer>
    </div>
  );
}
