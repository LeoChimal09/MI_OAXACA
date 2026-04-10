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

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: 'default' | 'warning' | 'info' | 'success' | 'error';
    description: string;
  }
> = {
  pending: {
    label: 'Pending',
    color: 'default',
    description: "We've received your order and are getting it ready.",
  },
  in_progress: {
    label: 'In Progress',
    color: 'warning',
    description: 'Your order is being prepared in the kitchen.',
  },
  ready: {
    label: 'Ready',
    color: 'info',
    description: 'Your order is ready. Please come collect it or await delivery.',
  },
  completed: {
    label: 'Completed',
    color: 'success',
    description: 'Your order has been delivered or collected. Enjoy!',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'error',
    description: 'This order has been cancelled.',
  },
};

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
  const { order, loading, error, updateOrderStatus } = useOrdersApi({ ref });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    confirmColor: 'primary',
    onConfirm: () => {},
  });

  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, open: false }));

  const tax = useMemo(() => (order ? order.totalPrice * 0.08 : 0), [order]);
  const total = useMemo(() => (order ? order.totalPrice + tax : 0), [order, tax]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography sx={{ color: 'var(--foreground-secondary)' }}>Loading order...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Button component={Link} href="/orders" sx={{ color: 'var(--brand-pink)', width: 'fit-content' }}>
            Back to Orders
          </Button>
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            Order not found
          </Typography>
          <Typography sx={{ color: 'var(--foreground-secondary)' }}>
            {error ?? 'This order may no longer be available.'}
          </Typography>
        </Stack>
      </Container>
    );
  }

  const fullName = `${order.form.firstName} ${order.form.lastName}`.trim();
  const isDelivery = order.form.fulfillment === 'delivery';
  const status = STATUS_CONFIG[order.status];

  const handleRemakeOrder = () => {
    if (cart.totalOrders > 0) {
      setConfirmState({
        open: true,
        title: 'Replace current cart?',
        description:
          'Your current cart will be replaced with this previous order. You can review and edit before placing it.',
        confirmLabel: 'Replace Cart',
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
      title: 'Cancel this order?',
      description: 'This order is still pending, so it can be cancelled now and kept in your history.',
      confirmLabel: 'Cancel Order',
      confirmColor: 'error',
      onConfirm: async () => {
        await updateOrderStatus(order.ref, 'cancelled');
        closeConfirm();
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3.5}>
        <Stack spacing={1}>
          <Button component={Link} href="/orders" size="small" sx={{ color: 'var(--brand-pink)', width: 'fit-content', pl: 0 }}>
            My Orders
          </Button>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography variant="h5" sx={{ color: 'var(--brand-pink)', fontFamily: 'monospace', fontWeight: 600 }}>
              {order.ref}
            </Typography>
            <Chip label={status.label} size="small" variant="outlined" />
          </Stack>
          <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
            Placed {formatOrderTimestamp(order.placedAt)}
          </Typography>
        </Stack>

        <Card variant="outlined" sx={{ borderColor: `${status.color}.main` }}>
          <CardContent>
            <Stack spacing={0.5}>
              <Typography variant="body1">{status.description}</Typography>
              {order.status === 'in_progress' && order.etaMinutes && (
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 700 }}>
                  Estimated time: {formatOrderEtaMinutes(order.etaMinutes)}
                </Typography>
              )}
              {order.status === 'cancelled' && order.cancellationNote?.trim() && (
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 700 }}>
                  Restaurant note: {order.cancellationNote}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Stack spacing={2.5} sx={{ flex: 1 }}>
            <Card variant="outlined" sx={{ backgroundColor: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
                  Items Ordered
                </Typography>
                <Stack spacing={1.5}>
                  {order.orders.map((entry, index) => (
                    <Stack key={entry.orderId} spacing={0.7}>
                      <Chip label={`Order ${index + 1}`} size="small" sx={{ width: 'fit-content', color: '#fff', backgroundColor: 'var(--brand-pink)' }} />
                      {entry.lines.map((line) => (
                        <Box key={`${entry.orderId}-${line.id}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 1 }}>
                          <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
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
                        Subtotal
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        ${order.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                        Tax (8%)
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        ${tax.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.6 }}>
                      <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 700 }}>Total</Typography>
                      <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 700 }}>${total.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2} sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
            <Card variant="outlined" sx={{ backgroundColor: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                  {isDelivery ? <DeliveryDiningIcon color="primary" fontSize="small" /> : <StorefrontIcon color="primary" fontSize="small" />}
                  <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)' }}>
                    {isDelivery ? 'Delivery' : 'Pickup'}
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
                    Ready for in-store pickup
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ backgroundColor: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)', mb: 0.75 }}>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                  {fullName || 'Guest'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                  {order.form.email}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                  {order.form.telephone}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ backgroundColor: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)', mb: 0.75 }}>
                  Payment
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                  {order.form.payment === 'card' ? 'Card' : 'Cash'}
                </Typography>
              </CardContent>
            </Card>

            {order.form.comment.trim() && (
              <Card variant="outlined" sx={{ backgroundColor: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)', mb: 0.75 }}>
                    Special Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    {order.form.comment}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" onClick={handleRemakeOrder}>
            Remake Order
          </Button>
          <Button variant="outlined" component={Link} href="/menu">
            Browse Menu
          </Button>
          <Button variant="outlined" component={Link} href="/orders">
            All Orders
          </Button>
          {order.status === 'pending' && (
            <Button variant="outlined" color="error" onClick={handleCancelOrder}>
              Cancel Order
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
  );
}
