import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import type { 
  ExpenseCategory, 
  StaffRole 
} from '../../types/workshop';
import { EXPENSE_CATEGORIES } from '../../types/workshop';
import { 
  TrendingUp, Wallet, Users, Award, 
  Plus, Trash2, Edit2, CheckCircle2, 
  Search, ExternalLink,
  Percent
} from 'lucide-react';
import { createWhatsAppLink } from '../../lib/whatsapp';

export const OwnerView: React.FC = () => {
  const { 
    financials, 
    orders, 
    expenses, 
    addExpense, 
    deleteExpense, 
    technicians, 
    addTechnician, 
    updateTechnician, 
    deleteTechnician 
  } = useWorkshop();

  const [activeTab, setActiveTab] = useState<'financials' | 'expenses' | 'staff' | 'performance'>('financials');

  // --- Expenses Form & Filters ---
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('sewa_tempat');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expenseReceipt, setExpenseReceipt] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expenseSearch, setExpenseSearch] = useState('');

  // --- Staff Management Form ---
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRole>('Lead Specialist Coating');
  const [staffCommissionPct, setStaffCommissionPct] = useState<number>(15);
  const [staffSuccessMsg, setStaffSuccessMsg] = useState('');

  const staffRoles: StaffRole[] = [
    'Lead Specialist Coating',
    'Paint Correction Master',
    'Interior & Glass Specialist',
    'Junior Detailer',
    'Kasir & Front Desk',
    'Workshop Manager',
  ];

  // Submit Expense (Strategic / Owner level)
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || expenseAmount <= 0) return;

    await addExpense({
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
      receiptNumber: expenseReceipt.trim() || undefined,
      notes: expenseNotes.trim() ? `[Owner] ${expenseNotes.trim()}` : '[Dicatat oleh Owner]'
    });

    setExpenseSuccessMsg(`Pengeluaran toko "${expenseTitle}" berhasil dicatat!`);
    setTimeout(() => setExpenseSuccessMsg(''), 3500);

    // Reset Form
    setExpenseTitle('');
    setExpenseAmount(0);
    setExpenseReceipt('');
    setExpenseNotes('');
  };

  // Submit Staff (Add or Edit)
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffPhone.trim()) return;

    if (editingStaffId) {
      await updateTechnician(editingStaffId, {
        name: staffName.trim(),
        phone: staffPhone.trim(),
        role: staffRole,
        defaultCommissionPct: Number(staffCommissionPct)
      });
      setStaffSuccessMsg(`Data karyawan "${staffName}" berhasil diperbarui!`);
    } else {
      await addTechnician({
        name: staffName.trim(),
        phone: staffPhone.trim(),
        role: staffRole,
        defaultCommissionPct: Number(staffCommissionPct)
      });
      setStaffSuccessMsg(`Karyawan baru "${staffName}" berhasil ditambahkan & siap dipilih di SPK!`);
    }

    setTimeout(() => setStaffSuccessMsg(''), 3500);
    setIsStaffFormOpen(false);
    setEditingStaffId(null);
    setStaffName('');
    setStaffPhone('');
    setStaffCommissionPct(15);
  };

  const handleOpenEditStaff = (tech: typeof technicians[0]) => {
    setEditingStaffId(tech.id);
    setStaffName(tech.name);
    setStaffPhone(tech.phone);
    setStaffRole(tech.role as StaffRole);
    setStaffCommissionPct(tech.defaultCommissionPct);
    setIsStaffFormOpen(true);
  };

  // WhatsApp Slip Sender for Staff
  const handleSendCommissionSlipWA = (tech: typeof technicians[0], stats: {
    completedCount: number;
    activeCount: number;
    totalRev: number;
    totalComm: number;
  }) => {
    const msg = `Halo Bro ${tech.name} 🚗✨\n\nBerikut rekap komisi pengerjaan SPK kamu di *NAIRISTEM Detailing Lab*:\n\n• Jabatan: ${tech.role}\n• Rate Komisi: ${tech.defaultCommissionPct}%\n• Unit Selesai: ${stats.completedCount} Mobil\n• Unit Aktif: ${stats.activeCount} Mobil\n• Total Nilai SPK: Rp ${stats.totalRev.toLocaleString('id-ID')}\n• *Total Hak Komisi: Rp ${stats.totalComm.toLocaleString('id-ID')}*\n\nTerima kasih atas dedikasi dan kerapian hasil pengerjaannya! Mantap terus! 🔥`;
    const link = createWhatsAppLink(tech.phone, msg);
    window.open(link, '_blank');
  };

  // Calculate expenses category breakdown
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

  // Filtered expenses
  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const q = expenseSearch.toLowerCase();
    const matchesSearch = e.title.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Calculations for Financial View
  const profitMargin = financials.totalGrossRevenue > 0 
    ? Math.round((financials.realNetProfit / financials.totalGrossRevenue) * 100) 
    : 0;

  const commissionPctOfGross = financials.totalGrossRevenue > 0
    ? Math.round((financials.totalCommissionPayable / financials.totalGrossRevenue) * 100)
    : 0;

  const expensePctOfGross = financials.totalGrossRevenue > 0
    ? Math.round((financials.totalExpenses / financials.totalGrossRevenue) * 100)
    : 0;

  // Technician Leaderboard data
  const technicianPerformance = technicians.map(tech => {
    const assignedOrders = orders.filter(o => o.technicianName === tech.name);
    const completedOrders = assignedOrders.filter(o => o.status === 'completed' || o.status === 'ready');
    const activeOrders = assignedOrders.filter(o => o.status !== 'completed' && o.status !== 'ready');
    const totalRev = assignedOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const totalComm = assignedOrders.reduce((sum, o) => sum + (o.technicianCommissionAmount || 0), 0);

    return {
      tech,
      assignedCount: assignedOrders.length,
      completedCount: completedOrders.length,
      activeCount: activeOrders.length,
      totalRev,
      totalComm
    };
  }).sort((a, b) => b.totalComm - a.totalComm);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Executive Control • Owner & Manajer</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-400 border border-purple-800">
                OWNER VIEW
              </span>
            </div>
            <p className="text-xs text-zinc-400">Kontrol laba bersih riil, audit laporan kas keluar toko, master data staff, dan performa detailer.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('financials')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'financials' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Laba Bersih Riil</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'expenses' ? 'bg-rose-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Audit Kas Keluar ({expenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'staff' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola Staff ({technicians.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'performance' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Evaluasi Montir</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FINANCIALS & REAL NET PROFIT */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Real Net Profit Formula Banner */}
          <div className="bg-gradient-to-r from-zinc-900 via-purple-950/30 to-zinc-900 border border-purple-800/40 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 block mb-1">
                  Formula Perhitungan Laba Bersih Hak Pemilik:
                </span>
                <p className="text-xs sm:text-sm text-zinc-300">
                  <span className="text-zinc-100 font-bold">Laba Bersih Riil</span> = Total Omzet SPK (<span className="text-blue-400 font-mono">Rp {financials.totalGrossRevenue.toLocaleString('id-ID')}</span>) − Komisi Montir (<span className="text-cyan-400 font-mono">Rp {financials.totalCommissionPayable.toLocaleString('id-ID')}</span>) − Kas Keluar Toko (<span className="text-rose-400 font-mono">Rp {financials.totalExpenses.toLocaleString('id-ID')}</span>)
                </p>
              </div>

              <div className="bg-zinc-950/80 border border-purple-700/60 rounded-xl p-3 sm:px-5 flex items-center justify-between sm:justify-start gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Hasil Laba Bersih:</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                    Rp {financials.realNetProfit.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold font-mono">
                  {profitMargin}% Margin
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Omzet SPK</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-blue-400">
                Rp {financials.totalGrossRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Dari {orders.length} transaksi SPK</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Total Komisi Montir</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-cyan-400">
                Rp {financials.totalCommissionPayable.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">{commissionPctOfGross}% dari total omzet</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Pengeluaran Toko</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-rose-400">
                Rp {financials.totalExpenses.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Dicatat oleh Kasir & Owner</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Uang Kas Masuk</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">
                Rp {financials.totalPaidRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Sudah masuk rekening/laci</span>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Piutang Gantung</span>
              <span className="text-lg sm:text-2xl font-bold font-mono text-amber-400">
                Rp {financials.totalUnpaidReceivables.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-amber-400/80 block mt-0.5">Belum ditransfer customer</span>
            </div>
          </div>

          {/* Breakdown Visual Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue Distribution Progress */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-purple-400" /> Distribusi Alokasi Omzet SPK
                </h3>
                <p className="text-xs text-zinc-400">Proporsi uang masuk terhadap biaya operasional toko, gaji/komisi, dan laba bersih.</p>
              </div>

              {/* Stacked Progress Bar */}
              <div className="w-full h-5 rounded-full overflow-hidden bg-zinc-950 flex border border-zinc-800">
                <div 
                  style={{ width: `${Math.max(5, profitMargin)}%` }} 
                  className="bg-emerald-500 h-full transition-all" 
                  title={`Laba Bersih: ${profitMargin}%`}
                />
                <div 
                  style={{ width: `${Math.max(5, commissionPctOfGross)}%` }} 
                  className="bg-cyan-500 h-full transition-all" 
                  title={`Komisi Montir: ${commissionPctOfGross}%`}
                />
                <div 
                  style={{ width: `${Math.max(5, expensePctOfGross)}%` }} 
                  className="bg-rose-500 h-full transition-all" 
                  title={`Kas Keluar Toko: ${expensePctOfGross}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Laba Bersih</span>
                  </div>
                  <div className="font-mono font-bold text-white">{profitMargin}%</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Rp {financials.realNetProfit.toLocaleString('id-ID')}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-900/60">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>Komisi Montir</span>
                  </div>
                  <div className="font-mono font-bold text-white">{commissionPctOfGross}%</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Rp {financials.totalCommissionPayable.toLocaleString('id-ID')}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Kas Keluar Toko</span>
                  </div>
                  <div className="font-mono font-bold text-white">{expensePctOfGross}%</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Rp {financials.totalExpenses.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>

            {/* Payment Channel Breakdown */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" /> Rekapitulasi Kas Masuk Berdasarkan Saluran
                </h3>
                <p className="text-xs text-zinc-400">Arus uang riil yang sudah tersimpan di laci tunai maupun rekening bank.</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      💵
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200">Uang Tunai (Cash di Laci)</div>
                      <div className="text-[11px] text-zinc-400">Pembayaran langsung di meja kasir</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">
                    Rp {financials.cashPaymentsTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      💳
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200">Transfer Bank (BCA)</div>
                      <div className="text-[11px] text-zinc-400">Masuk rekening koran bengkel</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-blue-400 text-sm sm:text-base">
                    Rp {financials.transferPaymentsTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                      📱
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200">QRIS Statis & Dinamis</div>
                      <div className="text-[11px] text-zinc-400">Settlement merchant QRIS</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-cyan-400 text-sm sm:text-base">
                    Rp {financials.qrisPaymentsTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT & REKAP LAPORAN KAS KELUAR TOKO */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Audit Information Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-rose-400" /> Audit Laporan Pengeluaran Toko • Owner Oversight
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Rekapitulasi pengeluaran kas toko yang dicatat kasir (makan teknisi, belanja mendesak) serta pengeluaran sewa & operasional owner.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Total Beban Toko: Rp {financials.totalExpenses.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Category Summary Cards */}
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
                <span className="text-[10px] text-zinc-500 block">{cat.count} nota</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Form Tambah Pengeluaran Strategis Owner */}
            <form onSubmit={handleAddExpense} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="pb-3 border-b border-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-400" /> Catat Pengeluaran Strategis Toko
                </h3>
                <p className="text-xs text-zinc-400">Biaya sewa workshop, pembelian mesin besar, renovasi, atau biaya owner.</p>
              </div>

              {expenseSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{expenseSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Keperluan / Pos Pengeluaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  placeholder="Misal: Sewa Ruko Tahunan / Mesin Poles Rupes"
                  className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Kategori Beban
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
                    step={10000}
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
                    No. Nota / Kontrak Vendor (Opsional)
                  </label>
                  <input
                    type="text"
                    value={expenseReceipt}
                    onChange={e => setExpenseReceipt(e.target.value)}
                    placeholder="KTR/2026/03/01"
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Catatan Keterangan
                </label>
                <textarea
                  rows={2}
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  placeholder="Keterangan kontrak, termin pembayaran, atau vendor..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Pengeluaran Toko</span>
              </button>
            </form>

            {/* Right Column: Riwayat Audit Pengeluaran */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-rose-400" /> Riwayat Audit Seluruh Kas Keluar
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
                          Belum ada pengeluaran di kategori ini.
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
                                  if (window.confirm(`Hapus pengeluaran "${item.title}"?`)) {
                                    deleteExpense(item.id);
                                  }
                                }}
                                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                                title="Hapus Catatan Pengeluaran"
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

      {/* TAB 3: MASTER DATA KARYAWAN & STAFF */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Master Data Tim & Montir
              </h3>
              <p className="text-xs text-zinc-400">
                Karyawan yang didaftarkan di sini otomatis muncul di formulir penerimaan mobil baru (Check-in SPK).
              </p>
            </div>

            <button
              onClick={() => {
                setEditingStaffId(null);
                setStaffName('');
                setStaffPhone('');
                setStaffRole('Lead Specialist Coating');
                setStaffCommissionPct(15);
                setIsStaffFormOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Karyawan Baru</span>
            </button>
          </div>

          {staffSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{staffSuccessMsg}</span>
            </div>
          )}

          {/* Modal / Inline Add/Edit Staff Form */}
          {isStaffFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
              <form 
                onSubmit={handleSaveStaff}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {editingStaffId ? 'Edit Data Karyawan' : 'Tambah Karyawan / Montir Baru'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsStaffFormOpen(false)}
                    className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 bg-zinc-800 rounded-lg"
                  >
                    Batal
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Nama Lengkap Karyawan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    placeholder="Misal: Rudi Santoso"
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={staffPhone}
                    onChange={e => setStaffPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Digunakan untuk pengiriman slip rincian komisi via WA.</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Jabatan / Spesialisasi
                  </label>
                  <select
                    value={staffRole}
                    onChange={e => setStaffRole(e.target.value as StaffRole)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {staffRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Persentase Komisi Default per Unit SPK (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={staffCommissionPct}
                      onChange={e => setStaffCommissionPct(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="font-mono font-bold text-sm bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-blue-400 min-w-[54px] text-center">
                      {staffCommissionPct}%
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Rata-rata industri workshop detailing: 10% s/d 20%.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingStaffId ? 'Simpan Perubahan' : 'Simpan Karyawan Baru'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Staff Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {technicians.map(tech => {
              const assignedOrders = orders.filter(o => o.technicianName === tech.name);
              const completedCount = assignedOrders.filter(o => o.status === 'completed' || o.status === 'ready').length;

              return (
                <div 
                  key={tech.id} 
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 space-y-3.5 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100">{tech.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{tech.role}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800">
                      {tech.defaultCommissionPct}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>No. WhatsApp:</span>
                      <span className="font-mono text-zinc-200">{tech.phone}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>SPK Ditugaskan:</span>
                      <span className="font-semibold text-zinc-200">{assignedOrders.length} Unit</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Selesai Dikerjakan:</span>
                      <span className="font-semibold text-emerald-400">{completedCount} Unit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/70">
                    <button
                      onClick={() => handleOpenEditStaff(tech)}
                      className="flex-1 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-zinc-400" />
                      <span>Edit</span>
                    </button>
                    {technicians.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus karyawan "${tech.name}" dari sistem?`)) {
                            deleteTechnician(tech.id);
                          }
                        }}
                        className="h-8 w-8 bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 rounded-lg flex items-center justify-center transition-colors"
                        title="Hapus Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: EVALUASI KINERJA MONTIR (LEADERBOARD) */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Leaderboard & Evaluasi Kinerja Detailer
              </h3>
              <p className="text-xs text-zinc-400">
                Peringkat teknisi berdasarkan produktivitas unit yang selesai serta akumulasi hak komisi.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1.5 rounded-lg">
              Total Komisi Dikeluarkan: Rp {financials.totalCommissionPayable.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Nama Detailer / Role</th>
                    <th className="py-3 px-4 text-center">Unit Selesai</th>
                    <th className="py-3 px-4 text-center">Unit On-Going</th>
                    <th className="py-3 px-4 text-right">Nilai SPK Dikerjakan</th>
                    <th className="py-3 px-4 text-center">Rate %</th>
                    <th className="py-3 px-4 text-right">Total Hak Komisi</th>
                    <th className="py-3 px-4 text-center">Slip Komisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {technicianPerformance.map((item, idx) => {
                    const isTop = idx === 0;
                    return (
                      <tr key={item.tech.id} className="hover:bg-zinc-950/40 text-zinc-300">
                        <td className="py-3.5 px-4 text-center">
                          <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-mono font-bold text-xs ${
                            isTop 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 ring-2 ring-amber-500/20' 
                              : idx === 1 
                              ? 'bg-zinc-700/40 text-zinc-300 border border-zinc-600' 
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                            <span>{item.tech.name}</span>
                            {isTop && <span className="text-xs">👑</span>}
                          </div>
                          <div className="text-[11px] text-zinc-400">{item.tech.role}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/70 border border-emerald-800 text-emerald-400">
                            {item.completedCount} Unit
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-xs font-mono text-zinc-400 bg-zinc-800">
                            {item.activeCount} Unit
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-200">
                          Rp {item.totalRev.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-blue-400">
                          {item.tech.defaultCommissionPct}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-400 text-sm">
                          Rp {item.totalComm.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleSendCommissionSlipWA(item.tech, item)}
                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs px-2.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1 transition-all"
                            title="Kirim rincian komisi langsung ke WhatsApp Montir"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Slip WA</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
