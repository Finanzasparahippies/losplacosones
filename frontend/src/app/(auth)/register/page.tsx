'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetcher } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await fetcher('/users/register/', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-ceviche-brown flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-md w-full animate-premium">
        <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-premium border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -left-10 -bottom-10 text-8xl opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">🍋</div>
          
          <div className="relative z-10">
            <header className="text-center mb-10">
              <Link href="/" className="inline-block mb-6">
                <span className="text-2xl font-black text-ceviche-red uppercase tracking-tighter block leading-none">Ceviche</span>
                <span className="text-4xl font-black text-ceviche-orange uppercase tracking-tighter block leading-none ml-6 italic">Placosones</span>
              </Link>
              <h1 className="text-xl font-black text-white uppercase tracking-[0.2em] italic">Crea tu Cuenta</h1>
              <p className="text-ceviche-teal/50 text-xs mt-2 uppercase font-bold tracking-widest">Únete a la Experiencia Placosa</p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-ceviche-red/20 border border-ceviche-red/50 rounded-xl text-ceviche-red text-xs font-bold text-center uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Nombre de Usuario</label>
                <input 
                  name="username"
                  type="text" 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl text-white focus:border-ceviche-orange/50 focus:ring-0 transition-all outline-none text-sm"
                  placeholder="el_placoso_01"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Email</label>
                <input 
                  name="email"
                  type="email" 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl text-white focus:border-ceviche-orange/50 focus:ring-0 transition-all outline-none text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Teléfono</label>
                <input 
                  name="phone"
                  type="tel" 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl text-white focus:border-ceviche-orange/50 focus:ring-0 transition-all outline-none text-sm"
                  placeholder="602-000-0000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Contraseña</label>
                <input 
                  name="password"
                  type="password" 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 p-3.5 rounded-2xl text-white focus:border-ceviche-orange/50 focus:ring-0 transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-ceviche-orange to-ceviche-red p-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-ceviche-red/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Registrarme'}
              </button>
            </form>

            <footer className="mt-8 text-center space-y-4">
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                ¿Ya eres parte? <Link href="/login" className="text-ceviche-teal hover:text-white transition-colors">Entra aquí</Link>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
