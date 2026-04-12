"use client";

import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import { formatOrderTimestamp } from "@/features/checkout/order-format";
import type { OrderEtaMinutes, OrderStatus } from "@/features/checkout/checkout.types";
import {
  canRemoveOrderFromHistory,
  canTransitionOrderStatus,
  formatOrderEtaMinutes,
  ORDER_ETA_OPTIONS,
} from "@/features/checkout/order-status";
import { useOrdersApi } from "@/hooks/useOrdersApi";
import { useI18n } from "@/components/shared/I18nProvider";

const HIDDEN_ADMIN_ORDER_HISTORY_KEY = "mi_oaxaca_hidden_admin_order_history";

const WORKFLOW: OrderStatus[] = ["pending", "in_progress", "ready", "completed", "cancelled"];

function getKitchenItemTypeKey(category: string): "appetizer" | "meal" | "drink" | "dessert" | "extra" {
  const normalized = category.trim().toLowerCase();

  if (normalized === "appetizers") {
    return "appetizer";
  }

  if (normalized === "drinks") {
    return "drink";
  }

  if (normalized === "desserts") {
    return "dessert";
  }

  if (normalized === "extras" || normalized === "à la carte") {
    return "extra";
  }

  return "meal";
}

function loadHiddenAdminOrderRefs() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = localStorage.getItem(HIDDEN_ADMIN_ORDER_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    localStorage.removeItem(HIDDEN_ADMIN_ORDER_HISTORY_KEY);
    return [];
  }
}

export default function AdminOrdersPage() {
  const { t } = useI18n();
  const { orders, loading, error, updateOrderStatus } = useOrdersApi({
    mode: "admin",
    pollIntervalMs: 5000,
  });
  const STATUS_CONFIG: Record<OrderStatus, { label: string; color: "default" | "warning" | "info" | "success" | "error" }> = {
    pending: { label: t("status.pending"), color: "default" },
    in_progress: { label: t("status.in_progress"), color: "warning" },
    ready: { label: t("status.ready"), color: "info" },
    completed: { label: t("status.completed"), color: "success" },
    cancelled: { label: t("status.cancelled"), color: "error" },
  };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const [hiddenOrderRefs, setHiddenOrderRefs] = useState<string[]>(loadHiddenAdminOrderRefs);
  const [etaDialogOrderRef, setEtaDialogOrderRef] = useState<string | null>(null);
  const [cancelDialogOrderRef, setCancelDialogOrderRef] = useState<string | null>(null);
  const [cancelNoteInput, setCancelNoteInput] = useState("");
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
    confirmLabel: "Confirm",
    confirmColor: "primary",
    onConfirm: () => {},
  });

  const visibleOrders = orders.filter((order) => !hiddenOrderRefs.includes(order.ref));
  const showOverflowMask = visibleOrders.length > 3;
  const liveCounts = {
    pending: visibleOrders.filter((order) => order.status === 'pending').length,
    in_progress: visibleOrders.filter((order) => order.status === 'in_progress').length,
    ready: visibleOrders.filter((order) => order.status === 'ready').length,
  };

  const etaDialogOrder = etaDialogOrderRef
    ? visibleOrders.find((order) => order.ref === etaDialogOrderRef) ?? null
    : null;

  const handleChooseEta = (etaMinutes: OrderEtaMinutes) => {
    if (!etaDialogOrderRef) {
      return;
    }

    void updateOrderStatus(etaDialogOrderRef, "in_progress", { etaMinutes });
    setEtaDialogOrderRef(null);
  };

  const handleConfirmCancel = () => {
    if (!cancelDialogOrderRef) {
      return;
    }

    void updateOrderStatus(cancelDialogOrderRef, "cancelled", {
      cancellationNote: cancelNoteInput.trim() || undefined,
      cancelledBy: "admin",
    });
    setCancelDialogOrderRef(null);
    setCancelNoteInput("");
  };

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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
        <Typography color="text.secondary">{t("admin.orders_loading")}</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
        <Stack spacing={3}>
          <Typography variant="h4">{t("admin.orders_unable")}</Typography>
          <Typography color="text.secondary">{error}</Typography>
          <Button variant="contained" LinkComponent={Link} href="/admin">
            {t("admin.back_dashboard")}
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(20,24,42,0.96) 0%, rgba(12,14,26,0.96) 72%)',
            boxShadow: 'var(--shadow-deep)',
          }}
        >
          <Stack spacing={1.25}>
            <Typography variant="overline" color="secondary.main">
              {t("admin.area")}
            </Typography>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
              <Stack spacing={0.75}>
                <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.6rem' } }}>
                  {t("admin.orders_title")}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                  {t("admin.orders_subtitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.visible_orders', { count: visibleOrders.length, suffix: visibleOrders.length === 1 ? '' : 's' })}
                </Typography>
              </Stack>

              <Stack spacing={1} alignItems={{ xs: 'stretch', lg: 'flex-end' }} sx={{ width: { xs: '100%', lg: 'auto' } }}>
                {visibleOrders.length > 0 && visibleOrders.some((order) => canRemoveOrderFromHistory(order.status)) && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ alignSelf: { xs: 'flex-start', lg: 'flex-end' } }}
                    onClick={() => {
                      const removableOrders = visibleOrders.filter((order) => canRemoveOrderFromHistory(order.status));
                      setConfirmState({
                        open: true,
                        title: t("admin.clear_history_title"),
                        description: t("admin.clear_history_desc", {
                          count: removableOrders.length,
                          suffix: removableOrders.length !== 1 ? "s" : "",
                        }),
                        confirmLabel: t("admin.clear_history"),
                        confirmColor: "error",
                        onConfirm: () => {
                          const removable = visibleOrders.filter((order) => canRemoveOrderFromHistory(order.status));
                          setHiddenOrderRefs((prev) => {
                            const next = [...new Set([...prev, ...removable.map((o) => o.ref)])];
                            localStorage.setItem(HIDDEN_ADMIN_ORDER_HISTORY_KEY, JSON.stringify(next));
                            return next;
                          });
                          setConfirmState((prev) => ({ ...prev, open: false }));
                        },
                      });
                    }}
                  >
                    {t("admin.clear_history")}
                  </Button>
                )}

                <Stack direction={{ xs: 'row', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
                <Box sx={{ minWidth: 118, px: 1.25, py: 1, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 0.35, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.1 }}>{t('status.pending')}</Typography>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--foreground)', lineHeight: 1, width: '100%', textAlign: 'center' }}>{liveCounts.pending}</Typography>
                </Box>
                <Box sx={{ minWidth: 118, px: 1.25, py: 1, borderRadius: 3, border: '1px solid rgba(245,197,24,0.18)', background: 'rgba(245,197,24,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 0.35, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.1 }}>{t('status.in_progress')}</Typography>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-gold)', lineHeight: 1, width: '100%', textAlign: 'center' }}>{liveCounts.in_progress}</Typography>
                </Box>
                <Box sx={{ minWidth: 118, px: 1.25, py: 1, borderRadius: 3, border: '1px solid rgba(6,182,212,0.18)', background: 'rgba(6,182,212,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: 0.35, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.1 }}>{t('status.ready')}</Typography>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-teal)', lineHeight: 1, width: '100%', textAlign: 'center' }}>{liveCounts.ready}</Typography>
                </Box>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      {visibleOrders.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h6">
                {orders.length === 0 ? t("admin.no_orders") : t("admin.none_visible")}
              </Typography>
              <Typography color="text.secondary">
                {orders.length === 0
                  ? t("admin.no_orders_copy")
                  : t("admin.none_visible_copy")}
              </Typography>
              <Button variant="contained" LinkComponent={Link} href="/menu">
                {t("admin.open_menu")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ position: "relative" }}>
          <Box
            ref={scrollRef}
            sx={{
              maxHeight: showOverflowMask ? { xs: 520, md: 560 } : "none",
              overflowY: showOverflowMask ? "auto" : "visible",
              pr: showOverflowMask ? 1 : 0,
              scrollbarWidth: "thin",
              overscrollBehavior: "contain",
            }}
          >
            <Stack spacing={2}>
              {visibleOrders.map((order) => {
                const itemCount = order.orders.reduce(
                  (sum, entry) => sum + entry.lines.reduce((lineSum, line) => lineSum + line.cartQuantity, 0),
                  0,
                );
                const kitchenLines = order.orders.flatMap((entry) => entry.lines);
                const kitchenSummary = Object.entries(
                  kitchenLines.reduce<Record<string, number>>((acc, line) => {
                    const typeLabel = getKitchenItemTypeKey(line.category);
                    acc[typeLabel] = (acc[typeLabel] ?? 0) + line.cartQuantity;
                    return acc;
                  }, {}),
                )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([label, qty]) => `${qty} ${t(`admin.type.${label}`)}`)
                  .join(" · ");
                const status = STATUS_CONFIG[order.status];
                const canRemove = canRemoveOrderFromHistory(order.status);

                return (
                  <Card key={order.ref} variant="outlined" sx={{ position: "relative" }}>
                    {canRemove && (
                      <IconButton
                        aria-label={t("admin.remove_history_aria", { ref: order.ref })}
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
                        onClick={() => {
                          setConfirmState({
                            open: true,
                            title: t("admin.remove_history_title"),
                            description: t("admin.remove_history_desc"),
                            confirmLabel: t("admin.remove"),
                            confirmColor: "error",
                            onConfirm: () => {
                              setHiddenOrderRefs((prev) => {
                                if (prev.includes(order.ref)) return prev;

                                const next = [...prev, order.ref];
                                localStorage.setItem(HIDDEN_ADMIN_ORDER_HISTORY_KEY, JSON.stringify(next));
                                return next;
                              });
                              setConfirmState((prev) => ({ ...prev, open: false }));
                            },
                          });
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                    <CardContent sx={{ pr: canRemove ? 7 : 2, py: { xs: 1.75, sm: 2 } }}>
                      <Stack spacing={{ xs: 2, sm: 2.5 }}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", md: "center" }}
                          spacing={2}
                        >
                          <Stack spacing={0.75}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="h6" sx={{ overflowWrap: "anywhere" }}>{order.ref}</Typography>
                              <Chip size="small" label={status.label} color={status.color} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {formatOrderTimestamp(order.placedAt)} · {order.form.firstName} {order.form.lastName} · {order.form.fulfillment === "delivery" ? t("admin.delivery") : t("admin.pickup")}
                            </Typography>
                            {order.status === "in_progress" && order.etaMinutes && (
                              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                                ETA: {formatOrderEtaMinutes(order.etaMinutes)}
                              </Typography>
                            )}
                          </Stack>

                          <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={0.25}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: "primary.main" }}>
                              {t("admin.total_with_tax", { total: (order.totalPrice * 1.08).toFixed(2) })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t("admin.subtotal_plus_tax", { subtotal: order.totalPrice.toFixed(2) })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t("admin.items_count", { count: itemCount, suffix: itemCount !== 1 ? "s" : "" })}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Order items — compact by default, expandable when needed */}
                        <Accordion
                          disableGutters
                          elevation={0}
                          sx={{
                            bgcolor: "transparent",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            "&:before": { display: "none" },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon fontSize="small" />}
                            sx={{
                              minHeight: 40,
                              px: 1,
                              "& .MuiAccordionSummary-content": {
                                my: 0.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                              },
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
                              {t("admin.kitchen_items")}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kitchenSummary}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                            <Stack spacing={0.5}>
                              {kitchenLines.map((line, lineIdx) => (
                                <Stack
                                  key={`${order.ref}-${line.id}-${lineIdx}`}
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Typography variant="body2" sx={{ fontSize: "0.86rem" }}>
                                    <strong>{line.cartQuantity}×</strong> {line.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                    {t(`admin.type.${getKitchenItemTypeKey(line.category)}`)} · {line.category}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                            {order.form.comment?.trim() && (
                              <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 0.75 }}>
                                {t("admin.note", { note: order.form.comment.trim() })}
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>

                        <Divider />

                        <Box
                          sx={{
                            display: "grid",
                            gap: 2,
                            gridTemplateColumns: {
                              xs: "1fr",
                              md: "minmax(0, 1fr) minmax(0, 1.2fr)",
                            },
                          }}
                        >
                          <Stack spacing={0.75}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {t("admin.customer")}
                            </Typography>
                            <Typography variant="body2">{order.form.email}</Typography>
                            <Typography variant="body2">{order.form.telephone}</Typography>
                            {order.form.fulfillment === "delivery" && (
                              <Typography variant="body2" color="text.secondary">
                                {order.form.deliveryAddress.address1}, {order.form.deliveryAddress.city}
                              </Typography>
                            )}
                          </Stack>

                          <Stack spacing={1}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {t("admin.update_status")}
                            </Typography>
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, auto)' },
                                gap: 1,
                              }}
                            >
                              {WORKFLOW.map((nextStatus) => {
                                const canTransition = canTransitionOrderStatus(order.status, nextStatus);

                                return (
                                  <Button
                                    key={nextStatus}
                                    size="small"
                                    variant={order.status === nextStatus ? "contained" : "outlined"}
                                    color={STATUS_CONFIG[nextStatus].color === "default" ? "inherit" : STATUS_CONFIG[nextStatus].color}
                                    sx={{ width: '100%', minWidth: 0 }}
                                    disabled={!canTransition || order.status === nextStatus}
                                    onClick={() => {
                                      if (nextStatus === "in_progress" && order.status !== "in_progress") {
                                        setEtaDialogOrderRef(order.ref);
                                        return;
                                      }

                                      if (nextStatus === "cancelled") {
                                        setCancelDialogOrderRef(order.ref);
                                        setCancelNoteInput("");
                                        return;
                                      }

                                      void updateOrderStatus(order.ref, nextStatus);
                                    }}
                                  >
                                    {STATUS_CONFIG[nextStatus].label}
                                  </Button>
                                );
                              })}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {t("admin.workflow_help")}
                            </Typography>
                          </Stack>
                        </Box>
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
                  "linear-gradient(180deg, rgba(12,14,26,0) 0%, rgba(12,14,26,0.76) 52%, rgba(12,14,26,0.98) 100%)",
              }}
            />
          )}

          {showOverflowMask && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1, textAlign: "right" }}
            >
              {t("admin.scroll_older")}
            </Typography>
          )}
        </Box>
      )}

      <ConfirmActionDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        confirmColor={confirmState.confirmColor}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmState.onConfirm}
      />

      <Dialog
        open={Boolean(etaDialogOrderRef)}
        onClose={() => setEtaDialogOrderRef(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("admin.set_prep_time")}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography color="text.secondary" variant="body2">
              {t("admin.choose_eta", { ref: etaDialogOrder?.ref ?? "" })}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {ORDER_ETA_OPTIONS.map((minutes) => (
                <Button key={minutes} variant="outlined" onClick={() => handleChooseEta(minutes)}>
                  {formatOrderEtaMinutes(minutes)}
                </Button>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEtaDialogOrderRef(null)}>{t("admin.cancel")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(cancelDialogOrderRef)}
        onClose={() => {
          setCancelDialogOrderRef(null);
          setCancelNoteInput("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("admin.cancel_order_title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Typography color="text.secondary" variant="body2">
              {t("admin.cancel_order_desc", { ref: cancelDialogOrderRef ?? "" })}
            </Typography>
            <TextField
              label={t("admin.cancel_note")}
              placeholder={t("admin.cancel_note_placeholder")}
              value={cancelNoteInput}
              onChange={(event) => setCancelNoteInput(event.target.value)}
              multiline
              minRows={3}
              inputProps={{ maxLength: 300 }}
              helperText={`${cancelNoteInput.length}/300`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => {
              setCancelDialogOrderRef(null);
              setCancelNoteInput("");
            }}
          >
            {t("admin.back")}
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmCancel}>
            {t("admin.cancel_order")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
