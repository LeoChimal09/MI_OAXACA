'use client';

import { useCart } from '@/features/cart/CartContext';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/shared/I18nProvider';

export default function CartPage() {
  const { t } = useI18n();
  const { cart, updateOrderLine, removeOrder, clearCart } = useCart();
  const router = useRouter();

  const handleStartFresh = () => {
    clearCart();
    router.push('/menu');
  };

  if (cart.orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography variant="h4" sx={{ color: 'var(--foreground)' }}>
            {t('cart.empty_title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--foreground-secondary)' }}>
            {t('cart.empty_copy')}
          </Typography>
          <Button component={Link} href="/menu" variant="contained" sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff', textTransform: 'capitalize', fontSize: '1rem', py: 1.5, px: 4, mt: 2 }}>
            {t('cart.continue_shopping')}
          </Button>
        </Stack>
      </Container>
    );
  }

  const subtotal = cart.totalPrice;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h3" sx={{ mb: 3, color: 'var(--foreground)', fontFamily: 'Playfair Display', fontSize: { xs: '2rem', sm: '2.5rem' } }}>
        {t('cart.title')}
      </Typography>
      <Typography variant="body2" sx={{ mt: -2, mb: 3, color: 'var(--foreground-secondary)' }}>
        {t('cart.count', { count: cart.totalOrders, suffix: cart.totalOrders === 1 ? '' : 's' })}
      </Typography>

      <Stack spacing={2.5} sx={{ mb: 4 }}>
        {cart.orders.map((order, index) => (
          <Paper key={order.orderId} sx={{ backgroundColor: 'var(--card-background)', border: '1px solid rgba(232, 25, 125, 0.18)', borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 },
                px: { xs: 2, sm: 2.5 },
                py: 1.5,
                backgroundColor: 'rgba(232, 25, 125, 0.08)',
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip label={`Order ${index + 1}`} size="small" sx={{ color: '#fff', backgroundColor: 'var(--brand-pink)', fontWeight: 600 }} />
                <Typography sx={{ color: 'var(--foreground-secondary)' }}>
                  {t('cart.item_count', { count: order.lines.length, suffix: order.lines.length === 1 ? '' : 's' })}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
                <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 700 }}>
                  ${order.total.toFixed(2)}
                </Typography>
                <Button size="small" color="error" onClick={() => removeOrder(order.orderId)}>
                  {t('cart.remove')}
                </Button>
              </Stack>
            </Box>

            <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />}>
              {order.lines.map((line) => (
                <Box
                  key={`${order.orderId}-${line.id}`}
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: 1.5,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1.2fr auto auto auto auto' },
                    gap: { xs: 1.1, sm: 2 },
                    alignItems: 'center',
                  }}
                >
                  <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ color: 'var(--foreground)', fontWeight: 600, lineHeight: 1.2 }}>
                      {line.name}
                    </Typography>
                    <Typography sx={{ color: 'var(--foreground-secondary)', fontSize: '0.92rem' }}>
                      ${line.price.toFixed(2)} {t('cart.each')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', sm: 'center' }} alignItems="center">
                    <IconButton size="small" onClick={() => updateOrderLine(order.orderId, line.id, line.cartQuantity - 1)} disabled={line.cartQuantity <= 1} sx={{ color: 'var(--brand-pink)' }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 22, textAlign: 'center', color: 'var(--foreground)', fontWeight: 600 }}>
                      {line.cartQuantity}
                    </Typography>
                    <IconButton size="small" onClick={() => updateOrderLine(order.orderId, line.id, line.cartQuantity + 1)} sx={{ color: 'var(--brand-pink)' }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography sx={{ color: 'var(--foreground)', fontWeight: 600, textAlign: { xs: 'left', sm: 'right' } }}>
                    ${(line.price * line.cartQuantity).toFixed(2)}
                  </Typography>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <IconButton size="small" onClick={() => updateOrderLine(order.orderId, line.id, 0)} sx={{ color: '#ef4444' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Paper sx={{ backgroundColor: 'var(--card-background)', p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: 'var(--foreground)' }}>{t('cart.subtotal')}</Typography>
            <Typography sx={{ color: 'var(--foreground)', fontSize: '1.1rem' }}>${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: 'var(--foreground)' }}>{t('cart.tax')}</Typography>
            <Typography sx={{ color: 'var(--foreground)', fontSize: '1.1rem' }}>${tax.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2, borderTop: '2px solid var(--brand-pink)' }}>
            <Typography variant="h6" sx={{ color: 'var(--brand-pink)', fontWeight: 600 }}>{t('cart.total')}</Typography>
            <Typography variant="h5" sx={{ color: 'var(--brand-pink)', fontWeight: 600 }}>${total.toFixed(2)}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Button component={Link} href="/menu" variant="outlined" sx={{ color: 'var(--brand-pink)', borderColor: 'var(--brand-pink)', flex: 1 }}>
          {t('cart.continue_shopping')}
        </Button>
        <Button component={Link} href="/checkout" variant="contained" sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff', flex: 1 }}>
          {t('cart.checkout')}
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button onClick={clearCart} variant="text" sx={{ color: '#ef4444', justifyContent: 'flex-start', width: { xs: '100%', sm: 'auto' } }}>
          {t('cart.clear')}
        </Button>
        <Button onClick={handleStartFresh} variant="text" sx={{ color: '#f97316', justifyContent: 'flex-start', width: { xs: '100%', sm: 'auto' } }}>
          {t('cart.start_fresh')}
        </Button>
      </Stack>
    </Container>
  );
}
