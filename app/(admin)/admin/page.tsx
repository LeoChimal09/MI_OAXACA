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

const modules = [
  {
    name: "Orders",
    description: "Review live orders and move them through the status workflow.",
    href: "/admin/orders",
    cta: "Open Orders",
    status: "Live",
  },
  {
    name: "Billing",
    description: "Planned next module for payment and settlement visibility.",
    status: "Planned",
  },
  {
    name: "Reports",
    description: "Planned analytics module for daily and weekly operations insights.",
    status: "Planned",
  },
];

export default function AdminDashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="overline" color="secondary.main">
          Admin Area
        </Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}>
          Operations Dashboard
        </Typography>
        <Typography color="text.secondary">
          Focused admin scope: Orders is live, while Billing and Reports are planned for a later phase.
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
                <Typography variant="caption" color={module.status === "Live" ? "success.main" : "text.secondary"}>
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
