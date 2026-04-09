"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { Cart, CartItem, MenuItem, OrderEntry } from "./cart.types";

export type PendingLine = { item: MenuItem; quantity: number };

type CartContextType = {
  cart: Cart;
  placeOrder: (lines: PendingLine[]) => void;
  removeOrder: (orderId: string) => void;
  updateOrderLine: (orderId: string, itemId: string, quantity: number) => void;
  clearCart: () => void;
  remakeOrder: (sourceOrders: OrderEntry[]) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "mi_oaxaca_cart";

function loadCartFromStorage(): OrderEntry[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return (parsed as unknown[])
      .map((orderRaw, index): OrderEntry | null => {
        if (!orderRaw || typeof orderRaw !== "object") return null;
        const candidate = orderRaw as Record<string, unknown>;
        const rawLines = Array.isArray(candidate.lines) ? candidate.lines : [];

        const lines: CartItem[] = rawLines
          .map((lineRaw) => {
            if (!lineRaw || typeof lineRaw !== "object") return null;
            const line = lineRaw as Record<string, unknown>;

            const id = String(line.id ?? line.menuItemId ?? "").trim();
            const name = String(line.name ?? line.itemName ?? "").trim();

            const rawPrice = Number(line.price);
            const fallbackUnitPrice = Number(line.unitPrice);
            const price = Number.isFinite(rawPrice)
              ? rawPrice
              : Number.isFinite(fallbackUnitPrice)
                ? fallbackUnitPrice / 100
                : 0;

            const rawQty = Number(line.cartQuantity);
            const fallbackQty = Number(line.quantity);
            const cartQuantity = Number.isFinite(rawQty)
              ? rawQty
              : Number.isFinite(fallbackQty)
                ? fallbackQty
                : 0;

            if (!id || !name || cartQuantity <= 0 || !Number.isFinite(price) || price < 0) {
              return null;
            }

            return {
              ...line,
              id,
              name,
              price,
              cartQuantity,
            } as CartItem;
          })
          .filter((line): line is CartItem => line !== null);

        if (lines.length === 0) return null;

        return {
          orderId: String(candidate.orderId ?? `ORD-${Date.now()}-${index}`),
          lines,
          total: lines.reduce((sum, item) => sum + item.price * item.cartQuantity, 0),
        };
      })
      .filter((order): order is OrderEntry => order !== null);
  } catch {
    return [];
  }
}

function saveCartToStorage(orders: OrderEntry[]) {
  try {
    if (orders.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(orders));
    }
  } catch {
    // storage quota exceeded or private browsing — silently continue
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderEntry[]>(() => {
    if (typeof window === "undefined") return [];
    return loadCartFromStorage();
  });

  // Write-through: persist every change after hydration
  useEffect(() => {
    saveCartToStorage(orders);
  }, [orders]);

  const placeOrder = useCallback((lines: PendingLine[]) => {
    const cartItems: CartItem[] = lines.map(({ item, quantity }) => ({
      ...item,
      cartQuantity: quantity,
    }));
    const total = cartItems.reduce((sum, i) => sum + i.price * i.cartQuantity, 0);
    const orderId = Date.now().toString();
    setOrders((prev) => [...prev, { orderId, lines: cartItems, total }]);
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
  }, []);

  const updateOrderLine = useCallback(
    (orderId: string, itemId: string, quantity: number) => {
      setOrders((prev) =>
        prev
          .map((order) => {
            if (order.orderId !== orderId) return order;
            const lines =
              quantity <= 0
                ? order.lines.filter((l) => l.id !== itemId)
                : order.lines.map((l) =>
                    l.id === itemId ? { ...l, cartQuantity: quantity } : l,
                  );
            const total = lines.reduce((sum, l) => sum + l.price * l.cartQuantity, 0);
            return { ...order, lines, total };
          })
          .filter((o) => o.lines.length > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setOrders([]);
  }, []);

  const remakeOrder = useCallback((sourceOrders: OrderEntry[]) => {
    const clonedOrders = sourceOrders.map((order, index) => ({
      ...order,
      orderId: `${Date.now()}-${index}`,
      lines: order.lines.map((line) => ({ ...line })),
      total: order.lines.reduce((sum, line) => sum + line.price * line.cartQuantity, 0),
    }));
    setOrders(clonedOrders);
  }, []);

  const cart = useMemo<Cart>(() => {
    const totalPrice = orders.reduce((sum, o) => sum + o.total, 0);
    return { orders, totalOrders: orders.length, totalPrice };
  }, [orders]);

  return (
    <CartContext.Provider
      value={{ cart, placeOrder, removeOrder, updateOrderLine, clearCart, remakeOrder }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
