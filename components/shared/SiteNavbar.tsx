"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import { useSyncExternalStore } from "react";
import { useCart } from "@/features/cart/CartContext";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/orders", label: "My Orders" },
  { href: "/admin", label: "Admin" },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const { cart } = useCart();

  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const cartCount = hydrated ? cart.totalOrders : 0;

  return (
    <>
      {/* Fiesta color strip */}
      <div
        className="h-1.5"
        style={{
          background:
            "linear-gradient(to right, #e8197d, #f97316, #f5c518, #22c55e, #06b6d4, #a855f7)",
        }}
      />

      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-3"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2" style={{ textDecoration: "none" }}>
          <span
            className="text-xl font-black tracking-wide"
            style={{ color: "var(--brand-pink)", fontFamily: "var(--font-display)" }}
          >
            Mi Oaxaca
          </span>
          <span
            className="hidden sm:inline text-xs tracking-widest"
            style={{ color: "var(--foreground-muted)" }}
          >
            Tacos y Más…
          </span>
        </Link>

        {/* Nav links */}
        <nav
          className="flex items-center gap-4 text-sm font-medium"
          style={{ color: "var(--foreground-muted)" }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-white"
              style={{
                color: pathname === href ? "var(--foreground)" : undefined,
                fontWeight: pathname === href ? 700 : undefined,
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-full p-2 transition-opacity hover:opacity-90"
            style={{
              color: pathname === "/cart" ? "var(--foreground)" : "var(--foreground-muted)",
              background: "rgba(232, 25, 125, 0.12)",
            }}
            aria-label="View cart"
          >
            <Badge
              badgeContent={cartCount}
              color="secondary"
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: 700,
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              <ShoppingCartIcon fontSize="small" />
            </Badge>
          </Link>
          <Link
            href="/menu"
            className="px-5 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: "var(--brand-pink)", color: "#fff" }}
          >
            Order Now
          </Link>
        </nav>
      </header>
    </>
  );
}
