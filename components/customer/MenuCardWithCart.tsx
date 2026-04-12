"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
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
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
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
            onClick={() => setDetailOpen(true)}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
              lineHeight: 1.3,
              cursor: "pointer",
              "&:hover": { color: "text.primary" },
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

    {/* Detail Modal */}
    <Dialog
      open={detailOpen}
      onClose={() => setDetailOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: "rgba(13,16,30,0.97)",
          border: "1px solid rgba(120,128,170,0.22)",
          borderRadius: 3,
          backdropFilter: "blur(12px)",
        },
      }}
    >
      {/* Modal image */}
      <Box
        sx={{
          width: "100%",
          height: 180,
          background: hasImage
            ? "rgba(10,12,22,0.65)"
            : "linear-gradient(135deg, rgba(232,25,125,0.14), rgba(249,115,22,0.1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3.5rem",
          position: "relative",
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
        <IconButton
          onClick={() => setDetailOpen(false)}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { background: "rgba(0,0,0,0.75)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={1}>
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--foreground-muted)",
              fontWeight: 700,
              fontSize: "0.65rem",
            }}
          >
            {categoryLabel(item.category)}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, fontFamily: "var(--font-display)", lineHeight: 1.2 }}
          >
            {item.name}
          </Typography>
          {item.description && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {item.description}
            </Typography>
          )}
          <Typography
            color="primary.main"
            sx={{ fontWeight: 900, fontSize: "1.3rem", fontVariantNumeric: "tabular-nums" }}
          >
            ${item.price.toFixed(2)}
          </Typography>
          {!item.available && <Chip label={t("menu.out_of_stock")} size="small" color="error" sx={{ alignSelf: "flex-start" }} />}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="text" onClick={() => setDetailOpen(false)} sx={{ color: "text.secondary" }}>
          Close
        </Button>
        {item.available && (
          <Button
            variant="contained"
            onClick={() => { onItemAdded?.(item); setDetailOpen(false); }}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              background: "primary.main",
              borderRadius: 2,
            }}
          >
            {t("menu.add")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  </>
  );
}
