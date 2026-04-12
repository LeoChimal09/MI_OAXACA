import SiteNavbar from "@/components/shared/SiteNavbar";
import AdminLockedView from "@/components/auth/AdminLockedView";
import { getAuthSession, isAdminSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const isAdminEnabled = isAdminSession(session);
  const navUser = isAdminEnabled
    ? { name: session?.user?.name ?? null, image: session?.user?.image ?? null, href: "/admin" }
    : null;

  return (
    <>
      <SiteNavbar showAdmin={isAdminEnabled} user={navUser} />
      <main>
        {isAdminEnabled ? (
          <>{children}</>
        ) : (
          <AdminLockedView />
        )}
      </main>
    </>
  );
}

