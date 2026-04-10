import { NextResponse } from "next/server";
import { isAdminTestModeEnabled } from "@/lib/auth";

/**
 * GET /api/auth/account-role
 * Returns whether OAuth is required for admins (production) or if test mode is enabled
 */
export async function GET() {
  const adminTestModeEnabled = isAdminTestModeEnabled();

  return NextResponse.json({
    requiresOAuth: !adminTestModeEnabled,
  });
}
