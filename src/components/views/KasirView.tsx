import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import type { Order, PaymentMethod } from '../../types/workshop';
import { 
  CreditCard, DollarSign, QrCode, Building2, Printer, 
  Send, CheckCircle2, Search, Clock, Lock, Check
} from 'lucide-react';
import { InvoiceModal } from '../InvoiceModal';
import { createWhatsAppLink } from '../../lib/whatsapp';

export const KasirView: React.FC = () => {
  const { 
    orders, processPayment, financials, cashClosings, addCashClosing 
  } = useWorkshop();

  const [activeTab, setActiveTab] = useState<'pos' | 'piutang' | 'tutup_kasir'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNotes, setPayNotes] = useState('');

  const [actualDrawerCash, setActualDrawerCash] = useState<number>(0);
  const [cashierName, setCashierName] = useState('Kasir Meja Depan');
  const [closingNotes, setClosingNotes] = useState('');
  const [closingSuccessMsg, setClosingSuccessMsg] = useState('');

  const openPayModal = (order: Order) => {
    setPayingOrder(order);
    const remaining = order.remainingBalance !== undefined ? order.remainingBalance : (order.finalTotal - (order.amountPaid || 0));
    setPayAmount(remaining > 0 ? remaining : order.finalTotal);
    setPayMethod(order.paymentMethod && order.paymentMethod !== 'pending' ? order.paymentMethod : 'cash');
    setPayNotes('');
  };

  const handleConfirmPayment = async () => {
    if (!payingOrder) return;
    await processPayment(payingOrder.id, payMethod, Number(payAmount) || 0, payNotes);
    setPayingOrder(null);
  };

  const handleFollowUpWA = (order: Order) => {
    const origin = window.location.origin;
    const cleanPlate = order.plateNumber.replace(/\s+/g, '').toUpperCase();
    const trackingUrl = `${origin}/track/${cleanPlate}`;
    const remaining = order.remainingBalance !== undefined ? order.remainingBalance : (order.finalTotal - (order.amountPaid || 0));

    const msg = `Halo Kak ${order.customerName},\n\nSalam dari *NAIRISTEM Detailing Lab* 🚗\n\nKami menginfokan tagihan pengerjaan kendaraan *${order.vehicleModel}* (${order.plateNumber}):\n• Total SPK: Rp ${order.finalTotal.toLocaleString('id-ID')}\n• Sudah Dibayar: Rp ${(order.amountPaid || 0).toLocaleString('id-ID')}\n• *Sisa Tagihan Belum Lunas:* *Rp ${remaining.toLocaleString('id-ID')}*\n\nPelunasan transfer:\n💳 *BCA: 8831-2900-11* (a.n NAIRISTEM INDONESIA)\n\nCek invoice di:\n👉 ${trackingUrl}\n\nTerima kasih!`;

    const link = createWhatsAppLink(order.customerPhone, msg);
    window.open(link, '_blank');
  };

  const handleSaveClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    const expected = financials.cashPaymentsTotal;
    const diff = actualDrawerCash - expected;

    await addCashClosing({
      date: new Date().toISOString().split('T')[0],
      actualCashInDrawer: actualDrawerCash,
      expectedCash: expected,
      difference: diff,
      notes: closingNotes,
      closedBy: cashierName
    });

    setClosingSuccessMsg(`Tutup kasir berhasil disimpan! Selisih: Rp ${diff.toLocaleString('id-ID')}`);
    setTimeout(() => setClosingSuccessMsg(''), 4000);
    setClosingNotes('');
  };

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (
      o.plateNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.spkNumber.toLowerCase().includes(q)
    );
  });

  const unpaidOrders = filteredOrders.filter(o => o.paymentStatus !== 'paid');
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Kasir & Front Desk (POS)</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                KASIR VIEW
              </span>
            </div>
            <p className="text-xs text-zinc-400">Penerimaan pembayaran, cetak invoice, follow-up piutang, dan tutup kasir laci harian.</p>
          </div>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pos' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Transaksi Kasir ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('piutang')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'piutang' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Manajemen Piutang ({unpaidOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tutup_kasir')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tutup_kasir' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Tutup Kasir Harian</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Uang Kasir Terkumpul</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            Rp {financials.totalPaidRevenue.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Sudah masuk kasir</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Piutang Gantung</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            Rp {financials.totalUnpaidReceivables.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-rose-400/80 block mt-0.5">{unpaidOrders.length} unit belum lunas</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Uang Tunai (Cash) Laci</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            Rp {financials.cashPaymentsTotal.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Wajib cocok saat tutup kasir</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Non-Tunai (Transfer/QRIS)</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            Rp {(financials.transferPaymentsTotal + financials.qrisPaymentsTotal).toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">BCA & QRIS settlement</span>
        </div>
      </div>

      {activeTab === 'pos' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Daftar Transaksi & Pembayaran SPK
              </h3>
              <p className="text-xs text-zinc-400">Terima pembayaran tunai/non-tunai, cetak nota, dan cek status pelunasan.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari plat, customer, SPK..."
                className="w-full h-9 bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">No. SPK</th>
                  <th className="py-2.5 px-3">Plat / Mobil</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Total SPK</th>
                  <th className="py-2.5 px-3 text-right">Sudah Dibayar</th>
                  <th className="py-2.5 px-3 text-center">Metode</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.map(order => {
                  const isPaid = order.paymentStatus === 'paid';
                  const remaining = order.remainingBalance !== undefined ? order.remainingBalance : (order.finalTotal - (order.amountPaid || 0));

                  return (
                    <tr key={order.id} className="hover:bg-zinc-950/40 text-zinc-300">
                      <td className="py-3 px-3 font-mono font-medium text-blue-400">
                        {order.spkNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-zinc-100">{order.plateNumber}</span>
                        <div className="text-[11px] text-zinc-400">{order.vehicleModel}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-200">{order.customerName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{order.customerPhone}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-zinc-100">
                        Rp {order.finalTotal.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400">
                        Rp {(order.amountPaid || (isPaid ? order.finalTotal : 0)).toLocaleString('id-ID')}
                        {!isPaid && remaining > 0 && (
                          <div className="text-[10px] text-rose-400 font-mono">
                            Sisa: Rp {remaining.toLocaleString('id-ID')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center uppercase font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                          {order.paymentMethod || (isPaid ? 'Transfer' : 'Pending')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border uppercase ${
                          isPaid 
                            ? 'bg-emerald-950/70 border-emerald-700 text-emerald-400' 
                            : order.paymentStatus === 'partial'
                            ? 'bg-amber-950/70 border-amber-700 text-amber-400'
                            : 'bg-rose-950/70 border-rose-700 text-rose-400'
                        }`}>
                          {isPaid ? 'LUNAS' : order.paymentStatus === 'partial' ? 'DP' : 'BELUM'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        {!isPaid && (
                          <button
                            onClick={() => openPayModal(order)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Bayar</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                          title="Cetak Invoice PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Nota</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'piutang' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Daftar Piutang & Tagihan Belum Lunas
              </h3>
              <p className="text-xs text-zinc-400">
                Kendaraan yang sudah/sedang dikerjakan tapi masih menyisakan tagihan belum lunas.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-lg">
              Total Piutang: Rp {financials.totalUnpaidReceivables.toLocaleString('id-ID')}
            </span>
          </div>

          {unpaidOrders.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">Semua Tagihan Lunas 100%!</p>
              <p className="text-xs text-zinc-500">Tidak ada piutang gantung saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {unpaidOrders.map(order => {
                const paid = order.amountPaid || 0;
                const remaining = order.remainingBalance !== undefined ? order.remainingBalance : (order.finalTotal - paid);

                return (
                  <div
                    key={order.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-mono font-bold text-zinc-100 text-sm">
                          {order.plateNumber}
                        </span>
                        <h4 className="text-xs font-semibold text-zinc-200 mt-1">{order.vehicleModel}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{order.spkNumber}</span>
                    </div>

                    <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Pemilik:</span>
                        <span className="text-zinc-200 font-medium">{order.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">No. WA:</span>
                        <span className="text-zinc-300 font-mono">{order.customerPhone}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-zinc-800/60">
                        <span className="text-zinc-400">Total SPK:</span>
                        <span className="font-mono">Rp {order.finalTotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Sudah Dibayar:</span>
                        <span className="font-mono">Rp {paid.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-zinc-800/60 text-sm">
                        <span>Sisa Piutang:</span>
                        <span className="font-mono">Rp {remaining.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleFollowUpWA(order)}
                        className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        title="Kirim pesan penagihan sopan via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Follow-up WA</span>
                      </button>
                      <button
                        onClick={() => openPayModal(order)}
                        className="h-9 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Input Pelunasan"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Lunasi</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tutup_kasir' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSaveClosing} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" /> Formulir Tutup Kasir & Rekonsiliasi Uang Fisik
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Hitung uang tunai fisik yang ada di laci kasir saat tutup toko dan cocokkan dengan data sistem.
              </p>
            </div>

            {closingSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{closingSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nama Kasir yang Bertugas
                </label>
                <input
                  type="text"
                  required
                  value={cashierName}
                  onChange={e => setCashierName(e.target.value)}
                  className="w-full h-11 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Total Uang Kas Tunai Menurut Sistem (Expected):</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    Rp {financials.cashPaymentsTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Total dari seluruh SPK yang dibayar menggunakan metode <strong className="text-zinc-300">CASH / TUNAI</strong>.
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Uang Fisik di Laci Kasir (Hasil Hitung Tangan) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={actualDrawerCash || ''}
                    onChange={e => setActualDrawerCash(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full h-12 bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 text-base sm:text-lg font-mono font-bold text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {actualDrawerCash > 0 && (
                <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  actualDrawerCash === financials.cashPaymentsTotal
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                    : actualDrawerCash < financials.cashPaymentsTotal
                    ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                    : 'bg-blue-950/60 border-blue-700 text-blue-300'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span>
                      {actualDrawerCash === financials.cashPaymentsTotal
                        ? '✅ UANG FISIK PAS (Cocok Sempurna)'
                        : actualDrawerCash < financials.cashPaymentsTotal
                        ? '⚠️ SELISIH KURANG (Uang Fisik Kurang dari Sistem)'
                        : 'ℹ️ SELISIH LEBIH (Uang Fisik Lebih Banyak)'}
                    </span>
                    <span className="font-mono text-sm">
                      Rp {(actualDrawerCash - financials.cashPaymentsTotal).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Catatan Rekonsiliasi Tutup Kasir
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={e => setClosingNotes(e.target.value)}
                  placeholder="Misal: Uang kembalian koin disimpan di toples kasir."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
              >
                <Lock className="w-4 h-4" />
                <span>Simpan Rekap Tutup Kasir Hari Ini</span>
              </button>
            </div>
          </form>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" /> Riwayat Tutup Kasir Sebelumnya ({cashClosings.length})
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Catatan rekonsiliasi laci kasir harian yang pernah disimpan.</p>
            </div>

            {cashClosings.length === 0 ? (
              <div className="h-48 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 text-xs p-4 text-center">
                Belum ada rekap tutup kasir yang tersimpan. Simpan rekonsiliasi pertama Anda melalui formulir di samping.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {cashClosings.map(c => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-zinc-100">{c.date}</span>
                        <div className="text-[11px] text-zinc-400">Kasir: {c.closedBy}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        c.difference === 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        Selisih: Rp {c.difference.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                      <div>Sistem: Rp {c.expectedCash.toLocaleString('id-ID')}</div>
                      <div className="text-right">Fisik: Rp {c.actualCashInDrawer.toLocaleString('id-ID')}</div>
                    </div>
                    {c.notes && (
                      <p className="text-[11px] text-zinc-400 italic">"{c.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-5 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Penerimaan Pembayaran SPK
                </h3>
                <p className="text-xs text-zinc-400 font-mono">{payingOrder.spkNumber} • {payingOrder.plateNumber}</p>
              </div>
              <button
                onClick={() => setPayingOrder(null)}
                className="text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-semibold"
              >
                Batal
              </button>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Unit Kendaraan:</span>
                <span className="font-medium text-white">{payingOrder.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Nama Customer:</span>
                <span className="font-medium text-white">{payingOrder.customerName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Total Tagihan SPK:</span>
                <span className="font-mono font-bold text-white">Rp {payingOrder.finalTotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Sudah Dibayar Sebelumnya:</span>
                <span className="font-mono">Rp {(payingOrder.amountPaid || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'Cash / Tunai', icon: DollarSign },
                  { id: 'transfer', label: 'Transfer Bank', icon: Building2 },
                  { id: 'qris', label: 'QRIS Scan', icon: QrCode },
                ].map(m => {
                  const Icon = m.icon;
                  const isSelected = payMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as PaymentMethod)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nominal yang Diterima Saat Ini (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">Rp</span>
                <input
                  type="number"
                  min={1000}
                  step={50000}
                  value={payAmount || ''}
                  onChange={e => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full h-12 bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 text-base sm:text-lg font-mono font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Catatan Kasir (Opsional)
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={e => setPayNotes(e.target.value)}
                placeholder="Misal: Diterima uang pas lembaran Rp 100.000 / Bukti transfer via BCA Hendra"
                className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Penerimaan Pembayaran</span>
            </button>
          </div>
        </div>
      )}

      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
