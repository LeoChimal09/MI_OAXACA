// Auth helpers for mi_oaxaca.
// Mirrors web-project pattern: Google OAuth via NextAuth.
// For MVP, stubs are provided; integrate with NextAuth when setting up OAuth.

export type AuthSession = {
  user?: {
    email?: string | null;
    name?: string | null;
  };
  isAdmin?: boolean;
} | null;

/**
 * Get auth session from NextAuth.
 * Replace with: getServerSession(authOptions) when NextAuth is configured.
 */
export async function getAuthSession(): Promise<AuthSession> {
  // TODO: Integrate with NextAuth
  // const session = await getServerSession(authOptions);
  // return session;
  return null;
}

/**
 * Check if session is an admin user.
 * Checks if user email is in ADMIN_EMAILS environment variable.
 */
export function isAdminSession(session: AuthSession | null | undefined): boolean {
  if (!session?.user?.email) {
    return false;
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(session.user.email.toLowerCase());
}
