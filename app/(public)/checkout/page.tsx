'use client';

import { useCart } from '@/features/cart/CartContext';
import { useOrderHistory } from '@/features/checkout/OrderHistoryContext';
import type { PlacedOrder } from '@/features/checkout/checkout.types';
import { useOrdersApi } from '@/hooks/useOrdersApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Chip,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Link from 'next/link';

const STRIPE_SESSION_STORAGE_KEY = 'mi_oaxaca_checkout_stripe_session';
const OWNED_ORDER_REFS_KEY = 'mi_oaxaca_owned_order_refs';

function saveOwnedOrderRef(ref: string) {
  try {
    const raw = localStorage.getItem(OWNED_ORDER_REFS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const refs = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];

    if (!refs.includes(ref)) {
      localStorage.setItem(OWNED_ORDER_REFS_KEY, JSON.stringify([ref, ...refs]));
    }
  } catch {
    // ignore localStorage issues in non-browser/private mode
  }
}

export default function CheckoutPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, clearCart } = useCart();
  const { addOrder } = useOrderHistory();
  const { createOrder } = useOrdersApi({ enabled: false, pollIntervalMs: 0 });
  const paymentParam = searchParams.get('payment');
  const cancelledRef = searchParams.get('ref');
  const wasCancelled = paymentParam === 'cancelled';

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    fulfillmentType: 'pickup' as 'pickup' | 'delivery',
    paymentMethod: 'cash' as 'cash' | 'card',
    deliveryAddress: '',
    specialInstructions: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!wasCancelled || !cancelledRef) {
      return;
    }

    let stripeSessionId: string | null = null;
    try {
      stripeSessionId = sessionStorage.getItem(STRIPE_SESSION_STORAGE_KEY);
      sessionStorage.removeItem(STRIPE_SESSION_STORAGE_KEY);
    } catch {
      // ignore sessionStorage access issues
    }

    if (!stripeSessionId) {
      return;
    }

    void fetch('/api/payments/abandon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: cancelledRef, sessionId: stripeSessionId }),
    }).catch(() => null);
  }, [wasCancelled, cancelledRef]);

  if (cart.orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            Cart is empty
          </Typography>
          <Button component={Link} href="/menu" variant="contained" sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff' }}>
            Back to Menu
          </Button>
        </Stack>
      </Container>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.customerEmail.trim()) newErrors.customerEmail = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) newErrors.customerEmail = 'Invalid email';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone is required';
    if (formData.fulfillmentType === 'delivery' && !formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const [firstName, ...rest] = formData.customerName.trim().split(' ');
      const lastName = rest.join(' ').trim();

      const input = {
        form: {
          firstName: firstName || 'Guest',
          lastName,
          email: formData.customerEmail.trim().toLowerCase(),
          telephone: formData.customerPhone.trim(),
          fulfillment: formData.fulfillmentType,
          deliveryAddress: {
            address1: formData.fulfillmentType === 'delivery' ? formData.deliveryAddress.trim() : '',
            city: '',
            state: 'IL',
            postcode: '',
          },
          comment: formData.specialInstructions.trim(),
          payment: formData.paymentMethod,
          termsAgreed: true,
        },
        orders: cart.orders,
        totalPrice: cart.totalPrice,
      };

      if (formData.paymentMethod === 'card') {
        const response = await fetch('/api/payments/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const payload = (await response.json().catch(() => null)) as
          | { checkoutUrl?: string; stripeSessionId?: string; orderRef?: string; error?: string }
          | null;

        if (!response.ok || !payload?.checkoutUrl || !payload?.orderRef) {
          throw new Error(payload?.error ?? 'Unable to initialize secure payment.');
        }

        saveOwnedOrderRef(payload.orderRef);
        try {
          if (payload.stripeSessionId) {
            sessionStorage.setItem(STRIPE_SESSION_STORAGE_KEY, payload.stripeSessionId);
          }
        } catch {
          // ignore sessionStorage access issues
        }

        window.location.href = payload.checkoutUrl;
        return;
      }

      const order = (await createOrder(input)) as PlacedOrder;

      addOrder(order);
      clearCart();
      router.push(`/order-confirmation?ref=${order.ref}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cart.totalPrice;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const totalItems = cart.orders.reduce(
    (acc, order) => acc + order.lines.reduce((lineAcc, line) => lineAcc + line.cartQuantity, 0),
    0,
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, color: 'var(--foreground)', fontFamily: 'Playfair Display' }}>
        Checkout
      </Typography>

      {wasCancelled && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your payment was cancelled. Your order details are still here if you want to try again.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <Box sx={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {errors.submit && (
                <Box sx={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: 1, p: 2 }}>
                  <Typography sx={{ color: '#991b1b' }}>{errors.submit}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
                  Your Information
                </Typography>
                <Stack spacing={2}>
                  <TextField label="Full Name" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} error={!!errors.customerName} helperText={errors.customerName} fullWidth />
                  <TextField label="Email" type="email" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} error={!!errors.customerEmail} helperText={errors.customerEmail} fullWidth />
                  <TextField label="Phone Number" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} error={!!errors.customerPhone} helperText={errors.customerPhone} fullWidth />
                </Stack>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
                  Pickup or Delivery
                </Typography>
                <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                  <FormLabel sx={{ color: 'var(--foreground-secondary)', mb: 1 }}>Choose fulfillment</FormLabel>
                  <RadioGroup
                    value={formData.fulfillmentType}
                    onChange={(e) => setFormData({ ...formData, fulfillmentType: e.target.value as 'pickup' | 'delivery' })}
                    sx={{ gap: 1.25, flexDirection: { xs: 'column', sm: 'row' } }}
                  >
                    <FormControlLabel
                      value="pickup"
                      control={<Radio sx={{ color: 'var(--brand-pink)' }} />}
                      label={<Stack direction="row" spacing={0.75} alignItems="center"><StorefrontIcon fontSize="small" /><span>Pickup</span></Stack>}
                    />
                    <FormControlLabel
                      value="delivery"
                      control={<Radio sx={{ color: 'var(--brand-pink)' }} />}
                      label={<Stack direction="row" spacing={0.75} alignItems="center"><LocalShippingIcon fontSize="small" /><span>Delivery</span></Stack>}
                    />
                  </RadioGroup>
                </FormControl>

                {formData.fulfillmentType === 'pickup' ? (
                  <Paper sx={{ backgroundColor: 'rgba(232, 25, 125, 0.1)', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>637 1st St, Silvis, IL</Typography>
                  </Paper>
                ) : (
                  <TextField label="Delivery Address" value={formData.deliveryAddress} onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })} error={!!errors.deliveryAddress} helperText={errors.deliveryAddress} fullWidth multiline rows={3} />
                )}
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
                  Special Instructions (Optional)
                </Typography>
                <TextField label="e.g., no onions, extra salsa..." value={formData.specialInstructions} onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} fullWidth multiline rows={3} />
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
                  Payment
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel sx={{ color: 'var(--foreground-secondary)', mb: 1 }}>How would you like to pay?</FormLabel>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'card' })}
                    sx={{ gap: 1.25, flexDirection: { xs: 'column', sm: 'row' } }}
                  >
                    <FormControlLabel value="cash" control={<Radio sx={{ color: 'var(--brand-pink)' }} />} label="Cash" />
                    <FormControlLabel value="card" control={<Radio sx={{ color: 'var(--brand-pink)' }} />} label="Card" />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={Link} href="/cart" variant="outlined" sx={{ color: 'var(--brand-pink)', borderColor: 'var(--brand-pink)', width: { xs: '100%', sm: 'auto' } }}>Back to Cart</Button>
                <Button type="submit" disabled={isSubmitting} variant="contained" sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff', flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>

        <Box sx={{ flex: 1, order: { xs: -1, md: 0 } }}>
          <Paper
            sx={{
              backgroundColor: 'var(--card-background)',
              p: 3,
              position: isDesktop ? 'sticky' : 'static',
              top: isDesktop ? 'calc(var(--site-nav-height, 64px) + 16px)' : 'auto',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1.5, color: 'var(--brand-pink)', fontFamily: 'Playfair Display' }}>
              Order Summary
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip size="small" label={`${cart.totalOrders} order${cart.totalOrders === 1 ? '' : 's'}`} sx={{ backgroundColor: 'rgba(232, 25, 125, 0.18)', color: 'var(--brand-pink)' }} />
              <Chip size="small" label={`${totalItems} item${totalItems === 1 ? '' : 's'}`} sx={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground-secondary)' }} />
            </Stack>

            <Stack spacing={1.25} sx={{ mb: 3, maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
              {cart.orders.map((order, index) => (
                <Box key={order.orderId}>
                  <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 700, fontSize: '0.86rem', letterSpacing: '0.02em', mb: 0.75 }}>
                    ORDER {index + 1}
                  </Typography>
                  <Stack spacing={0.65}>
                    {order.lines.map((line) => (
                      <Box key={`${order.orderId}-${line.id}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
                        <Typography sx={{ color: 'var(--foreground)', fontSize: '0.94rem' }}>
                          {line.cartQuantity}x {line.name}
                        </Typography>
                        <Typography sx={{ color: 'var(--foreground)', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                          ${(line.price * line.cartQuantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.4 }}>
                      <Typography sx={{ color: 'var(--foreground-secondary)', fontSize: '0.82rem' }}>Order total</Typography>
                      <Typography sx={{ color: 'var(--foreground-secondary)', fontSize: '0.82rem' }}>${order.total.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                  {index < cart.orders.length - 1 && <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.08)', my: 1.15 }} />}
                </Box>
              ))}
            </Stack>

            <Divider sx={{ backgroundColor: 'rgba(232, 25, 125, 0.2)', my: 2 }} />
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: 'var(--foreground-secondary)' }}>Subtotal:</Typography><Typography sx={{ color: 'var(--foreground)' }}>${subtotal.toFixed(2)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ color: 'var(--foreground-secondary)' }}>Tax (8%):</Typography><Typography sx={{ color: 'var(--foreground)' }}>${tax.toFixed(2)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 1.5, borderTop: '2px solid var(--brand-pink)' }}><Typography sx={{ color: 'var(--brand-pink)', fontWeight: 600 }}>Total:</Typography><Typography sx={{ color: 'var(--brand-pink)', fontWeight: 600, fontSize: '1.2rem' }}>${total.toFixed(2)}</Typography></Box>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
