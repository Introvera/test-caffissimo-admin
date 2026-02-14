// ============== ROLES ==============
export type Role = "super_admin" | "branch_owner" | "supervisor" | "cashier";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============== BRANCHES ==============
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isOpen: boolean;
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  uberEatsUrl?: string;
  doorDashUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============== PRODUCTS ==============
export interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  images: string[];
  tags: string[];
  tastingNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchProduct {
  id: string;
  productId: string;
  branchId: string;
  price: number;
  isAvailable: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============== ORDERS ==============
export type OrderSource = "pos" | "ecommerce" | "uber_eats" | "doordash";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
export type PaymentMethod = "cash" | "card" | "online" | "external";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  branchId: string;
  source: OrderSource;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  internalNotes?: string;
  externalOrderId?: string;
  isReadOnly: boolean;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
}

// ============== EXTERNAL PLATFORM SALES ==============
export interface ExternalSalesEntry {
  id: string;
  branchId: string;
  platform: "uber_eats" | "doordash";
  date: string;
  totalSales: number;
  orderCount: number;
  source: "manual" | "import";
  importedAt?: string;
  createdAt: string;
}

// ============== OFFERS ==============
export type DiscountType = "percent" | "fixed";

export interface Offer {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  productIds?: string[];
  categoryIds?: string[];
  branchIds?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============== FRIDGE STOCK ==============
export interface FridgeTemperatureEntry {
  name: string;
  temperature: number; // in °F
}

export interface FridgeStockReport {
  id: string;
  branchId: string;
  date: string;
  temperatures: FridgeTemperatureEntry[];
  notes?: string;
  submittedBy: string;
  createdAt: string;
}

// ============== ATTENDANCE ==============
export type AttendanceStatus = "present" | "absent" | "late" | "half_day";

export interface AttendanceEntry {
  id: string;
  branchId: string;
  userId: string;
  userName: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  createdAt: string;
}

// ============== AUDIT LOGS ==============
export type AuditAction =
  | "price_change"
  | "offer_change"
  | "order_cancelled"
  | "user_created"
  | "user_updated"
  | "branch_updated"
  | "product_created"
  | "product_updated"
  | "stock_report"
  | "attendance_updated"
  | "settings_updated";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  branchId?: string;
  details: Record<string, unknown>;
  createdAt: string;
}

// ============== SETTINGS ==============
export interface Settings {
  id: string;
  taxRate: number;
  serviceFeeRate: number;
  updatedAt: string;
}

// ============== FILTERS ==============
export interface DateRange {
  from: Date;
  to: Date;
}

export type DateRangePreset = "today" | "7d" | "30d" | "custom";

export interface ReportFilters {
  dateRange: DateRange;
  branchId?: string;
  source?: OrderSource | "all";
  paymentMethod?: PaymentMethod | "all";
  status?: OrderStatus | "all";
}
