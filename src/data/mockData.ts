import type { Order, ServiceItem, Technician } from '../types/workshop';

export const DEFAULT_TECHNICIANS: Technician[] = [
  {
    id: 'tech-1',
    name: 'Rudi Haryanto',
    phone: '08123456781',
    role: 'Lead Specialist Coating',
    defaultCommissionPct: 15,
  },
  {
    id: 'tech-2',
    name: 'Doni Wahyudi',
    phone: '08123456782',
    role: 'Paint Correction Master',
    defaultCommissionPct: 15,
  },
  {
    id: 'tech-3',
    name: 'Eko Prasetyo',
    phone: '08123456783',
    role: 'Interior & Glass Specialist',
    defaultCommissionPct: 12.5,
  },
  {
    id: 'tech-4',
    name: 'Fajar Kurniawan',
    phone: '08123456784',
    role: 'Junior Detailer',
    defaultCommissionPct: 10,
  }
];

export const SERVICE_CATALOG: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
    category: 'coating',
    price: 3800000,
  },
  {
    id: 'srv-2',
    name: 'Paint Correction Multi-Stage Swirl Removal',
    category: 'correction',
    price: 1750000,
  },
  {
    id: 'srv-3',
    name: 'Full Interior Deep Detailing & Ozone Sanitation',
    category: 'interior',
    price: 950000,
  },
  {
    id: 'srv-4',
    name: 'Glass Polish & Rain-Repellent Coating (All Windows)',
    category: 'glass',
    price: 650000,
  },
  {
    id: 'srv-5',
    name: 'Engine Bay Detailing & Protective Dressing',
    category: 'engine',
    price: 450000,
  },
  {
    id: 'srv-6',
    name: 'Undercarriage Wash & Rust Inhibitor Spray',
    category: 'other',
    price: 400000,
  },
  {
    id: 'srv-7',
    name: 'Headlight Restoration & UV Clear Coat',
    category: 'correction',
    price: 350000,
  }
];

export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ord-088',
    spkNumber: 'SPK-202609-088',
    plateNumber: 'B 1988 NAI',
    vehicleModel: 'Toyota Fortuner 2.8 GR Sport',
    vehicleColor: 'Super White',
    customerName: 'Budi Pratama',
    customerPhone: '081234567890',
    technicianName: 'Rudi Haryanto',
    status: 'queue',
    servicePackage: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
    serviceItems: [
      {
        id: 'srv-1',
        name: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
        category: 'coating',
        price: 3800000,
      }
    ],
    polishMaterials: [
      { id: 'mat-1', name: 'CarPro CQuartz Finest Reserve 50ml', cost: 450000, quantity: '1 Botol' },
      { id: 'mat-2', name: 'Compound & Finishing Polish Pad', cost: 75000, quantity: '1 Set' }
    ],
    scratchPoints: [
      { id: 'sc-101', x: 40, y: 30, view: 'front', severity: 'minor', note: 'Stone chip halus di bumper depan' },
      { id: 'sc-102', x: 65, y: 45, view: 'left', severity: 'minor', note: 'Swirl halus di pintu kemudi' }
    ],
    initialPhotos: [
      { id: 'ph-101', label: 'Tampak Depan Bodi', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', timestamp: '2026-09-08 17:00' }
    ],
    totalServicePrice: 3800000,
    materialCost: 525000,
    technicianCommissionPct: 15,
    technicianCommissionAmount: 570000,
    discount: 0,
    finalTotal: 3800000,
    paymentStatus: 'unpaid',
    notes: 'Unit contoh verifikasi: B 1988 NAI (Budi Pratama) - Coating Platinum 9H',
    estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-001',
    spkNumber: 'SPK-202609-001',
    plateNumber: 'B 1234 NAI',
    vehicleModel: 'Toyota Innova Zenix Hybrid 2024',
    vehicleColor: 'Platinum White Pearl',
    customerName: 'Hendra Gunawan',
    customerPhone: '081234567890',
    technicianName: 'Rudi Haryanto',
    status: 'queue',
    servicePackage: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
    serviceItems: [
      {
        id: 'srv-1',
        name: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
        category: 'coating',
        price: 3800000,
      },
      {
        id: 'srv-4',
        name: 'Glass Polish & Rain-Repellent Coating (All Windows)',
        category: 'glass',
        price: 650000,
      }
    ],
    polishMaterials: [
      { id: 'mat-1', name: 'CarPro CQuartz Finest Reserve 50ml', cost: 450000, quantity: '1 Botol' },
      { id: 'mat-2', name: 'Menzerna Heavy Cut Compound 400', cost: 75000, quantity: '100ml' }
    ],
    scratchPoints: [
      { id: 'sc-1', x: 28, y: 35, view: 'left', severity: 'minor', note: 'Swirl halus di dekat gagang pintu depan kiri' },
      { id: 'sc-2', x: 75, y: 55, view: 'front', severity: 'medium', note: 'Baret kerikil (stone chip) di bumper depan bawah' }
    ],
    initialPhotos: [
      { id: 'ph-1', label: 'Tampak Depan', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', timestamp: '2026-09-08 09:15' },
      { id: 'ph-2', label: 'Baret Pintu Depan Kiri', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', timestamp: '2026-09-08 09:18' }
    ],
    totalServicePrice: 4450000,
    materialCost: 525000,
    technicianCommissionPct: 15,
    technicianCommissionAmount: 667500,
    discount: 150000,
    finalTotal: 4300000,
    paymentStatus: 'unpaid',
    notes: 'Prioritaskan pembersihan jamur kaca depan karena pemilik sering dinas malam hari.',
    estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-002',
    spkNumber: 'SPK-202609-002',
    plateNumber: 'B 8888 RFS',
    vehicleModel: 'Porsche Macan GTS 2023',
    vehicleColor: 'Jet Black Metallic',
    customerName: 'Aditya Wicaksono',
    customerPhone: '081198765432',
    technicianName: 'Doni Wahyudi',
    status: 'detailing',
    servicePackage: 'Paint Correction & Multi-Stage Swirl Removal',
    serviceItems: [
      {
        id: 'srv-2',
        name: 'Paint Correction Multi-Stage Swirl Removal',
        category: 'correction',
        price: 1750000,
      },
      {
        id: 'srv-5',
        name: 'Engine Bay Detailing & Protective Dressing',
        category: 'engine',
        price: 450000,
      }
    ],
    polishMaterials: [
      { id: 'mat-3', name: 'Koch Chemie H9.01 Heavy Cut', cost: 90000, quantity: '150ml' },
      { id: 'mat-4', name: 'Rupes Yellow Fine Finishing Foam Pad', cost: 120000, quantity: '1 Pcs' }
    ],
    scratchPoints: [
      { id: 'sc-3', x: 50, y: 30, view: 'top', severity: 'minor', note: 'Swirl mark tebal akibat cuci hidrolik biasa' },
      { id: 'sc-4', x: 80, y: 60, view: 'rear', severity: 'minor', note: 'Baret kuku di area loading bagasi' }
    ],
    initialPhotos: [
      { id: 'ph-3', label: 'Tampak Belakang', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', timestamp: '2026-09-08 10:00' }
    ],
    totalServicePrice: 2200000,
    materialCost: 210000,
    technicianCommissionPct: 15,
    technicianCommissionAmount: 330000,
    discount: 0,
    finalTotal: 2200000,
    paymentStatus: 'partial',
    notes: 'Mobil warna hitam solid, lakukan test spot di kap mesin sebelum poles seluruh bodi.',
    estimatedCompletion: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-003',
    spkNumber: 'SPK-202609-003',
    plateNumber: 'D 1904 AD',
    vehicleModel: 'Honda Civic Type R FL5',
    vehicleColor: 'Championship White',
    customerName: 'Reza Fahlevi',
    customerPhone: '087812345678',
    technicianName: 'Rudi Haryanto',
    status: 'finishing',
    servicePackage: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
    serviceItems: [
      {
        id: 'srv-1',
        name: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
        category: 'coating',
        price: 3800000,
      },
      {
        id: 'srv-3',
        name: 'Full Interior Deep Detailing & Ozone Sanitation',
        category: 'interior',
        price: 950000,
      }
    ],
    polishMaterials: [
      { id: 'mat-5', name: 'Gyeon Q2 Syncro EVO 50ml', cost: 500000, quantity: '1 Box' }
    ],
    scratchPoints: [
      { id: 'sc-5', x: 45, y: 50, view: 'right', severity: 'minor', note: 'Water spot di side skirt kanan' }
    ],
    initialPhotos: [
      { id: 'ph-4', label: 'Tampak Samping', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', timestamp: '2026-09-07 14:00' }
    ],
    totalServicePrice: 4750000,
    materialCost: 500000,
    technicianCommissionPct: 15,
    technicianCommissionAmount: 712500,
    discount: 250000,
    finalTotal: 4500000,
    paymentStatus: 'paid',
    notes: 'Sedang infrared curing layer ke-3. Jangan sampai debu menempel di sayap belakang (spoiler).',
    estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-004',
    spkNumber: 'SPK-202609-004',
    plateNumber: 'B 777 DET',
    vehicleModel: 'BMW M3 Competition G80',
    vehicleColor: 'Isle of Man Green Metallic',
    customerName: 'Kevin Sanjaya',
    customerPhone: '081377788899',
    technicianName: 'Eko Prasetyo',
    status: 'ready',
    servicePackage: 'Full Interior Deep Detailing & Ozone Sanitation',
    serviceItems: [
      {
        id: 'srv-3',
        name: 'Full Interior Deep Detailing & Ozone Sanitation',
        category: 'interior',
        price: 950000,
      },
      {
        id: 'srv-4',
        name: 'Glass Polish & Rain-Repellent Coating (All Windows)',
        category: 'glass',
        price: 650000,
      }
    ],
    polishMaterials: [
      { id: 'mat-6', name: 'Colourlock Leather Shield & Cleaner', cost: 150000, quantity: '1 Set' }
    ],
    scratchPoints: [],
    initialPhotos: [
      { id: 'ph-5', label: 'Tampak Depan Lengkap', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', timestamp: '2026-09-07 10:00' }
    ],
    totalServicePrice: 1600000,
    materialCost: 150000,
    technicianCommissionPct: 12.5,
    technicianCommissionAmount: 200000,
    discount: 0,
    finalTotal: 1600000,
    paymentStatus: 'paid',
    notes: 'Siap di pick up. Kunci mobil sudah di resepsionis depan.',
    estimatedCompletion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-005',
    spkNumber: 'SPK-202609-005',
    plateNumber: 'B 1010 KCS',
    vehicleModel: 'Mercedes-Benz G63 AMG 2023',
    vehicleColor: 'Obsidian Black',
    customerName: 'Ir. Hartono',
    customerPhone: '08111223344',
    technicianName: 'Rudi Haryanto',
    status: 'completed',
    servicePackage: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
    serviceItems: [
      {
        id: 'srv-1',
        name: 'Nano Ceramic Coating Platinum 9H (3 Layer)',
        category: 'coating',
        price: 3800000,
      }
    ],
    polishMaterials: [
      { id: 'mat-7', name: 'Gyeon Mohs EVO 50ml', cost: 480000, quantity: '1 Botol' }
    ],
    scratchPoints: [],
    initialPhotos: [],
    totalServicePrice: 3800000,
    materialCost: 480000,
    technicianCommissionPct: 15,
    technicianCommissionAmount: 570000,
    discount: 0,
    finalTotal: 3800000,
    paymentStatus: 'paid',
    notes: 'Pengerjaan tuntas memuaskan. Customer menjadwalkan maintenance 6 bulan ke depan.',
    estimatedCompletion: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];
