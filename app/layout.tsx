import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/shared/I18nProvider";
import MuiThemeProvider from "@/components/shared/MuiThemeProvider";
import SessionWrapper from "@/components/shared/SessionWrapper";
import { CartProvider } from "@/features/cart/CartContext";
import { OrderHistoryProvider } from "@/features/checkout/OrderHistoryContext";

export const metadata: Metadata = {
  title: "Mi Oaxaca — Tacos y Más",
  description:
    "Authentic Mexican restaurant serving tacos y más. Order online for pickup or dine-in.",
  keywords: ["Mi Oaxaca", "Mexican restaurant", "tacos", "authentic Mexican food"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionWrapper>
          <I18nProvider>
            <MuiThemeProvider>
              <CartProvider>
                <OrderHistoryProvider>{children}</OrderHistoryProvider>
              </CartProvider>
            </MuiThemeProvider>
          </I18nProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
