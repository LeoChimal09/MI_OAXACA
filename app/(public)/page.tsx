import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-3.5rem)]" style={{ background: "var(--background)" }}>
      {/* ── Hero ── */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <h1
          className="text-5xl sm:text-7xl font-black tracking-tight leading-none"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
        >
          Mi{" "}
          <span style={{ color: "var(--brand-pink)" }}>Oaxaca</span>
        </h1>
        <p className="text-xl" style={{ color: "var(--accent-gold)" }}>
          Tacos y Más…
        </p>
        <p className="max-w-md text-base leading-7" style={{ color: "var(--foreground-muted)" }}>
          Authentic flavors from Oaxaca, Mexico — brought straight to your table.
          Order online for pickup or come visit us.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link
            href="/menu"
            className="px-8 py-3 rounded-full text-base font-bold transition-opacity hover:opacity-90"
            style={{ background: "var(--brand-pink)", color: "#fff" }}
          >
            View the Menu
          </Link>
          <a
            href="tel:309-721-7620"
            className="px-8 py-3 rounded-full text-base font-bold border transition-colors hover:bg-white/10"
            style={{ borderColor: "var(--accent-teal)", color: "var(--accent-teal)" }}
          >
            309-721-7620
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-4 text-xs"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          color: "var(--foreground-muted)",
        }}
      >
        <span>© {new Date().getFullYear()} Mi Oaxaca — Mexican Restaurant</span>
        <span>📞 309-721-7620</span>
      </footer>
    </div>
  );
}
