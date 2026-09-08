import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { CarScratchMap } from './CarScratchMap';
import type { ScratchPoint, ServiceItem, InitialPhoto, Order } from '../types/workshop';
import { 
  Car, User, CheckCircle2, 
  Trash2, Sparkles, Camera, ArrowRight
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface InspectionFormProps {
  onSuccess: (createdOrder: Order) => void;
}

export const InspectionForm: React.FC<InspectionFormProps> = ({ onSuccess }) => {
  const { technicians, serviceCatalog, createOrder } = useWorkshop();

  // Form Fields
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [technicianName, setTechnicianName] = useState(technicians[0]?.name || 'Rudi Haryanto');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([serviceCatalog[0]?.id || 'srv-1']);
  const [scratchPoints, setScratchPoints] = useState<ScratchPoint[]>([]);
  const [photos, setPhotos] = useState<InitialPhoto[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto calculate selected services
  const selectedServices: ServiceItem[] = serviceCatalog.filter(s => selectedServiceIds.includes(s.id));
  const totalServicePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Selected technician details
  const selectedTech = technicians.find(t => t.name === technicianName) || technicians[0];
  const commissionPct = selectedTech?.defaultCommissionPct || 15;
  const technicianCommissionAmount = Math.round((totalServicePrice * commissionPct) / 100);
  const finalTotal = Math.max(0, totalServicePrice - discount);

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(x => x !== id) : prev)
        : [...prev, id]
    );
  };

  const [activeCameraSlot, setActiveCameraSlot] = useState<string | null>(null);

  const handleCameraCapture = (dataUrl: string, label: string) => {
    setPhotos(prev => [
      ...prev,
      {
        id: `ph-${Date.now()}`,
        label,
        url: dataUrl,
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
      }
    ]);
    setActiveCameraSlot(null);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!plateNumber.trim()) {
      setErrorMsg('Plat nomor wajib diisi!');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Nama pemilik / customer wajib diisi!');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Nomor WhatsApp customer wajib diisi!');
      return;
    }

    try {
      setIsSubmitting(true);
      const primaryPackage = selectedServices[0]?.name || 'Auto Detailing Premium';
      
      const newOrder = await createOrder({
        plateNumber: plateNumber.trim().toUpperCase(),
        vehicleModel: vehicleModel.trim() || 'Mobil Penumpang',
        vehicleColor: vehicleColor.trim() || 'Warna Standar',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        technicianName,
        status: 'queue',
        servicePackage: primaryPackage,
        serviceItems: selectedServices,
        polishMaterials: [
          { id: 'm-1', name: 'Compound & Finishing Polish Pad', cost: 75000, quantity: '1 Set' },
          { id: 'm-2', name: 'Ceramic Coating Prep & Applicator', cost: 120000, quantity: '1 Set' }
        ],
        scratchPoints,
        initialPhotos: photos,
        totalServicePrice,
        materialCost: 195000,
        technicianCommissionPct: commissionPct,
        technicianCommissionAmount,
        discount,
        finalTotal,
        paymentStatus: 'unpaid',
        notes,
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      onSuccess(newOrder);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan check-in SPK');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">Check-in Unit & Inspeksi Masuk</h2>
            <p className="text-xs text-zinc-400">Pencatatan data kendaraan, estimasi biaya, diagram baret, dan foto awal kondisi fisik.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Car className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">Identitas Kendaraan</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nomor Plat Polisi <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={plateNumber}
              onChange={e => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="Contoh: B 1988 NAI"
              className="w-full h-12 bg-zinc-950 border border-zinc-700 focus:border-blue-500 rounded-lg px-3.5 text-base sm:text-lg font-mono font-bold tracking-wider text-zinc-100 uppercase placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">Digunakan pelanggan untuk mengakses link live tracking.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Merk & Model Mobil <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={vehicleModel}
                onChange={e => setVehicleModel(e.target.value)}
                placeholder="Misal: Toyota Fortuner GR"
                className="w-full h-11 bg-zinc-950 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Warna Cat Kendaraan
              </label>
              <input
                type="text"
                value={vehicleColor}
                onChange={e => setVehicleColor(e.target.value)}
                placeholder="Misal: Super White Pearl"
                className="w-full h-11 bg-zinc-950 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">Pemilik & Penanggung Jawab</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nama Pemilik / Customer <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Misal: Budi Pratama"
                className="w-full h-11 bg-zinc-950 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                No. WhatsApp Customer <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full h-11 bg-zinc-950 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Tugaskan Lead Detailer / Montir
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {technicians.map(tech => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setTechnicianName(tech.name)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    technicianName === tech.name
                      ? 'bg-blue-950/60 border-blue-500 text-zinc-100'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{tech.name}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">{tech.role} (Komisi {tech.defaultCommissionPct}%)</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">Paket Layanan & Treatment Detailing</h3>
          </div>
          <span className="text-xs text-zinc-400">Pilih satu atau lebih paket yang diambil oleh pelanggan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {serviceCatalog.map(srv => {
            const isSelected = selectedServiceIds.includes(srv.id);
            return (
              <div
                key={srv.id}
                onClick={() => toggleService(srv.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all select-none flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/80 text-zinc-100 ring-1 ring-blue-500/50'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                  isSelected ? 'bg-blue-600 border-blue-400 text-white' : 'border-zinc-700 bg-zinc-900'
                }`}>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold leading-snug">{srv.name}</div>
                  <div className="text-xs font-bold text-amber-400 mt-1">
                    Rp {srv.price.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CarScratchMap points={scratchPoints} onChange={setScratchPoints} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">Foto Inspeksi Kondisi Awal ({photos.length})</h3>
          </div>
          <p className="text-xs text-zinc-400">Dokumentasi fisik sebelum proses cuci untuk bukti transparansi ke pemilik.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Tampak Depan', id: 'btn-front' },
            { label: 'Tampak Belakang', id: 'btn-rear' },
            { label: 'Sisi Samping', id: 'btn-side' },
            { label: 'Detail Baret', id: 'btn-scratch' },
          ].map(slot => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setActiveCameraSlot(slot.label)}
              className="h-14 sm:h-16 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-700 hover:border-cyan-500 bg-zinc-950/80 cursor-pointer transition-colors p-2 text-center group"
            >
              <Camera className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400" />
              <span className="text-[11px] font-medium text-zinc-300 group-hover:text-zinc-100 leading-none">
                📸 {slot.label}
              </span>
            </button>
          ))}
        </div>

        {activeCameraSlot && (
          <CameraCaptureModal
            label={activeCameraSlot}
            onCapture={handleCameraCapture}
            onClose={() => setActiveCameraSlot(null)}
          />
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {photos.map(p => (
              <div key={p.id} className="relative group rounded-lg overflow-hidden border border-zinc-800 aspect-video bg-zinc-950">
                <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-2">
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="self-end bg-rose-600/80 hover:bg-rose-600 text-white p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <span className="text-[11px] font-semibold text-white block truncate">{p.label}</span>
                    <span className="text-[9px] text-zinc-300 block">{p.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Catatan Khusus dari Owner / Instruksi Kerja
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Misal: Hindari emblem belakang saat poles tebal, customer minta dilapisi wax ekstra di kap mesin."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-xs text-zinc-300">
            <span>Subtotal Biaya Jasa:</span>
            <span className="font-mono font-medium">Rp {totalServicePrice.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span>Potongan / Diskon (Rp):</span>
            <input
              type="number"
              min={0}
              step={50000}
              value={discount}
              onChange={e => setDiscount(Number(e.target.value) || 0)}
              className="w-36 h-8 text-right bg-zinc-900 border border-zinc-700 rounded px-2.5 font-mono text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-cyan-400 pt-2 border-t border-zinc-800">
            <span>Estimasi Komisi Teknisi ({technicianName} - {commissionPct}%):</span>
            <span className="font-mono font-semibold">Rp {technicianCommissionAmount.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between items-center text-sm sm:text-base font-bold text-zinc-100 pt-2 border-t border-zinc-800">
            <span>Total Tagihan SPK:</span>
            <span className="text-emerald-400 font-mono text-lg">Rp {finalTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-20">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-base rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Menyimpan SPK...</span>
          ) : (
            <>
              <span>Terbitkan SPK & Masukkan ke Antrean</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
