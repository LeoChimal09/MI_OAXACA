import SiteNavbar from "@/components/shared/SiteNavbar";
import CartMiniBar from "@/components/customer/CartMiniBar";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNavbar />
      <CartMiniBar />
      <main>{children}</main>
    </>
  );
}
