import { useState, useEffect } from 'react';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { Navbar } from './components/Navbar';
import { MontirView } from './components/views/MontirView';
import { KasirView } from './components/views/KasirView';
import { OwnerView } from './components/views/OwnerView';
import { PublicTracking } from './components/PublicTracking';
import { LoginModal } from './components/LoginModal';

function MainApp() {
  const [trackingPlate, setTrackingPlate] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentRole, currentUser, orders } = useWorkshop();

  // Handle URL path on initial load & popstate (e.g. /track/B1988NAI or /track/B-1988-NAI)
  useEffect(() => {
    const handleLocation = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      if (pathname.startsWith('/track/')) {
        const rawPlate = pathname.replace('/track/', '').trim();
        if (rawPlate) {
          setTrackingPlate(decodeURIComponent(rawPlate).toUpperCase());
        }
      } else if (hash.startsWith('#/track/')) {
        const rawPlate = hash.replace('#/track/', '').trim();
        if (rawPlate) {
          setTrackingPlate(decodeURIComponent(rawPlate).toUpperCase());
        }
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  const openTrackingView = (plate: string) => {
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    setTrackingPlate(cleanPlate);
    window.history.pushState({}, '', `/track/${cleanPlate}`);
  };

  const closeTrackingView = () => {
    setTrackingPlate(null);
    window.history.pushState({}, '', '/');
  };

  // If tracking view is active (either via direct URL or preview button), show public tracking without login!
  if (trackingPlate !== null) {
    return (
      <PublicTracking
        plateNumber={trackingPlate}
        onBackToDashboard={closeTrackingView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar
        onOpenLiveTracking={() => openTrackingView(orders[0]?.plateNumber || 'B1988NAI')}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {currentRole === 'montir' && (
          <MontirView onOpenTracking={openTrackingView} />
        )}

        {currentRole === 'kasir' && (
          <KasirView />
        )}

        {currentRole === 'owner' && (
          <OwnerView />
        )}
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {/* Footer Branding */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-4 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} NAIRISTEM Workshop OS • Auto Detailing & Workshop Management</span>
          <span className="text-[11px] text-zinc-400">
            {currentUser ? (
              <>Sesi Aktif: <strong className="text-zinc-200">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</>
            ) : (
              <>Akses: <strong className="text-blue-400">Montir Lapangan</strong> (Siap Kerja Tanpa Login)</>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WorkshopProvider>
      <MainApp />
    </WorkshopProvider>
  );
}
