"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useI18n } from "@/components/shared/I18nProvider";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const modules = [
    {
      name: t("admin.module.orders"),
      description: t("admin.module.orders_desc"),
      href: "/admin/orders",
      cta: t("admin.module.orders_cta"),
      status: t("admin.live"),
      isLive: true,
    },
    {
      name: t("admin.module.billing"),
      description: t("admin.module.billing_desc"),
      status: t("admin.planned"),
      isLive: false,
    },
    {
      name: t("admin.module.reports"),
      description: t("admin.module.reports_desc"),
      status: t("admin.planned"),
      isLive: false,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.main">
          {t("admin.area")}
        </Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}>
          {t("admin.dashboard")}
        </Typography>
        <Typography color="text.secondary">
          {t("admin.dashboard_subtitle")}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        {modules.map((module) => (
          <Card key={module.name} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="h6">{module.name}</Typography>
                <Typography variant="caption" color={module.isLive ? "success.main" : "text.secondary"}>
                  {module.status}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {module.description}
              </Typography>
            </CardContent>
            {module.href && (
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="contained" LinkComponent={Link} href={module.href}>
                  {module.cta}
                </Button>
              </CardActions>
            )}
          </Card>
        ))}
      </Box>
    </Container>
  );
}
