"use client";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { MenuCategory } from "@/features/menu/menu.data";
import { useI18n } from "@/components/shared/I18nProvider";

const categoryEmojis: Record<string, string> = {
  All: "🍽️",
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

type CategorySidebarProps = {
  categories: (string | MenuCategory)[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  const { categoryLabel } = useI18n();

  return (
    <Stack
      spacing={1.5}
      sx={{
        flexDirection: { xs: "row", md: "column" },
        overflowX: { xs: "auto", md: "visible" },
        pb: { xs: 0.75, md: 0 },
        pr: { xs: 0.5, md: 0 },
        px: { xs: 0.25, md: 0 },
        /* hide scrollbar on mobile while keeping scroll functionality */
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      {categories.map((category) => (
        <ButtonBase
          key={category}
          onClick={() => onSelectCategory(category)}
          sx={{
            display: "inline-flex",
            flexShrink: 0,
            width: "max-content",
            cursor: "pointer",
            transition: "all 0.2s ease",
            border: selectedCategory === category ? "2px solid" : "1px solid",
            borderRadius: 3,
            borderColor:
              selectedCategory === category ? "primary.main" : "divider",
            background:
              selectedCategory === category
                ? "linear-gradient(135deg, rgba(232,25,125,0.18), rgba(232,25,125,0.08))"
                : "rgba(12,14,26,0.58)",
            boxShadow: selectedCategory === category ? "var(--glow-pink)" : "var(--shadow-soft)",
            "&:hover": {
              transform: { xs: "none", md: "translateY(-2px)" },
              boxShadow: "var(--shadow-deep)",
              borderColor: "primary.light",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              p: { xs: 1, md: 1.35 },
            }}
          >
            <Box sx={{ fontSize: { xs: "1.2rem", md: "1.45rem" } }}>
              {categoryEmojis[category as keyof typeof categoryEmojis] ?? "📌"}
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: selectedCategory === category ? 700 : 500,
                color: selectedCategory === category ? "primary.main" : "text.primary",
                whiteSpace: "nowrap",
                fontSize: { xs: "0.92rem", md: "0.98rem" },
              }}
            >
              {categoryLabel(String(category))}
            </Typography>
          </Box>
        </ButtonBase>
      ))}
    </Stack>
  );
}
