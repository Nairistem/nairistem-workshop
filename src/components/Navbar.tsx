import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import type { UserRole } from '../types/workshop';
import { 
  Wrench, CreditCard, Crown, ExternalLink, RefreshCw, Check
} from 'lucide-react';

interface NavbarProps {
  onOpenLiveTracking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLiveTracking }) => {
  const { 
    currentRole, 
    setCurrentRole, 
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

  const rolesConfig: {
    id: UserRole;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    activeBorder: string;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'montir',
      label: 'Montir Lapangan',
      sublabel: 'Workshop Bay',
      icon: Wrench,
      activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-600/25',
      activeBorder: 'border-blue-500',
      badge: `${activeBayCount} Unit`,
      badgeColor: 'bg-blue-950 text-blue-200 border-blue-800'
    },
    {
      id: 'kasir',
      label: 'Kasir & Front Desk',
      sublabel: 'POS Meja Depan',
      icon: CreditCard,
      activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25',
      activeBorder: 'border-emerald-500',
      badge: unpaidCount > 0 ? `${unpaidCount} Tagihan` : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800'
    },
    {
      id: 'owner',
      label: 'Owner & Manajer',
      sublabel: 'Executive View',
      icon: Crown,
      activeClass: 'bg-purple-600 text-white shadow-lg shadow-purple-600/25',
      activeBorder: 'border-purple-500',
      badge: 'Laba Riil',
      badgeColor: 'bg-purple-950 text-purple-200 border-purple-800'
    },
  ];

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

          {/* Role Switcher (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-inner">
            {rolesConfig.map(r => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;

              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? `${r.activeClass} border ${r.activeBorder}`
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <div className="text-left">
                    <span className="block leading-none">{r.label}</span>
                  </div>
                  {r.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isActive ? 'bg-black/30 border-white/20 text-white' : r.badgeColor
                    }`}>
                      {r.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live / Sandbox Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isLiveMode
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
              }`}
              title={isLiveMode ? 'Terhubung langsung ke Supabase Cloud' : 'Mode Sandbox Interaktif (Penyimpanan Lokal)'}
            >
              <span
                className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
              />
              <span>{isLiveMode ? 'Supabase Live' : 'Sandbox Mode'}</span>
            </div>

            {/* Public Live Tracking Preview Button */}
            <button
              onClick={onOpenLiveTracking}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700/80 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Pratinjau Halaman Pelanggan /track/:plate"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Web Pelanggan</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
              title="Reset ke data awal demo bengkel"
            >
              {resetSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Segmented Role Switcher */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-zinc-800/80 text-xs">
          {rolesConfig.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;

            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`flex-1 py-2 px-2.5 rounded-xl font-semibold text-center whitespace-nowrap flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? `${r.activeClass} border ${r.activeBorder}`
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
