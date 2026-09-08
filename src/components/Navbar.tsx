import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Layers, PlusCircle, Receipt, ExternalLink, RefreshCw, Check
} from 'lucide-react';

export type NavTab = 'kanban' | 'checkin' | 'cashier' | 'track';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenLiveTracking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenLiveTracking }) => {
  const { orders, isLiveMode, resetToMockData, isLoading } = useWorkshop();
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const activeCount = orders.filter(o => o.status !== 'completed').length;

  const handleReset = () => {
    if (window.confirm('Reset data ke kondisi default demo bengkel?')) {
      resetToMockData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-600/30">
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
              <p className="text-[10px] text-zinc-400 hidden sm:block">Auto Detailing & Ceramic Coating Management</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => onTabChange('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban SPK</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'kanban' ? 'bg-blue-900 text-blue-200' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('checkin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'checkin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Check-in Unit</span>
            </button>

            <button
              onClick={() => onTabChange('cashier')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cashier'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Kasir & Komisi</span>
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
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

            <button
              onClick={onOpenLiveTracking}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700/80 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Pratinjau Halaman Pelanggan /track"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Web Pelanggan</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
              title="Reset ke data awal demo"
            >
              {resetSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              )}
            </button>
          </div>
        </div>

        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-zinc-800/80 text-xs">
          <button
            onClick={() => onTabChange('kanban')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium text-center whitespace-nowrap ${
              activeTab === 'kanban' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            Kanban ({activeCount})
          </button>
          <button
            onClick={() => onTabChange('checkin')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium text-center whitespace-nowrap ${
              activeTab === 'checkin' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            + Check-in
          </button>
          <button
            onClick={() => onTabChange('cashier')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium text-center whitespace-nowrap ${
              activeTab === 'cashier' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            Kasir
          </button>
        </div>
      </div>
    </header>
  );
};
