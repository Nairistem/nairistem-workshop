import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, SwitchCamera } from 'lucide-react';
import { captureVideoFrame, compressImageFile } from '../lib/imageCompression';

interface CameraCaptureModalProps {
  label: string;
  onCapture: (dataUrl: string, label: string) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  label,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Start Camera Stream
  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setErrorMessage('');
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera langsung');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCameraAccess(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCameraAccess(false);
      setErrorMessage(
        err.name === 'NotAllowedError' 
          ? 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.' 
          : 'Kamera langsung tidak dapat diakses pada perangkat ini.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Capture Frame from Video Viewfinder
  const handleShutter = () => {
    if (!videoRef.current) return;
    try {
      setIsProcessing(true);
      const result = captureVideoFrame(videoRef.current, 1280, 0.82);
      setCapturedImage(result.dataUrl);
    } catch (err) {
      console.error('Failed to capture frame', err);
      setErrorMessage('Gagal mengambil frame foto dari kamera.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback upload (strictly camera capture)
  const handleNativeCameraFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const result = await compressImageFile(file, 1280, 0.82);
      setCapturedImage(result.dataUrl);
    } catch (err) {
      console.error('Error compressing camera photo', err);
      setErrorMessage('Gagal memproses foto kamera.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedImage) {
      stopCamera();
      onCapture(capturedImage, label);
      onClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    } else {
      startCamera(facingMode);
    }
  };

  // Toggle Camera Front / Back
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">
                Kamera Langsung: <span className="text-cyan-400">{label}</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Foto otomatis dikompres hemat memori (WebP HD)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Captured Screen */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] sm:min-h-[420px] overflow-hidden">
          {capturedImage ? (
            // Preview captured image
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured preview"
                className="max-h-[70vh] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-zinc-700 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Foto Terambil & Terkompres HD</span>
              </div>
            </div>
          ) : hasCameraAccess ? (
            // Live Video Viewfinder
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Overlay / Guidelines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                <div className="bg-black/60 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full text-[11px] text-zinc-200">
                  Arahkan kamera ke: <strong className="text-cyan-400">{label}</strong>
                </div>

                {/* Framing Box */}
                <div className="w-full max-w-[320px] aspect-[4/3] border-2 border-dashed border-cyan-400/60 rounded-2xl relative flex items-center justify-center">
                  <span className="text-[11px] font-mono text-cyan-300/80 bg-black/40 px-2 py-0.5 rounded">
                    Posisikan bodi mobil di dalam bingkai
                  </span>
                </div>

                <div className="text-[10px] text-zinc-400 bg-black/60 px-3 py-1 rounded-full">
                  Format WebP Otomatis • Resolusi 1280px
                </div>
              </div>
            </div>
          ) : (
            // Camera Access Fallback
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-200">Akses Kamera Langsung</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  {errorMessage || 'Aktifkan kamera perangkat Anda untuk mengambil foto unit secara instan.'}
                </p>
              </div>

              {/* Native Mobile Camera Trigger */}
              <label className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer transition-all shadow-lg shadow-cyan-600/30 w-full">
                <Camera className="w-4 h-4" />
                <span>Buka Kamera HP Langsung</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleNativeCameraFile}
                />
              </label>

              <p className="text-[10px] text-zinc-500">
                Pilihan langsung mengaktifkan kamera belakang HP montir tanpa galeri.
              </p>
            </div>
          )}
        </div>

        {/* Shutter & Controls Bottom Bar */}
        <div className="p-4 bg-zinc-900/95 border-t border-zinc-800 flex items-center justify-around gap-3">
          {capturedImage ? (
            // Confirm or Retake Buttons
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-600/30"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
          ) : hasCameraAccess ? (
            // Shutter & Flip Button
            <div className="flex items-center justify-between w-full px-6">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-3 text-zinc-400 hover:text-white rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
                title="Putar Kamera Depan/Belakang"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              {/* Big Round Shutter Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleShutter}
                className="w-16 h-16 rounded-full border-4 border-white/80 bg-cyan-500 hover:bg-cyan-400 active:scale-95 transition-all shadow-xl shadow-cyan-500/40 flex items-center justify-center disabled:opacity-50"
                title="Ambil Foto"
              >
                <div className="w-12 h-12 rounded-full border-2 border-black/30 bg-white flex items-center justify-center">
                  <Camera className="w-6 h-6 text-cyan-700" />
                </div>
              </button>

              {/* Fallback Native Input Trigger in case stream freezes */}
              <label
                className="p-3 text-zinc-400 hover:text-white rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Gunakan Aplikasi Kamera Bawaan HP"
              >
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleNativeCameraFile}
                />
              </label>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="py-2.5 px-6 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
