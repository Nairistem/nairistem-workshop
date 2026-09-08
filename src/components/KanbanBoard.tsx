import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import type { Order } from '../types/workshop';
import { STATUS_FLOW, STATUS_META } from '../types/workshop';
import { 
  Car, User, Wrench, ChevronRight, ChevronLeft, 
  Send, CheckCircle, FileText, Search, Plus, ExternalLink,
  ShieldAlert, Camera, Sparkles
} from 'lucide-react';
import { createWhatsAppLink, generateTrackingMessage, generateCompletionMessage } from '../lib/whatsapp';
import { InvoiceModal } from './InvoiceModal';

interface KanbanBoardProps {
  onOpenCheckIn: () => void;
  onOpenTracking: (plateNumber: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onOpenCheckIn, onOpenTracking }) => {
  const { orders, updateOrderStatus } = useWorkshop();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const filteredOrders = orders.filter(ord => {
    const q = searchQuery.toLowerCase();
    return (
      ord.plateNumber.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.vehicleModel.toLowerCase().includes(q) ||
      ord.spkNumber.toLowerCase().includes(q)
    );
  });

  const activeOrdersCount = orders.filter(o => o.status !== 'completed').length;
  const inProgressCount = orders.filter(o => o.status === 'detailing' || o.status === 'finishing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;
  const todayRevenue = orders.reduce((sum, o) => sum + o.finalTotal, 0);

  const moveOrderStage = async (order: Order, direction: 'next' | 'prev') => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    if (direction === 'next' && currentIndex < STATUS_FLOW.length - 1) {
      await updateOrderStatus(order.id, STATUS_FLOW[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      await updateOrderStatus(order.id, STATUS_FLOW[currentIndex - 1]);
    }
  };

  const handleSendTrackingWA = (order: Order) => {
    const origin = window.location.origin;
    const msg = generateTrackingMessage(order, origin);
    const link = createWhatsAppLink(order.customerPhone, msg);
    window.open(link, '_blank');
  };

  const handleSendReadyWA = (order: Order) => {
    const origin = window.location.origin;
    const msg = generateCompletionMessage(order, origin);
    const link = createWhatsAppLink(order.customerPhone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Antrean Aktif</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">{activeOrdersCount} Unit</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Sedang Dikerjakan</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">{inProgressCount} Unit</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Siap Diambil</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{readyCount} Unit</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Nilai SPK Terdata</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400">
              Rp {(todayRevenue / 1000000).toFixed(1)} Jt
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari plat nomor (B 1988), nama customer, atau model mobil..."
            className="w-full h-10 bg-zinc-950 border border-zinc-700/80 rounded-lg pl-10 pr-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Reset
            </button>
          )}
        </div>

        <button
          onClick={onOpenCheckIn}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Check-in Unit Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {STATUS_FLOW.map(statusKey => {
          const meta = STATUS_META[statusKey];
          const columnOrders = filteredOrders.filter(o => o.status === statusKey);

          return (
            <div
              key={statusKey}
              className="bg-zinc-950/60 border border-zinc-800/90 rounded-xl flex flex-col max-h-[calc(100vh-230px)] min-h-[420px]"
            >
              <div className="p-3 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: meta.accentHex }}
                  />
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                    {meta.shortLabel}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {columnOrders.length}
                </span>
              </div>

              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                {columnOrders.length === 0 ? (
                  <div className="h-32 border border-dashed border-zinc-800/80 rounded-lg flex items-center justify-center text-[11px] text-zinc-600 italic text-center p-3">
                    Kosong di tahap ini
                  </div>
                ) : (
                  columnOrders.map(order => {
                    const statusIndex = STATUS_FLOW.indexOf(order.status);
                    const canMovePrev = statusIndex > 0;
                    const canMoveNext = statusIndex < STATUS_FLOW.length - 1;

                    return (
                      <div
                        key={order.id}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 space-y-3 transition-all shadow-md group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 font-mono font-extrabold text-sm sm:text-base text-zinc-100 tracking-wider">
                              {order.plateNumber}
                            </span>
                            <div className="text-[11px] font-medium text-zinc-400 truncate">
                              {order.vehicleModel}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                            {order.spkNumber.replace('SPK-', '')}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-300 space-y-1 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/60">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                              <User className="w-3 h-3" /> {order.customerName}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {order.customerPhone}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/50">
                            <span className="text-zinc-400 flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-cyan-400" /> {order.technicianName}
                            </span>
                            <span className="text-cyan-400 font-mono">
                              Komisi Rp {(order.technicianCommissionAmount / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          {order.scratchPoints.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> {order.scratchPoints.length} baret
                            </span>
                          )}
                          {order.initialPhotos.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-400 flex items-center gap-1">
                              <Camera className="w-3 h-3" /> {order.initialPhotos.length} foto
                            </span>
                          )}
                          <span className="ml-auto font-mono font-semibold text-emerald-400 text-xs">
                            Rp {(order.finalTotal / 1000).toFixed(0)}k
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          {order.status === 'ready' ? (
                            <button
                              onClick={() => handleSendReadyWA(order)}
                              className="flex-1 h-8 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                              title="Kirim Notifikasi Mobil Siap Diambil ke WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>Notif Siap WA</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendTrackingWA(order)}
                              className="flex-1 h-8 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                              title="Kirim Link Live Tracking ke WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>Kirim Link WA</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center justify-center transition-colors shrink-0"
                            title="Buka Invoice & Cetak PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenTracking(order.plateNumber)}
                            className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center justify-center transition-colors shrink-0"
                            title="Preview Halaman Live Tracking Pelanggan"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                          <button
                            disabled={!canMovePrev}
                            onClick={() => moveOrderStage(order, 'prev')}
                            className="h-7 px-2 bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                            title="Kembalikan ke tahap sebelumnya"
                          >
                            <ChevronLeft className="w-3 h-3" /> Mundur
                          </button>

                          <button
                            disabled={!canMoveNext}
                            onClick={() => moveOrderStage(order, 'next')}
                            className="h-7 px-2.5 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-30 disabled:pointer-events-none text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            title="Maju ke tahap selanjutnya"
                          >
                            Lanjut <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </div>
  );
};
