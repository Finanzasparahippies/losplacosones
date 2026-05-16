'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import GPSManager from '@/components/delivery/GPSManager';
import { MessageCircle, X, Send, MapPin } from 'lucide-react';
import { fetcher } from '@/lib/api';

// Dynamic import for Leaflet
const TrackingMap = dynamic(() => import('@/components/delivery/TrackingMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-ceviche-brown/20 animate-pulse rounded-premium" />
});

const isUpdatingRef = { current: false };
type TrackingMode = 'OFF' | 'GPS' | 'MANUAL';

export default function AdminDeliveryPage() {
  const [vehicleLocation, setVehicleLocation] = useState<{latitude: number, longitude: number} | undefined>();
  const [stops, setStops] = useState([]);
  const [mode, setMode] = useState<TrackingMode>('OFF');
  const [isSpoofed, setIsSpoofed] = useState(false);
  const [chatOrder, setChatOrder] = useState<any>(null);

  // Reference for "Common Ghost Coordinates" to warn but not necessarily block
  const COMMON_GHOST_LAT = 28.7381;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locRes = await fetch('/api/delivery/location/');
        if (locRes.ok) {
          const data = await locRes.json();
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          setVehicleLocation({ latitude: lat, longitude: lng });
          
          // Check if it matches known spoofed coords
          if (Math.abs(lat - COMMON_GHOST_LAT) < 0.001) setIsSpoofed(true);
        }
        await fetchOrders();
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const getCookie = (n: string) => `; ${document.cookie}`.split(`; ${n}=`).pop()?.split(';').shift() || '';
      const stopsRes = await fetch('/api/shop/orders/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (stopsRes.ok) {
        const data = await stopsRes.json();
        const activeStops = data.filter((o: any) => o.status === 'PENDING' || o.status === 'SHIPPED').map((o: any) => ({
          id: o.id,
          name: o.user_email,
          address: o.delivery_address,
          status: o.status,
          latitude: o.latitude,
          longitude: o.longitude
        }));
        setStops(activeStops);
      }
    } catch(e) {}
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`/api/shop/orders/${orderId}/change_status/`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  const updateServer = useCallback(async (lat: number, lng: number) => {
    if (isUpdatingRef.current) return;
    try {
      isUpdatingRef.current = true;
      const getCookie = (n: string) => `; ${document.cookie}`.split(`; ${n}=`).pop()?.split(';').shift() || '';
      await fetch('/api/delivery/location/update/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      
      // Dynamic spoof detection: update warning if it matches the "Ghost"
      if (Math.abs(lat - COMMON_GHOST_LAT) < 0.001) setIsSpoofed(true);
      else setIsSpoofed(false);

    } catch (e) {} finally {
      isUpdatingRef.current = false;
    }
  }, []);

  // New Dynamic Calibration: Takes whatever the current sensor says and fixes it
  const captureCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setVehicleLocation({ latitude, longitude });
        updateServer(latitude, longitude);
        setMode('MANUAL'); // Switch to manual to lock this verified position
      }, (error) => {
        alert("No se pudo obtener la ubicación actual del sensor.");
      });
    }
  };

  const handleGPSUpdate = useCallback((lat: number, lng: number) => {
    if (mode === 'GPS') {
      setVehicleLocation({ latitude: lat, longitude: lng });
      updateServer(lat, lng);
    }
  }, [mode, updateServer]);

  const handleManualUpdate = useCallback((lat: number, lng: number) => {
    if (mode === 'MANUAL') {
      setVehicleLocation({ latitude: lat, longitude: lng });
      updateServer(lat, lng);
    }
  }, [mode, updateServer]);

  return (
    <div className="p-8 space-y-8 animate-premium">
      <header className="flex justify-between items-center border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            Delivery <span className="text-ceviche-orange">Tracker</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${mode !== 'OFF' ? 'bg-ceviche-lime' : 'bg-white/20'}`}></span>
            <p className="text-ceviche-teal/60 font-bold text-xs uppercase tracking-widest">
              Modo: {mode}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <ModeButton active={mode === 'OFF'} onClick={() => setMode('OFF')} label="Off" />
            <ModeButton active={mode === 'GPS'} onClick={() => setMode('GPS')} label="Auto GPS" />
            <ModeButton active={mode === 'MANUAL'} onClick={() => setMode('MANUAL')} label="Manual" />
          </div>
          
          <button 
            onClick={captureCurrentLocation}
            className="text-[9px] font-black uppercase text-ceviche-teal hover:text-white transition-colors flex items-center gap-2 px-3 py-1 bg-ceviche-teal/10 rounded-full border border-ceviche-teal/20"
          >
            <span>📍 Capturar Ubicación Sensor</span>
          </button>
        </div>
      </header>

      {isSpoofed && mode === 'GPS' && (
        <div className="bg-ceviche-red/20 border border-ceviche-red/50 p-4 rounded-xl flex items-center gap-4 animate-premium">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-ceviche-red font-black uppercase text-xs">Aviso de Ubicación Genérica</p>
            <p className="text-white/70 text-xs">Tu navegador está reportando una ubicación genérica (Hermosillo). Si no es correcta, usa el modo <b>Manual</b>.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TrackingMap 
            vehicleLocation={vehicleLocation} 
            stops={stops} 
            isDraggable={mode === 'MANUAL'}
            onMarkerDrag={handleManualUpdate}
          />
          
          <div className="bg-ceviche-brown/40 p-8 rounded-premium border border-white/5 backdrop-blur-sm">
            <h2 className="text-2xl font-black mb-8 text-ceviche-orange uppercase italic tracking-tight">Ruta Activa</h2>
            <div className="space-y-4">
              {stops.length === 0 ? (
                <p className="text-white/20 italic text-center py-8 font-bold uppercase tracking-widest">Sin entregas activas</p>
              ) : (
                stops.map((stop: any) => (
                  <div key={stop.id} className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-ceviche-orange/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-ceviche-orange/20 flex items-center justify-center text-ceviche-orange font-black">
                        #{stop.id}
                      </div>
                      <div>
                        <p className="font-black text-white">{stop.name}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{stop.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-widest ${
                        stop.status === 'SHIPPED' ? 'bg-ceviche-lime text-ceviche-brown' : 'bg-ceviche-orange/20 text-ceviche-orange'
                      }`}>
                        {stop.status}
                      </span>
                      
                      {stop.status === 'PENDING' && (
                         <button 
                           onClick={() => updateOrderStatus(stop.id, 'SHIPPED')}
                           className="bg-white/10 hover:bg-ceviche-lime hover:text-ceviche-brown text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-colors"
                         >
                           Iniciar Entrega
                         </button>
                      )}
                      {stop.status === 'SHIPPED' && (
                         <button 
                           onClick={() => updateOrderStatus(stop.id, 'DELIVERED')}
                           className="bg-ceviche-lime/20 hover:bg-ceviche-lime hover:text-ceviche-brown text-ceviche-lime text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-colors"
                         >
                           Entregado
                         </button>
                      )}
                      <button 
                        onClick={() => setChatOrder(stop)}
                        className="bg-ceviche-teal/20 text-ceviche-teal hover:bg-ceviche-teal hover:text-black w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        title="Chat con el cliente"
                      >
                        <MessageCircle size={14} />
                      </button>
                      {(stop.latitude || stop.address) && (
                        <a 
                          href={stop.latitude ? `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                          title="Abrir en Google Maps"
                        >
                          <MapPin size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <GPSManager 
            onLocationUpdate={handleGPSUpdate} 
            isTracking={mode === 'GPS'}
            setIsTracking={(val) => setMode(val ? 'GPS' : 'OFF')}
          />
          
          <div className="p-8 bg-black/60 rounded-premium border border-white/5">
            <h3 className="text-xl font-black mb-6 text-white uppercase italic tracking-tighter">Instrucciones</h3>
            <div className="space-y-4 text-xs font-bold text-white/40 uppercase tracking-tighter">
              <p>1. Selecciona <span className="text-white">Auto GPS</span> para seguimiento automático.</p>
              <p>2. Usa <span className="text-white">Manual</span> si necesitas corregir la posición en el mapa.</p>
              <p>3. El botón <span className="text-ceviche-teal">Capturar</span> toma tu ubicación actual del sensor una sola vez.</p>
            </div>
          </div>
        </div>
      </div>
      
      {chatOrder && (
        <DriverChatModal 
          order={chatOrder} 
          onClose={() => setChatOrder(null)} 
        />
      )}
    </div>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
        active 
          ? 'bg-ceviche-orange text-white shadow-xl shadow-ceviche-orange/20 scale-105' 
          : 'text-white/30 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

function DriverChatModal({ order, onClose }: { order: any, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await fetcher(`/shop/orders/${order.id}/chat_messages/`);
        setMessages(msgs);
      } catch (e) {}
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [order.id]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await fetch(`/api/shop/orders/${order.id}/chat_messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      setNewMessage('');
      const msgs = await fetcher(`/shop/orders/${order.id}/chat_messages/`);
      setMessages(msgs);
    } catch (e) {
      alert("Error enviando mensaje");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-black/90 border border-white/10 w-full max-w-md rounded-premium shadow-2xl overflow-hidden flex flex-col h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="font-black text-white uppercase tracking-tight">Chat - Orden #{order.id}</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">{order.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMine = msg.is_staff;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 ${isMine ? 'bg-ceviche-teal text-black rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
                  {!isMine && (
                    <p className="text-[9px] font-black uppercase opacity-60 mb-1">👤 Cliente</p>
                  )}
                  <p className="text-sm font-medium">{msg.message}</p>
                  <p className={`text-[8px] font-bold text-right mt-1 opacity-50`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje al cliente..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-ceviche-teal transition-colors"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-ceviche-teal text-black p-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
