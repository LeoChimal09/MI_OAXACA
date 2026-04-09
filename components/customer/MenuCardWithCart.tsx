"use client";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MenuItem } from "./MenuCard";

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
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: item.available ? 1 : 0.55,
      }}
    >
      <Box
        sx={{
          height: 120,
          background:
            "linear-gradient(135deg, rgba(232,25,125,0.12) 0%, rgba(249,115,22,0.10) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
        }}
      >
        {categoryEmoji[item.category] ?? "🍽️"}
      </Box>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ flex: 1, fontSize: "1rem" }}>
              {item.name}
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              ${item.price.toFixed(2)}
            </Typography>
          </Stack>
          {item.description && (
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <Chip label={item.category} size="small" variant="outlined" color="primary" />
            {!item.available && <Chip label="Out of Stock" size="small" color="error" />}
          </Stack>
        </Stack>

        {item.available && (
          <Stack sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddShoppingCartIcon />}
              onClick={() => onItemAdded?.(item)}
              fullWidth
            >
              Add to Order
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
