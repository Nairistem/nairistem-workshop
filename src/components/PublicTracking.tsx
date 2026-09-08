import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { CarScratchMap } from './CarScratchMap';
import { STATUS_FLOW, STATUS_META } from '../types/workshop';
import { 
  ShieldCheck, Clock, CheckCircle2, Phone, Sparkles, 
  Car, ArrowLeft
} from 'lucide-react';
import { createWhatsAppLink } from '../lib/whatsapp';

interface PublicTrackingProps {
  plateNumber: string;
  onBackToDashboard?: () => void;
}

export const PublicTracking: React.FC<PublicTrackingProps> = ({ plateNumber, onBackToDashboard }) => {
  const { getOrderByPlate, orders } = useWorkshop();
  const [searchPlateInput, setSearchPlateInput] = useState(plateNumber || '');

  // Look up order by plate
  const order = getOrderByPlate(searchPlateInput || plateNumber);

  const currentStatusMeta = order ? STATUS_META[order.status] : null;
  const currentStepIndex = order ? STATUS_META[order.status].stepIndex : 1;

  const contactWorkshopWhatsApp = () => {
    if (!order) return;
    const msg = `Halo NAIRISTEM Detailing Lab, saya ingin menanyakan progres kendaraan saya dengan plat nomor *${order.plateNumber}* (${order.vehicleModel}). Terima kasih!`;
    const workshopPhone = import.meta.env.VITE_WORKSHOP_PHONE || '081299998888';
    const link = createWhatsAppLink(workshopPhone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      {/* Top Concierge Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md">
              N
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                <span>NAIRISTEM CONCIERGE</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Live Tracking
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Digital Vehicle Service & Detailing Progress</p>
            </div>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 bg-zinc-800/80 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kembali ke Dashboard</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6 flex-1">
        {/* Search / Direct Plate Lookup Bar if not found or changing */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-2">
          <span className="text-xs text-zinc-400 shrink-0 font-medium pl-1">Plat Nomor:</span>
          <input
            type="text"
            value={searchPlateInput}
            onChange={e => setSearchPlateInput(e.target.value.toUpperCase())}
            placeholder="Ketik Plat Mobil (contoh: B 1988 NAI)"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-mono font-bold uppercase text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
          />
          {orders.length > 0 && !order && (
            <div className="flex gap-1.5 overflow-x-auto text-[11px] text-zinc-400">
              <span className="self-center text-zinc-500">Demo:</span>
              {orders.slice(0, 3).map(o => (
                <button
                  key={o.id}
                  onClick={() => setSearchPlateInput(o.plateNumber)}
                  className="px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700 font-mono text-zinc-200"
                >
                  {o.plateNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {!order ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Car className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Kendaraan Tidak Ditemukan</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Nomor plat <span className="font-mono font-bold text-zinc-200">"{searchPlateInput || 'KOSONG'}"</span> tidak terdaftar dalam antrean aktif. Pastikan format plat nomor sudah sesuai dengan SPK Anda.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setSearchPlateInput(orders[0]?.plateNumber || 'B 1234 NAI')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Lihat Contoh Kendaraan Terdaftar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Vehicle Hero Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider block font-semibold">
                    {order.spkNumber}
                  </span>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="px-3.5 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-lg sm:text-xl font-mono font-black tracking-wider text-white shadow-inner">
                      {order.plateNumber}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-zinc-100">
                      {order.vehicleModel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Warna Cat: <span className="text-zinc-200">{order.vehicleColor}</span> • Pemilik: <span className="text-zinc-200 font-medium">{order.customerName}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${currentStatusMeta?.badgeBg} ${currentStatusMeta?.badgeBorder} ${currentStatusMeta?.badgeText} border`}>
                    <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: currentStatusMeta?.accentHex }} />
                    <span>{currentStatusMeta?.label}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Lead Detailer: <span className="text-zinc-300 font-medium">{order.technicianName}</span>
                  </div>
                </div>
              </div>

              {/* Live Status Progress Stepper */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <span>Tahapan Pengerjaan Detailing</span>
                  <span className="font-mono text-zinc-300">Tahap {currentStepIndex} dari 5</span>
                </div>

                {/* Progress Bar & Indicators */}
                <div className="grid grid-cols-5 gap-2 relative">
                  {STATUS_FLOW.map((st, idx) => {
                    const stepNum = idx + 1;
                    const meta = STATUS_META[st];
                    const isPassed = stepNum < currentStepIndex;
                    const isCurrent = stepNum === currentStepIndex;

                    return (
                      <div key={st} className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                            isCurrent
                              ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-600/30 shadow-lg'
                              : isPassed
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : stepNum}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-medium leading-tight ${
                            isCurrent
                              ? 'text-blue-400 font-bold'
                              : isPassed
                              ? 'text-zinc-200'
                              : 'text-zinc-600'
                          }`}
                        >
                          {meta.shortLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Active Status Explanation Card */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Status Saat Ini: {currentStatusMeta?.label}</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    {currentStatusMeta?.description}
                  </p>
                  <div className="pt-2 text-[11px] text-zinc-500 flex flex-wrap gap-4 border-t border-zinc-800/60 mt-2">
                    <span>Diperbarui: {new Date(order.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    <span>Estimasi Selesai: {new Date(order.estimatedCompletion).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Transparency Section: Scratch Map & Photos */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transparansi Inspeksi Fisik Masuk
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Catatan inspeksi bodi kendaraan sebelum tim kami melakukan cuci dekontaminasi dan proses poles.
                </p>
              </div>

              {/* Car Scratch Map in Read-Only Mode */}
              <CarScratchMap points={order.scratchPoints} readOnly={true} />

              {/* Initial Photos Carousel / Grid */}
              {order.initialPhotos && order.initialPhotos.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-zinc-300 block uppercase tracking-wider">
                    Foto Dokumentasi Kondisi Awal ({order.initialPhotos.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {order.initialPhotos.map(photo => (
                      <div
                        key={photo.id}
                        className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video relative group"
                      >
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                          <div>
                            <span className="text-xs font-semibold text-white block">{photo.label}</span>
                            <span className="text-[10px] text-zinc-400">{photo.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Treatment Package & Workshop Contact CTA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Treatment yang Dikerjakan</span>
                  <p className="font-semibold text-white text-sm mt-0.5">{order.servicePackage}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-zinc-400 block">Total Tagihan:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    Rp {order.finalTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Contact Workshop Button */}
              <div className="pt-2">
                <button
                  onClick={contactWorkshopWhatsApp}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hubungi Workshop via WhatsApp</span>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Luxury Digital Concierge Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500 space-y-2">
        <p className="text-zinc-400">NAIRISTEM Detailing Lab • High-Performance Auto Workshop</p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-medium">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Powered by <strong className="text-zinc-200">NAIRISTEM Workshop OS</strong></span>
        </div>
      </footer>
    </div>
  );
};
