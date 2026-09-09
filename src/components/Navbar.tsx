import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Wrench, Crown, CreditCard, ExternalLink, RefreshCw, Check, Lock, LogOut, UserCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenLiveTracking: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLiveTracking, onOpenLogin }) => {
  const { 
    currentUser,
    logout,
    orders, 
    isLiveMode, 
    resetToMockData, 
    isLoading 
  } = useWorkshop();
  
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const activeBayCount = orders.filter(o => o.status !== 'completed').length;
  const unpaidCount = orders.filter(o => o.paymentStatus !== 'paid').length;

  const handleReset = () => {
    if (window.confirm('Reset data ke kondisi awal demo bengkel detailing?')) {
      resetToMockData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-600/30">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  NAIRISTEM
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800/60 uppercase">
                  Workshop OS
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block">
                Auto Detailing & Workshop Operations
              </p>
            </div>
          </div>

          {/* Center Info / Active Mode Badge (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {!currentUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium">Mode Kerja:</span>
                <span className="font-bold text-white">Montir Lapangan ({activeBayCount} Mobil di Bay)</span>
              </div>
            ) : currentUser.role === 'kasir' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Akses:</span>
                <span className="font-bold text-white">Front Desk Kasir & POS</span>
                {unpaidCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                    {unpaidCount} Tagihan Belum Lunas
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/60 text-xs text-purple-300">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-medium">Akses:</span>
                <span className="font-bold text-white">Executive Owner & Analytics</span>
              </div>
            )}
          </div>

          {/* Quick Actions & Auth Section */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live / Sandbox Indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-zinc-900 border-zinc-800 text-zinc-300"
              title={isLiveMode ? 'Terhubung langsung ke Supabase Cloud' : 'Mode Sandbox Interaktif (Penyimpanan Lokal)'}
            >
              <span
                className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
              />
              <span className="text-[10px]">{isLiveMode ? 'Supabase Live' : 'Sandbox Mode'}</span>
            </div>

            {/* Public Live Tracking Preview Button */}
            <button
              onClick={onOpenLiveTracking}
              className="px-2.5 sm:px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700/80 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Pratinjau Halaman Pelanggan /track/:plate"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Web Pelanggan</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
              title="Reset ke data awal demo bengkel"
            >
              {resetSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              )}
            </button>

            {/* Formal Auth Navigation */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                {/* Guest Montir Status (Desktop) */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-800/50 text-[11px] font-medium text-blue-300">
                  <Wrench className="w-3 h-3 text-blue-400" />
                  <span>Mode: Montir Lapangan</span>
                </div>

                {/* Login Button */}
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login Staf / Admin</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Logged in User Profile */}
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                  {currentUser.role === 'owner' ? (
                    <Crown className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <div className="text-left hidden sm:block">
                    <span className="block font-bold text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] text-zinc-400 leading-tight">
                      {currentUser.role === 'owner' ? '👑 Owner & Manajer' : '👤 Kasir Meja Depan'}
                    </span>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 sm:hidden" />
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/70 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Keluar dari akun dan kembali ke Mode Montir Lapangan"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Header: Clear Status for Phones */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-zinc-800/80 text-xs">
          {!currentUser ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold text-white">Mode: Montir Lapangan</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{activeBayCount} Mobil</span>
              </div>
              <button
                onClick={onOpenLogin}
                className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                Login Staf
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                {currentUser.role === 'owner' ? (
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="font-bold text-white">
                  {currentUser.role === 'owner' ? '👑 Owner & Manajer' : '👤 Kasir Meja Depan'}
                </span>
                <span className="text-zinc-500 text-[10px]">({currentUser.name})</span>
              </div>
              <button
                onClick={logout}
                className="text-xs text-red-400 font-semibold hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
