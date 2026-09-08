import React from 'react';
import type { Order } from '../types/workshop';
import { STATUS_META } from '../types/workshop';
import { 
  X, Car, User, DollarSign, 
  Printer, Send, ShieldAlert, Sparkles
} from 'lucide-react';
import { CarScratchMap } from './CarScratchMap';
import { createWhatsAppLink } from '../lib/whatsapp';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onOpenPayment?: (order: Order) => void;
  onOpenInvoice?: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenPayment,
  onOpenInvoice,
}) => {
  const statusMeta = STATUS_META[order.status];
  const isPaid = order.paymentStatus === 'paid';
  const remaining = order.remainingBalance !== undefined 
    ? order.remainingBalance 
    : (order.finalTotal - (order.amountPaid || 0));

  const handleSendWA = () => {
    const origin = window.location.origin;
    const cleanPlate = order.plateNumber.replace(/\s+/g, '').toUpperCase();
    const trackingUrl = `${origin}/track/${cleanPlate}`;
    const msg = `Halo Kak ${order.customerName},\n\nUpdate pengerjaan kendaraan *${order.vehicleModel}* (${order.plateNumber}) di *NAIRISTEM Detailing Lab*:\n• Status Saat Ini: *${statusMeta.label}*\n• Layanan: ${order.servicePackage}\n• Lead Detailer: ${order.technicianName}\n\nCek foto dan progress langsung di:\n👉 ${trackingUrl}\n\nTerima kasih!`;
    const link = createWhatsAppLink(order.customerPhone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-extrabold text-base sm:text-lg text-white tracking-wider">
                  {order.plateNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {order.spkNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${statusMeta.badgeBg} ${statusMeta.badgeBorder} ${statusMeta.badgeText}`}>
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {order.vehicleModel} • Warna: <span className="text-zinc-200">{order.vehicleColor}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Quick Info: Customer & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Customer Card */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800/80">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Data Pemilik Kendaraan</span>
                </div>
                <button
                  onClick={handleSendWA}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-medium transition-colors"
                >
                  <Send className="w-3 h-3" /> Chat WA
                </button>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Nama Pelanggan:</span>
                <span className="font-bold text-zinc-100">{order.customerName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Nomor WhatsApp:</span>
                <span className="font-mono text-zinc-200">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-zinc-800/50">
                <span className="text-zinc-400">Lead Detailer:</span>
                <span className="text-cyan-400 font-semibold">{order.technicianName}</span>
              </div>
            </div>

            {/* Financial Card */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800/80">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rincian Keuangan & Kasir</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  isPaid 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                    : order.paymentStatus === 'partial'
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-rose-950 text-rose-400 border-rose-800'
                }`}>
                  {isPaid ? 'Lunas' : order.paymentStatus === 'partial' ? 'DP Masuk' : 'Belum Bayar'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Total Biaya SPK:</span>
                <span className="font-mono font-bold text-zinc-100">
                  Rp {order.finalTotal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-400 font-medium">
                <span>Sudah Diterima Kasir:</span>
                <span className="font-mono">
                  Rp {(order.amountPaid || (isPaid ? order.finalTotal : 0)).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-zinc-800/50">
                <span className="text-zinc-400">Sisa Tagihan (Piutang):</span>
                <span className={`font-mono font-bold ${remaining > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                  Rp {remaining.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Service Items List */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Paket Treatment & Layanan yang Diambil
            </h4>

            <div className="divide-y divide-zinc-800/70 text-xs">
              {order.serviceItems.map(item => (
                <div key={item.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="text-zinc-200 font-medium">{item.name}</span>
                    <span className="text-[10px] text-zinc-400 ml-2 uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {item.category}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-zinc-200">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {order.discount > 0 && (
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs text-rose-400 font-medium">
                <span>Diskon Khusus:</span>
                <span className="font-mono">- Rp {order.discount.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          {/* Body Scratch Map */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Inspeksi Titik Baret & Kerusakan Bodi ({order.scratchPoints.length} Titik)
            </h4>
            <CarScratchMap points={order.scratchPoints} readOnly={true} />
          </div>

          {/* Initial Documentation Photos */}
          {order.initialPhotos && order.initialPhotos.length > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                Foto Dokumentasi Fisik Awal ({order.initialPhotos.length} Foto)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {order.initialPhotos.map(p => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-900">
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <span className="font-semibold text-zinc-400 block">Catatan Tambahan:</span>
              <p className="text-zinc-300 italic">"{order.notes}"</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenInvoice && (
              <button
                type="button"
                onClick={() => onOpenInvoice(order)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Nota / Invoice</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendWA}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Update WA Customer</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && onOpenPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPayment(order);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
              >
                <DollarSign className="w-4 h-4" />
                <span>Bayar / Lunasi Tagihan</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
