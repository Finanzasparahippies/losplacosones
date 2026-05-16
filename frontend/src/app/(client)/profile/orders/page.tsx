'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetcher } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Package, Clock, MapPin, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

const TrackingMap = dynamic(() => import('@/components/delivery/TrackingMap'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-ceviche-brown/20 animate-pulse rounded-premium flex items-center justify-center font-black uppercase tracking-widest text-xs opacity-50">Localizando GPS...</div>
});

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleLocation, setVehicleLocation] = useState<{latitude: number, longitude: number} | undefined>();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await fetcher('/shop/orders/');
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();

    // Poll for vehicle location to simulate real-time
    const pollVehicle = async () => {
      try {
        const res = await fetch('/api/delivery/location/');
        if (res.ok) setVehicleLocation(await res.json());
      } catch (e) {}
    };
    pollVehicle();
    const interval = setInterval(pollVehicle, 5000);

    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const pastOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'PREPARING': return 'text-ceviche-orange bg-ceviche-orange/10 border-ceviche-orange/20';
      case 'OUT_FOR_DELIVERY': return 'text-ceviche-teal bg-ceviche-teal/10 border-ceviche-teal/20';
      case 'DELIVERED': return 'text-ceviche-lime bg-ceviche-lime/10 border-ceviche-lime/20';
      case 'CANCELLED': return 'text-ceviche-red bg-ceviche-red/10 border-ceviche-red/20';
      default: return 'text-white bg-white/10 border-white/20';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Orden Recibida';
      case 'PREPARING': return 'Preparando Ceviche';
      case 'OUT_FOR_DELIVERY': return 'En Camino a ti';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-ceviche-brown text-ceviche-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <header className="mb-12 animate-premium">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
            Mis <span className="text-ceviche-orange underline decoration-ceviche-teal decoration-wavy underline-offset-8">Órdenes</span>
          </h1>
          <p className="text-sm md:text-base text-ceviche-teal font-black uppercase tracking-[0.2em] opacity-80 mt-4">
            Historial y Rastreo en Vivo
          </p>
        </header>

        {loading ? (
          <div className="py-20 text-center font-black uppercase tracking-widest text-ceviche-orange animate-pulse">
            Consultando registros...
          </div>
        ) : (
          <div className="space-y-16 animate-premium" style={{ animationDelay: '0.1s' }}>
            
            {/* Órdenes Activas */}
            <section>
              <h2 className="text-xl font-black text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={20} className="text-ceviche-orange" /> Órdenes en Curso
              </h2>
              
              {activeOrders.length === 0 ? (
                <div className="bg-white/5 border border-white/10 p-12 rounded-premium text-center">
                  <Package size={40} className="mx-auto mb-4 text-white/10" />
                  <p className="text-white/20 font-black uppercase italic">No tienes pedidos en curso</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {activeOrders.map(order => (
                    <div key={order.id} className="bg-black/40 backdrop-blur-xl border border-ceviche-orange/20 rounded-premium overflow-hidden shadow-2xl flex flex-col md:flex-row">
                      
                      {/* Detalles de la Orden */}
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1">Orden #{order.id}</span>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </div>
                          </div>
                          <span className="text-xl font-black text-white italic drop-shadow-md">${order.total}</span>
                        </div>

                        <div className="space-y-2 flex-1 mb-6">
                          {order.items.map((item: any, idx: number) => (
                            <p key={idx} className="text-sm font-bold text-white/70">
                              <span className="text-ceviche-orange">{item.quantity}x</span> {item.product_name}
                            </p>
                          ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 text-xs font-bold text-white/40 uppercase flex items-center gap-2">
                          <MapPin size={14} className="text-ceviche-teal" />
                          <span className="truncate">{order.delivery_address}</span>
                        </div>
                      </div>

                      {/* Mapa en Vivo (Si está en camino) */}
                      {order.status === 'OUT_FOR_DELIVERY' && order.latitude && order.longitude && (
                        <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-white/10 bg-black/60 relative">
                          <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <span className="w-2 h-2 bg-ceviche-lime rounded-full animate-pulse shadow-lg shadow-ceviche-lime/50"></span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">Live Tracking</span>
                          </div>
                          <TrackingMap 
                            vehicleLocation={vehicleLocation} 
                            clientLocation={{ latitude: parseFloat(order.latitude), longitude: parseFloat(order.longitude) }} 
                          />
                        </div>
                      )}

                      {/* Progreso Visual (Si no está en camino) */}
                      {order.status !== 'OUT_FOR_DELIVERY' && (
                        <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-white/10 bg-white/5 p-8 flex flex-col justify-center items-center text-center">
                          <div className="w-16 h-16 rounded-full border-4 border-ceviche-orange/20 border-t-ceviche-orange animate-spin mb-4"></div>
                          <p className="text-sm font-black text-white uppercase tracking-widest mb-1">Cocinando</p>
                          <p className="text-[10px] text-white/40 font-bold uppercase">Tu pedido pronto saldrá a ruta</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Historial de Órdenes */}
            {pastOrders.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-ceviche-teal" /> Historial
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastOrders.map(order => (
                    <div key={order.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">Orden #{order.id}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${order.status === 'DELIVERED' ? 'text-ceviche-lime' : 'text-ceviche-red'}`}>
                          {order.status === 'DELIVERED' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-bold text-white/70 mb-1">{order.items.length} Platillos</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-white italic">${order.total}</span>
                          <ChevronRight size={16} className="text-white/20 group-hover:text-ceviche-orange transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </main>

      <footer className="py-12 text-center border-t border-white/5 bg-black/20">
        <p className="text-ceviche-teal/40 text-[10px] font-black uppercase tracking-[0.3em]">Ceviche Placosones &copy; 2026</p>
      </footer>
    </div>
  );
}
