import type { MenuItem } from "@/components/customer/MenuCard";

export const MENU_CATEGORIES = [
  "Appetizers",
  "Classics",
  "Tacos",
  "Traditional Oaxacan",
  "Seafood",
  "Kids Menu",
  "À La Carte",
  "Extras",
  "Desserts",
  "Drinks",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const menuItems: MenuItem[] = [
  // ===== APPETIZERS =====
  {
    id: "app-1",
    name: "Choriquezo",
    description: "Melted cheese with Mexican sausage",
    price: 11.0,
    category: "Appetizers",
    available: true,
  },
  {
    id: "app-2",
    name: "Guacamole",
    description: "Fresh handmade guacamole",
    price: 10.0,
    category: "Appetizers",
    available: true,
  },
  {
    id: "app-3",
    name: "Garnachas",
    description: "(4) Mini corn tortillas topped with meat, cheese, and salsa",
    price: 13.0,
    category: "Appetizers",
    available: true,
  },

  // ===== CLASSICS =====
  {
    id: "cls-1",
    name: "Tortas",
    description: "Melted cheese, mayo, beans, lettuce, tomato, avocado, onion — (W) contains wheat",
    price: 13.0,
    category: "Classics",
    available: true,
  },
  {
    id: "cls-2",
    name: "Chicken Flautas Dinner",
    description: "Mayo, lettuce, tomato, onion, cheese — (3 flautas)",
    price: 13.0,
    category: "Classics",
    available: true,
  },
  {
    id: "cls-3",
    name: "Burrito",
    description: "Large flour tortilla, rice, beans, lettuce, tomato, onion, cheese",
    price: 12.0,
    category: "Classics",
    available: true,
  },
  {
    id: "cls-4",
    name: "Gorditas (2)",
    description: "2 stuffed corn tortillas, beans, cabbage, cheese",
    price: 10.0,
    category: "Classics",
    available: true,
  },
  {
    id: "cls-5",
    name: "Quesadilla",
    description: "Flour tortilla, cheese, served with sour cream and pico de gallo",
    price: 13.5,
    category: "Classics",
    available: true,
  },
  {
    id: "cls-6",
    name: "Tostadas (2)",
    description: "2 tostadas with beans, lettuce, tomato, onion, cheese",
    price: 11.5,
    category: "Classics",
    available: true,
  },
  {
    id: "cls-7",
    name: "Chile Relleno Dinner",
    description: "Stuffed cheese poblano pepper in tomato sauce",
    price: 15.5,
    category: "Classics",
    available: true,
  },

  // ===== TACOS =====
  {
    id: "tac-1",
    name: "Quesabirria Tacos (3)",
    description: "Barbacoa, melted cheese, consome, cilantro & onion",
    price: 14.0,
    category: "Tacos",
    available: true,
  },
  {
    id: "tac-2",
    name: "Street Tacos (3)",
    description: "Cilantro & onion — choice of meat",
    price: 11.0,
    category: "Tacos",
    available: true,
  },
  {
    id: "tac-3",
    name: "Tacos Gobernador (3)",
    description: "Shrimp cooked with veggies, melted cheese",
    price: 14.0,
    category: "Tacos",
    available: true,
  },

  // ===== TRADITIONAL OAXACAN =====
  {
    id: "trad-1",
    name: "Chicken Mole",
    description:
      "Authentic Oaxacan mole negro with rice and tortillas, garnished with toasted sesame seeds — **contains nuts",
    price: 14.5,
    category: "Traditional Oaxacan",
    available: true,
  },
  {
    id: "trad-2",
    name: "Pork Mole",
    description:
      "Fried pork pieces in spicy mole sauce, served with rice, tortillas, and queso fresco",
    price: 14.0,
    category: "Traditional Oaxacan",
    available: true,
  },
  {
    id: "trad-3",
    name: "Barbacoa Dinner",
    description:
      "Slow cooked beef with traditional chiles and spices, pasta salad, rice, tortillas, and avocado green salsa",
    price: 15.25,
    category: "Traditional Oaxacan",
    available: true,
  },
  {
    id: "trad-4",
    name: "Tlayuda",
    description:
      "Large crispy corn tortilla with asiento, beans, Oaxacan cheese, cabbage, tomato, onion, avocado — serves 2–3",
    price: 25.0,
    category: "Traditional Oaxacan",
    available: true,
  },
  {
    id: "trad-5",
    name: "Tamales Oaxaqueños (2)",
    description: "Banana leaf wrapped, chicken mole or pork in red sauce",
    price: 7.0,
    category: "Traditional Oaxacan",
    available: true,
  },
  {
    id: "trad-6",
    name: "Enchilada Dinner",
    description:
      "(3) Handmade corn or flour tortillas stuffed with chicken, topped with red or green sauce and queso fresco",
    price: 14.0,
    category: "Traditional Oaxacan",
    available: true,
  },
  {
    id: "trad-7",
    name: "Charola Oaxaqueña",
    description:
      "Grilled steak, spicy porkloin, chorizo, grilled chicken with rice, beans, grilled jalapeno, onions, roasted cactus, and tortillas",
    price: 30.5,
    category: "Traditional Oaxacan",
    available: true,
  },

  // ===== SEAFOOD =====
  {
    id: "sea-1",
    name: "Mojarra Frita",
    description: "Fried fish served with rice and beans, salad, and side of mayo",
    price: 20.99,
    category: "Seafood",
    available: true,
  },
  {
    id: "sea-2",
    name: "Camarones al Mojo de Ajo",
    description: "Shrimp sauteed with garlic, rice, salad, and tortillas",
    price: 18.5,
    category: "Seafood",
    available: true,
  },
  {
    id: "sea-3",
    name: "Camarones Ala Diabla",
    description: "Shrimp cooked with onions in chipotle sauce, rice and tortillas",
    price: 17.95,
    category: "Seafood",
    available: true,
  },

  // ===== KIDS MENU =====
  {
    id: "kid-1",
    name: "Kids Taco",
    description: "Under 12 · Served with small drink, rice, beans, or fries",
    price: 7.5,
    category: "Kids Menu",
    available: true,
  },
  {
    id: "kid-2",
    name: "Kids Quesadilla",
    description: "Under 12 · Served with small drink, rice, beans, or fries",
    price: 7.5,
    category: "Kids Menu",
    available: true,
  },
  {
    id: "kid-3",
    name: "Kids Chicken Strips",
    description: "Under 12 · Served with small drink, rice, beans, or fries",
    price: 7.5,
    category: "Kids Menu",
    available: true,
  },

  // ===== À LA CARTE =====
  {
    id: "alc-1",
    name: "Taco",
    description: "Single taco — choice of meat, cilantro & onion",
    price: 4.0,
    category: "À La Carte",
    available: true,
  },
  {
    id: "alc-2",
    name: "Quesabirria Taco",
    description: "Single quesabirria taco with consome",
    price: 5.5,
    category: "À La Carte",
    available: true,
  },
  {
    id: "alc-3",
    name: "Bean Tostada",
    description: "Crispy tostada with beans",
    price: 4.5,
    category: "À La Carte",
    available: true,
  },
  {
    id: "alc-4",
    name: "Tamal",
    description: "Single tamal — chicken mole or pork in red sauce",
    price: 3.99,
    category: "À La Carte",
    available: true,
  },
  {
    id: "alc-5",
    name: "Gordita",
    description: "Single stuffed corn tortilla",
    price: 5.99,
    category: "À La Carte",
    available: true,
  },
  {
    id: "alc-6",
    name: "Cheese Quesadilla",
    description: "Flour tortilla with cheese",
    price: 7.5,
    category: "À La Carte",
    available: true,
  },

  // ===== EXTRAS =====
  {
    id: "ext-1",
    name: "Cheese",
    description: "Side of cheese",
    price: 1.0,
    category: "Extras",
    available: true,
  },
  {
    id: "ext-2",
    name: "Sour Cream",
    description: "Side of sour cream",
    price: 1.0,
    category: "Extras",
    available: true,
  },
  {
    id: "ext-3",
    name: "Avocado",
    description: "Side of fresh avocado",
    price: 2.0,
    category: "Extras",
    available: true,
  },
  {
    id: "ext-4",
    name: "Bean Dip",
    description: "Side of bean dip",
    price: 3.0,
    category: "Extras",
    available: true,
  },
  {
    id: "ext-5",
    name: "Jalapeno",
    description: "Side of jalapeno",
    price: 1.0,
    category: "Extras",
    available: true,
  },
  {
    id: "ext-6",
    name: "Tortillas",
    description: "Side of tortillas",
    price: 2.0,
    category: "Extras",
    available: true,
  },

  // ===== DESSERTS =====
  {
    id: "des-1",
    name: "Mexican Flan",
    description: "Classic creamy caramel flan",
    price: 6.5,
    category: "Desserts",
    available: true,
  },
  {
    id: "des-2",
    name: "Churros",
    description: "Fried dough pastry dusted with cinnamon sugar",
    price: 5.5,
    category: "Desserts",
    available: true,
  },
  {
    id: "des-3",
    name: "Platano Frito",
    description: "Fried plantain with condensed milk",
    price: 7.5,
    category: "Desserts",
    available: true,
  },
  {
    id: "des-4",
    name: "3 Leches Cake",
    description: "Moist three milk cake",
    price: 6.5,
    category: "Desserts",
    available: true,
  },

  // ===== DRINKS =====
  {
    id: "drk-1",
    name: "Fountain Drink",
    description: "Assorted fountain beverages",
    price: 3.25,
    category: "Drinks",
    available: true,
  },
  {
    id: "drk-2",
    name: "Aguas Frescas",
    description: "Horchata, Jamaica, or Tamarind",
    price: 3.5,
    category: "Drinks",
    available: true,
  },
  {
    id: "drk-3",
    name: "Jarritos",
    description: "Mexican fruit soda",
    price: 3.5,
    category: "Drinks",
    available: true,
  },
  {
    id: "drk-4",
    name: "Mexican Coke",
    description: "Glass bottle Coca-Cola made with cane sugar",
    price: 3.5,
    category: "Drinks",
    available: true,
  },
  {
    id: "drk-5",
    name: "Fanta",
    description: "Fanta orange soda",
    price: 3.5,
    category: "Drinks",
    available: true,
  },
];

const MENU_ES: Record<string, { name?: string; description?: string }> = {
  "app-1": { description: "Queso derretido con chorizo mexicano" },
  "app-2": { description: "Guacamole fresco hecho a mano" },
  "app-3": { description: "(4) Mini tortillas de maiz con carne, queso y salsa" },
  "cls-1": { description: "Queso derretido, mayo, frijoles, lechuga, tomate, aguacate, cebolla — (W) contiene trigo" },
  "cls-2": { description: "Mayo, lechuga, tomate, cebolla, queso — (3 flautas)" },
  "cls-3": { description: "Tortilla grande de harina, arroz, frijoles, lechuga, tomate, cebolla, queso" },
  "cls-4": { description: "2 tortillas de maiz rellenas, frijoles, col, queso" },
  "cls-5": { description: "Tortilla de harina con queso, servida con crema y pico de gallo" },
  "cls-6": { description: "2 tostadas con frijoles, lechuga, tomate, cebolla y queso" },
  "cls-7": { description: "Chile poblano relleno de queso en salsa de tomate" },
  "tac-1": { description: "Barbacoa, queso derretido, consome, cilantro y cebolla" },
  "tac-2": { description: "Cilantro y cebolla — elige tu carne" },
  "tac-3": { description: "Camaron cocinado con verduras y queso derretido" },
  "trad-1": { name: "Mole de Pollo", description: "Autentico mole negro oaxaqueno con arroz y tortillas, decorado con ajonjoli tostado — **contiene nueces" },
  "trad-2": { name: "Mole de Puerco", description: "Trozos de puerco frito en salsa de mole picante, servido con arroz, tortillas y queso fresco" },
  "trad-3": { description: "Res cocida lentamente con chiles y especias tradicionales, ensalada de pasta, arroz, tortillas y salsa verde de aguacate" },
  "trad-4": { description: "Tortilla grande de maiz crujiente con asiento, frijoles, queso oaxaqueno, col, tomate, cebolla y aguacate — rinde para 2-3" },
  "trad-5": { description: "Envuelto en hoja de platano, mole de pollo o puerco en salsa roja" },
  "trad-6": { description: "(3) Tortillas hechas a mano de maiz o harina rellenas de pollo, con salsa roja o verde y queso fresco" },
  "trad-7": { description: "Bistec asado, lomo enchilado, chorizo y pollo asado con arroz, frijoles, jalapeno asado, cebolla, nopal y tortillas" },
  "sea-1": { description: "Pescado frito servido con arroz, frijoles, ensalada y guarnicion de mayonesa" },
  "sea-2": { description: "Camarones salteados con ajo, arroz, ensalada y tortillas" },
  "sea-3": { description: "Camarones cocinados con cebolla en salsa chipotle, con arroz y tortillas" },
  "kid-1": { name: "Taco Infantil", description: "Menores de 12 anos · Incluye bebida chica, arroz, frijoles o papas" },
  "kid-2": { name: "Quesadilla Infantil", description: "Menores de 12 anos · Incluye bebida chica, arroz, frijoles o papas" },
  "kid-3": { name: "Tiritas de Pollo Infantil", description: "Menores de 12 anos · Incluye bebida chica, arroz, frijoles o papas" },
  "alc-1": { description: "Taco individual — elige carne, cilantro y cebolla" },
  "alc-2": { description: "Taco de quesabirria individual con consome" },
  "alc-3": { description: "Tostada crujiente con frijoles" },
  "alc-4": { description: "Tamal individual — mole de pollo o puerco en salsa roja" },
  "alc-5": { description: "Gordita individual de maiz rellena" },
  "alc-6": { description: "Tortilla de harina con queso" },
  "ext-1": { name: "Queso", description: "Porcion de queso" },
  "ext-2": { name: "Crema", description: "Porcion de crema" },
  "ext-3": { name: "Aguacate", description: "Porcion de aguacate fresco" },
  "ext-4": { name: "Dip de Frijol", description: "Porcion de dip de frijol" },
  "ext-5": { name: "Jalapeno", description: "Porcion de jalapeno" },
  "ext-6": { name: "Tortillas", description: "Porcion de tortillas" },
  "des-1": { description: "Flan clasico cremoso de caramelo" },
  "des-2": { description: "Masa frita espolvoreada con azucar y canela" },
  "des-3": { description: "Platano frito con leche condensada" },
  "des-4": { name: "Pastel Tres Leches", description: "Pastel humedo de tres leches" },
  "drk-1": { name: "Refresco de Fuente", description: "Variedad de bebidas de fuente" },
  "drk-2": { description: "Horchata, jamaica o tamarindo" },
  "drk-3": { description: "Refresco mexicano de frutas" },
  "drk-4": { name: "Coca Mexicana", description: "Botella de vidrio Coca-Cola hecha con azucar de cana" },
  "drk-5": { description: "Refresco de naranja Fanta" },
};

export function localizeMenuItem(item: MenuItem, locale: "en" | "es"): MenuItem {
  if (locale !== "es") {
    return item;
  }

  const translated = MENU_ES[item.id];
  if (!translated) {
    return item;
  }

  return {
    ...item,
    name: translated.name ?? item.name,
    description: translated.description ?? item.description,
  };
}
