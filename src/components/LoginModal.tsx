import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Lock, Mail, Eye, EyeOff, X, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { login } = useWorkshop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(result.error || 'Email atau password tidak sesuai.');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-zinc-900/80 border-b border-zinc-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Login Staf & Administrasi
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Akses terkontrol untuk Kasir & Owner
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@nairistem.com"
                  className="w-full h-11 bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-xl pl-10 pr-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-xl pl-10 pr-10 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Quick-Fill Pills */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400">
                ⚡ Akses Cepat Akun Demo (1-Klik):
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Siap Uji</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('kasir@nairistem.com', 'kasir123')}
                className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/60 hover:border-emerald-700 text-left transition-all group"
              >
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>💳 Akun Kasir</span>
                  <CheckCircle2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">kasir@nairistem.com</div>
                <div className="text-[10px] text-zinc-500 font-mono">pass: kasir123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('owner@nairistem.com', 'owner123')}
                className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-950/80 border border-purple-800/60 hover:border-purple-700 text-left transition-all group"
              >
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <span>👑 Akun Owner</span>
                  <CheckCircle2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">owner@nairistem.com</div>
                <div className="text-[10px] text-zinc-500 font-mono">pass: owner123</div>
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 text-center pt-1">
              🔧 <span className="text-zinc-300 font-medium">Pegawai Lapangan (Montir)</span> tidak memerlukan login dan otomatis aktif secara bebas di bengkel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
