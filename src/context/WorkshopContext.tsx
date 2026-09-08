import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Order, OrderStatus, Technician, ServiceItem } from '../types/workshop';
import { INITIAL_MOCK_ORDERS, DEFAULT_TECHNICIANS, SERVICE_CATALOG } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface WorkshopContextType {
  orders: Order[];
  technicians: Technician[];
  serviceCatalog: ServiceItem[];
  isLiveMode: boolean;
  isLoading: boolean;
  createOrder: (newOrderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'spkNumber'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrderByPlate: (plateNumber: string) => Order | undefined;
  resetToMockData: () => void;
  syncWithSupabase: () => Promise<void>;
}

const STORAGE_KEY = 'nairistem_workshop_orders_v1';

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load local orders, using mock defaults', e);
    }
    return INITIAL_MOCK_ORDERS;
  });

  const [technicians] = useState<Technician[]>(DEFAULT_TECHNICIANS);
  const [serviceCatalog] = useState<ServiceItem[]>(SERVICE_CATALOG);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(isSupabaseConfigured);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, [orders]);

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
          notes: item.notes || '',
          estimatedCompletion: item.estimated_completion || new Date().toISOString(),
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        setOrders(remoteOrders);
        setIsLiveMode(true);
      } else {
        for (const ord of INITIAL_MOCK_ORDERS) {
          await supabase.from('orders').insert({
            id: ord.id,
            spk_number: ord.spkNumber,
            plate_number: ord.plateNumber,
            vehicle_model: ord.vehicleModel,
            vehicle_color: ord.vehicleColor,
            customer_name: ord.customerName,
            customer_phone: ord.customerPhone,
            technician_name: ord.technicianName,
            status: ord.status,
            service_package: ord.servicePackage,
            service_items: ord.serviceItems,
            polish_materials: ord.polishMaterials,
            scratch_points: ord.scratchPoints,
            initial_photos: ord.initialPhotos,
            total_service_price: ord.totalServicePrice,
            material_cost: ord.materialCost,
            technician_commission_pct: ord.technicianCommissionPct,
            technician_commission_amount: ord.technicianCommissionAmount,
            discount: ord.discount,
            final_total: ord.finalTotal,
            payment_status: ord.paymentStatus,
            notes: ord.notes,
            estimated_completion: ord.estimatedCompletion,
            created_at: ord.createdAt,
            updated_at: ord.updatedAt
          });
        }
      }
    } catch (err) {
      console.warn('Supabase sync notice: Operating in Local Sandbox Mode', err);
      setIsLiveMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'spkNumber'>): Promise<Order> => {
    const nextIndex = orders.length + 1;
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const spkNumber = `SPK-${yearMonth}-${String(nextIndex).padStart(3, '0')}`;
    const id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newOrder: Order = {
      ...orderData,
      id,
      spkNumber,
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
        console.error('Failed to push new order to Supabase', e);
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
        console.error('Failed to update status in Supabase', e);
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
        console.error('Failed to update order in Supabase', e);
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    if (supabase && isLiveMode) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (e) {
        console.error('Failed to delete order from Supabase', e);
      }
    }
  };

  const getOrderByPlate = (plateNumber: string): Order | undefined => {
    if (!plateNumber) return undefined;
    const cleanSearch = plateNumber.replace(/\s+/g, '').toUpperCase();
    return orders.find(ord => ord.plateNumber.replace(/\s+/g, '').toUpperCase() === cleanSearch);
  };

  const resetToMockData = () => {
    setOrders(INITIAL_MOCK_ORDERS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
  };

  return (
    <WorkshopContext.Provider
      value={{
        orders,
        technicians,
        serviceCatalog,
        isLiveMode,
        isLoading,
        createOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        getOrderByPlate,
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
