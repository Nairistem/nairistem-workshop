import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Order, OrderStatus, Technician, ServiceItem, UserRole, 
  Expense, CashClosing, PaymentMethod 
} from '../types/workshop';
import { 
  INITIAL_MOCK_ORDERS, DEFAULT_TECHNICIANS, SERVICE_CATALOG, 
  INITIAL_MOCK_EXPENSES 
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface WorkshopContextType {
  // Role & Navigation
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Orders
  orders: Order[];
  createOrder: (newOrderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'spkNumber'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  processPayment: (orderId: string, paymentMethod: PaymentMethod, amountPaid: number, notes?: string) => Promise<void>;
  getOrderByPlate: (plateNumber: string) => Order | undefined;

  // Technicians / Staff CRUD
  technicians: Technician[];
  addTechnician: (techData: Omit<Technician, 'id'>) => Promise<Technician>;
  updateTechnician: (id: string, updates: Partial<Technician>) => Promise<void>;
  deleteTechnician: (id: string) => Promise<void>;

  // Expenses CRUD
  expenses: Expense[];
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Cash Closing
  cashClosings: CashClosing[];
  addCashClosing: (closingData: Omit<CashClosing, 'id' | 'closedAt'>) => Promise<CashClosing>;

  // Financial Summaries (Executive / Owner)
  financials: {
    totalGrossRevenue: number;
    totalPaidRevenue: number;
    totalUnpaidReceivables: number;
    totalCommissionPayable: number;
    totalExpenses: number;
    realNetProfit: number;
    cashPaymentsTotal: number;
    transferPaymentsTotal: number;
    qrisPaymentsTotal: number;
  };

  // Base Data & State
  serviceCatalog: ServiceItem[];
  isLiveMode: boolean;
  isLoading: boolean;
  resetToMockData: () => void;
  syncWithSupabase: () => Promise<void>;
}

const ORDERS_KEY = 'nairistem_workshop_orders_v2';
const TECHS_KEY = 'nairistem_workshop_technicians_v2';
const EXPENSES_KEY = 'nairistem_workshop_expenses_v2';
const CLOSINGS_KEY = 'nairistem_workshop_cash_closings_v2';
const ROLE_KEY = 'nairistem_workshop_role_v2';

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Current Active Role
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_KEY);
      if (saved === 'montir' || saved === 'kasir' || saved === 'owner') return saved;
    } catch {}
    return 'montir'; // Default to workshop bay for mechanics or user choice
  });

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch {}
  };

  // 2. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Using mock orders fallback', e);
    }
    return INITIAL_MOCK_ORDERS;
  });

  // 3. Technicians State (CRUD)
  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    try {
      const saved = localStorage.getItem(TECHS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Using default technicians fallback', e);
    }
    return DEFAULT_TECHNICIANS;
  });

  // 4. Expenses State (CRUD)
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(EXPENSES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Using default expenses fallback', e);
    }
    return INITIAL_MOCK_EXPENSES;
  });

  // 5. Cash Closings State
  const [cashClosings, setCashClosings] = useState<CashClosing[]>(() => {
    try {
      const saved = localStorage.getItem(CLOSINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [serviceCatalog] = useState<ServiceItem[]>(SERVICE_CATALOG);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(isSupabaseConfigured);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('LocalStorage write error (orders)', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(TECHS_KEY, JSON.stringify(technicians));
    } catch (e) {
      console.error('LocalStorage write error (technicians)', e);
    }
  }, [technicians]);

  useEffect(() => {
    try {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('LocalStorage write error (expenses)', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(CLOSINGS_KEY, JSON.stringify(cashClosings));
    } catch (e) {
      console.error('LocalStorage write error (closings)', e);
    }
  }, [cashClosings]);

  // Initial Sync with remote Supabase
  useEffect(() => {
    if (isSupabaseConfigured) {
      syncWithSupabase();
    }
  }, []);

  const syncWithSupabase = async () => {
    if (!supabase) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const remoteOrders: Order[] = data.map((item: any) => ({
          id: item.id,
          spkNumber: item.spk_number,
          plateNumber: item.plate_number,
          vehicleModel: item.vehicle_model,
          vehicleColor: item.vehicle_color,
          customerName: item.customer_name,
          customerPhone: item.customer_phone,
          technicianName: item.technician_name,
          status: item.status as OrderStatus,
          servicePackage: item.service_package,
          serviceItems: item.service_items || [],
          polishMaterials: item.polish_materials || [],
          scratchPoints: item.scratch_points || [],
          initialPhotos: item.initial_photos || [],
          totalServicePrice: Number(item.total_service_price || 0),
          materialCost: Number(item.material_cost || 0),
          technicianCommissionPct: Number(item.technician_commission_pct || 15),
          technicianCommissionAmount: Number(item.technician_commission_amount || 0),
          discount: Number(item.discount || 0),
          finalTotal: Number(item.final_total || 0),
          paymentStatus: item.payment_status || 'unpaid',
          paymentMethod: item.payment_method || (item.payment_status === 'paid' ? 'transfer' : 'pending'),
          amountPaid: item.amount_paid !== undefined ? Number(item.amount_paid) : (item.payment_status === 'paid' ? Number(item.final_total) : 0),
          remainingBalance: item.remaining_balance !== undefined ? Number(item.remaining_balance) : (item.payment_status === 'paid' ? 0 : Number(item.final_total)),
          notes: item.notes || '',
          estimatedCompletion: item.estimated_completion || new Date().toISOString(),
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        setOrders(remoteOrders);
        setIsLiveMode(true);
      }
    } catch (err) {
      console.warn('Supabase sync fallback to Local Sandbox', err);
      setIsLiveMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Orders Actions ---
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'spkNumber'>): Promise<Order> => {
    const nextIndex = orders.length + 1;
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const spkNumber = `SPK-${yearMonth}-${String(nextIndex).padStart(3, '0')}`;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ord-${Date.now()}`;

    const newOrder: Order = {
      ...orderData,
      id,
      spkNumber,
      paymentMethod: orderData.paymentMethod || 'pending',
      amountPaid: orderData.amountPaid || 0,
      remainingBalance: orderData.remainingBalance !== undefined ? orderData.remainingBalance : orderData.finalTotal,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    if (supabase && isLiveMode) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          spk_number: newOrder.spkNumber,
          plate_number: newOrder.plateNumber,
          vehicle_model: newOrder.vehicleModel,
          vehicle_color: newOrder.vehicleColor,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          technician_name: newOrder.technicianName,
          status: newOrder.status,
          service_package: newOrder.servicePackage,
          service_items: newOrder.serviceItems,
          polish_materials: newOrder.polishMaterials,
          scratch_points: newOrder.scratchPoints,
          initial_photos: newOrder.initialPhotos,
          total_service_price: newOrder.totalServicePrice,
          material_cost: newOrder.materialCost,
          technician_commission_pct: newOrder.technicianCommissionPct,
          technician_commission_amount: newOrder.technicianCommissionAmount,
          discount: newOrder.discount,
          final_total: newOrder.finalTotal,
          payment_status: newOrder.paymentStatus,
          notes: newOrder.notes,
          estimated_completion: newOrder.estimatedCompletion,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt
        });
      } catch (e) {
        console.error('Supabase order insert error', e);
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updatedAt = new Date().toISOString();
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status, updatedAt } : order
    ));

    if (supabase && isLiveMode) {
      try {
        await supabase.from('orders').update({ status, updated_at: updatedAt }).eq('id', orderId);
      } catch (e) {
        console.error('Supabase status update error', e);
      }
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    const updatedAt = new Date().toISOString();
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates, updatedAt } : order
    ));

    if (supabase && isLiveMode) {
      try {
        const payload: any = { updated_at: updatedAt };
        if (updates.status) payload.status = updates.status;
        if (updates.paymentStatus) payload.payment_status = updates.paymentStatus;
        if (updates.finalTotal !== undefined) payload.final_total = updates.finalTotal;
        if (updates.technicianCommissionAmount !== undefined) payload.technician_commission_amount = updates.technicianCommissionAmount;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.scratchPoints) payload.scratch_points = updates.scratchPoints;
        if (updates.initialPhotos) payload.initial_photos = updates.initialPhotos;

        await supabase.from('orders').update(payload).eq('id', orderId);
      } catch (e) {
        console.error('Supabase order update error', e);
      }
    }
  };

  const processPayment = async (
    orderId: string, 
    paymentMethod: PaymentMethod, 
    paidNow: number,
    notes?: string
  ) => {
    const updatedAt = new Date().toISOString();
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const currentPaid = order.amountPaid || 0;
      const newTotalPaid = Math.min(order.finalTotal, currentPaid + paidNow);
      const remaining = Math.max(0, order.finalTotal - newTotalPaid);
      const paymentStatus = remaining === 0 ? 'paid' : (newTotalPaid > 0 ? 'partial' : 'unpaid');
      const updatedNotes = notes ? `${order.notes ? order.notes + ' | ' : ''}${notes}` : order.notes;

      return {
        ...order,
        paymentStatus,
        paymentMethod,
        amountPaid: newTotalPaid,
        remainingBalance: remaining,
        notes: updatedNotes,
        updatedAt
      };
    }));

    if (supabase && isLiveMode) {
      try {
        await supabase.from('orders').update({
          payment_status: paidNow >= 0 ? 'paid' : 'partial',
          updated_at: updatedAt
        }).eq('id', orderId);
      } catch (e) {
        console.error('Supabase process payment error', e);
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    if (supabase && isLiveMode) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (e) {
        console.error('Supabase delete order error', e);
      }
    }
  };

  const getOrderByPlate = (plateNumber: string): Order | undefined => {
    if (!plateNumber) return undefined;
    const cleanSearch = plateNumber.replace(/\s+/g, '').toUpperCase();
    return orders.find(ord => ord.plateNumber.replace(/\s+/g, '').toUpperCase() === cleanSearch);
  };

  // --- Staff / Technician CRUD ---
  const addTechnician = async (techData: Omit<Technician, 'id'>): Promise<Technician> => {
    const newTech: Technician = {
      ...techData,
      id: `tech-${Date.now()}`,
      isActive: true
    };
    setTechnicians(prev => [...prev, newTech]);
    return newTech;
  };

  const updateTechnician = async (id: string, updates: Partial<Technician>) => {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTechnician = async (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
  };

  // --- Expenses CRUD ---
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // --- Cash Closing ---
  const addCashClosing = async (closingData: Omit<CashClosing, 'id' | 'closedAt'>): Promise<CashClosing> => {
    const newClosing: CashClosing = {
      ...closingData,
      id: `cls-${Date.now()}`,
      closedAt: new Date().toISOString()
    };
    setCashClosings(prev => [newClosing, ...prev]);
    return newClosing;
  };

  // --- Financial Calculations (Owner View) ---
  const totalGrossRevenue = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
  
  const totalPaidRevenue = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'paid') return sum + o.finalTotal;
    return sum + (o.amountPaid || 0);
  }, 0);

  const totalUnpaidReceivables = orders.reduce((sum, o) => {
    if (o.paymentStatus === 'paid') return sum;
    if (o.remainingBalance !== undefined) return sum + o.remainingBalance;
    return sum + (o.finalTotal - (o.amountPaid || 0));
  }, 0);

  const totalCommissionPayable = orders.reduce((sum, o) => sum + (o.technicianCommissionAmount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Real Net Profit = Total Gross Omzet - Komisi Montir - Seluruh Pengeluaran Toko
  const realNetProfit = totalGrossRevenue - totalCommissionPayable - totalExpenses;

  // Breakdown payment channels
  const cashPaymentsTotal = orders
    .filter(o => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.finalTotal : (o.amountPaid || 0)), 0);

  const transferPaymentsTotal = orders
    .filter(o => o.paymentMethod === 'transfer')
    .reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.finalTotal : (o.amountPaid || 0)), 0);

  const qrisPaymentsTotal = orders
    .filter(o => o.paymentMethod === 'qris')
    .reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.finalTotal : (o.amountPaid || 0)), 0);

  const resetToMockData = () => {
    setOrders(INITIAL_MOCK_ORDERS);
    setTechnicians(DEFAULT_TECHNICIANS);
    setExpenses(INITIAL_MOCK_EXPENSES);
    setCashClosings([]);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
    localStorage.setItem(TECHS_KEY, JSON.stringify(DEFAULT_TECHNICIANS));
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(INITIAL_MOCK_EXPENSES));
    localStorage.removeItem(CLOSINGS_KEY);
  };

  return (
    <WorkshopContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        processPayment,
        getOrderByPlate,
        technicians,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        cashClosings,
        addCashClosing,
        financials: {
          totalGrossRevenue,
          totalPaidRevenue,
          totalUnpaidReceivables,
          totalCommissionPayable,
          totalExpenses,
          realNetProfit,
          cashPaymentsTotal,
          transferPaymentsTotal,
          qrisPaymentsTotal,
        },
        serviceCatalog,
        isLiveMode,
        isLoading,
        resetToMockData,
        syncWithSupabase,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
