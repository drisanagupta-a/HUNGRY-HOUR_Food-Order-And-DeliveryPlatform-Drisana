import orangeDrink from "../assets/Mediterranean Feast Sticker Set 5.png";

export const foodCategories = [
  { name: "All", icon: "✦" },
  { name: "Burgers", icon: "🍔" },
  { name: "Pizza", icon: "🍕" },
  { name: "Noodles", icon: "🍜" },
  { name: "Snacks", icon: "🍟" },
  { name: "Drinks", icon: "🥤" },
  { name: "Indian", icon: "🍛" },
  { name: "Desserts", icon: "🍰" },
];

export const mockRestaurants = [
  {
    id: "bun-butter",
    name: "Bun & Butter",
    cuisine: "Burgers · American",
    categories: ["Burgers", "Snacks"],
    rating: "4.8",
    time: "20–30 min",
    fee: 25,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
    badge: "Customer favorite",
  },
  {
    id: "little-oven",
    name: "The Little Oven",
    cuisine: "Pizza · Italian",
    categories: ["Pizza", "Snacks"],
    rating: "4.7",
    time: "25–35 min",
    fee: 0,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85",
    badge: "Free delivery",
  },
  {
    id: "masala-mood",
    name: "Masala Mood",
    cuisine: "North Indian · Curry",
    categories: ["Indian", "Snacks"],
    rating: "4.9",
    time: "30–40 min",
    fee: 30,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85",
    badge: "Top rated",
  },
  {
    id: "wok-this-way",
    name: "Wok This Way",
    cuisine: "Chinese · Asian",
    categories: ["Chinese", "Noodles", "Momos"],
    rating: "4.6",
    time: "20–30 min",
    fee: 20,
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85",
    badge: "Popular pick",
  },
  {
    id: "dosa-diaries",
    name: "Dosa Diaries",
    cuisine: "South Indian · Vegetarian",
    categories: ["South Indian", "Healthy food"],
    rating: "4.7",
    time: "25–35 min",
    fee: 20,
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=85",
    badge: "Made with love",
  },
  {
    id: "sweet-spot",
    name: "The Sweet Spot",
    cuisine: "Desserts · Beverages",
    categories: ["Desserts", "Drinks", "Beverages"],
    rating: "4.8",
    time: "15–25 min",
    fee: 15,
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85",
    badge: "Something sweet",
  },
];

export const mockDishes = [
  {
    id: "classic-crunch",
    name: "Classic Crunch Burger",
    restaurant: "Bun & Butter",
    restaurantId: "bun-butter",
    category: "Burgers",
    description: "A hearty burger-house favorite for a satisfying meal.",
    price: 249,
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "margherita",
    name: "Garden Margherita",
    restaurant: "The Little Oven",
    restaurantId: "little-oven",
    category: "Pizza",
    description: "A comforting Italian-style classic from the oven.",
    price: 329,
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "butter-paneer",
    name: "Paneer Butter Masala",
    restaurant: "Masala Mood",
    restaurantId: "masala-mood",
    category: "Indian",
    description: "A rich, comforting curry-house favorite.",
    price: 289,
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "chilli-noodles",
    name: "Chilli Garlic Noodles",
    restaurant: "Wok This Way",
    restaurantId: "wok-this-way",
    category: "Noodles",
    description: "A savory noodle favorite with a bold garlic finish.",
    price: 219,
    rating: "4.6",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "masala-dosa",
    name: "Golden Masala Dosa",
    restaurant: "Dosa Diaries",
    restaurantId: "dosa-diaries",
    category: "South Indian",
    description: "A crisp South Indian classic, made for a filling bite.",
    price: 179,
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "choco-brownie",
    name: "Warm Choco Brownie",
    restaurant: "The Sweet Spot",
    restaurantId: "sweet-spot",
    category: "Desserts",
    description: "A warm chocolate treat to finish on a sweet note.",
    price: 159,
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "steamed-momos",
    name: "Steamed Veg Momos",
    restaurant: "Wok This Way",
    restaurantId: "wok-this-way",
    category: "Momos",
    description: "A soft, savory snack from the neighborhood kitchen.",
    price: 189,
    rating: "4.6",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "masala-fries",
    name: "Crispy Masala Fries",
    restaurant: "Bun & Butter",
    restaurantId: "bun-butter",
    category: "Snacks",
    description: "A crisp side with a warmly spiced finish.",
    price: 129,
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "orange-cooler",
    name: "Fresh Orange Cooler",
    restaurant: "The Sweet Spot",
    restaurantId: "sweet-spot",
    category: "Drinks",
    description: "A bright, refreshing citrus drink.",
    price: 119,
    rating: "4.8",
    image: orangeDrink,
  },
  {
    id: "garden-salad",
    name: "Garden Fresh Salad",
    restaurant: "Dosa Diaries",
    restaurantId: "dosa-diaries",
    category: "Healthy food",
    description: "A fresh, light option for a feel-good meal.",
    price: 199,
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=85",
  },
];
