'use client';

import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useMemo, useState } from 'react';
import ConfirmActionDialog from '@/components/shared/ConfirmActionDialog';
import { useCart } from '@/features/cart/CartContext';
import { formatOrderTimestamp } from '@/features/checkout/order-format';
import type { OrderStatus } from '@/features/checkout/checkout.types';
import { formatOrderEtaMinutes } from '@/features/checkout/order-status';
import { useOrdersApi } from '@/hooks/useOrdersApi';
import { useI18n } from '@/components/shared/I18nProvider';

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    color: 'default' | 'warning' | 'info' | 'success' | 'error';
  }
> = {
  pending: {
    color: 'default',
  },
  in_progress: {
    color: 'warning',
  },
  ready: {
    color: 'info',
  },
  completed: {
    color: 'success',
  },
  cancelled: {
    color: 'error',
  },
};

const STATUS_ORDER: OrderStatus[] = ['pending', 'in_progress', 'ready', 'completed'];

type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: 'primary' | 'error' | 'warning';
  onConfirm: () => void | Promise<void>;
};

export default function OrderDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const router = useRouter();
  const { cart, remakeOrder } = useCart();
  const { t } = useI18n();
  const { order, loading, error, updateOrderStatus } = useOrdersApi({
    ref,
    pollIntervalMs: 5000,
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: '',
    confirmColor: 'primary',
    onConfirm: () => {},
  });

  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false }));

  const tax = useMemo(() => (order ? order.totalPrice * 0.08 : 0), [order]);
  const total = useMemo(() => (order ? order.totalPrice + tax : 0), [order, tax]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography sx={{ color: 'var(--foreground-secondary)' }}>{t('order_detail.loading')}</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Button component={Link} href="/orders" sx={{ color: 'var(--brand-pink)', width: 'fit-content' }}>
            {t('order_detail.back_orders')}
          </Button>
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            {t('order_detail.not_found')}
          </Typography>
          <Typography sx={{ color: 'var(--foreground-secondary)' }}>
            {error ?? t('order_detail.not_found_copy')}
          </Typography>
        </Stack>
      </Container>
    );
  }

  const fullName = `${order.form.firstName} ${order.form.lastName}`.trim();
  const isDelivery = order.form.fulfillment === 'delivery';
  const status = STATUS_CONFIG[order.status];
  const progressIndex = STATUS_ORDER.indexOf(order.status);
  const pickupMessageKey: Record<OrderStatus, string> = {
    pending: 'order_detail.pickup_pending',
    in_progress: 'order_detail.pickup_in_progress',
    ready: 'order_detail.pickup_ready',
    completed: 'order_detail.pickup_completed',
    cancelled: 'order_detail.pickup_cancelled',
  };

  const handleRemakeOrder = () => {
    if (cart.totalOrders > 0) {
      setConfirmState({
        open: true,
        title: t('order_detail.replace_title'),
        description: t('order_detail.replace_desc'),
        confirmLabel: t('orders.replace_cart'),
        confirmColor: 'warning',
        onConfirm: () => {
          remakeOrder(order.orders);
          closeConfirm();
          router.push('/checkout');
        },
      });
      return;
    }

    remakeOrder(order.orders);
    router.push('/checkout');
  };

  const handleCancelOrder = () => {
    setConfirmState({
      open: true,
        title: t('orders.cancel_title'),
        description: t('orders.cancel_desc'),
        confirmLabel: t('orders.cancel'),
      confirmColor: 'error',
      onConfirm: async () => {
        await updateOrderStatus(order.ref, 'cancelled');
        closeConfirm();
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - var(--site-nav-height, 64px))',
        background:
          'radial-gradient(1000px 420px at 10% 0%, rgba(232,25,125,0.08), rgba(232,25,125,0) 60%), radial-gradient(820px 360px at 100% 0%, rgba(6,182,212,0.08), rgba(6,182,212,0) 58%)',
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box
            className="altar-surface"
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 3,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Stack spacing={1.25}>
              <Button component={Link} href="/orders" size="small" sx={{ color: 'var(--brand-pink)', width: 'fit-content', pl: 0 }}>
                {t('order_detail.my_orders')}
              </Button>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                    <Typography variant="h4" sx={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: { xs: '2rem', sm: '2.5rem' }, overflowWrap: 'anywhere' }}>
                      {order.ref}
                    </Typography>
                    <Chip label={t(`status.${order.status}`)} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                    {t('order_detail.placed', { date: formatOrderTimestamp(order.placedAt) })}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    minWidth: { sm: 220 },
                    width: { xs: '100%', sm: 'auto' },
                    p: 1.1,
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.035)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', textAlign: 'center' }}>
                    {t('order_detail.current_status')}
                  </Typography>
                  <Typography sx={{ color: 'var(--foreground)', fontWeight: 800, mt: 0.35, textAlign: 'center' }}>
                    {t(`status.${order.status}`)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

        {order.status !== 'cancelled' && (
          <Card
            variant="outlined"
            sx={{
              background: 'rgba(19,22,41,0.78)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <CardContent>
              <Stack spacing={1.2}>
                <Typography variant="subtitle2" sx={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('order_detail.progress')}
                </Typography>
                <Stack direction="row" spacing={{ xs: 0.9, sm: 1.25 }} alignItems="flex-start" sx={{ overflowX: 'auto', pb: 0.25, pt: 0.25 }}>
                  {STATUS_ORDER.map((step, index) => {
                    const isActive = step === order.status;
                    const isComplete = progressIndex >= index && progressIndex !== -1;

                    return (
                      <Stack key={step} direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 'fit-content' }}>
                        <Stack spacing={0.55} alignItems="center" justifyContent="flex-start" sx={{ minWidth: { xs: 74, sm: 84 } }}>
                          <Box
                            sx={{
                              width: 13,
                              height: 13,
                              borderRadius: '50%',
                              background: isComplete ? 'var(--brand-pink)' : 'rgba(255,255,255,0.12)',
                              boxShadow: isActive ? '0 0 0 6px rgba(232,25,125,0.12)' : 'none',
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: isActive ? 'var(--foreground)' : 'var(--foreground-muted)',
                              fontWeight: isActive ? 700 : 500,
                              textAlign: 'center',
                              lineHeight: 1.15,
                            }}
                          >
                            {t(`status.${step}`)}
                          </Typography>
                        </Stack>
                        {index < STATUS_ORDER.length - 1 && (
                          <Box
                            sx={{
                              width: { xs: 24, sm: 52 },
                              height: 2,
                              borderRadius: 999,
                              background: progressIndex > index ? 'var(--brand-pink)' : 'rgba(255,255,255,0.08)',
                            }}
                          />
                        )}
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Card
          variant="outlined"
          sx={{
            borderColor: `${status.color}.main`,
            background: 'rgba(19,22,41,0.78)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <CardContent>
            <Stack spacing={0.5}>
              <Typography variant="body1">{t(`status.${order.status}_desc`)}</Typography>
              {order.status === 'in_progress' && order.etaMinutes && (
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 700 }}>
                  {t('orders.estimated', { eta: formatOrderEtaMinutes(order.etaMinutes) })}
                </Typography>
              )}
              {order.status === 'cancelled' && order.cancellationNote?.trim() && (
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 700 }}>
                  {t('order_detail.restaurant_note', { note: order.cancellationNote })}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
          <Stack spacing={2.5} sx={{ flex: 1 }}>
            <Card variant="outlined" sx={{ background: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)', boxShadow: 'var(--shadow-soft)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
                  {t('order_detail.items')}
                </Typography>
                <Stack spacing={1.5}>
                  {order.orders.map((entry, index) => (
                    <Stack key={entry.orderId} spacing={0.7}>
                      <Chip label={`Order ${index + 1}`} size="small" sx={{ width: 'fit-content', color: '#fff', backgroundColor: 'var(--brand-pink)' }} />
                      {entry.lines.map((line) => (
                        <Box key={`${entry.orderId}-${line.id}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.25, sm: 1 }, pl: 1 }}>
                          <Typography variant="body2" sx={{ color: 'var(--foreground)', overflowWrap: 'anywhere' }}>
                            {line.cartQuantity}x {line.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                            ${(line.price * line.cartQuantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ))}

                  <Divider sx={{ backgroundColor: 'rgba(232, 25, 125, 0.2)' }} />

                  <Stack spacing={0.6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                        {t('cart.subtotal')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        ${order.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                        {t('cart.tax')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        ${tax.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.6 }}>
                      <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 700 }}>{t('cart.total')}</Typography>
                      <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 700 }}>${total.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2} sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
            <Card variant="outlined" sx={{ background: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)', boxShadow: 'var(--shadow-soft)' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                  {isDelivery ? <DeliveryDiningIcon color="primary" fontSize="small" /> : <StorefrontIcon color="primary" fontSize="small" />}
                  <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)' }}>
                    {isDelivery ? t('checkout.delivery') : t('checkout.pickup')}
                  </Typography>
                </Stack>
                {isDelivery ? (
                  <Stack>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                      {order.form.deliveryAddress.address1}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                      {order.form.deliveryAddress.city}
                      {order.form.deliveryAddress.state ? `, ${order.form.deliveryAddress.state}` : ''}
                      {order.form.deliveryAddress.postcode ? ` ${order.form.deliveryAddress.postcode}` : ''}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    {t(pickupMessageKey[order.status])}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ background: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)', boxShadow: 'var(--shadow-soft)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)', mb: 0.75 }}>
                  {t('order_detail.contact')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                  {fullName || t('guest.guest')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                  {order.form.email}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                  {order.form.telephone}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ background: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)', boxShadow: 'var(--shadow-soft)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)', mb: 0.75 }}>
                  {t('order_detail.payment')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                  {order.form.payment === 'card' ? t('checkout.card') : t('checkout.cash')}
                </Typography>
              </CardContent>
            </Card>

            {order.form.comment.trim() && (
              <Card variant="outlined" sx={{ background: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)', boxShadow: 'var(--shadow-soft)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)', mb: 0.75 }}>
                    {t('order_detail.instructions')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    {order.form.comment}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button variant="contained" onClick={handleRemakeOrder} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {t('order_detail.remake')}
          </Button>
          <Button variant="outlined" component={Link} href="/menu" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {t('order_detail.browse')}
          </Button>
          <Button variant="outlined" component={Link} href="/orders" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {t('order_detail.all')}
          </Button>
          {order.status === 'pending' && (
            <Button variant="outlined" color="error" onClick={handleCancelOrder} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {t('orders.cancel')}
            </Button>
          )}
        </Stack>

        <ConfirmActionDialog
          open={confirmState.open}
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          confirmColor={confirmState.confirmColor}
          onClose={closeConfirm}
          onConfirm={confirmState.onConfirm}
        />
      </Stack>
      </Container>
    </Box>
  );
}
