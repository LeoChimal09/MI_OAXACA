import SiteNavbar from "@/components/shared/SiteNavbar";
import CartMiniBar from "@/components/customer/CartMiniBar";
import OrderProgressBanner from "@/components/customer/OrderProgressBanner";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNavbar />
      <OrderProgressBanner />
      <CartMiniBar />
      <main>{children}</main>
    </>
  );
}
