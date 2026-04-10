"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MenuIcon from "@mui/icons-material/Menu";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useSyncExternalStore, useState, type CSSProperties } from "react";
import { signOut } from "next-auth/react";
import { useCart } from "@/features/cart/CartContext";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/orders", label: "My Orders" },
];

type NavUser = { name: string | null; image: string | null; href: string } | null;

type SiteNavbarProps = {
  showAdmin?: boolean;
  user?: NavUser;
};

export default function SiteNavbar({ showAdmin = false, user = null }: SiteNavbarProps) {
  const pathname = usePathname();
  const { cart } = useCart();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerHoveredRef = useRef(false);
  const menuHoveredRef = useRef(false);

  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const cartCount = hydrated ? cart.totalOrders : 0;
  const accountMenuOpen = Boolean(accountAnchor);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);


  const cancelAccountClose = () => {
    if (!closeTimerRef.current) {
      return;
    }

    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const scheduleAccountClose = () => {
    cancelAccountClose();
    closeTimerRef.current = setTimeout(() => {
      if (!triggerHoveredRef.current && !menuHoveredRef.current) {
        setAccountAnchor(null);
      }
    }, 80);
  };

  const handleTriggerEnter = (target: HTMLElement) => {
    if (!isDesktop) {
      return;
    }

    triggerHoveredRef.current = true;
    cancelAccountClose();
    setAccountAnchor(target);
  };

  const handleTriggerLeave = () => {
    if (!isDesktop) {
      return;
    }

    triggerHoveredRef.current = false;
    scheduleAccountClose();
  };

  const handleMenuEnter = () => {
    if (!isDesktop) {
      return;
    }

    menuHoveredRef.current = true;
    cancelAccountClose();
  };

  const handleMenuLeave = () => {
    if (!isDesktop) {
      return;
    }

    menuHoveredRef.current = false;
    scheduleAccountClose();
  };

  const handleAccountClick = (target: HTMLElement) => {
    if (accountAnchor === target) {
      setAccountAnchor(null);
      return;
    }

    setAccountAnchor(target);
  };

  const navigationLinks = showAdmin
    ? [...navLinks, { href: "/admin", label: "Admin" }]
    : navLinks;

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
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8"
        style={{
          "--site-nav-height": isDesktop ? "64px" : "60px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        } as CSSProperties}
      >
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-2" style={{ textDecoration: "none" }}>
          <span
            className="text-2xl font-black tracking-wide"
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
          className="flex items-center gap-1 text-sm font-medium sm:gap-2"
          style={{ color: "var(--foreground-muted)", display: isDesktop ? "flex" : "none" }}
        >
          {navigationLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-2.5 py-1 transition-all duration-150 hover:text-white"
              style={{
                color: pathname === href ? "var(--foreground)" : undefined,
                fontWeight: pathname === href ? 700 : undefined,
                background: pathname === href ? "rgba(255,255,255,0.06)" : undefined,
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side - Cart and Account */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-full p-2 transition-all hover:opacity-95"
            style={{
              color: pathname === "/cart" ? "var(--foreground)" : "var(--foreground-muted)",
              background: "rgba(232, 25, 125, 0.14)",
              border: "1px solid rgba(232, 25, 125, 0.25)",
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

          {user ? (
            <>
              <Box
                component={Link}
                href={user.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleAccountClick(event.currentTarget);
                }}
                onMouseEnter={(event) => handleTriggerEnter(event.currentTarget)}
                onMouseLeave={handleTriggerLeave}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  ml: 0.5,
                  px: 0.8,
                  py: 0.35,
                  borderRadius: 999,
                  backgroundColor: accountMenuOpen ? "rgba(255,255,255,0.08)" : "transparent",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background-color 0.15s ease",
                }}
              >
                <Avatar src={user.image ?? undefined} alt={user.name ?? "You"} sx={{ width: 32, height: 32 }}>
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: "none", sm: "block" } }}>
                  {user.name ?? "Account"}
                </Typography>
              </Box>
              <Popper
                anchorEl={accountAnchor}
                open={accountMenuOpen}
                placement="bottom-end"
                disablePortal
                modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
              >
                <ClickAwayListener onClickAway={() => setAccountAnchor(null)}>
                  <Paper
                    elevation={3}
                    onMouseEnter={handleMenuEnter}
                    onMouseLeave={handleMenuLeave}
                    sx={{ minWidth: 168, p: 0.75, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
                  >
                    <Button
                      fullWidth
                      size="small"
                      color="inherit"
                      onClick={() => {
                        setAccountAnchor(null);
                        void signOut({ callbackUrl: "/" });
                      }}
                    >
                      Sign out
                    </Button>
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </>
          ) : (
            <Button
              variant="text"
              size="small"
              startIcon={<PersonOutlineIcon />}
              sx={{ ml: 1, textTransform: "none" }}
              onClick={() => window.dispatchEvent(new CustomEvent("open-welcome-modal"))}
            >
              Sign in
            </Button>
          )}

          {!isDesktop && (
            <Button
              variant="text"
              size="small"
              sx={{ minWidth: 0, px: 1, color: "var(--foreground-muted)" }}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon fontSize="small" />
            </Button>
          )}
        </div>
      </header>

      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 280, pt: 1.5 }} role="presentation">
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Mi Oaxaca
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Quick navigation
            </Typography>
          </Box>
          <Divider />
          <List>
            {navigationLinks.map(({ href, label }) => (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                selected={pathname === href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
            <ListItemButton component={Link} href="/cart" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary={`Cart (${cartCount})`} />
            </ListItemButton>
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            {user ? (
              <Button
                fullWidth
                color="inherit"
                variant="outlined"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("open-welcome-modal"));
                }}
              >
                Sign in
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
