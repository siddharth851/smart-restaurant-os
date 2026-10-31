// Demo content for Part 1 (UI foundation). Replaced by Lovable Cloud data in later parts.
import cover from "@/assets/cover.jpg";
import paneer from "@/assets/food-paneer.jpg";
import butterChicken from "@/assets/food-butterchicken.jpg";
import biryani from "@/assets/food-biryani.jpg";
import dosa from "@/assets/food-dosa.jpg";
import lassi from "@/assets/food-lassi.jpg";
import gulab from "@/assets/food-gulab.jpg";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  veg: boolean;
  bestseller?: boolean;
  spicy?: boolean;
  available: boolean;
};

export type Category = { id: string; name: string; count?: number };

export type Restaurant = {
  slug: string;
  name: string;
  tagline: string;
  cuisine: string;
  address: string;
  rating: number;
  hours: string;
  cover: string;
  initials: string;
};

export const restaurant: Restaurant = {
  slug: "saffron-table",
  name: "Saffron Table",
  tagline: "Modern Indian kitchen · Since 2014",
  cuisine: "North & South Indian",
  address: "12 Lavelle Road, Bengaluru",
  rating: 4.7,
  hours: "11:30 AM – 11:00 PM",
  cover,
  initials: "ST",
};

export const categories: Category[] = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Main Course" },
  { id: "rice", name: "Biryani & Rice" },
  { id: "south", name: "South Indian" },
  { id: "drinks", name: "Beverages" },
  { id: "desserts", name: "Desserts" },
];

export const menuItems: MenuItem[] = [
  { id: "m1", name: "Paneer Tikka", description: "Charred cottage cheese, bell peppers and onion, marinated in hung curd and smoked spices. Served with mint chutney.", price: 320, categoryId: "starters", image: paneer, veg: true, bestseller: true, available: true },
  { id: "m2", name: "Tandoori Paneer Skewers", description: "Six-piece platter with pickled onions and lemon.", price: 360, categoryId: "starters", image: paneer, veg: true, spicy: true, available: true },
  { id: "m3", name: "Butter Chicken", description: "Tandoor-roasted chicken in a velvety tomato, butter and fenugreek gravy.", price: 420, categoryId: "mains", image: butterChicken, veg: false, bestseller: true, available: true },
  { id: "m4", name: "Murgh Makhani with Naan", description: "Our signature makhani served with two butter garlic naans.", price: 520, categoryId: "mains", image: butterChicken, veg: false, available: true },
  { id: "m5", name: "Hyderabadi Chicken Biryani", description: "Dum-cooked basmati layered with saffron, mint and slow-cooked chicken. Served with raita.", price: 450, categoryId: "rice", image: biryani, veg: false, bestseller: true, spicy: true, available: true },
  { id: "m6", name: "Masala Dosa", description: "Crisp rice crepe with spiced potato, sambar and two chutneys.", price: 180, categoryId: "south", image: dosa, veg: true, available: true },
  { id: "m7", name: "Ghee Roast Dosa", description: "Golden, paper-thin dosa roasted in clarified butter.", price: 220, categoryId: "south", image: dosa, veg: true, available: false },
  { id: "m8", name: "Mango Lassi", description: "Alphonso mango, thick yogurt, cardamom and pistachio.", price: 160, categoryId: "drinks", image: lassi, veg: true, available: true },
  { id: "m9", name: "Gulab Jamun", description: "Warm milk dumplings in rose-cardamom syrup with pistachio.", price: 150, categoryId: "desserts", image: gulab, veg: true, bestseller: true, available: true },
];

export const tables = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  number: i + 1,
  seats: [2, 4, 4, 6][i % 4] ?? 4,
  zone: i < 6 ? "Indoor" : i < 10 ? "Terrace" : "Private",
  status: (["available", "occupied", "occupied", "reserved", "available"] as const)[i % 5] ?? "available",
}));

export type OrderStatus = "new" | "preparing" | "ready" | "served";

export const orders = [
  { id: "ORD-1042", table: 4, items: [{ name: "Butter Chicken", qty: 1 }, { name: "Mango Lassi", qty: 2 }], total: 740, status: "new" as OrderStatus, minutes: 2, note: "Less spicy" },
  { id: "ORD-1041", table: 7, items: [{ name: "Paneer Tikka", qty: 2 }, { name: "Masala Dosa", qty: 1 }], total: 820, status: "preparing" as OrderStatus, minutes: 9 },
  { id: "ORD-1040", table: 2, items: [{ name: "Chicken Biryani", qty: 2 }], total: 900, status: "preparing" as OrderStatus, minutes: 14, note: "Extra raita" },
  { id: "ORD-1039", table: 11, items: [{ name: "Gulab Jamun", qty: 3 }], total: 450, status: "ready" as OrderStatus, minutes: 18 },
  { id: "ORD-1038", table: 5, items: [{ name: "Murgh Makhani with Naan", qty: 1 }, { name: "Mango Lassi", qty: 1 }], total: 680, status: "served" as OrderStatus, minutes: 32 },
  { id: "ORD-1037", table: 9, items: [{ name: "Masala Dosa", qty: 3 }], total: 540, status: "served" as OrderStatus, minutes: 41 },
];

export const staff = [
  { name: "Ananya Rao", role: "Manager", email: "ananya@saffrontable.in", status: "Active" },
  { name: "Vikram Shetty", role: "Head Chef", email: "vikram@saffrontable.in", status: "Active" },
  { name: "Meera Iyer", role: "Kitchen", email: "meera@saffrontable.in", status: "Active" },
  { name: "Rahul Nair", role: "Waiter", email: "rahul@saffrontable.in", status: "On leave" },
  { name: "Sana Khan", role: "Waiter", email: "sana@saffrontable.in", status: "Active" },
];

export const weeklyRevenue = [
  { day: "Mon", orders: 82, revenue: 38400 },
  { day: "Tue", orders: 74, revenue: 33900 },
  { day: "Wed", orders: 91, revenue: 41200 },
  { day: "Thu", orders: 88, revenue: 40100 },
  { day: "Fri", orders: 126, revenue: 61800 },
  { day: "Sat", orders: 148, revenue: 72400 },
  { day: "Sun", orders: 139, revenue: 68300 },
];

export const platformRestaurants = [
  { name: "Saffron Table", slug: "saffron-table", city: "Bengaluru", plan: "Pro", status: "Active", tables: 12, orders: 4820, owner: "Ananya Rao" },
  { name: "The Coastal Kitchen", slug: "coastal-kitchen", city: "Goa", plan: "Growth", status: "Active", tables: 18, orders: 3210, owner: "Joel D'Souza" },
  { name: "Bombay Brasserie Co.", slug: "bombay-brasserie", city: "Mumbai", plan: "Enterprise", status: "Active", tables: 40, orders: 12940, owner: "Priya Mehta" },
  { name: "Chai & Crumbs", slug: "chai-crumbs", city: "Pune", plan: "Starter", status: "Trial", tables: 6, orders: 412, owner: "Kabir Joshi" },
  { name: "Delhi Darbar", slug: "delhi-darbar", city: "New Delhi", plan: "Growth", status: "Suspended", tables: 22, orders: 6720, owner: "Arjun Malhotra" },
  { name: "Udupi Grand", slug: "udupi-grand", city: "Mangaluru", plan: "Pro", status: "Active", tables: 15, orders: 5180, owner: "Lakshmi Bhat" },
];

export const plans = [
  { name: "Starter", tables: "Up to 8 tables", restaurants: 38 },
  { name: "Growth", tables: "Up to 25 tables", restaurants: 64 },
  { name: "Pro", tables: "Up to 50 tables", restaurants: 41 },
  { name: "Enterprise", tables: "Unlimited", restaurants: 9 },
];

export const platformUsers = [
  { name: "Ananya Rao", email: "ananya@saffrontable.in", role: "Restaurant Owner", restaurant: "Saffron Table", lastActive: "2 min ago" },
  { name: "Priya Mehta", email: "priya@bombaybrasserie.in", role: "Restaurant Owner", restaurant: "Bombay Brasserie Co.", lastActive: "1 hr ago" },
  { name: "Joel D'Souza", email: "joel@coastalkitchen.in", role: "Restaurant Owner", restaurant: "The Coastal Kitchen", lastActive: "Yesterday" },
  { name: "Neha Kapoor", email: "neha@smartrestaurantos.com", role: "Super Admin", restaurant: "Platform", lastActive: "Just now" },
  { name: "Vikram Shetty", email: "vikram@saffrontable.in", role: "Staff", restaurant: "Saffron Table", lastActive: "15 min ago" },
];

export const activityLogs = [
  { time: "02:04", actor: "Neha Kapoor", action: "Suspended restaurant", target: "Delhi Darbar", type: "warning" },
  { time: "01:47", actor: "Kabir Joshi", action: "Started trial", target: "Chai & Crumbs", type: "info" },
  { time: "01:12", actor: "Priya Mehta", action: "Added 6 tables", target: "Bombay Brasserie Co.", type: "default" },
  { time: "00:58", actor: "Lakshmi Bhat", action: "Upgraded plan to Pro", target: "Udupi Grand", type: "success" },
  { time: "00:21", actor: "Ananya Rao", action: "Invited staff member", target: "Saffron Table", type: "default" },
  { time: "Yesterday", actor: "System", action: "Nightly backup completed", target: "Platform", type: "success" },
];

export const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", Number.isInteger(n) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
