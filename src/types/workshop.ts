export type OrderStatus = 'queue' | 'detailing' | 'finishing' | 'ready' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
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
  notes: string;
  estimatedCompletion: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  role: string;
  defaultCommissionPct: number;
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
