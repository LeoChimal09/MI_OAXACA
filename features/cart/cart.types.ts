export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
};

export type CartItem = MenuItem & {
  cartQuantity: number;
};

export type OrderEntry = {
  orderId: string;
  lines: CartItem[];
  total: number;
};

export type Cart = {
  orders: OrderEntry[];
  totalOrders: number;
  totalPrice: number;
};
