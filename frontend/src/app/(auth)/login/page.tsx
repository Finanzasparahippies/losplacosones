'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await auth.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ceviche-brown flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-md w-full animate-premium">
        <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-premium border border-white/5 shadow-2xl relative overflow-hidden group">
          {/* Decorative elements */}
          <div className="absolute -right-10 -top-10 text-8xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">🍤</div>
          
          <div className="relative z-10">
            <header className="text-center mb-10">
              <Link href="/" className="inline-block mb-6">
                <span className="text-2xl font-black text-ceviche-red uppercase tracking-tighter block leading-none">Ceviche</span>
                <span className="text-4xl font-black text-ceviche-orange uppercase tracking-tighter block leading-none ml-6 italic">Placosones</span>
              </Link>
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em] italic">Bienvenido de Vuelta</h1>
              <p className="text-ceviche-teal/50 text-xs mt-2 uppercase font-bold tracking-widest">Acceso al Panel de Control</p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-ceviche-red/20 border border-ceviche-red/50 rounded-xl text-ceviche-red text-xs font-bold text-center uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-ceviche-orange/50 focus:ring-0 transition-all outline-none"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Contraseña</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-ceviche-orange/50 focus:ring-0 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-ceviche-orange to-ceviche-red p-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-ceviche-red/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {loading ? 'Entrando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <footer className="mt-10 text-center space-y-4">
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                ¿No tienes cuenta? <Link href="/register" className="text-ceviche-teal hover:text-white transition-colors">Regístrate</Link>
              </p>
              <Link href="/" className="text-[9px] text-white/10 hover:text-white transition-colors uppercase tracking-[0.3em] block">
                ← Volver al Inicio
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
