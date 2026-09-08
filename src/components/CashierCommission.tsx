import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import type { Order, PaymentStatus } from '../types/workshop';
import { 
  DollarSign, Wrench, FileText, 
  Printer, TrendingUp, Users
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

export const CashierCommission: React.FC = () => {
  const { orders, technicians, updateOrder } = useWorkshop();
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [filterPayment, setFilterPayment] = useState<'all' | PaymentStatus>('all');
  const [searchPlate, setSearchPlate] = useState('');

  // Financial aggregates
  const totalGrossRevenue = orders.reduce((sum, o) => sum + o.finalTotal, 0);
  const totalMaterialCost = orders.reduce((sum, o) => sum + (o.materialCost || 0), 0);
  const totalCommissionPayable = orders.reduce((sum, o) => sum + (o.technicianCommissionAmount || 0), 0);
  const netEstimatedProfit = totalGrossRevenue - totalMaterialCost - totalCommissionPayable;

  // Paid vs Pending
  const totalPaidRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.finalTotal, 0);

  // Calculate technician commission tallies
  const technicianStats = technicians.map(tech => {
    const techOrders = orders.filter(o => o.technicianName === tech.name);
    const totalJobs = techOrders.length;
    const grossGenerated = techOrders.reduce((sum, o) => sum + o.totalServicePrice, 0);
    const commissionEarned = techOrders.reduce((sum, o) => sum + o.technicianCommissionAmount, 0);

    return {
      ...tech,
      totalJobs,
      grossGenerated,
      commissionEarned,
    };
  });

  const filteredOrders = orders.filter(o => {
    const matchesPayment = filterPayment === 'all' || o.paymentStatus === filterPayment;
    const matchesSearch = !searchPlate || o.plateNumber.toLowerCase().includes(searchPlate.toLowerCase()) || o.customerName.toLowerCase().includes(searchPlate.toLowerCase());
    return matchesPayment && matchesSearch;
  });

  const handleQuickPaymentStatus = async (order: Order, newStatus: PaymentStatus) => {
    await updateOrder(order.id, { paymentStatus: newStatus });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Omzet Jasa SPK</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-100">
            Rp {totalGrossRevenue.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            Terbayar: Rp {totalPaidRevenue.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Komisi Teknisi / Montir</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400">
            Rp {totalCommissionPayable.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-zinc-400">
            Rata-rata 12.5% - 15% dari jasa
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Estimasi Bahan & Obat Poles</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
            Rp {totalMaterialCost.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-zinc-400">
            Compound, Coating & Pad
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Estimasi Laba Bersih Bengkel</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
            Rp {netEstimatedProfit.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-zinc-400">
            Setelah komisi & bahan poles
          </div>
        </div>
      </div>

      {/* Technician Commission Leaderboard & Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Rekap Perhitungan Komisi Teknisi
            </h3>
            <p className="text-xs text-zinc-400">
              Otomatis dihitung berdasarkan persentase bagi hasil dari setiap jasa SPK yang ditugaskan.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Total {technicianStats.reduce((s, t) => s + t.totalJobs, 0)} Pengerjaan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Nama Detailer</th>
                <th className="py-2.5 px-3">Spesialisasi / Role</th>
                <th className="py-2.5 px-3 text-center">Unit Ditangani</th>
                <th className="py-2.5 px-3 text-right">Nilai Jasa</th>
                <th className="py-2.5 px-3 text-center">Rate (%)</th>
                <th className="py-2.5 px-3 text-right">Komisi Diterima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {technicianStats.map(tech => (
                <tr key={tech.id} className="hover:bg-zinc-950/40 text-zinc-300">
                  <td className="py-3 px-3 font-semibold text-zinc-100">
                    {tech.name}
                  </td>
                  <td className="py-3 px-3 text-zinc-400">
                    {tech.role}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                      {tech.totalJobs} Unit
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    Rp {tech.grossGenerated.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-cyan-400">
                    {tech.defaultCommissionPct}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                    Rp {tech.commissionEarned.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SPK Transaction Register & Invoicing Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Buku Kasir & Daftar Invoice SPK
            </h3>
            <p className="text-xs text-zinc-400">Kelola status pelunasan, cetak invoice PDF, dan rincian transaksi.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchPlate}
              onChange={e => setSearchPlate(e.target.value)}
              placeholder="Cari plat..."
              className="h-8 bg-zinc-950 border border-zinc-700 rounded px-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            
            <div className="flex bg-zinc-950 p-0.5 rounded border border-zinc-800 text-xs">
              {(['all', 'unpaid', 'partial', 'paid'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPayment(p)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    filterPayment === p
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p === 'all' ? 'Semua' : p === 'paid' ? 'Lunas' : p === 'partial' ? 'DP' : 'Belum'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">No. SPK</th>
                <th className="py-2.5 px-3">Plat / Mobil</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Detailer</th>
                <th className="py-2.5 px-3 text-right">Tagihan Total</th>
                <th className="py-2.5 px-3 text-center">Status Bayar</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 italic">
                    Tidak ada data transaksi yang sesuai filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-950/40 text-zinc-300">
                    <td className="py-3 px-3 font-mono text-blue-400 font-medium">
                      {order.spkNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-zinc-100">{order.plateNumber}</div>
                      <div className="text-[11px] text-zinc-400">{order.vehicleModel}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-zinc-200 font-medium">{order.customerName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      <div>{order.technicianName}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">
                        Komisi: Rp {order.technicianCommissionAmount.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-100">
                      Rp {order.finalTotal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select
                        value={order.paymentStatus}
                        onChange={e => handleQuickPaymentStatus(order, e.target.value as PaymentStatus)}
                        className={`text-xs px-2 py-1 rounded font-semibold border cursor-pointer focus:outline-none ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                            : order.paymentStatus === 'partial'
                            ? 'bg-amber-950/80 border-amber-700 text-amber-400'
                            : 'bg-rose-950/80 border-rose-700 text-rose-400'
                        }`}
                      >
                        <option value="unpaid">Belum Lunas</option>
                        <option value="partial">DP / Parsial</option>
                        <option value="paid">LUNAS</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
