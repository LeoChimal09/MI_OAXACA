export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  /** e.g. "$14.50", "2x$7", "3x$11" */
  price: string;
  tags?: Array<"wheat" | "nuts">;
};

export type MenuSection = {
  id: string;
  label: string;
  /** Shown as a small note below the heading */
  subtitle?: string;
  items: MenuItem[];
};

export const meatChoices = [
  "Steak (Asada)",
  "Al Pastor (Marinated Pork w/ Pineapple)",
  "Chicken (Pollo)",
  "Chorizo (Spicy Sausage)",
  "Chicharron (Pork Rinds)",
  "Ground Beef",
  "Veggie",
];

export const menuSections: MenuSection[] = [
  {
    id: "appetizers",
    label: "Appetizers",
    items: [
      {
        id: "choriquezo",
        name: "Choriquezo",
        description: "Melted cheese, Mexican sausage",
        price: "$11",
      },
      {
        id: "guacamole",
        name: "Guacamole",
        price: "$10",
      },
      {
        id: "garnachas",
        name: "Garnachas",
        description: "(4) Mini corn tortillas topped with meat, cheese, salsa",
        price: "$13",
      },
    ],
  },
  {
    id: "classics",
    label: "Classics",
    subtitle: "Most items served with your choice of meat — see Choices of Meat below",
    items: [
      {
        id: "tortas",
        name: "Tortas",
        description: "Melted cheese, mayo, beans, lettuce, tomato, avocado, onion",
        price: "$13",
        tags: ["wheat"],
      },
      {
        id: "chicken-flautas",
        name: "Chicken Flautas Dinner",
        description: "Mayo, lettuce, tomato, onion, cheese (3 flautas)",
        price: "$13",
      },
      {
        id: "burrito",
        name: "Burrito",
        description: "Large flour tortilla, rice, beans, lettuce, tomato, onion, cheese",
        price: "$12",
      },
      {
        id: "gorditas",
        name: "Gorditas",
        description: "Stuffed corn tortilla, beans, cabbage, cheese",
        price: "2x$10",
      },
      {
        id: "quesadilla",
        name: "Quesadilla",
        description: "Flour, cheese, served with sour cream and pico de gallo",
        price: "$13.50",
      },
      {
        id: "tostadas",
        name: "Tostadas",
        description: "Beans, lettuce, tomato, onion, cheese",
        price: "2x$11.50",
      },
      {
        id: "chile-relleno",
        name: "Chile Relleno Dinner",
        description: "Stuffed cheese poblano pepper in tomato sauce",
        price: "$15.50",
      },
    ],
  },
  {
    id: "tacos",
    label: "Tacos",
    items: [
      {
        id: "quesabirria",
        name: "Quesabirria Tacos",
        description: "(3) Barbacoa, melted cheese, consome, cilantro & onion",
        price: "$14",
      },
      {
        id: "street-tacos",
        name: "Street Tacos",
        description: "Cilantro & onion",
        price: "3x$11",
      },
      {
        id: "tacos-gobernador",
        name: "Tacos Gobernador",
        description: "Shrimp cooked with veggies, melted cheese",
        price: "3x$14",
      },
    ],
  },
  {
    id: "traditional",
    label: "Traditional Oaxacan Dishes",
    items: [
      {
        id: "chicken-mole",
        name: "Chicken Mole",
        description:
          "An authentic Oaxacan mole negro served with rice and tortillas garnished with toasted sesame seeds",
        price: "$14.50",
        tags: ["nuts"],
      },
      {
        id: "pork-mole",
        name: "Pork Mole",
        description:
          "Fried pork pieces cooked in spicy mole sauce served with rice, tortillas, and queso fresco",
        price: "$14",
      },
      {
        id: "barbacoa-dinner",
        name: "Barbacoa Dinner",
        description:
          "Slow cooked beef seasoned with traditional chiles and spices served with pasta salad, rice, tortillas, and avocado green salsa",
        price: "$15.25",
      },
      {
        id: "tlayuda",
        name: "Tlayuda",
        description:
          "Large crispy corn tortilla topped with asiento (pork lard), beans, Oaxacan cheese, cabbage, tomato, onion, avocado — steak & chorizo or spicy porkloin & shortrib. Served open-faced or folded, serves 2–3",
        price: "$25",
      },
      {
        id: "tamales",
        name: "Tamales Oaxaqueños",
        description: "Banana leaf wrapped, chicken mole or pork in red sauce",
        price: "2x$7",
      },
      {
        id: "enchilada-dinner",
        name: "Enchilada Dinner",
        description:
          "(3) Handmade corn tortillas or flour stuffed with chicken topped with red or green sauce and queso fresco",
        price: "$14",
      },
      {
        id: "charola",
        name: "Charola Oaxaqueña",
        description:
          "Grilled steak, spicy porkloin, chorizo, grilled chicken served with rice and beans, grilled jalapeno, onions, roasted cactus, and tortillas",
        price: "$30.50",
      },
    ],
  },
  {
    id: "seafood",
    label: "Seafood",
    items: [
      {
        id: "mojarra",
        name: "Mojarra Frita",
        description: "Fried fish served with rice and beans, salad, and side of mayo",
        price: "$20.99",
      },
      {
        id: "camarones-mojo",
        name: "Camarones al Mojo de Ajo",
        description: "Shrimp sauteed with garlic served with rice, salad, and tortillas",
        price: "$18.50",
      },
      {
        id: "camarones-diabla",
        name: "Camarones Ala Diabla",
        description:
          "Shrimp cooked with onions in a chipotle sauce served with rice and tortillas",
        price: "$17.95",
      },
    ],
  },
  {
    id: "kids",
    label: "Kids Menu",
    subtitle: "Under 12 years · $7.50 each · Served with small drink, rice, beans, or fries",
    items: [
      { id: "kids-taco", name: "Taco", price: "$7.50" },
      { id: "kids-quesadilla", name: "Quesadilla", price: "$7.50" },
      { id: "kids-chicken-strips", name: "Chicken Strips", price: "$7.50" },
    ],
  },
  {
    id: "a-la-carte",
    label: "À La Carte",
    items: [
      { id: "alc-taco", name: "Taco", price: "$4" },
      { id: "alc-quesabirria", name: "Quesabirria Taco", price: "$5.50" },
      { id: "alc-bean-tostada", name: "Bean Tostada", price: "$4.50" },
      { id: "alc-tamal", name: "Tamal", price: "$3.99" },
      { id: "alc-gordita", name: "Gordita", price: "$5.99" },
      { id: "alc-cheese-quesadilla", name: "Cheese Quesadilla", price: "$7.50" },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    items: [
      { id: "extra-cheese", name: "Cheese", price: "$1" },
      { id: "extra-sour-cream", name: "Sour Cream", price: "$1" },
      { id: "extra-avocado", name: "Avocado", price: "$2" },
      { id: "extra-bean-dip", name: "Bean Dip", price: "$3" },
      { id: "extra-jalapeno", name: "Jalapeno", price: "$1" },
      { id: "extra-tortillas", name: "Tortillas", price: "$2" },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    items: [
      { id: "flan", name: "Mexican Flan", price: "$6.50" },
      { id: "churros", name: "Churros", price: "$5.50" },
      {
        id: "platano",
        name: "Platano Frito",
        description: "Fried plantain with condensed milk",
        price: "$7.50",
      },
      { id: "tres-leches", name: "3 Leches Cake", price: "$6.50" },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    items: [
      { id: "fountain", name: "Fountain Drink", price: "$3.25" },
      {
        id: "aguas",
        name: "Aguas Frescas",
        description: "Horchata, Jamaica, Tamarind",
        price: "$3.50",
      },
      { id: "jarritos", name: "Jarritos", price: "$3.50" },
      { id: "mexican-coke", name: "Mexican Coke", price: "$3.50" },
      { id: "fanta", name: "Fanta", price: "$3.50" },
    ],
  },
];
