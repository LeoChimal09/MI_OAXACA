"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import { useCart } from "@/features/cart/CartContext";
import { formatOrderTimestamp } from "@/features/checkout/order-format";
import type { OrderStatus } from "@/features/checkout/checkout.types";
import { canRemoveOrderFromHistory, formatOrderEtaMinutes } from "@/features/checkout/order-status";
import { useOrdersApi } from "@/hooks/useOrdersApi";
import { useI18n } from "@/components/shared/I18nProvider";

const HIDDEN_ORDER_HISTORY_KEY = "mi_oaxaca_hidden_order_history";

const STATUS_CONFIG: Record<OrderStatus, { color: "default" | "warning" | "info" | "success" | "error" }> = {
  pending:    { color: "default"  },
  in_progress:{ color: "warning"  },
  ready:      { color: "info"     },
  completed:  { color: "success"  },
  cancelled:  { color: "error"    },
};

function loadHiddenOrderRefs() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = localStorage.getItem(HIDDEN_ORDER_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    localStorage.removeItem(HIDDEN_ORDER_HISTORY_KEY);
    return [];
  }
}

export default function OrdersPage() {
  const { t } = useI18n();
  const { cart, remakeOrder } = useCart();
  const { orders, loading, error, updateOrderStatus } = useOrdersApi();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const [hiddenOrderRefs, setHiddenOrderRefs] = useState<string[]>(loadHiddenOrderRefs);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmColor: "primary" | "error" | "warning";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    confirmColor: "primary",
    onConfirm: () => {},
  });

  const visibleOrders = orders.filter((order) => !hiddenOrderRefs.includes(order.ref));
  const showOverflowMask = visibleOrders.length > 3;
  const pluralSuffix = (count: number) => (count === 1 ? "" : "s");

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showOverflowMask) {
      return;
    }

    const updateFade = () => {
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowBottomFade(remaining > 8);
    };

    updateFade();
    el.addEventListener("scroll", updateFade);
    window.addEventListener("resize", updateFade);

    return () => {
      el.removeEventListener("scroll", updateFade);
      window.removeEventListener("resize", updateFade);
    };
  }, [showOverflowMask, visibleOrders.length]);

  const handleRemakeOrder = (orderOrders: typeof orders[number]["orders"]) => {
    if (cart.totalOrders > 0) {
      setConfirmState({
        open: true,
        title: t("orders.replace_cart_title"),
        description: t("orders.replace_cart_desc"),
        confirmLabel: t("orders.replace_cart"),
        confirmColor: "warning",
        onConfirm: () => {
          remakeOrder(orderOrders);
          router.push("/checkout");
          setConfirmState((prev) => ({ ...prev, open: false }));
        },
      });
      return;
    }

    remakeOrder(orderOrders);
    router.push("/checkout");
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
        <Typography color="text.secondary">{t("orders.loading")}</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
        <Stack spacing={3}>
          <Typography variant="h4">{t("orders.unable")}</Typography>
          <Typography color="text.secondary">{error}</Typography>
          <Button variant="contained" LinkComponent={Link} href="/menu" sx={{ mx: "auto" }}>
            {t("orders.back_menu")}
          </Button>
        </Stack>
      </Container>
    );
  }

  if (visibleOrders.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}>{t("orders.title")}</Typography>
          <Typography color="text.secondary">
            {orders.length === 0
              ? t("orders.none")
              : t("orders.none_visible")}
          </Typography>
          <Button variant="contained" LinkComponent={Link} href="/menu" sx={{ mx: "auto" }}>
            {t("orders.start")}
          </Button>
        </Stack>
      </Container>
    );
  }

  // Count removable orders (completed or cancelled)
  const removableOrders = visibleOrders.filter((order) => canRemoveOrderFromHistory(order.status));
  const hasRemovableOrders = removableOrders.length > 0;

  const handleClearHistory = () => {
    setConfirmState({
      open: true,
      title: t("orders.clear_history_title"),
      description: t("orders.clear_history_desc", {
        count: removableOrders.length,
        suffix: pluralSuffix(removableOrders.length),
      }),
      confirmLabel: t("orders.clear_history"),
      confirmColor: "error",
      onConfirm: () => {
        setHiddenOrderRefs((prev) => {
          const next = [...new Set([...prev, ...removableOrders.map((o) => o.ref)])];
          localStorage.setItem(HIDDEN_ORDER_HISTORY_KEY, JSON.stringify(next));
          return next;
        });
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
            <Typography variant="h3" sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}>{t("orders.title")}</Typography>
            {hasRemovableOrders && (
              <Button variant="outlined" color="error" size="small" onClick={handleClearHistory}>
                {t("orders.clear_history")}
              </Button>
            )}
          </Stack>

          <Box sx={{ position: "relative" }}>
            <Box
              ref={scrollRef}
              sx={{
                maxHeight: showOverflowMask ? { xs: 420, md: 452 } : "none",
                overflowY: showOverflowMask ? "auto" : "visible",
                pr: showOverflowMask ? 1 : 0,
                scrollbarWidth: "thin",
                overscrollBehavior: "contain",
              }}
            >
              <Stack spacing={2}>
              {visibleOrders.map((order) => {
                const status = STATUS_CONFIG[order.status];
                const canRemove = canRemoveOrderFromHistory(order.status);
                const itemCount = order.orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.cartQuantity, 0), 0);
                const tax = order.totalPrice * 0.08;
                return (
                  <Card
                    key={order.ref}
                    variant="outlined"
                    sx={{
                      position: "relative",
                      display: "block",
                      "&:hover": { borderColor: "primary.main", backgroundColor: "rgba(143,45,31,0.02)" },
                      transition: "border-color 0.15s, background-color 0.15s",
                    }}
                  >
                    {canRemove && (
                      <IconButton
                        aria-label={t("orders.remove_from_history", { ref: order.ref })}
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
                        onClick={() =>
                          setConfirmState({
                            open: true,
                            title: t("orders.remove_history_title"),
                            description: t("orders.remove_history_desc"),
                            confirmLabel: t("cart.remove"),
                            confirmColor: "error",
                            onConfirm: () => {
                              setHiddenOrderRefs((prev) => {
                                if (prev.includes(order.ref)) {
                                  return prev;
                                }

                                const next = [...prev, order.ref];
                                localStorage.setItem(HIDDEN_ORDER_HISTORY_KEY, JSON.stringify(next));
                                return next;
                              });
                              setConfirmState((prev) => ({ ...prev, open: false }));
                            },
                          })
                        }
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}

                    <CardContent sx={{ pr: canRemove ? 6 : 2 }}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          spacing={1}
                        >
                          <Stack spacing={0.5}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {order.ref}
                              </Typography>
                              <Chip
                                label={t(`status.${order.status}`)}
                                color={status.color}
                                size="small"
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {formatOrderTimestamp(order.placedAt)} &middot;{" "}
                              {t("cart.item_count", { count: itemCount, suffix: pluralSuffix(itemCount) })} &middot;{" "}
                              {order.form.fulfillment === "delivery" ? t("checkout.delivery") : t("checkout.pickup")}
                            </Typography>
                            {order.status === "in_progress" && order.etaMinutes && (
                              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                                {t("orders.estimated", { eta: formatOrderEtaMinutes(order.etaMinutes) })}
                              </Typography>
                            )}
                          </Stack>
                          <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={0.25}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "primary.main" }}>
                              ${(order.totalPrice + tax).toFixed(2)}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Button
                            size="small"
                            variant="outlined"
                            LinkComponent={Link}
                            href={`/orders/${order.ref}`}
                          >
                            {t("orders.view_details")}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleRemakeOrder(order.orders)}
                          >
                            {t("orders.remake")}
                          </Button>
                          {order.status === "pending" && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() =>
                                setConfirmState({
                                  open: true,
                                  title: t("orders.cancel_title"),
                                  description: t("orders.cancel_desc"),
                                  confirmLabel: t("orders.cancel"),
                                  confirmColor: "error",
                                  onConfirm: async () => {
                                    await updateOrderStatus(order.ref, "cancelled");
                                    setConfirmState((prev) => ({ ...prev, open: false }));
                                  },
                                })
                              }
                            >
                              {t("orders.cancel")}
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
              </Stack>
            </Box>

            {showOverflowMask && showBottomFade && (
              <Box
                sx={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 72,
                  background:
                    "linear-gradient(180deg, rgba(2,7,23,0) 0%, rgba(2,7,23,0.45) 60%, rgba(2,7,23,0.75) 100%)",
                }}
              />
            )}

            {showOverflowMask && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1, textAlign: "right" }}
              >
                {t("orders.scroll_older")}
              </Typography>
            )}
          </Box>

        <ConfirmActionDialog
          open={confirmState.open}
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          confirmColor={confirmState.confirmColor}
          onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
          onConfirm={confirmState.onConfirm}
        />
      </Stack>
    </Container>
  );
}
