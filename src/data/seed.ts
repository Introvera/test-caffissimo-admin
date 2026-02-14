import {
  Branch,
  Category,
  Product,
  BranchProduct,
  Order,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  User,
  Offer,
  FridgeStockReport,
  AttendanceEntry,
  AuditLog,
  ExternalSalesEntry,
} from "@/types";
import { subDays, format, addHours } from "date-fns";

// ============== BRANCHES ==============
export const branches: Branch[] = [
  {
    id: "branch-1",
    name: "Downtown Caffissimo",
    address: "123 Main Street, Downtown, CA 90001",
    phone: "(555) 123-4567",
    email: "downtown@caffissimo.com",
    isOpen: true,
    openingHours: {
      monday: { open: "06:00", close: "20:00" },
      tuesday: { open: "06:00", close: "20:00" },
      wednesday: { open: "06:00", close: "20:00" },
      thursday: { open: "06:00", close: "20:00" },
      friday: { open: "06:00", close: "21:00" },
      saturday: { open: "07:00", close: "21:00" },
      sunday: { open: "07:00", close: "18:00" },
    },
    uberEatsUrl: "https://ubereats.com/caffissimo-downtown",
    doorDashUrl: "https://doordash.com/caffissimo-downtown",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "branch-2",
    name: "Westside Caffissimo",
    address: "456 Ocean Boulevard, Westside, CA 90002",
    phone: "(555) 234-5678",
    email: "westside@caffissimo.com",
    isOpen: true,
    openingHours: {
      monday: { open: "07:00", close: "19:00" },
      tuesday: { open: "07:00", close: "19:00" },
      wednesday: { open: "07:00", close: "19:00" },
      thursday: { open: "07:00", close: "19:00" },
      friday: { open: "07:00", close: "20:00" },
      saturday: { open: "08:00", close: "20:00" },
      sunday: { open: "08:00", close: "17:00" },
    },
    uberEatsUrl: "https://ubereats.com/caffissimo-westside",
    doorDashUrl: "https://doordash.com/caffissimo-westside",
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
  },
  {
    id: "branch-3",
    name: "University Caffissimo",
    address: "789 College Ave, University District, CA 90003",
    phone: "(555) 345-6789",
    email: "university@caffissimo.com",
    isOpen: false,
    openingHours: {
      monday: { open: "06:30", close: "22:00" },
      tuesday: { open: "06:30", close: "22:00" },
      wednesday: { open: "06:30", close: "22:00" },
      thursday: { open: "06:30", close: "22:00" },
      friday: { open: "06:30", close: "23:00" },
      saturday: { open: "08:00", close: "23:00" },
      sunday: { open: "09:00", close: "20:00" },
    },
    uberEatsUrl: "https://ubereats.com/caffissimo-university",
    doorDashUrl: "https://doordash.com/caffissimo-university",
    createdAt: "2024-06-15T08:00:00Z",
    updatedAt: "2024-06-15T08:00:00Z",
  },
];

// ============== CATEGORIES ==============
export const categories: Category[] = [
  { id: "cat-1", name: "Espresso Drinks", description: "Classic espresso-based beverages", sortOrder: 1 },
  { id: "cat-2", name: "Cold Brew & Iced", description: "Refreshing cold coffee drinks", sortOrder: 2 },
  { id: "cat-3", name: "Tea & Specialty", description: "Premium teas and specialty drinks", sortOrder: 3 },
  { id: "cat-4", name: "Pastries", description: "Fresh baked goods", sortOrder: 4 },
  { id: "cat-5", name: "Sandwiches", description: "Fresh made sandwiches", sortOrder: 5 },
  { id: "cat-6", name: "Merchandise", description: "Coffee beans and merchandise", sortOrder: 6 },
];

// ============== PRODUCTS ==============
export const products: Product[] = [
  // Espresso Drinks
  { id: "prod-1", name: "Classic Espresso", description: "Rich, bold single or double shot of espresso", categoryId: "cat-1", images: ["/products/espresso.jpg"], tags: ["hot", "classic", "strong"], tastingNotes: "Bold, rich, with hints of dark chocolate", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-2", name: "Caffissimo Latte", description: "Smooth espresso with steamed milk and light foam", categoryId: "cat-1", images: ["/products/latte.jpg"], tags: ["hot", "popular", "creamy"], tastingNotes: "Smooth, creamy, balanced sweetness", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-3", name: "Cappuccino", description: "Equal parts espresso, steamed milk, and foam", categoryId: "cat-1", images: ["/products/cappuccino.jpg"], tags: ["hot", "classic", "frothy"], tastingNotes: "Light, airy, with rich espresso notes", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-4", name: "Americano", description: "Espresso diluted with hot water", categoryId: "cat-1", images: ["/products/americano.jpg"], tags: ["hot", "classic", "strong"], tastingNotes: "Bold yet smooth, full-bodied flavor", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-5", name: "Flat White", description: "Velvety microfoam with ristretto shots", categoryId: "cat-1", images: ["/products/flatwhite.jpg"], tags: ["hot", "smooth", "popular"], tastingNotes: "Silky, intense coffee flavor", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-6", name: "Mocha", description: "Espresso with chocolate and steamed milk", categoryId: "cat-1", images: ["/products/mocha.jpg"], tags: ["hot", "sweet", "chocolate"], tastingNotes: "Rich chocolate meets bold espresso", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-7", name: "Caramel Macchiato", description: "Vanilla-flavored latte with caramel drizzle", categoryId: "cat-1", images: ["/products/caramel-macchiato.jpg"], tags: ["hot", "sweet", "popular"], tastingNotes: "Sweet vanilla with caramel finish", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  // Cold Brew & Iced
  { id: "prod-8", name: "Signature Cold Brew", description: "20-hour steeped cold brew coffee", categoryId: "cat-2", images: ["/products/cold-brew.jpg"], tags: ["cold", "popular", "smooth"], tastingNotes: "Naturally sweet, low acidity, chocolatey", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-9", name: "Iced Latte", description: "Espresso poured over cold milk and ice", categoryId: "cat-2", images: ["/products/iced-latte.jpg"], tags: ["cold", "refreshing", "creamy"], tastingNotes: "Crisp, refreshing, balanced", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-10", name: "Nitro Cold Brew", description: "Cold brew infused with nitrogen for a creamy texture", categoryId: "cat-2", images: ["/products/nitro.jpg"], tags: ["cold", "premium", "smooth"], tastingNotes: "Cascading bubbles, velvety mouthfeel", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-11", name: "Vanilla Sweet Cream Cold Brew", description: "Cold brew topped with vanilla sweet cream", categoryId: "cat-2", images: ["/products/vanilla-cold-brew.jpg"], tags: ["cold", "sweet", "popular"], tastingNotes: "Sweet cream swirls with bold coffee", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-12", name: "Iced Americano", description: "Espresso with cold water over ice", categoryId: "cat-2", images: ["/products/iced-americano.jpg"], tags: ["cold", "refreshing", "strong"], tastingNotes: "Bold, crisp, refreshing", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  // Tea & Specialty
  { id: "prod-13", name: "Chai Latte", description: "Spiced black tea with steamed milk", categoryId: "cat-3", images: ["/products/chai.jpg"], tags: ["hot", "spiced", "sweet"], tastingNotes: "Warm spices, creamy, comforting", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-14", name: "Matcha Latte", description: "Premium Japanese matcha with steamed milk", categoryId: "cat-3", images: ["/products/matcha.jpg"], tags: ["hot", "earthy", "healthy"], tastingNotes: "Earthy, smooth, slightly sweet", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-15", name: "London Fog", description: "Earl Grey tea with vanilla and steamed milk", categoryId: "cat-3", images: ["/products/london-fog.jpg"], tags: ["hot", "aromatic", "calming"], tastingNotes: "Bergamot, vanilla, creamy finish", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-16", name: "Golden Turmeric Latte", description: "Anti-inflammatory turmeric blend with milk", categoryId: "cat-3", images: ["/products/turmeric.jpg"], tags: ["hot", "healthy", "spiced"], tastingNotes: "Warm, earthy, hints of ginger", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-17", name: "Hot Chocolate", description: "Rich Belgian chocolate with steamed milk", categoryId: "cat-3", images: ["/products/hot-chocolate.jpg"], tags: ["hot", "sweet", "indulgent"], tastingNotes: "Rich, creamy, deeply chocolatey", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  // Pastries
  { id: "prod-18", name: "Butter Croissant", description: "Flaky, buttery French croissant", categoryId: "cat-4", images: ["/products/croissant.jpg"], tags: ["bakery", "classic", "buttery"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-19", name: "Almond Croissant", description: "Croissant filled with almond cream", categoryId: "cat-4", images: ["/products/almond-croissant.jpg"], tags: ["bakery", "sweet", "nutty"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-20", name: "Blueberry Muffin", description: "Moist muffin loaded with fresh blueberries", categoryId: "cat-4", images: ["/products/blueberry-muffin.jpg"], tags: ["bakery", "fruity", "breakfast"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-21", name: "Chocolate Chip Cookie", description: "Freshly baked with Belgian chocolate", categoryId: "cat-4", images: ["/products/cookie.jpg"], tags: ["bakery", "sweet", "chocolate"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-22", name: "Cinnamon Roll", description: "Warm, gooey cinnamon roll with cream cheese frosting", categoryId: "cat-4", images: ["/products/cinnamon-roll.jpg"], tags: ["bakery", "sweet", "warm"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-23", name: "Banana Bread", description: "Moist banana bread with walnuts", categoryId: "cat-4", images: ["/products/banana-bread.jpg"], tags: ["bakery", "classic", "nutty"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  // Sandwiches
  { id: "prod-24", name: "Avocado Toast", description: "Smashed avocado on artisan sourdough", categoryId: "cat-5", images: ["/products/avocado-toast.jpg"], tags: ["savory", "healthy", "breakfast"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-25", name: "Turkey Club", description: "Roasted turkey, bacon, lettuce, tomato", categoryId: "cat-5", images: ["/products/turkey-club.jpg"], tags: ["savory", "lunch", "protein"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-26", name: "Caprese Panini", description: "Fresh mozzarella, tomato, basil, balsamic", categoryId: "cat-5", images: ["/products/caprese.jpg"], tags: ["savory", "vegetarian", "lunch"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-27", name: "Breakfast Burrito", description: "Eggs, cheese, salsa, choice of protein", categoryId: "cat-5", images: ["/products/breakfast-burrito.jpg"], tags: ["savory", "breakfast", "filling"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  // Merchandise
  { id: "prod-28", name: "House Blend Beans (12oz)", description: "Our signature medium roast blend", categoryId: "cat-6", images: ["/products/house-blend.jpg"], tags: ["beans", "merchandise"], tastingNotes: "Balanced, nutty, chocolate undertones", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-29", name: "Single Origin Ethiopia (12oz)", description: "Bright, fruity Ethiopian beans", categoryId: "cat-6", images: ["/products/ethiopia.jpg"], tags: ["beans", "single-origin"], tastingNotes: "Bright, floral, berry notes", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "prod-30", name: "Caffissimo Travel Mug", description: "16oz insulated stainless steel mug", categoryId: "cat-6", images: ["/products/mug.jpg"], tags: ["merchandise", "drinkware"], tastingNotes: "", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
];

// ============== BRANCH PRODUCTS ==============
function generateBranchProducts(): BranchProduct[] {
  const result: BranchProduct[] = [];
  let id = 1;

  for (const branch of branches) {
    for (const product of products) {
      const basePrice = getBasePrice(product.categoryId);
      const priceVariation = branch.id === "branch-1" ? 0 : branch.id === "branch-2" ? 0.25 : -0.25;
      
      // Deterministic availability/visibility based on id
      const isAvailable = id % 10 !== 0; // 90% available
      const isVisible = id % 20 !== 0; // 95% visible
      
      result.push({
        id: `bp-${id++}`,
        productId: product.id,
        branchId: branch.id,
        price: parseFloat((basePrice + priceVariation).toFixed(2)),
        isAvailable,
        isVisible,
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-01-15T08:00:00Z",
      });
    }
  }

  return result;
}

function getBasePrice(categoryId: string): number {
  switch (categoryId) {
    case "cat-1": return 4.50;
    case "cat-2": return 5.25;
    case "cat-3": return 5.00;
    case "cat-4": return 3.75;
    case "cat-5": return 9.50;
    case "cat-6": return 16.00;
    default: return 5.00;
  }
}

export const branchProducts = generateBranchProducts();

// ============== USERS ==============
export const users: User[] = [
  { id: "user-1", name: "Alex Johnson", email: "alex@caffissimo.com", role: "super_admin", avatar: "", isActive: true, createdAt: "2024-01-01T08:00:00Z", updatedAt: "2024-01-01T08:00:00Z" },
  { id: "user-2", name: "Maria Garcia", email: "maria@caffissimo.com", role: "branch_owner", branchId: "branch-1", avatar: "", isActive: true, createdAt: "2024-01-15T08:00:00Z", updatedAt: "2024-01-15T08:00:00Z" },
  { id: "user-3", name: "James Wilson", email: "james@caffissimo.com", role: "branch_owner", branchId: "branch-2", avatar: "", isActive: true, createdAt: "2024-03-01T08:00:00Z", updatedAt: "2024-03-01T08:00:00Z" },
  { id: "user-4", name: "Sarah Chen", email: "sarah@caffissimo.com", role: "branch_owner", branchId: "branch-3", avatar: "", isActive: true, createdAt: "2024-06-15T08:00:00Z", updatedAt: "2024-06-15T08:00:00Z" },
  { id: "user-5", name: "Michael Brown", email: "michael@caffissimo.com", role: "supervisor", branchId: "branch-1", avatar: "", isActive: true, createdAt: "2024-02-01T08:00:00Z", updatedAt: "2024-02-01T08:00:00Z" },
  { id: "user-6", name: "Emily Davis", email: "emily@caffissimo.com", role: "supervisor", branchId: "branch-2", avatar: "", isActive: true, createdAt: "2024-04-01T08:00:00Z", updatedAt: "2024-04-01T08:00:00Z" },
  { id: "user-7", name: "David Lee", email: "david@caffissimo.com", role: "cashier", branchId: "branch-1", avatar: "", isActive: true, createdAt: "2024-02-15T08:00:00Z", updatedAt: "2024-02-15T08:00:00Z" },
  { id: "user-8", name: "Jessica Martinez", email: "jessica@caffissimo.com", role: "cashier", branchId: "branch-1", avatar: "", isActive: true, createdAt: "2024-02-15T08:00:00Z", updatedAt: "2024-02-15T08:00:00Z" },
  { id: "user-9", name: "Chris Taylor", email: "chris@caffissimo.com", role: "cashier", branchId: "branch-2", avatar: "", isActive: true, createdAt: "2024-04-15T08:00:00Z", updatedAt: "2024-04-15T08:00:00Z" },
  { id: "user-10", name: "Amanda White", email: "amanda@caffissimo.com", role: "cashier", branchId: "branch-3", avatar: "", isActive: false, createdAt: "2024-07-01T08:00:00Z", updatedAt: "2024-07-01T08:00:00Z" },
];

// Seeded random number generator for deterministic data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Use a fixed base date for consistent data
const BASE_DATE = new Date("2026-02-05T12:00:00Z");

// ============== ORDERS ==============
function generateOrders(): Order[] {
  const orders: Order[] = [];
  const sources: OrderSource[] = ["pos", "pos", "pos", "ecommerce", "uber_eats", "doordash"];
  const statuses: OrderStatus[] = ["completed", "completed", "completed", "completed", "cancelled", "ready", "preparing"];
  const paymentMethods: PaymentMethod[] = ["cash", "card", "card", "card", "online"];

  const customerNames = ["John D.", "Sarah M.", "Mike T.", "Emma R.", "Alex K.", "Lisa P.", "Tom H.", "Jane S.", null, null];
  
  const random = seededRandom(12345);

  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(random() * 30);
    const hoursAgo = Math.floor(random() * 14) + 6;
    const orderDate = addHours(subDays(BASE_DATE, daysAgo), -hoursAgo);
    
    const source = sources[Math.floor(random() * sources.length)];
    const branch = branches[Math.floor(random() * branches.length)];
    const status = statuses[Math.floor(random() * statuses.length)];
    
    const itemCount = Math.floor(random() * 4) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(random() * products.length)];
      const bp = branchProducts.find(bp => bp.productId === product.id && bp.branchId === branch.id);
      const quantity = Math.floor(random() * 2) + 1;
      const unitPrice = bp?.price || 5.00;
      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      items.push({
        id: `item-${i}-${j}`,
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
      });
    }

    const tax = parseFloat((subtotal * 0.0875).toFixed(2));
    const discount = random() > 0.8 ? parseFloat((subtotal * 0.1).toFixed(2)) : 0;
    const total = parseFloat((subtotal + tax - discount).toFixed(2));

    const paymentMethod: PaymentMethod = source === "uber_eats" || source === "doordash" 
      ? "external" 
      : source === "ecommerce" 
        ? "online" 
        : paymentMethods[Math.floor(random() * paymentMethods.length)];

    const customerName = source === "pos" && random() > 0.5 
      ? null 
      : customerNames[Math.floor(random() * customerNames.length)];
    
    const extId = `EXT-${String(i + 1000).toUpperCase()}`;

    orders.push({
      id: `order-${i + 1}`,
      orderNumber: `ORD-${format(orderDate, "yyyyMMdd")}-${String(i + 1).padStart(4, "0")}`,
      branchId: branch.id,
      source,
      status,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      discount,
      total,
      paymentMethod,
      customerName: customerName || undefined,
      customerEmail: customerName ? `${customerName.toLowerCase().replace(" ", ".")}@email.com` : undefined,
      notes: i % 5 === 0 ? "Extra hot please" : undefined,
      internalNotes: status === "cancelled" ? "Customer requested cancellation" : undefined,
      externalOrderId: source === "uber_eats" || source === "doordash" ? extId : undefined,
      isReadOnly: source === "uber_eats" || source === "doordash",
      statusHistory: [
        { status: "pending", timestamp: orderDate.toISOString() },
        { status: "confirmed", timestamp: addHours(orderDate, 0.05).toISOString() },
        ...(status !== "pending" && status !== "confirmed" ? [{ status, timestamp: addHours(orderDate, 0.5).toISOString() }] : []),
      ],
      createdAt: orderDate.toISOString(),
      updatedAt: addHours(orderDate, 0.5).toISOString(),
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const orders = generateOrders();

// ============== EXTERNAL SALES ENTRIES ==============
function generateExternalSales(): ExternalSalesEntry[] {
  const entries: ExternalSalesEntry[] = [];
  let id = 1;

  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = subDays(BASE_DATE, daysAgo);
    const dateStr = format(date, "yyyy-MM-dd");

    for (const branch of branches) {
      // Uber Eats - deterministic inclusion based on daysAgo
      if (daysAgo % 5 !== 0) {
        const salesAmount = 100 + ((id * 37) % 300);
        entries.push({
          id: `ext-${id++}`,
          branchId: branch.id,
          platform: "uber_eats",
          date: dateStr,
          totalSales: parseFloat(salesAmount.toFixed(2)),
          orderCount: 5 + (id % 15),
          source: id % 2 === 0 ? "import" : "manual",
          createdAt: date.toISOString(),
        });
      }

      // DoorDash - deterministic inclusion
      if (daysAgo % 4 !== 0) {
        const salesAmount = 80 + ((id * 23) % 250);
        entries.push({
          id: `ext-${id++}`,
          branchId: branch.id,
          platform: "doordash",
          date: dateStr,
          totalSales: parseFloat(salesAmount.toFixed(2)),
          orderCount: 4 + (id % 12),
          source: id % 2 === 0 ? "import" : "manual",
          createdAt: date.toISOString(),
        });
      }
    }
  }

  return entries;
}

export const externalSalesEntries = generateExternalSales();

// ============== OFFERS ==============
export const offers: Offer[] = [
  {
    id: "offer-1",
    name: "Morning Rush 20% Off",
    description: "20% off all espresso drinks before 9am",
    discountType: "percent",
    discountValue: 20,
    startDate: subDays(BASE_DATE, 5).toISOString(),
    endDate: addHours(BASE_DATE, 24 * 30).toISOString(),
    categoryIds: ["cat-1"],
    branchIds: ["branch-1", "branch-2", "branch-3"],
    isActive: true,
    createdAt: subDays(BASE_DATE, 5).toISOString(),
    updatedAt: subDays(BASE_DATE, 5).toISOString(),
  },
  {
    id: "offer-2",
    name: "$2 Off Cold Brew",
    description: "$2 off any cold brew on Fridays",
    discountType: "fixed",
    discountValue: 2,
    startDate: subDays(BASE_DATE, 10).toISOString(),
    endDate: addHours(BASE_DATE, 24 * 20).toISOString(),
    categoryIds: ["cat-2"],
    branchIds: ["branch-1"],
    isActive: true,
    createdAt: subDays(BASE_DATE, 10).toISOString(),
    updatedAt: subDays(BASE_DATE, 10).toISOString(),
  },
  {
    id: "offer-3",
    name: "Student Discount",
    description: "15% off with valid student ID",
    discountType: "percent",
    discountValue: 15,
    startDate: subDays(BASE_DATE, 60).toISOString(),
    endDate: addHours(BASE_DATE, 24 * 90).toISOString(),
    branchIds: ["branch-3"],
    isActive: true,
    createdAt: subDays(BASE_DATE, 60).toISOString(),
    updatedAt: subDays(BASE_DATE, 60).toISOString(),
  },
];

// ============== FRIDGE STOCK REPORTS ==============
function generateFridgeReports(): FridgeStockReport[] {
  const reports: FridgeStockReport[] = [];
  const fridgeUnits = [
    "Main Fridge",
    "Milk Fridge",
    "Pastry Display Fridge",
    "Walk-in Cooler",
  ];

  let tempSeed = 100;
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const date = subDays(BASE_DATE, daysAgo);
    const dateStr = format(date, "yyyy-MM-dd");

    for (const branch of branches) {
      reports.push({
        id: `fridge-${branch.id}-${dateStr}`,
        branchId: branch.id,
        date: dateStr,
        temperatures: fridgeUnits.map((name, idx) => ({
          name,
          temperature: parseFloat((34 + ((tempSeed++ * 7 + idx) % 10) * 0.5).toFixed(1)),
        })),
        notes: daysAgo % 3 === 0 ? "Walk-in cooler running slightly warm" : undefined,
        submittedBy: users.find((u) => u.branchId === branch.id && u.role === "supervisor")?.name || "Staff",
        createdAt: date.toISOString(),
      });
    }
  }

  return reports;
}

export const fridgeStockReports = generateFridgeReports();

// ============== ATTENDANCE ==============
function generateAttendance(): AttendanceEntry[] {
  const entries: AttendanceEntry[] = [];
  const staffUsers = users.filter((u) => u.role === "cashier" || u.role === "supervisor");

  let attSeed = 200;
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const date = subDays(BASE_DATE, daysAgo);
    const dateStr = format(date, "yyyy-MM-dd");

    for (const user of staffUsers) {
      // Deterministic status based on seed
      const statusVal = (attSeed++ * 13) % 100;
      const status = statusVal < 5 ? "absent" : statusVal < 15 ? "late" : "present";
      
      const checkInMin = (attSeed * 3) % 30;
      const checkOutHour = 16 + ((attSeed * 5) % 3);
      const checkOutMin = (attSeed * 7) % 60;
      
      entries.push({
        id: `att-${user.id}-${dateStr}`,
        branchId: user.branchId!,
        userId: user.id,
        userName: user.name,
        date: dateStr,
        status,
        checkIn: status !== "absent" ? `${status === "late" ? "09" : "08"}:${checkInMin.toString().padStart(2, "0")}` : undefined,
        checkOut: status !== "absent" ? `${checkOutHour}:${checkOutMin.toString().padStart(2, "0")}` : undefined,
        createdAt: date.toISOString(),
      });
    }
  }

  return entries;
}

export const attendanceEntries = generateAttendance();

// ============== AUDIT LOGS ==============
function generateAuditLogs(): AuditLog[] {
  const logs: AuditLog[] = [];
  const actions: { action: AuditLog["action"]; entityType: string }[] = [
    { action: "price_change", entityType: "BranchProduct" },
    { action: "offer_change", entityType: "Offer" },
    { action: "order_cancelled", entityType: "Order" },
    { action: "product_updated", entityType: "Product" },
    { action: "branch_updated", entityType: "Branch" },
    { action: "user_created", entityType: "User" },
  ];

  for (let i = 0; i < 50; i++) {
    const daysAgo = (i * 17) % 30;
    const date = subDays(BASE_DATE, daysAgo);
    const actionIdx = i % actions.length;
    const { action, entityType } = actions[actionIdx];
    const user = users[i % 4];

    logs.push({
      id: `log-${i + 1}`,
      action,
      entityType,
      entityId: `${entityType.toLowerCase()}-${(i % 10) + 1}`,
      userId: user.id,
      userName: user.name,
      branchId: user.branchId,
      details: action === "price_change" 
        ? { oldPrice: 4.50, newPrice: 4.75, productName: "Caffissimo Latte" }
        : action === "order_cancelled"
          ? { orderId: `order-${i}`, reason: "Customer request" }
          : { note: "Updated via admin panel" },
      createdAt: date.toISOString(),
    });
  }

  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const auditLogs = generateAuditLogs();
