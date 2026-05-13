import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-6 py-24 flex flex-col items-center text-center">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-nectar-gold uppercase border border-nectar-gold/30 rounded-full bg-nectar-gold/5 animate-premium">
          Nectar Labs • Desarrollo Premium
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight animate-premium" style={{ animationDelay: '0.1s' }}>
          Escala tu negocio <br />
          <span className="text-nectar-gold">Sin límites globales</span>
        </h1>
        <p className="text-xl text-foreground/70 max-w-2xl mb-12 animate-premium" style={{ animationDelay: '0.2s' }}>
          Desarrollo de software a medida para negocios locales que buscan dominar su mercado con tecnología de alto rendimiento.
        </p>
        <div className="flex gap-4 animate-premium" style={{ animationDelay: '0.3s' }}>
          <button className="px-8 py-4 bg-nectar-gold text-nectar-black font-bold rounded-premium hover:bg-nectar-gold-dark transition-all">
            Empezar Proyecto
          </button>
          <button className="px-8 py-4 border border-foreground/10 font-bold rounded-premium hover:bg-foreground/5 transition-all">
            Ver Portafolio
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="w-full bg-nectar-gray py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-nectar-black border border-white/5 rounded-premium hover:border-nectar-gold/50 transition-all group">
              <div className="w-12 h-12 bg-nectar-gold/10 rounded-lg flex items-center justify-center mb-6 text-nectar-gold group-hover:bg-nectar-gold group-hover:text-nectar-black transition-all">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Desarrollo a Medida</h3>
              <p className="text-foreground/60">Software escalable sin plantillas rígidas, diseñado para tus necesidades exactas.</p>
            </div>
            
            <div className="p-8 bg-nectar-black border border-white/5 rounded-premium hover:border-nectar-gold/50 transition-all group">
              <div className="w-12 h-12 bg-nectar-gold/10 rounded-lg flex items-center justify-center mb-6 text-nectar-gold group-hover:bg-nectar-gold group-hover:text-nectar-black transition-all">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Analítica Avanzada</h3>
              <p className="text-foreground/60">Visualiza el crecimiento de tu negocio con tableros de datos potentes y claros.</p>
            </div>

            <div className="p-8 bg-nectar-black border border-white/5 rounded-premium hover:border-nectar-gold/50 transition-all group">
              <div className="w-12 h-12 bg-nectar-gold/10 rounded-lg flex items-center justify-center mb-6 text-nectar-gold group-hover:bg-nectar-gold group-hover:text-nectar-black transition-all">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Marketing Automatizado</h3>
              <p className="text-foreground/60">Sistema de newsletter y actualizaciones por correo para fidelizar a tus clientes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
