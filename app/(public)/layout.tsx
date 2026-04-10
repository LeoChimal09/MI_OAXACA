import SiteNavbar from "@/components/shared/SiteNavbar";
import CartMiniBar from "@/components/customer/CartMiniBar";
import OrderProgressBanner from "@/components/customer/OrderProgressBanner";
import WelcomeModal from "@/components/auth/WelcomeModal";
import { getAuthSession, isAdminSession } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthSession();
  const isAdmin = isAdminSession(session);
  const navUser = session?.user
    ? { name: session.user.name ?? null, image: session.user.image ?? null, href: "/" }
    : null;
  const isAuthenticated = Boolean(session?.user);

  return (
    <>
      <SiteNavbar showAdmin={isAdmin} user={navUser} />
      <WelcomeModal isAuthenticated={isAuthenticated} />
      <OrderProgressBanner />
      <CartMiniBar />
      <main>{children}</main>
    </>
  );
}
