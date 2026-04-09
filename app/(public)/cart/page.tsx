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

export default function CartPage() {
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
            Your cart is empty
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--foreground-secondary)' }}>
            Start adding delicious food from our menu
          </Typography>
          <Button component={Link} href="/menu" variant="contained" sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff', textTransform: 'capitalize', fontSize: '1rem', py: 1.5, px: 4, mt: 2 }}>
            Continue Shopping
          </Button>
        </Stack>
      </Container>
    );
  }

  const subtotal = cart.totalPrice;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, color: 'var(--foreground)', fontFamily: 'Playfair Display' }}>
        Your Orders
      </Typography>
      <Typography variant="body2" sx={{ mt: -3, mb: 3, color: 'var(--foreground-secondary)' }}>
        {cart.totalOrders} order{cart.totalOrders === 1 ? '' : 's'} in cart
      </Typography>

      <Stack spacing={2.5} sx={{ mb: 4 }}>
        {cart.orders.map((order, index) => (
          <Paper key={order.orderId} sx={{ backgroundColor: 'var(--card-background)', border: '1px solid rgba(232, 25, 125, 0.18)', borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: { xs: 2, sm: 2.5 },
                py: 1.5,
                backgroundColor: 'rgba(232, 25, 125, 0.08)',
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Chip label={`Order ${index + 1}`} size="small" sx={{ color: '#fff', backgroundColor: 'var(--brand-pink)', fontWeight: 600 }} />
                <Typography sx={{ color: 'var(--foreground-secondary)' }}>
                  {order.lines.length} item{order.lines.length === 1 ? '' : 's'}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography sx={{ color: 'var(--brand-pink)', fontWeight: 700 }}>
                  ${order.total.toFixed(2)}
                </Typography>
                <Button size="small" color="error" onClick={() => removeOrder(order.orderId)}>
                  Remove
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
                    gap: { xs: 1.25, sm: 2 },
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: 'var(--foreground)', fontWeight: 600 }}>
                    {line.name}
                  </Typography>
                  <Typography sx={{ color: 'var(--foreground-secondary)' }}>
                    ${line.price.toFixed(2)} each
                  </Typography>
                  <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
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

      <Paper sx={{ backgroundColor: 'var(--card-background)', p: 3, mb: 4 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: 'var(--foreground)' }}>Subtotal:</Typography>
            <Typography sx={{ color: 'var(--foreground)', fontSize: '1.1rem' }}>${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: 'var(--foreground)' }}>Tax (8%):</Typography>
            <Typography sx={{ color: 'var(--foreground)', fontSize: '1.1rem' }}>${tax.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2, borderTop: '2px solid var(--brand-pink)' }}>
            <Typography variant="h6" sx={{ color: 'var(--brand-pink)', fontWeight: 600 }}>Total:</Typography>
            <Typography variant="h5" sx={{ color: 'var(--brand-pink)', fontWeight: 600 }}>${total.toFixed(2)}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Button component={Link} href="/menu" variant="outlined" sx={{ color: 'var(--brand-pink)', borderColor: 'var(--brand-pink)', flex: 1 }}>
          Continue Shopping
        </Button>
        <Button component={Link} href="/checkout" variant="contained" sx={{ background: 'linear-gradient(135deg, var(--brand-pink), #f5316d)', color: '#fff', flex: 1 }}>
          Proceed to Checkout
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button onClick={clearCart} variant="text" sx={{ color: '#ef4444', justifyContent: 'flex-start' }}>
          Clear cart
        </Button>
        <Button onClick={handleStartFresh} variant="text" sx={{ color: '#f97316', justifyContent: 'flex-start' }}>
          Start fresh
        </Button>
      </Stack>
    </Container>
  );
}
