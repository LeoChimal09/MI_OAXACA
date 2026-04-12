"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
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
        borderRadius: 2,
        border: "1px solid",
        borderColor: "rgba(120,128,170,0.22)",
        background: "rgba(13,16,30,0.88)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 180ms ease, background-color 180ms ease",
        "&:hover": {
          borderColor: "rgba(232,25,125,0.24)",
          background: "rgba(14,18,33,0.92)",
        },
      }}
    >
      {/* Image Container - ready for food photos */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 100, sm: 110 },
          overflow: "hidden",
          background: hasImage
            ? "rgba(10, 12, 22, 0.65)"
            : "linear-gradient(135deg, rgba(232,25,125,0.14), rgba(249,115,22,0.1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: { xs: "2rem", sm: "2.4rem" },
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

      {/* Content Container */}
      <Stack spacing={0.5} sx={{ p: { xs: 1, sm: 1.1 }, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.8 }}>
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--foreground-muted)",
              fontWeight: 700,
              fontSize: "0.65rem",
              flexShrink: 0,
            }}
          >
            {categoryLabel(item.category)}
          </Typography>
          {!item.available && <Chip label={t("menu.out_of_stock")} size="small" color="error" sx={{ ml: "auto" }} />}
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "0.95rem", sm: "1.05rem" },
            fontWeight: 800,
            lineHeight: 1.15,
            fontFamily: "var(--font-display)",
          }}
        >
          {item.name}
        </Typography>

        {item.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
              lineHeight: 1.3,
            }}
          >
            {item.description}
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
          {item.available ? t("menu.ready") : t("menu.unavailable")}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ pt: 0.3 }}>
          <Typography
            color="primary.main"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.05rem", sm: "1.15rem" },
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ${item.price.toFixed(2)}
          </Typography>

          {item.available ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onItemAdded?.(item)}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                py: 0.3,
                px: 0.9,
                borderRadius: 1.2,
                textTransform: "none",
                borderColor: "rgba(232,25,125,0.36)",
                color: "primary.main",
                background: "transparent",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "primary.main",
                  background: "rgba(232,25,125,0.08)",
                },
              }}
            >
              {t("menu.add")}
            </Button>
          ) : (
            <Typography
              sx={{
                px: 0.8,
                py: 0.3,
                borderRadius: 1.2,
                border: "1px solid",
                borderColor: "error.main",
                color: "error.main",
                fontSize: "0.7rem",
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
