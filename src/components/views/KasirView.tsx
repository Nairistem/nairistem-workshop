import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import type { Order, PaymentMethod, ExpenseCategory } from '../../types/workshop';
import { EXPENSE_CATEGORIES } from '../../types/workshop';
import { 
  CreditCard, DollarSign, QrCode, Building2, Printer, 
  Send, CheckCircle2, Search, Clock, Lock, Check,
  Wallet, Plus, Trash2, Utensils, Eye
} from 'lucide-react';
import { InvoiceModal } from '../InvoiceModal';
import { OrderDetailModal } from '../OrderDetailModal';
import { createWhatsAppLink } from '../../lib/whatsapp';

export const KasirView: React.FC = () => {
  const { 
    orders, 
    processPayment, 
    financials, 
    cashClosings, 
    addCashClosing,
    expenses,
    addExpense,
    deleteExpense
  } = useWorkshop();

  const [activeTab, setActiveTab] = useState<'pos' | 'kas_keluar' | 'piutang' | 'tutup_kasir'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // POS Payment Modal State
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNotes, setPayNotes] = useState('');

  // Kas Keluar (Petty Cash) Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('konsumsi_tim');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expenseReceipt, setExpenseReceipt] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expenseSearch, setExpenseSearch] = useState('');

  // Tutup Kasir State
  const [actualDrawerCash, setActualDrawerCash] = useState<number>(0);
  const [cashierName, setCashierName] = useState('Kasir Meja Depan');
  const [closingNotes, setClosingNotes] = useState('');
  const [closingSuccessMsg, setClosingSuccessMsg] = useState('');

  // Expected cash in drawer = Cash SPK diterima - Kas Keluar dari laci
  const expectedCashInDrawer = Math.max(0, financials.cashPaymentsTotal - financials.totalExpenses);

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

  // Submit Kas Keluar (Petty Cash by Kasir)
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || expenseAmount <= 0) return;

    await addExpense({
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
      receiptNumber: expenseReceipt.trim() || undefined,
      notes: expenseNotes.trim() ? `[Kasir] ${expenseNotes.trim()}` : '[Dicatat oleh Kasir]'
    });

    setExpenseSuccessMsg(`Kas keluar "${expenseTitle}" Rp ${Number(expenseAmount).toLocaleString('id-ID')} berhasil dicatat!`);
    setTimeout(() => setExpenseSuccessMsg(''), 3500);

    // Reset Form
    setExpenseTitle('');
    setExpenseAmount(0);
    setExpenseReceipt('');
    setExpenseNotes('');
  };

  // Preset shortcut helper for cashier
  const applyPreset = (title: string, category: ExpenseCategory, amount: number) => {
    setExpenseTitle(title);
    setExpenseCategory(category);
    setExpenseAmount(amount);
  };

  const handleSaveClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    const expected = expectedCashInDrawer;
    const diff = actualDrawerCash - expected;

    await addCashClosing({
      date: new Date().toISOString().split('T')[0],
      actualCashInDrawer: actualDrawerCash,
      expectedCash: expected,
      difference: diff,
      notes: closingNotes ? `${closingNotes} (Kas Keluar Toko: Rp ${financials.totalExpenses.toLocaleString('id-ID')})` : `Kas Keluar Toko: Rp ${financials.totalExpenses.toLocaleString('id-ID')}`,
      closedBy: cashierName
    });

    setClosingSuccessMsg(`Tutup kasir berhasil disimpan! Selisih laci: Rp ${diff.toLocaleString('id-ID')}`);
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

  // Filtered expenses
  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const q = expenseSearch.toLowerCase();
    const matchesSearch = e.title.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Calculate category totals for kasir
  const categoryTotals = Object.keys(EXPENSE_CATEGORIES).map(catKey => {
    const total = expenses
      .filter(e => e.category === catKey)
      .reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.filter(e => e.category === catKey).length;
    return {
      key: catKey as ExpenseCategory,
      ...EXPENSE_CATEGORIES[catKey as ExpenseCategory],
      total,
      count
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
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
            <p className="text-xs text-zinc-400">
              Penerimaan pembayaran SPK, pencatatan kas keluar harian (makan teknisi/belanja mendesak), piutang, dan tutup kasir.
            </p>
          </div>
        </div>

        {/* 4 Tabs Navigation */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pos' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Transaksi POS ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('kas_keluar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'kas_keluar' ? 'bg-rose-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Kas Keluar Toko ({expenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('piutang')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'piutang' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Piutang ({unpaidOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tutup_kasir')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tutup_kasir' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Tutup Kasir</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Indicator Badges for Cashier */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Uang Kasir Masuk</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            Rp {financials.totalPaidRevenue.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Semua metode pembayaran</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Kas Keluar (Biaya)</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            Rp {financials.totalExpenses.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">{expenses.length} pengeluaran kasir</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Estimasi Kas Tunai Laci</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            Rp {expectedCashInDrawer.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Uang tunai bersih di laci</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Piutang Gantung</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">
            Rp {financials.totalUnpaidReceivables.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">{unpaidOrders.length} SPK belum lunas</span>
        </div>
      </div>

      {/* TAB 1: POS & TRANSAKSI */}
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
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setDetailOrder(order)}
                          className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1 transition-all"
                          title="Lihat Detail Pesanan SPK Lengkap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
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

      {/* TAB 2: KAS KELUAR & PENGELUARAN TOKO (RECORDED BY CASHIER) */}
      {activeTab === 'kas_keluar' && (
        <div className="space-y-6">
          {/* Information & Quick Presets Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-rose-400" /> Buku Kas Keluar Harian • Front Desk
                </h3>
                <p className="text-xs text-zinc-400">
                  Catat pengeluaran uang laci kasir untuk makan teknisi, pembelian bahan darurat, atau kebutuhan mendesak bengkel.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Total Kas Keluar: Rp {financials.totalExpenses.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Quick Presets for Cashier */}
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold text-zinc-400 block mb-2">⚡ Pintasan Cepat Kebutuhan Mendesak:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('Makan Siang & Es Tim Teknisi', 'konsumsi_tim', 60000)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span>Makan Siang Tim (Rp 60.000)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Beli Masking Tape & Busa Pad', 'alat_bengkel', 45000)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Tape & Pad (Rp 45.000)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Isi Galon Air Mineral & Kopi Tim', 'utilitas', 25000)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Galon Air & Kopi (Rp 25.000)</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Bensin Motor Operasional Antar Jemput', 'operasional_lain', 30000)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Bensin Operasional (Rp 30.000)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {categoryTotals.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setFilterCategory(filterCategory === cat.key ? 'all' : cat.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  filterCategory === cat.key 
                    ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500' 
                    : 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <span className={`text-[10px] font-semibold block truncate ${cat.text}`}>{cat.label}</span>
                <span className="text-sm sm:text-base font-bold font-mono text-zinc-100 block mt-1">
                  Rp {cat.total.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-zinc-500 block">{cat.count} pengeluaran</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Form Tambah Pengeluaran Kasir */}
            <form onSubmit={handleAddExpense} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="pb-3 border-b border-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-400" /> Catat Kas Keluar Kasir
                </h3>
                <p className="text-xs text-zinc-400">Pengeluaran otomatis mengurangi saldo uang fisik saat tutup kasir.</p>
              </div>

              {expenseSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{expenseSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Keperluan / Judul Pengeluaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  placeholder="Misal: Makan Siang 4 Teknisi & Minum"
                  className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Kategori Pengeluaran
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Nominal Biaya (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={5000}
                    required
                    value={expenseAmount || ''}
                    onChange={e => setExpenseAmount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs font-mono font-bold text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    No. Nota / Bon Warung (Opsional)
                  </label>
                  <input
                    type="text"
                    value={expenseReceipt}
                    onChange={e => setExpenseReceipt(e.target.value)}
                    placeholder="Nota No. 12"
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Catatan Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  placeholder="Keterangan warung/toko atau detail pembelian..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Pengeluaran Kasir</span>
              </button>
            </form>

            {/* Right Column: Riwayat Pengeluaran Kasir */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-rose-400" /> Riwayat Kas Keluar
                  </h3>
                  <p className="text-xs text-zinc-400">Total Terdata: <strong className="text-rose-400 font-mono">Rp {financials.totalExpenses.toLocaleString('id-ID')}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={expenseSearch}
                      onChange={e => setExpenseSearch(e.target.value)}
                      placeholder="Cari pengeluaran..."
                      className="w-full h-8 bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  {filterCategory !== 'all' && (
                    <button
                      onClick={() => setFilterCategory('all')}
                      className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-lg hover:bg-zinc-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Keperluan / Keterangan</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-right">Nominal</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                          Belum ada catatan kas keluar di kategori ini.
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map(item => {
                        const catMeta = EXPENSE_CATEGORIES[item.category];
                        return (
                          <tr key={item.id} className="hover:bg-zinc-950/40 text-zinc-300">
                            <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap">
                              {item.date}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-zinc-100">{item.title}</div>
                              {item.receiptNumber && (
                                <div className="text-[10px] text-zinc-400 font-mono">Nota: {item.receiptNumber}</div>
                              )}
                              {item.notes && (
                                <div className="text-[11px] text-zinc-400 italic mt-0.5">{item.notes}</div>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${catMeta?.badge || 'bg-zinc-800'} ${catMeta?.text || 'text-zinc-300'}`}>
                                {catMeta?.label || item.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                              Rp {item.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus catatan kas keluar "${item.title}"?`)) {
                                    deleteExpense(item.id);
                                  }
                                }}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                                title="Hapus Catatan Kas Keluar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAJEMEN PIUTANG */}
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
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1.5 rounded-lg">
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
                        onClick={() => setDetailOrder(order)}
                        className="h-9 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Lihat Detail Pesanan Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Detail</span>
                      </button>
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

      {/* TAB 4: TUTUP KASIR HARIAN & REKONSILIASI UANG LACI */}
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

              {/* Arus Kas Laci Reconciler breakdown */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Penerimaan Kas Tunai SPK (+):</span>
                  <span className="font-mono font-bold text-zinc-200">
                    Rp {financials.cashPaymentsTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-rose-400">
                  <span>Kas Keluar Toko / Makan / Bahan (-):</span>
                  <span className="font-mono font-bold">
                    - Rp {financials.totalExpenses.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-800 text-zinc-300">
                  <span className="font-semibold">Uang Kas Bersih di Laci Seharusnya (Expected):</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    Rp {expectedCashInDrawer.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Rumus: Total Penerimaan Cash SPK dikurangi Kas Keluar yang dicatat kasir.
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
                  actualDrawerCash === expectedCashInDrawer
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                    : actualDrawerCash < expectedCashInDrawer
                    ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                    : 'bg-blue-950/60 border-blue-700 text-blue-300'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span>
                      {actualDrawerCash === expectedCashInDrawer
                        ? '✅ UANG FISIK PAS (Cocok Sempurna)'
                        : actualDrawerCash < expectedCashInDrawer
                        ? '⚠️ SELISIH KURANG (Uang Fisik Kurang dari Sistem)'
                        : 'ℹ️ SELISIH LEBIH (Uang Fisik Lebih Banyak)'}
                    </span>
                    <span className="font-mono text-sm">
                      Rp {(actualDrawerCash - expectedCashInDrawer).toLocaleString('id-ID')}
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

      {/* MODAL PENERIMAAN PEMBAYARAN */}
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

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onOpenPayment={(ord) => openPayModal(ord)}
          onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
        />
      )}
    </div>
  );
};
