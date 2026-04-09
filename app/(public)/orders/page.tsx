'use client';

import { useOrderHistory } from '@/features/checkout/OrderHistoryContext';
import { useCart } from '@/features/cart/CartContext';
import type { OrderStatus, PlacedOrder } from '@/features/checkout/checkout.types';
import { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderSummary {
  ref: string;
  customerName: string;
  total: number;
  placedAt: string;
  status: OrderStatus;
  fulfillment: 'pickup' | 'delivery';
  itemCount: number;
  source: PlacedOrder;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
  pending: { label: 'Pending', color: 'default' },
  in_progress: { label: 'In Progress', color: 'warning' },
  ready: { label: 'Ready', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { orders: historyOrders, cancelOrder, removeFromHistory } = useOrderHistory();
  const { cart, remakeOrder } = useCart();
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const orders: OrderSummary[] = historyOrders.map((order: PlacedOrder) => ({
    ref: order.ref,
    customerName: `${order.form.firstName} ${order.form.lastName}`.trim() || 'Guest',
    total: order.totalPrice * 1.08,
    placedAt: order.placedAt,
    status: order.status,
    fulfillment: order.form.fulfillment,
    itemCount: order.orders.reduce((acc, entry) => acc + entry.lines.reduce((lineAcc, line) => lineAcc + line.cartQuantity, 0), 0),
    source: order,
  }));

  const handleRemake = (source: PlacedOrder) => {
    remakeOrder(source.orders);
    router.push(cart.totalOrders > 0 ? '/cart' : '/checkout');
  };

  const canRemoveFromHistory = (status: OrderStatus) =>
    status === 'completed' || status === 'cancelled';

  const removableOrders = orders.filter((order) => canRemoveFromHistory(order.status));

  const handleClearHistory = () => {
    if (removableOrders.length === 0) return;
    setConfirmState({
      open: true,
      title: 'Clear order history?',
      description: `This will remove ${removableOrders.length} completed/cancelled order${removableOrders.length === 1 ? '' : 's'} from your local history.`,
      confirmLabel: 'Clear History',
      onConfirm: () => {
        removableOrders.forEach((order) => removeFromHistory(order.ref));
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            No orders yet
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--foreground-secondary)' }}>
            Start ordering from our menu now
          </Typography>
          <Button
            component={Link}
            href="/menu"
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)',
              color: '#fff',
              textTransform: 'capitalize',
              fontSize: '1rem',
              py: 1.5,
              px: 4,
              mt: 2,
            }}
          >
            Browse Menu
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <Typography variant="h3" sx={{ color: 'var(--foreground)', fontFamily: 'Playfair Display' }}>
          My Orders
        </Typography>
        {removableOrders.length > 0 && (
          <Button size="small" variant="outlined" color="error" onClick={handleClearHistory}>
            Clear History
          </Button>
        )}
      </Stack>

      <Stack spacing={2}>
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.status];
          const canRemove = canRemoveFromHistory(order.status);
          return (
            <Card
              key={order.ref}
              variant="outlined"
              sx={{
                position: 'relative',
                backgroundColor: 'var(--card-background)',
                borderColor: 'rgba(232, 25, 125, 0.18)',
                '&:hover': {
                  borderColor: 'var(--brand-pink)',
                  backgroundColor: 'rgba(232, 25, 125, 0.03)',
                },
              }}
            >
              {canRemove && (
                <IconButton
                  size="small"
                  aria-label={`Remove ${order.ref} from history`}
                  onClick={() =>
                    setConfirmState({
                      open: true,
                      title: 'Remove order from history?',
                      description: 'This removes the order from this browser history list only.',
                      confirmLabel: 'Remove',
                      onConfirm: () => {
                        removeFromHistory(order.ref);
                        setConfirmState((prev) => ({ ...prev, open: false }));
                      },
                    })
                  }
                  sx={{ position: 'absolute', top: 8, right: 8, color: 'var(--foreground-secondary)' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}

              <CardContent sx={{ pr: canRemove ? 5 : 2 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                  >
                    <Stack spacing={0.4}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1" sx={{ color: 'var(--foreground)', fontWeight: 700, fontFamily: 'monospace' }}>
                          {order.ref}
                        </Typography>
                        <Chip label={status.label} color={status.color} size="small" />
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
                        {new Date(order.placedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        {new Date(order.placedAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}{' '}
                        · {order.itemCount} item{order.itemCount === 1 ? '' : 's'} · {order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--foreground-secondary)' }}>
                        {order.customerName}
                      </Typography>
                    </Stack>

                    <Typography variant="h6" sx={{ color: 'var(--brand-pink)', fontWeight: 700 }}>
                      ${order.total.toFixed(2)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button component={Link} href={`/orders/${order.ref}`} size="small" variant="outlined" sx={{ borderColor: 'var(--brand-pink)', color: 'var(--brand-pink)' }}>
                      View Details
                    </Button>
                    <Button size="small" variant="contained" onClick={() => handleRemake(order.source)} sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff' }}>
                      Remake Order
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => cancelOrder(order.ref)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Button component={Link} href="/menu" variant="outlined" sx={{ color: 'var(--brand-pink)', borderColor: 'var(--brand-pink)' }}>
          Place Another Order
        </Button>
      </Box>

      <Dialog
        open={confirmState.open}
        onClose={() => setConfirmState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{confirmState.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmState.description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmState((prev) => ({ ...prev, open: false }))}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmState.onConfirm}>
            {confirmState.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
