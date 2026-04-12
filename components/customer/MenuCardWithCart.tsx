"use client";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MenuItem } from "./MenuCard";
import { useI18n } from "@/components/shared/I18nProvider";

const categoryEmoji: Record<string, string> = {
  Appetizers: "🌶️",
  Classics: "🫓",
  Tacos: "🌮",
  "Traditional Oaxacan": "🫕",
  Seafood: "🦐",
  "Kids Menu": "🧒",
  "À La Carte": "🍽️",
  Extras: "➕",
  Desserts: "🍮",
  Drinks: "🥤",
};

type MenuCardWithCartProps = {
  item: MenuItem;
  onItemAdded?: (item: MenuItem) => void;
};

export default function MenuCardWithCart({ item, onItemAdded }: MenuCardWithCartProps) {
  const { t, categoryLabel } = useI18n();
  const hasImage = Boolean(item.imageUrl);

  return (
    <Box
      component="article"
      sx={{
        width: "100%",
        opacity: item.available ? 1 : 0.55,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: "var(--card-background)",
        boxShadow: "var(--shadow-soft)",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: item.available ? "translateY(-2px)" : "none",
          boxShadow: "var(--shadow-deep)",
          borderColor: "rgba(232,25,125,0.45)",
        },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.1, sm: 1.5 }} sx={{ p: { xs: 1.15, sm: 1.35 } }}>
        <Box
          sx={{
            width: { xs: "100%", sm: 128 },
            minWidth: { sm: 128 },
            height: { xs: 120, sm: 108 },
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            background: hasImage
              ? "rgba(10, 12, 22, 0.65)"
              : "linear-gradient(135deg, rgba(232,25,125,0.18), rgba(249,115,22,0.16))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
          }}
        >
          {hasImage ? (
            <Box
              component="img"
              src={item.imageUrl}
              alt={item.imageAlt ?? item.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Box sx={{ lineHeight: 1 }}>{categoryEmoji[item.category] ?? "🍽️"}</Box>
          )}
        </Box>

        <Stack spacing={0.7} sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
              <Typography
                variant="h6"
                sx={{
                  flex: 1,
                  fontSize: "0.98rem",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  fontFamily: "var(--font-display)",
                }}
              >
                {item.name}
              </Typography>
              <Typography color="primary.main" sx={{ fontWeight: 800, whiteSpace: "nowrap", fontSize: "1.35rem", lineHeight: 1 }}>
                ${item.price.toFixed(2)}
              </Typography>
            </Stack>
            {item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontSize: "0.9rem",
                }}
              >
                {item.description}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={0.75} sx={{ pt: 0.4, flexWrap: "wrap", rowGap: 0.75 }}>
            <Chip label={categoryLabel(item.category)} size="small" variant="outlined" color="primary" />
            {!item.available && <Chip label={t("menu.out_of_stock")} size="small" color="error" />}
          </Stack>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
        <Divider sx={{ display: { xs: "block", sm: "none" } }} />

        <Stack
          spacing={1}
          justifyContent="center"
          sx={{ width: { xs: "100%", sm: 170 }, alignItems: { xs: "stretch", sm: "flex-end" } }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", textAlign: { xs: "left", sm: "right" } }}>
            {item.available ? t("menu.ready") : t("menu.unavailable")}
          </Typography>
          {item.available ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddShoppingCartIcon />}
              onClick={() => onItemAdded?.(item)}
              sx={{ fontWeight: 800, py: 0.75, minWidth: { sm: 150 } }}
            >
              {t("menu.add")}
            </Button>
          ) : (
            <Typography
              sx={{
                px: 1,
                py: 0.7,
                borderRadius: 99,
                border: "1px solid",
                borderColor: "error.main",
                color: "error.main",
                fontSize: "0.78rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {t("menu.out_of_stock")}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
