export type UserRole = 'montir' | 'kasir' | 'owner';

export interface AuthUser {
  email: string;
  name: string;
  role: 'kasir' | 'owner';
}

export type OrderStatus = 'queue' | 'detailing' | 'finishing' | 'ready' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'pending';
export type CarView = 'front' | 'rear' | 'left' | 'right' | 'top';
export type ScratchSeverity = 'minor' | 'medium' | 'severe';

export interface ScratchPoint {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  view: CarView;
  severity: ScratchSeverity;
  note: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'coating' | 'correction' | 'interior' | 'glass' | 'engine' | 'other';
  price: number;
}

export interface PolishMaterial {
  id: string;
  name: string;
  cost: number;
  quantity: string;
}

export interface InitialPhoto {
  id: string;
  label: string;
  url: string;
  timestamp: string;
}

export interface Order {
  id: string;
  spkNumber: string;
  plateNumber: string; // e.g. "B 1988 NAI"
  vehicleModel: string; // e.g. "Toyota Fortuner GR Sport"
  vehicleColor: string; // e.g. "Super White"
  customerName: string;
  customerPhone: string; // e.g. "081234567890"
  technicianName: string;
  status: OrderStatus;
  servicePackage: string;
  serviceItems: ServiceItem[];
  polishMaterials: PolishMaterial[];
  scratchPoints: ScratchPoint[];
  initialPhotos: InitialPhoto[];
  totalServicePrice: number;
  materialCost: number;
  technicianCommissionPct: number; // percentage, e.g. 15
  technicianCommissionAmount: number;
  discount: number;
  finalTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amountPaid?: number; // Jumlah yang sudah dibayar (DP/Lunas)
  remainingBalance?: number; // Sisa tagihan piutang
  notes: string;
  estimatedCompletion: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type StaffRole = 
  | 'Lead Specialist Coating' 
  | 'Paint Correction Master' 
  | 'Interior & Glass Specialist' 
  | 'Junior Detailer' 
  | 'Kasir & Front Desk' 
  | 'Workshop Manager';

export interface Technician {
  id: string;
  name: string;
  phone: string;
  role: string;
  defaultCommissionPct: number;
  isActive?: boolean;
}

export type ExpenseCategory = 
  | 'obat_poles' 
  | 'konsumsi_tim' 
  | 'utilitas' 
  | 'sewa_tempat' 
  | 'alat_bengkel' 
  | 'operasional_lain';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface CashClosing {
  id: string;
  date: string;
  actualCashInDrawer: number;
  expectedCash: number;
  difference: number;
  notes: string;
  closedBy: string;
  closedAt: string;
}

export const STATUS_FLOW: OrderStatus[] = ['queue', 'detailing', 'finishing', 'ready', 'completed'];

export const STATUS_META: Record<OrderStatus, {
  label: string;
  shortLabel: string;
  stepIndex: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentHex: string;
  description: string;
}> = {
  queue: {
    label: 'Antrean Masuk',
    shortLabel: 'Antrean',
    stepIndex: 1,
    badgeBg: 'bg-blue-950/70',
    badgeBorder: 'border-blue-700/60',
    badgeText: 'text-blue-400',
    accentHex: '#3b82f6',
    description: 'Mobil baru check-in, menunggu giliran pengerjaan detailer.'
  },
  detailing: {
    label: 'Cuci & Detailing',
    shortLabel: 'Detailing',
    stepIndex: 2,
    badgeBg: 'bg-amber-950/70',
    badgeBorder: 'border-amber-700/60',
    badgeText: 'text-amber-400',
    accentHex: '#f59e0b',
    description: 'Sedang proses cuci dekon, multi-stage paint correction & coating.'
  },
  finishing: {
    label: 'Finishing / QC',
    shortLabel: 'Finishing',
    stepIndex: 3,
    badgeBg: 'bg-cyan-950/70',
    badgeBorder: 'border-cyan-700/60',
    badgeText: 'text-cyan-400',
    accentHex: '#06b6d4',
    description: 'Penyinaran infrared curing, dressing interior & quality control akhir.'
  },
  ready: {
    label: 'Siap Diambil',
    shortLabel: 'Siap Diambil',
    stepIndex: 4,
    badgeBg: 'bg-emerald-950/70',
    badgeBorder: 'border-emerald-700/60',
    badgeText: 'text-emerald-400',
    accentHex: '#10b981',
    description: 'Kendaraan telah selesai dikerjakan dan siap diambil oleh pemilik.'
  },
  completed: {
    label: 'Selesai / Lunas',
    shortLabel: 'Selesai',
    stepIndex: 5,
    badgeBg: 'bg-zinc-900',
    badgeBorder: 'border-zinc-700',
    badgeText: 'text-zinc-400',
    accentHex: '#71717a',
    description: 'Kendaraan telah diserahkan dan invoice telah lunas.'
  }
};

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; badge: string; text: string }> = {
  obat_poles: { label: 'Obat Poles & Coating', badge: 'bg-blue-950/60 border-blue-800/60', text: 'text-blue-400' },
  konsumsi_tim: { label: 'Makan & Konsumsi Tim', badge: 'bg-amber-950/60 border-amber-800/60', text: 'text-amber-400' },
  utilitas: { label: 'Listrik, Air & WiFi', badge: 'bg-cyan-950/60 border-cyan-800/60', text: 'text-cyan-400' },
  sewa_tempat: { label: 'Sewa Ruko / Workshop', badge: 'bg-purple-950/60 border-purple-800/60', text: 'text-purple-400' },
  alat_bengkel: { label: 'Pad, Tape & Alat', badge: 'bg-rose-950/60 border-rose-800/60', text: 'text-rose-400' },
  operasional_lain: { label: 'Operasional Lainnya', badge: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-300' },
};
