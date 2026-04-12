"use client";

import Box from "@mui/material/Box";
import type { MenuItem } from "./MenuCard";
import MenuCardWithCart from "./MenuCardWithCart";

type MenuGridWithCartProps = {
  items: MenuItem[];
  onItemAdded?: (item: MenuItem) => void;
};

export default function MenuGridWithCart({ items, onItemAdded }: MenuGridWithCartProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: { xs: 1, sm: 1.15, lg: 1.25 },
        gridTemplateColumns: {
          xs: "1fr",
          xl: "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      {items.map((item) => (
        <MenuCardWithCart key={item.id} item={item} onItemAdded={onItemAdded} />
      ))}
    </Box>
  );
}
