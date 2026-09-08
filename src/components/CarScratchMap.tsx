import React, { useState } from 'react';
import type { ScratchPoint, CarView, ScratchSeverity } from '../types/workshop';
import { Plus, Trash2, Crosshair, Check } from 'lucide-react';

interface CarScratchMapProps {
  points: ScratchPoint[];
  onChange?: (points: ScratchPoint[]) => void;
  readOnly?: boolean;
}

export const CarScratchMap: React.FC<CarScratchMapProps> = ({ points, onChange, readOnly = false }) => {
  const [activeView, setActiveView] = useState<CarView>('top');
  const [selectedSeverity, setSelectedSeverity] = useState<ScratchSeverity>('minor');
  const [noteInput, setNoteInput] = useState('');
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null);

  const viewPoints = points.filter(p => p.view === activeView);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingPoint({ x, y });
  };

  const handleAddPoint = () => {
    if (!pendingPoint || !onChange) return;
    const newPoint: ScratchPoint = {
      id: `pt-${Date.now()}`,
      x: pendingPoint.x,
      y: pendingPoint.y,
      view: activeView,
      severity: selectedSeverity,
      note: noteInput.trim() || getDefaultNote(selectedSeverity, activeView),
    };
    onChange([...points, newPoint]);
    setPendingPoint(null);
    setNoteInput('');
  };

  const handleRemovePoint = (id: string) => {
    if (readOnly || !onChange) return;
    onChange(points.filter(p => p.id !== id));
  };

  const getDefaultNote = (sev: ScratchSeverity, view: CarView) => {
    const sevLabel = sev === 'minor' ? 'Swirl / Baret Halus' : sev === 'medium' ? 'Baret Dalam' : 'Penyok / Cat Terkelupas';
    return `${sevLabel} di sisi ${view}`;
  };

  const getSeverityBadge = (sev: ScratchSeverity) => {
    switch (sev) {
      case 'minor':
        return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/50', label: 'Baret Halus / Swirl' };
      case 'medium':
        return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/50', label: 'Baret Dalam' };
      case 'severe':
        return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/50', label: 'Penyok / Baret Kritis' };
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">Diagram Inspeksi Baret Fisik</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {readOnly ? 'Titik baret & cacat bodi yang terdata saat check-in.' : 'Klik pada diagram mobil untuk menandai titik baret/cacat.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs w-full sm:w-auto overflow-x-auto">
          {(['top', 'front', 'rear', 'left', 'right'] as CarView[]).map(view => {
            const count = points.filter(p => p.view === view).length;
            const labels: Record<CarView, string> = {
              top: 'Atas / Kap',
              front: 'Depan',
              rear: 'Belakang',
              left: 'Sisi Kiri',
              right: 'Sisi Kanan'
            };
            return (
              <button
                key={view}
                type="button"
                onClick={() => { setActiveView(view); setPendingPoint(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeView === view
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{labels[view]}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeView === view ? 'bg-blue-900 text-blue-200' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Diagram Canvas */}
      <div className="mt-4 flex flex-col lg:flex-row gap-5 items-center">
        <div
          onClick={handleCanvasClick}
          className={`relative w-full max-w-[480px] h-[260px] sm:h-[300px] bg-zinc-900/60 rounded-lg border border-zinc-800 flex items-center justify-center select-none overflow-hidden ${
            !readOnly ? 'cursor-crosshair hover:border-zinc-700' : ''
          }`}
        >
          {/* Automotive Wireframe Backgrounds based on activeView */}
          <div className="absolute inset-0 p-4 flex items-center justify-center opacity-85 pointer-events-none">
            {activeView === 'top' && (
              <svg viewBox="0 0 300 500" className="h-full w-auto text-zinc-600 stroke-current fill-zinc-900/40" strokeWidth="2.5" strokeLinecap="round">
                <rect x="50" y="30" width="200" height="440" rx="45" />
                <path d="M75 140 Q150 120 225 140 L210 190 Q150 180 90 190 Z" />
                <rect x="85" y="195" width="130" height="150" rx="8" />
                <path d="M90 350 Q150 360 210 350 L220 390 Q150 400 80 390 Z" />
                <path d="M40 145 L50 150 L50 170 L40 165 Z" />
                <path d="M260 145 L250 150 L250 170 L260 165 Z" />
                <line x1="110" y1="40" x2="110" y2="120" strokeDasharray="4 4" />
                <line x1="190" y1="40" x2="190" y2="120" strokeDasharray="4 4" />
              </svg>
            )}

            {activeView === 'front' && (
              <svg viewBox="0 0 400 260" className="w-full h-auto text-zinc-600 stroke-current fill-zinc-900/40" strokeWidth="2.5" strokeLinecap="round">
                <path d="M50 170 Q200 190 350 170 L340 230 Q200 245 60 230 Z" />
                <path d="M80 160 L110 70 Q200 60 290 70 L320 160 Z" />
                <polygon points="65,150 130,155 120,175 60,170" />
                <polygon points="335,150 270,155 280,175 340,170" />
                <rect x="150" y="170" width="100" height="40" rx="6" />
                <rect x="40" y="210" width="30" height="35" rx="4" />
                <rect x="330" y="210" width="30" height="35" rx="4" />
              </svg>
            )}

            {activeView === 'rear' && (
              <svg viewBox="0 0 400 260" className="w-full h-auto text-zinc-600 stroke-current fill-zinc-900/40" strokeWidth="2.5" strokeLinecap="round">
                <path d="M60 170 Q200 180 340 170 L335 230 Q200 240 65 230 Z" />
                <path d="M90 75 Q200 65 310 75 L325 150 Q200 160 75 150 Z" />
                <polygon points="65,150 140,152 135,170 65,165" />
                <polygon points="335,150 260,152 265,170 335,165" />
                <rect x="160" y="180" width="80" height="30" rx="4" />
                <circle cx="90" cy="235" r="8" />
                <circle cx="310" cy="235" r="8" />
              </svg>
            )}

            {(activeView === 'left' || activeView === 'right') && (
              <svg viewBox="0 0 500 220" className={`w-full h-auto text-zinc-600 stroke-current fill-zinc-900/40 ${activeView === 'right' ? '-scale-x-100' : ''}`} strokeWidth="2.5" strokeLinecap="round">
                <path d="M40 150 Q70 70 160 65 L310 65 Q390 70 460 130 L460 165 Q400 165 390 165 A 35 35 0 0 0 320 165 L180 165 A 35 35 0 0 0 110 165 L40 165 Z" />
                <path d="M165 75 L230 75 L230 120 L135 120 Z" />
                <path d="M245 75 L320 75 L350 120 L245 120 Z" />
                <circle cx="145" cy="165" r="28" />
                <circle cx="355" cy="165" r="28" />
                <line x1="238" y1="75" x2="238" y2="165" strokeDasharray="3 3" />
              </svg>
            )}
          </div>

          {/* Render Saved Scratch Pins */}
          {viewPoints.map((pt, idx) => {
            const sev = getSeverityBadge(pt.severity);
            return (
              <div
                key={pt.id}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                title={`${pt.note} (${sev.label})`}
              >
                <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${sev.bg} text-black font-bold text-[11px] shadow-lg border border-white/50 animate-pulse`}>
                  {idx + 1}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div className="bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs px-2.5 py-1.5 rounded shadow-xl whitespace-nowrap">
                    <span className="font-bold">{sev.label}:</span> {pt.note}
                  </div>
                  <div className="w-2 h-2 bg-zinc-900 rotate-45 -mt-1 border-r border-b border-zinc-700"></div>
                </div>
              </div>
            );
          })}

          {pendingPoint && !readOnly && (
            <div
              style={{ left: `${pendingPoint.x}%`, top: `${pendingPoint.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
              <div className="w-7 h-7 rounded-full border-2 border-blue-400 bg-blue-500/20 animate-ping absolute -inset-0"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400 border border-white shadow"></div>
            </div>
          )}

          {!readOnly && points.length === 0 && !pendingPoint && (
            <div className="absolute bottom-3 bg-zinc-950/80 px-3 py-1 rounded text-[11px] text-zinc-400 border border-zinc-800">
              Sentuh atau klik bodi mobil untuk input titik baret
            </div>
          )}
        </div>

        {/* Scratch Details Sidebar */}
        <div className="w-full lg:flex-1 space-y-3">
          {!readOnly && pendingPoint ? (
            <div className="bg-zinc-900/90 border border-blue-500/50 rounded-lg p-3.5 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Konfirmasi Titik Cacat Baru
                </span>
                <span className="text-[11px] text-zinc-400">Koordinat: {pendingPoint.x}%, {pendingPoint.y}%</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(['minor', 'medium', 'severe'] as ScratchSeverity[]).map(sev => {
                  const s = getSeverityBadge(sev);
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSelectedSeverity(sev)}
                      className={`px-2 py-1.5 rounded text-xs font-medium border text-center transition-all ${
                        selectedSeverity === sev
                          ? `${s.bg} text-zinc-950 font-bold border-white`
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                      }`}
                    >
                      {sev === 'minor' ? 'Halus / Swirl' : sev === 'medium' ? 'Baret Dalam' : 'Penyok/Kritis'}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Catatan baret (misal: Baret kuku di gagang pintu)"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Simpan Titik
                </button>
                <button
                  type="button"
                  onClick={() => setPendingPoint(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 px-3 rounded transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between">
              <span>Daftar Baret Terdata ({viewPoints.length})</span>
              <span className="text-[11px] text-zinc-500">Sisi: {activeView.toUpperCase()}</span>
            </div>

            {viewPoints.length === 0 ? (
              <div className="text-xs text-zinc-400 bg-zinc-900/40 border border-zinc-800/80 rounded p-3 text-center">
                Belum ada catatan cacat bodi pada sisi ini.
              </div>
            ) : (
              viewPoints.map((pt, i) => {
                const s = getSeverityBadge(pt.severity);
                return (
                  <div
                    key={pt.id}
                    className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-4 h-4 rounded-full ${s.bg} text-black font-bold flex items-center justify-center text-[10px] shrink-0`}>
                        {i + 1}
                      </span>
                      <div className="truncate">
                        <span className={`font-medium ${s.text} mr-1.5`}>[{s.label}]</span>
                        <span className="text-zinc-200">{pt.note}</span>
                      </div>
                    </div>
                    {!readOnly && onChange && (
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(pt.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                        title="Hapus titik"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
