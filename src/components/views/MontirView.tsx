import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import type { Order, OrderStatus } from '../../types/workshop';
import { STATUS_FLOW, STATUS_META } from '../../types/workshop';
import { 
  Car, Wrench, ChevronRight, ChevronLeft, 
  Send, Plus, ExternalLink, ShieldAlert, Camera, Search, 
  CheckCircle, Layers, ClipboardCheck
} from 'lucide-react';
import { createWhatsAppLink, generateTrackingMessage, generateCompletionMessage } from '../../lib/whatsapp';
import { InspectionForm } from '../InspectionForm';
import { CarScratchMap } from '../CarScratchMap';

interface MontirViewProps {
  onOpenTracking: (plateNumber: string) => void;
}

export const MontirView: React.FC<MontirViewProps> = ({ onOpenTracking }) => {
  const { orders, updateOrderStatus } = useWorkshop();
  const [activeTab, setActiveTab] = useState<'kanban' | 'checkin'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // Filter orders for Montir: focus on active bay stages (queue, detailing, finishing, ready)
  const montirStages: OrderStatus[] = ['queue', 'detailing', 'finishing', 'ready'];

  const filteredOrders = orders.filter(ord => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      ord.plateNumber.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.vehicleModel.toLowerCase().includes(q) ||
      ord.technicianName.toLowerCase().includes(q)
    );
    return matchesSearch;
  });

  const totalInBay = orders.filter(o => o.status !== 'completed').length;
  const inWashingDetailing = orders.filter(o => o.status === 'detailing').length;
  const inQC = orders.filter(o => o.status === 'finishing').length;
  const readyToDeliver = orders.filter(o => o.status === 'ready').length;

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
    <div className="space-y-6">
      {/* View Header & Operational Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Workshop Bay • Pegawai Lapangan</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
                MONTIR VIEW
              </span>
            </div>
            <p className="text-xs text-zinc-400">Fokus penanganan fisik kendaraan, inspeksi bodi, dan alur pengerjaan SPK.</p>
          </div>
        </div>

        {/* Montir Tab Switcher */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'kanban' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Papan Kanban SPK ({totalInBay})</span>
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'checkin' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Check-in Unit Baru</span>
          </button>
        </div>
      </div>

      {activeTab === 'checkin' ? (
        <InspectionForm onSuccess={() => setActiveTab('kanban')} />
      ) : (
        <div className="space-y-5">
          {/* Operational Physical Metrics (Zero Financial Leakage) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Unit di Bay</span>
                <span className="text-2xl font-bold font-mono text-zinc-100">{totalInBay} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Car className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Cuci & Poles Aktif</span>
                <span className="text-2xl font-bold font-mono text-amber-400">{inWashingDetailing} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Finishing & Curing QC</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">{inQC} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ClipboardCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Siap Serah Terima</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{readyToDeliver} Unit</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari plat nomor (B 1988), model mobil, atau nama detailer..."
              className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Kanban Columns (4 Montir Physical Stages) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {montirStages.map(statusKey => {
              const meta = STATUS_META[statusKey];
              const columnOrders = filteredOrders.filter(o => o.status === statusKey);

              return (
                <div
                  key={statusKey}
                  className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl flex flex-col min-h-[460px]"
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: meta.accentHex }}
                      />
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                        {meta.label}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {columnOrders.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                    {columnOrders.length === 0 ? (
                      <div className="h-32 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-xs text-zinc-600 italic">
                        Tidak ada mobil di tahap ini
                      </div>
                    ) : (
                      columnOrders.map(order => {
                        const statusIndex = STATUS_FLOW.indexOf(order.status);
                        const canMovePrev = statusIndex > 0;
                        const canMoveNext = statusIndex < STATUS_FLOW.length - 1;

                        return (
                          <div
                            key={order.id}
                            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 space-y-3 transition-all shadow-md"
                          >
                            {/* Card Top: Plate & Vehicle */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="inline-block px-2.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 font-mono font-extrabold text-sm sm:text-base text-zinc-100 tracking-wider">
                                  {order.plateNumber}
                                </span>
                                <p className="text-xs font-semibold text-zinc-200 mt-1">{order.vehicleModel}</p>
                                <p className="text-[11px] text-zinc-400">Warna: {order.vehicleColor}</p>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {order.spkNumber.replace('SPK-', '')}
                              </span>
                            </div>

                            {/* Service Package & Detailer Tag */}
                            <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80 text-xs space-y-1">
                              <div className="font-medium text-zinc-300 leading-snug text-[11px]">
                                🛠️ {order.servicePackage}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/50">
                                <span>Detailer:</span>
                                <span className="text-cyan-400 font-medium">{order.technicianName}</span>
                              </div>
                            </div>

                            {/* Scratch & Photo Badges */}
                            <div className="flex items-center gap-2 text-[11px]">
                              {order.scratchPoints.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setInspectingOrder(order)}
                                  className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-400 hover:bg-amber-900/40 flex items-center gap-1 transition-colors"
                                  title="Lihat Peta Baret Mobil"
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  <span>{order.scratchPoints.length} Titik Baret</span>
                                </button>
                              ) : (
                                <span className="text-zinc-500 text-[10px]">Bodi mulus</span>
                              )}

                              {order.initialPhotos.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setInspectingOrder(order)}
                                  className="px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-400 hover:bg-blue-900/40 flex items-center gap-1 transition-colors"
                                  title="Lihat Foto Awal"
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>{order.initialPhotos.length} Foto</span>
                                </button>
                              )}
                            </div>

                            {/* Notes if any */}
                            {order.notes && (
                              <div className="text-[11px] text-zinc-400 italic bg-zinc-950/40 p-2 rounded border border-zinc-800/60 truncate" title={order.notes}>
                                💬 "{order.notes}"
                              </div>
                            )}

                            {/* WhatsApp Actions */}
                            <div className="flex items-center gap-1.5 pt-1">
                              {order.status === 'ready' ? (
                                <button
                                  onClick={() => handleSendReadyWA(order)}
                                  className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Notif Siap WA</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSendTrackingWA(order)}
                                  className="flex-1 h-8 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Kirim Link WA</span>
                                </button>
                              )}

                              <button
                                onClick={() => onOpenTracking(order.plateNumber)}
                                className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center justify-center transition-colors shrink-0"
                                title="Pratinjau Live Tracking"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Stage Progression Buttons */}
                            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                              <button
                                disabled={!canMovePrev}
                                onClick={() => moveOrderStage(order, 'prev')}
                                className="h-7 px-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-20 disabled:pointer-events-none text-zinc-300 rounded text-xs flex items-center gap-1 transition-colors"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" /> Mundur
                              </button>

                              <button
                                disabled={!canMoveNext}
                                onClick={() => moveOrderStage(order, 'next')}
                                className="h-7 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:pointer-events-none text-white font-semibold rounded text-xs flex items-center gap-1 transition-colors"
                              >
                                Lanjut <ChevronRight className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* Inspecting Modal (Car Scratch Map & Photos Viewer for Montir) */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Inspeksi Fisik: <span className="font-mono text-blue-400">{inspectingOrder.plateNumber}</span>
                </h3>
                <p className="text-xs text-zinc-400">{inspectingOrder.vehicleModel} ({inspectingOrder.vehicleColor})</p>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

            <CarScratchMap points={inspectingOrder.scratchPoints} readOnly={true} />

            {inspectingOrder.initialPhotos.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-zinc-300 block">Foto Dokumentasi Awal:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {inspectingOrder.initialPhotos.map(p => (
                    <div key={p.id} className="rounded-lg overflow-hidden border border-zinc-800 aspect-video bg-zinc-950 relative">
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
