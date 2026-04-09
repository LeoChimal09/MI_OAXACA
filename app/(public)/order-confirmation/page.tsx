'use client';

import { useSearchParams } from 'next/navigation';
import { useOrderHistory } from '@/features/checkout/OrderHistoryContext';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const { getOrder } = useOrderHistory();
  const ref = searchParams.get('ref');
  const order = ref ? getOrder(ref) : undefined;

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            Order not found
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

  const placedTime = new Date(order.placedAt);
  const etaTime = new Date(placedTime.getTime() + 30 * 60 * 1000);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: '4rem', color: '#22c55e', mb: 2 }} />
        <Typography variant="h3" sx={{ color: 'var(--foreground)', fontFamily: 'Playfair Display', mb: 1 }}>
          Order Confirmed!
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--foreground-secondary)' }}>
          Thank you for your order, {order.form.firstName}!
        </Typography>
      </Box>

      <Paper sx={{ backgroundColor: 'rgba(232, 25, 125, 0.1)', border: '2px solid var(--brand-pink)', p: 3, textAlign: 'center', mb: 4 }}>
        <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)', mb: 1 }}>
          Order Reference
        </Typography>
        <Typography variant="h4" sx={{ color: 'var(--brand-pink)', fontFamily: 'Playfair Display', fontSize: '2.5rem', letterSpacing: '2px', mb: 2 }}>
          {order.ref}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
          Save this reference to track your order
        </Typography>
      </Paper>

      <Alert severity="info" sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6', mb: 4, color: 'var(--foreground)' }}>
        A confirmation email has been sent to <strong>{order.form.email}</strong>
      </Alert>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ backgroundColor: 'var(--card-background)', p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
              Items
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {order.orders.flatMap((entry) => entry.lines).map((item, idx) => (
                <Box key={`${item.id}-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--foreground)' }}>
                    {item.cartQuantity}x {item.name}
                  </Typography>
                  <Typography sx={{ color: 'var(--foreground)' }}>
                    ${(item.price * item.cartQuantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ backgroundColor: 'rgba(232, 25, 125, 0.2)', my: 2 }} />

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: 'var(--foreground-secondary)' }}>Subtotal:</Typography>
                <Typography sx={{ color: 'var(--foreground)' }}>${order.totalPrice.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: 'var(--foreground-secondary)' }}>Tax (8%):</Typography>
                <Typography sx={{ color: 'var(--foreground)' }}>${(order.totalPrice * 0.08).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(232, 25, 125, 0.2)' }}>
                <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 600 }}>Total:</Typography>
                <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 600, fontSize: '1.1rem' }}>
                  ${(order.totalPrice * 1.08).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ backgroundColor: 'var(--card-background)', p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
              {order.form.fulfillment === 'pickup' ? 'Pickup Details' : 'Delivery Details'}
            </Typography>

            {order.form.fulfillment === 'pickup' ? (
              <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                637 1st St
                <br />
                Silvis, IL
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'var(--foreground)', whiteSpace: 'pre-wrap' }}>
                {order.form.deliveryAddress.address1}
              </Typography>
            )}

            <Divider sx={{ backgroundColor: 'rgba(232, 25, 125, 0.2)', my: 2 }} />

            <Box sx={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)', mb: 0.5 }}>
                Estimated Time
              </Typography>
              <Typography variant="h6" sx={{ color: '#22c55e', fontFamily: 'Playfair Display' }}>
                {etaTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button component={Link} href="/orders" variant="outlined" sx={{ color: 'var(--brand-pink)', borderColor: 'var(--brand-pink)', flex: 1 }}>
          View My Orders
        </Button>
        <Button
          component={Link}
          href="/menu"
          variant="contained"
          sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff', flex: 1 }}
        >
          Continue Shopping
        </Button>
      </Stack>
    </Container>
  );
}
