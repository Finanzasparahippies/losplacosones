'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

const TrackingMap = dynamic(() => import('@/components/delivery/TrackingMap'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-ceviche-brown/20 animate-pulse rounded-premium flex items-center justify-center font-black uppercase tracking-widest text-xs opacity-50">Buscando el Ceviche...</div>
});

export default function ClientTrackingPage() {
  const [vehicleLocation, setVehicleLocation] = useState<{latitude: number, longitude: number} | undefined>();
  const [stops, setStops] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locRes = await fetch('/api/delivery/location/');
        if (locRes.ok) {
          const data = await locRes.json();
          setVehicleLocation(data);
          setLastUpdate(new Date());
        }
        
        const stopsRes = await fetch('/api/delivery/stops/');
        if (stopsRes.ok) {
          const data = await stopsRes.json();
          setStops(data);
        }
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-ceviche-brown text-ceviche-white">
      <Navbar />

      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ceviche-red/30 via-ceviche-brown/80 to-ceviche-brown z-10"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        <div className="z-20 text-center px-4 animate-premium pt-20">
          <h1 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-2xl">
            ¿Dónde está mi <span className="text-ceviche-orange underline decoration-ceviche-red decoration-wavy underline-offset-8">Ceviche</span>?
          </h1>
          <p className="text-xl md:text-2xl text-ceviche-teal font-black uppercase tracking-[0.2em] opacity-80">Rastreo Placosón en Vivo</p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 pb-32 -mt-10 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-premium overflow-hidden border-4 border-ceviche-orange/20 shadow-2xl">
              <TrackingMap vehicleLocation={vehicleLocation} stops={stops} />
            </div>
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-ceviche-lime rounded-full animate-pulse shadow-lg shadow-ceviche-lime/50"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Live Feed Phoenix, AZ</p>
              </div>
              {lastUpdate && (
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ceviche-teal/60 italic">
                  Visto hace unos segundos: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-ceviche-orange to-ceviche-red p-8 rounded-premium shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">🚚</div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-ceviche-brown uppercase mb-8 italic tracking-tighter">Ruta Activa</h2>
                <div className="space-y-4">
                  {stops.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-ceviche-brown/20 rounded-2xl">
                      <p className="text-ceviche-brown/40 font-black uppercase text-xs tracking-widest">Consultando radar...</p>
                    </div>
                  ) : (
                    stops.map((stop: any) => (
                      <div key={stop.id} className="p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm group-hover:border-white/20 transition-all">
                        <p className="font-black text-ceviche-brown text-xl leading-none mb-1">{stop.name}</p>
                        <p className="text-[10px] font-bold text-ceviche-brown/60 uppercase tracking-widest mb-4">{stop.address}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-ceviche-brown text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-lg">
                            {stop.status === 'ARRIVED' ? '📍 Aquí' : '🚚 En camino'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-ceviche-lime rounded-premium border-b-8 border-ceviche-teal shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-ceviche-brown uppercase mb-2 italic tracking-tighter">¿Hambre de Mar?</h3>
                <p className="text-ceviche-brown/60 text-xs font-bold uppercase tracking-widest mb-6 leading-relaxed">Estamos a la vuelta de la esquina. Pide el sazón original.</p>
                <a href="/menu" className="block w-full bg-ceviche-brown text-ceviche-lime py-4 rounded-full font-black uppercase text-center hover:scale-105 transition-all shadow-xl shadow-black/20 text-sm tracking-widest">
                  Ver el Menú Completo
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 text-center border-t border-white/5 bg-ceviche-brown">
        <p className="text-ceviche-teal/40 text-[10px] font-black uppercase tracking-[0.3em]">Ceviche Placosones &copy; 2026 • Phoenix, AZ</p>
      </footer>
    </div>
  );
}
