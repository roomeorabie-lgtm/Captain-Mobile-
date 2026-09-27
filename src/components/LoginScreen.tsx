import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Wrench } from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../utils/formatters';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      // Exact credentials requested
      if (username.trim() === 'Mando' && password === 'Mm90888') {
        sessionStorage.setItem('captain_mobile_auth', 'authenticated');
        onLoginSuccess();
      } else {
        setError('بيانات الدخول غير صحيحة، يرجى التأكد من اسم المستخدم وكلمة المرور');
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Subtle luxury glow effect in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-[400px] h-[400px] bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-28 h-28 mb-4 relative flex items-center justify-center p-2 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-inner">
              <img
                src={OFFICIAL_LOGO_URL}
                alt="Captain Mobile Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(255,190,0,0.15)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-black tracking-wide text-zinc-100 flex items-center gap-2">
              Captain Mobile
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">
              نظام إدارة وصيانة أجهزة الموبايل
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-sm text-center flex items-center justify-center gap-2 animate-shake">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full pr-10 pl-4 py-3 bg-[#0d0d10] border border-zinc-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full pr-10 pl-11 py-3 bg-[#0d0d10] border border-zinc-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 rounded-xl text-zinc-100 placeholder-zinc-600 text-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/10 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>تسجيل الدخول إلى النظام</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy & Local Notice */}
          <div className="mt-8 pt-5 border-t border-zinc-800/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
              <Wrench size={13} className="text-amber-500/80" />
              <span>نظام محلي مشفر ومحمي - لا يعتمد على خوادم سحابية</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-zinc-600 mt-6 font-medium">
          جميع البيانات تُحفظ محلياً على جهازك بواسطة تقنية IndexedDB الآمنة
        </p>
      </div>
    </div>
  );
};
