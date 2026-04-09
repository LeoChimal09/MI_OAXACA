import type { Metadata } from "next";
import { Playfair_Display, Lato, Geist_Mono } from "next/font/google";
import "./globals.css";
import MuiThemeProvider from "@/components/shared/MuiThemeProvider";
import { CartProvider } from "@/features/cart/CartContext";
import { OrderHistoryProvider } from "@/features/checkout/OrderHistoryContext";

/** Display font for headings — warm serif that suits the brand */
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

/** Body font — clean and highly readable */
const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${playfair.variable} ${lato.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MuiThemeProvider>
          <CartProvider>
            <OrderHistoryProvider>{children}</OrderHistoryProvider>
          </CartProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
