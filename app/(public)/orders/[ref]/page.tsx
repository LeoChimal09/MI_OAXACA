'use client';

import { useOrderHistory } from '@/features/checkout/OrderHistoryContext';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const { getOrder } = useOrderHistory();
  const [copied, setCopied] = useState(false);
  const refParam = params.ref;
  const ref = Array.isArray(refParam) ? refParam[0] : refParam;
  const order = ref ? getOrder(ref) : undefined;

  const handleCopyRef = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Button component={Link} href="/orders" startIcon={<ArrowBackIcon />} sx={{ color: 'var(--brand-pink)', width: 'fit-content' }}>
            Back to Orders
          </Button>
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            Order not found
          </Typography>
        </Stack>
      </Container>
    );
  }

  const placedTime = new Date(order.placedAt);
  const tax = order.totalPrice * 0.08;
  const total = order.totalPrice + tax;
  const fullName = `${order.form.firstName} ${order.form.lastName}`.trim();
  const isDelivery = order.form.fulfillment === 'delivery';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3.5}>
        <Stack spacing={1}>
          <Button component={Link} href="/orders" startIcon={<ArrowBackIcon />} size="small" sx={{ color: 'var(--brand-pink)', width: 'fit-content', pl: 0 }}>
            My Orders
          </Button>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography variant="h5" sx={{ color: 'var(--brand-pink)', fontFamily: 'monospace', fontWeight: 600 }}>
              {order.ref}
            </Typography>
            <Chip label={order.status} size="small" variant="outlined" />
            <Button onClick={handleCopyRef} startIcon={<ContentCopyIcon />} size="small" sx={{ color: 'var(--brand-pink)', textTransform: 'none' }}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>
            Placed {placedTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
            {placedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </Typography>
        </Stack>

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
                      <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>Subtotal</Typography>
                      <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>${order.totalPrice.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>Tax (8%)</Typography>
                      <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>${tax.toFixed(2)}</Typography>
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
                  {isDelivery ? (
                    <DeliveryDiningIcon color="primary" fontSize="small" />
                  ) : (
                    <StorefrontIcon color="primary" fontSize="small" />
                  )}
                  <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)' }}>
                    {isDelivery ? 'Delivery' : 'Pickup'}
                  </Typography>
                </Stack>
                {isDelivery ? (
                  <Typography variant="body2" sx={{ color: 'var(--foreground)', whiteSpace: 'pre-wrap' }}>
                    {order.form.deliveryAddress.address1}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                    637 1st St, Silvis, IL
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ backgroundColor: 'var(--card-background)', borderColor: 'rgba(232, 25, 125, 0.18)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: 'var(--foreground-secondary)', mb: 0.75 }}>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>{fullName || 'Guest'}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>{order.form.email}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--foreground-secondary)' }}>{order.form.telephone}</Typography>
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
      </Stack>
    </Container>
  );
}
