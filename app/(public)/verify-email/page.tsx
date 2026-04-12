"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/shared/I18nProvider";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(t("verify.loading"));
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    async function runVerification() {
      const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
      const token = searchParams.get("token")?.trim() ?? "";
      const adminIntent = searchParams.get("admin") === "1";

      if (!email || !token) {
        if (!cancelled) {
          setStatus("error");
          setMessage(t("verify.invalid"));
        }
        return;
      }

      const result = await signIn("credentials", {
        email,
        verificationToken: token,
        adminIntent: adminIntent ? "true" : "false",
        redirect: false,
      });

      if (cancelled) {
        return;
      }

      if (result?.ok) {
        setStatus("success");
        setMessage(t("verify.success"));
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
        return;
      }

      setStatus("error");
      setMessage(t("verify.expired"));
    }

    void runVerification();

    return () => {
      cancelled = true;
    };
  }, [searchParams, t]);

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "70vh", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <Stack spacing={2.5}>
          <Typography variant="h4">{t("verify.title")}</Typography>
          {status === "loading" && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography>{message}</Typography>
            </Stack>
          )}
          {status === "success" && <Alert severity="success">{message}</Alert>}
          {status === "error" && <Alert severity="error">{message}</Alert>}
          <Button component={Link} href="/" variant="contained">
            {t("verify.back_home")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
