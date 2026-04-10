"use client";

import GoogleIcon from "@mui/icons-material/Google";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

type SignInModalProps = {
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  callbackUrl?: string;
};

export default function SignInModal({
  trigger,
  callbackUrl = "/admin",
}: SignInModalProps) {
  const [open, setOpen] = useState(false);
  const [requiresOAuth, setRequiresOAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadMode() {
      const response = await fetch("/api/auth/account-role", { cache: "no-store" }).catch(() => null);
      const payload = response ? ((await response.json().catch(() => null)) as { requiresOAuth?: boolean } | null) : null;
      if (!cancelled && payload) {
        setRequiresOAuth(payload.requiresOAuth !== false);
      }
    }

    void loadMode();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const triggerWithHandler = {
    ...trigger,
    props: {
      ...trigger.props,
      onClick: () => setOpen(true),
    },
  };

  return (
    <>
      {triggerWithHandler}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent>
          <Stack spacing={3} sx={{ py: 2, textAlign: "center", alignItems: "center" }}>
            <Typography variant="overline" color="secondary.main">
              Admin Sign In
            </Typography>
            <Typography variant="h6">Sign in to access the admin area</Typography>
            <Typography variant="body2" color="text.secondary">
              {requiresOAuth
                ? "Only approved Google accounts listed in the admin allowlist can access staff routes."
                : "Request a secure admin sign-in link using an allowlisted test-mode email address."}
            </Typography>
            {requiresOAuth ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={() => {
                  setOpen(false);
                  void signIn("google", { callbackUrl });
                }}
              >
                Sign in with Google
              </Button>
            ) : (
              <Stack spacing={2} sx={{ width: "100%" }}>
                <TextField
                  label="Admin Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                  size="small"
                  autoComplete="email"
                />
                {error && (
                  <Typography variant="caption" color="error" textAlign="left">
                    {error}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  size="large"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    const normalizedEmail = email.trim().toLowerCase();
                    const result = await signIn("credentials", {
                      email: normalizedEmail,
                      password: "test",
                      adminIntent: "true",
                      redirect: false,
                    });

                    setLoading(false);

                    if (!result?.ok) {
                      setError("Test admin sign-in failed. Verify ADMIN_TEST_MODE=true and TEST_ADMIN_EMAILS includes this email.");
                      return;
                    }

                    setOpen(false);
                    setEmail("");
                    setError(null);
                    window.location.href = callbackUrl;
                  }}
                >
                  {loading ? "Please wait..." : "Sign in as Admin (Test Mode)"}
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
