import { useState, useEffect } from 'react';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { Navbar, type NavTab } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { InspectionForm } from './components/InspectionForm';
import { CashierCommission } from './components/CashierCommission';
import { PublicTracking } from './components/PublicTracking';
import type { Order } from './types/workshop';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('kanban');
  const [trackingPlate, setTrackingPlate] = useState<string | null>(null);
  const { orders } = useWorkshop();

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
    setActiveTab('kanban');
  };

  const handleCheckInSuccess = (_newOrder: Order) => {
    setActiveTab('kanban');
  };

  // If tracking view is active (either via direct URL or button), show public tracking without login!
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLiveTracking={() => openTrackingView(orders[0]?.plateNumber || 'B1234NAI')}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {activeTab === 'kanban' && (
          <KanbanBoard
            onOpenCheckIn={() => setActiveTab('checkin')}
            onOpenTracking={openTrackingView}
          />
        )}

        {activeTab === 'checkin' && (
          <InspectionForm onSuccess={handleCheckInSuccess} />
        )}

        {activeTab === 'cashier' && (
          <CashierCommission />
        )}
      </main>
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
