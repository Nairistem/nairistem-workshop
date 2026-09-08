import React from 'react';
import type { Order, PaymentStatus } from '../types/workshop';
import { useWorkshop } from '../context/WorkshopContext';
import { Printer, X, Check, FileText, Send } from 'lucide-react';
import { createWhatsAppLink } from '../lib/whatsapp';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { updateOrder } = useWorkshop();

  const handlePaymentStatusChange = async (status: PaymentStatus) => {
    await updateOrder(order.id, { paymentStatus: status });
  };

  const handlePrint = () => {
    window.print();
  };

  const sendInvoiceWhatsApp = () => {
    const origin = window.location.origin;
    const cleanPlate = order.plateNumber.replace(/\s+/g, '').toUpperCase();
    const trackingUrl = `${origin}/track/${cleanPlate}`;
    
    const msg = `Halo Kak ${order.customerName},\n\nBerikut rincian Invoice & SPK pengerjaan kendaraan di *NAIRISTEM Detailing Lab*:\n\n*No. Invoice:* ${order.spkNumber}\n*Kendaraan:* ${order.vehicleModel} (${order.plateNumber})\n*Layanan:* ${order.servicePackage}\n*Total Tagihan:* Rp ${order.finalTotal.toLocaleString('id-ID')}\n*Status:* ${order.paymentStatus === 'paid' ? '✅ LUNAS' : '⏳ BELUM LUNAS'}\n\nInvoice digital & live progress dapat diakses di:\n👉 ${trackingUrl}\n\nRekening Pembayaran:\nBCA 8831-2900-11 (a.n NAIRISTEM INDONESIA)\n\nTerima kasih atas kepercayaannya!`;
    
    const url = createWhatsAppLink(order.customerPhone, msg);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto">
        <div className="no-print p-4 sm:px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm sm:text-base font-bold text-zinc-100">
              Invoice SPK: <span className="font-mono text-blue-400">{order.spkNumber}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={sendInvoiceWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> Kirim WA
            </button>
            <button
              onClick={handlePrint}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak PDF
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="printable-invoice" className="p-6 sm:p-8 bg-zinc-900 text-zinc-100 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                  N
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">NAIRISTEM DETAILING LAB</h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Professional Automotive Detailing & Ceramic Protection</p>
              <p className="text-xs text-zinc-400">Jl. Otista Raya No. 88, Jakarta Timur • WhatsApp: 0812-9999-8888</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-blue-400">
                {order.spkNumber}
              </div>
              <p className="text-xs text-zinc-400">
                Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
              <p className="text-xs text-zinc-400">
                Lead Detailer: <span className="text-zinc-200 font-medium">{order.technicianName}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Data Pelanggan</span>
              <p className="font-semibold text-sm text-white">{order.customerName}</p>
              <p className="text-zinc-400">No. WhatsApp: {order.customerPhone}</p>
              <p className="text-zinc-400">Estimasi Selesai: {new Date(order.estimatedCompletion).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Spesifikasi Kendaraan</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-mono font-bold text-zinc-100 text-sm">
                  {order.plateNumber}
                </span>
                <span className="font-medium text-white">{order.vehicleModel}</span>
              </div>
              <p className="text-zinc-400">Warna Cat: {order.vehicleColor}</p>
              <p className="text-zinc-400">Cacat Bodi Terdata: {order.scratchPoints.length} titik inspeksi</p>
            </div>
          </div>

          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-2">Deskripsi Layanan & Treatment</th>
                  <th className="py-2.5 px-2 text-center">Kategori</th>
                  <th className="py-2.5 px-2 text-right">Biaya (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {order.serviceItems.map((item, idx) => (
                  <tr key={idx} className="text-zinc-300">
                    <td className="py-3 px-2 font-medium text-zinc-100">
                      {item.name}
                    </td>
                    <td className="py-3 px-2 text-center uppercase text-[10px] text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-semibold text-zinc-100">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.polishMaterials && order.polishMaterials.length > 0 && (
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs">
              <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Bahan & Obat Poles yang Digunakan:</span>
              <div className="flex flex-wrap gap-2 text-zinc-300 text-[11px]">
                {order.polishMaterials.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    • {m.name} ({m.quantity})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="no-print space-y-1.5">
              <span className="text-xs font-semibold text-zinc-400 block">Status Pembayaran Kasir:</span>
              <div className="flex gap-1.5">
                {(['unpaid', 'partial', 'paid'] as PaymentStatus[]).map(st => {
                  const labels: Record<PaymentStatus, string> = {
                    unpaid: 'Belum Lunas',
                    partial: 'DP / Sebagian',
                    paid: 'Lunas'
                  };
                  const isSelected = order.paymentStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handlePaymentStatusChange(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? st === 'paid'
                            ? 'bg-emerald-600 text-white'
                            : st === 'partial'
                            ? 'bg-amber-600 text-white'
                            : 'bg-rose-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                      {labels[st]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono">Rp {order.totalServicePrice.toLocaleString('id-ID')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Diskon Promo:</span>
                  <span className="font-mono">- Rp {order.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Akhir:</span>
                <span className="font-mono text-emerald-400 text-lg">
                  Rp {order.finalTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 text-[11px] text-zinc-400 text-center sm:text-left space-y-1">
            <p>• Garansi kilap & hydrophobic coating berlaku sesuai kartu garansi fisik yang diterbitkan.</p>
            <p>• Pembayaran via transfer resmi ke Rekening BCA: 8831-2900-11 a.n NAIRISTEM INDONESIA.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
