'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  User,
  CreditCard,
  Banknote
} from 'lucide-react';

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refrescar cada 10 seg
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetcher(`/shop/orders/${orderId}/change_status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-ceviche-orange/20 text-ceviche-orange border-ceviche-orange/30';
      case 'SHIPPED': return 'bg-ceviche-lime/20 text-ceviche-lime border-ceviche-lime/30';
      case 'DELIVERED': return 'bg-white/10 text-white/40 border-white/10';
      default: return 'bg-white/5 text-white/60';
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  return (
    <div className="space-y-12 pb-20 animate-premium">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Gestión de <span className="text-ceviche-orange">Órdenes</span>
          </h1>
          <p className="text-ceviche-teal/60 font-bold uppercase tracking-widest text-xs mt-2">
            Panel de control operativo en tiempo real
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-ceviche-lime animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live</span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-ceviche-teal animate-pulse font-black uppercase tracking-widest">
          Sincronizando...
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-20 rounded-premium text-center">
          <Package size={48} className="mx-auto mb-6 text-white/10" />
          <p className="text-white/20 font-black uppercase italic text-xl">No hay órdenes activas en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-premium overflow-hidden group hover:border-white/20 transition-all shadow-2xl"
            >
              <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                
                {/* ID & Status */}
                <div className="flex flex-col gap-3 min-w-[150px]">
                  <span className="text-3xl font-black text-white italic">#{order.id}</span>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                {/* Customer & Address */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{order.user_email}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <MapPin size={16} className="text-ceviche-teal shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white/90 leading-tight mb-1">{order.delivery_address}</p>
                      {order.latitude && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-black text-ceviche-lime uppercase tracking-widest flex items-center gap-1 hover:underline"
                        >
                          Ver en Mapa <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="lg:px-8 lg:border-x lg:border-white/5 max-w-xs w-full">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Detalle</p>
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <p key={idx} className="text-xs text-white/60 font-bold flex justify-between">
                        <span>{item.quantity}x {item.product_name}</span>
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
                    <div className="flex items-center gap-2 text-white/40">
                      {order.payment_method === 'CASH' ? <Banknote size={14} /> : <CreditCard size={14} />}
                      <span className="text-[10px] font-black uppercase italic">{order.payment_method}</span>
                    </div>
                    <span className="text-2xl font-black text-ceviche-orange tracking-tighter">${order.total}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[200px] w-full lg:w-auto">
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'SHIPPED')}
                      className="w-full bg-ceviche-orange text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <Truck size={16} /> Empezar Entrega
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'DELIVERED')}
                      className="w-full bg-ceviche-lime text-ceviche-brown py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Marcar Entregado
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if(window.confirm('¿Estás seguro de cancelar esta orden?')) {
                        updateStatus(order.id, 'CANCELLED');
                      }
                    }}
                    className="w-full border border-white/10 text-white/40 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-ceviche-red/20 hover:text-ceviche-red hover:border-ceviche-red/50 transition-all"
                  >
                    Cancelar Orden
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
