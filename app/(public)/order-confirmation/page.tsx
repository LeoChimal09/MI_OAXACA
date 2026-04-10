'use client';

import { useSearchParams } from 'next/navigation';
import { useCart } from '@/features/cart/CartContext';
import { useOrdersApi } from '@/hooks/useOrdersApi';
import {
  Container,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Link from 'next/link';
import { useEffect } from 'react';

export default function OrderConfirmationPage() {
  const params = useSearchParams();
  const ref = params.get('ref');
  const payment = params.get('payment');
  const sessionId = params.get('session_id');
  const { clearCart } = useCart();
  const { order, loading, error, refetch } = useOrdersApi({ ref, enabled: Boolean(ref) });

  useEffect(() => {
    if (payment === 'success') {
      clearCart();
    }
  }, [payment, clearCart]);

  useEffect(() => {
    if (payment !== 'success' || !ref || !sessionId) {
      return;
    }

    let cancelled = false;

    async function confirmStripePayment() {
      await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, sessionId }),
      }).catch(() => null);

      if (!cancelled) {
        void refetch();
      }
    }

    void confirmStripePayment();

    return () => {
      cancelled = true;
    };
  }, [payment, ref, sessionId, refetch]);

  const notFound = !ref || (!loading && !order);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading order...</Typography>
      </Container>
    );
  }

  if (notFound) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            Order not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error ?? 'This confirmation link may be invalid or has expired.'}
          </Typography>
          <Button
            component={Link}
            href="/menu"
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff' }}
          >
            Back to Menu
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!order) {
    return null;
  }

  const { form, orders, totalPrice } = order;
  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;
  const isDelivery = form.fulfillment === 'delivery';
  const paymentStatusLabel = order.paymentStatus ? order.paymentStatus.replaceAll('_', ' ') : 'paid';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Card sx={{ backgroundColor: 'success.50', borderColor: 'success.main' }} variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Order Placed!
                </Typography>
                <Typography color="text.secondary">
                  Thank you, {form.firstName}. Your order reference is <strong>{order.ref}</strong>.
                </Typography>
                {form.payment === 'card' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Payment status: {paymentStatusLabel}
                  </Typography>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Stack spacing={3} sx={{ flex: 1 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Your Order
                </Typography>
                <Stack spacing={2}>
                  {orders.map((entry, i) => (
                    <Stack key={entry.orderId} spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip label={`Order ${i + 1}`} size="small" color="primary" />
                      </Stack>
                      {entry.lines.map((line) => (
                        <Stack
                          key={line.id}
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          sx={{ pl: 1 }}
                        >
                          <Typography variant="body2">
                            {line.cartQuantity}× {line.name}
                          </Typography>
                          <Typography variant="body2">${(line.price * line.cartQuantity).toFixed(2)}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  ))}

                  <Divider />

                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Subtotal</Typography>
                      <Typography variant="body2">${totalPrice.toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Est. tax (8%)</Typography>
                      <Typography variant="body2">${tax.toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Total
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ${total.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2} sx={{ width: { xs: '100%', sm: 260 }, flexShrink: 0 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  {isDelivery ? <DeliveryDiningIcon color="primary" fontSize="small" /> : <StorefrontIcon color="primary" fontSize="small" />}
                  <Typography variant="subtitle2" color="text.secondary">
                    {isDelivery ? 'Delivery Address' : 'Pickup'}
                  </Typography>
                </Stack>
                {isDelivery ? (
                  <Stack>
                    <Typography variant="body2">{form.deliveryAddress.address1}</Typography>
                    <Typography variant="body2">
                      {form.deliveryAddress.city}
                      {form.deliveryAddress.state ? `, ${form.deliveryAddress.state}` : ''}
                      {form.deliveryAddress.postcode ? ` ${form.deliveryAddress.postcode}` : ''}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Ready for in-store pickup
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Payment
                </Typography>
                <Typography variant="body2">
                  {form.payment === 'cash' ? 'Cash on Pickup / Delivery' : 'Pay by Card'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button component={Link} href="/orders" variant="outlined" sx={{ flex: 1 }}>
            View My Orders
          </Button>
          <Button component={Link} href="/menu" variant="contained" sx={{ flex: 1 }}>
            Continue Shopping
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
