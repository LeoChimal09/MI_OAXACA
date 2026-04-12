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
import { useI18n } from "@/components/shared/I18nProvider";

type SignInModalProps = {
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  callbackUrl?: string;
};

export default function SignInModal({
  trigger,
  callbackUrl = "/admin",
}: SignInModalProps) {
  const { t } = useI18n();
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
              {t("admin.signin_title")}
            </Typography>
            <Typography variant="h6">{t("admin.signin_subtitle")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {requiresOAuth
                ? t("admin.signin_oauth_copy")
                : t("admin.signin_test_copy")}
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
                {t("admin.auth_google")}
              </Button>
            ) : (
              <Stack spacing={2} sx={{ width: "100%" }}>
                <TextField
                  label={t("admin.signin_email")}
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
                      setError(t("admin.signin_test_failed"));
                      return;
                    }

                    setOpen(false);
                    setEmail("");
                    setError(null);
                    window.location.href = callbackUrl;
                  }}
                >
                  {loading ? t("welcome.loading") : t("admin.signin_test_cta")}
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
