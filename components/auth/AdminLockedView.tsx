"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SignInModal from "@/components/auth/SignInModal";
import { useI18n } from "@/components/shared/I18nProvider";

export default function AdminLockedView() {
  const { t } = useI18n();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, textAlign: "center" }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="overline" color="secondary.main">
          {t("admin.auth_locked")}
        </Typography>
        <Typography variant="h4">{t("admin.auth_required")}</Typography>
        <Typography color="text.secondary">{t("admin.auth_help")}</Typography>
        <SignInModal
          trigger={<Button variant="contained" size="large">{t("admin.auth_google")}</Button>}
        />
      </Stack>
    </Container>
  );
}
