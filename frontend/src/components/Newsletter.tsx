'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('¡Te has suscrito con éxito! Prepárate para el sabor.');
        setEmail('');
      } else {
        const data = await res.json();
        setStatus('error');
        setMessage(data.email ? data.email[0] : 'Error al suscribirse. Inténtalo de nuevo.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error de conexión. Revisa tu internet.');
    }
  };

  return (
    <section className="bg-ceviche-orange py-20 px-8 relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <h2 className="text-5xl md:text-6xl font-black text-ceviche-brown uppercase italic tracking-tighter mb-6">
          Únete a la <span className="text-ceviche-red">Placosidad</span>
        </h2>
        <p className="text-ceviche-brown/80 text-xl font-medium mb-10 max-w-2xl mx-auto">
          Recibe ofertas exclusivas, rutas secretas y nuevos lanzamientos antes que nadie.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email más placosón"
            required
            className="flex-1 px-8 py-5 rounded-full bg-ceviche-brown text-ceviche-white border-4 border-ceviche-brown focus:border-ceviche-red outline-none transition-all placeholder:text-ceviche-white/30 text-lg"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-ceviche-red text-ceviche-white px-12 py-5 rounded-full font-black uppercase text-lg hover:scale-105 transition-transform shadow-xl shadow-ceviche-red/20 disabled:opacity-50"
          >
            {status === 'loading' ? 'Enviando...' : 'Suscribirme'}
          </button>
        </form>

        {message && (
          <p className={`mt-6 font-bold text-lg ${status === 'success' ? 'text-ceviche-brown' : 'text-ceviche-red'}`}>
            {status === 'success' ? '✅' : '❌'} {message}
          </p>
        )}
      </div>
    </section>
  );
}
