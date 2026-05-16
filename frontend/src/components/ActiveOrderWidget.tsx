'use client';

import { useState, useEffect, useRef } from 'react';
import { fetcher } from '@/lib/api';
import { MessageCircle, X, Send, Navigation, Package, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ActiveOrderWidget() {
  const { user } = useAuth();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for active orders
  useEffect(() => {
    if (!user) return;

    const checkActiveOrder = async () => {
      try {
        if (!localStorage.getItem('access_token')) return;
        const orders = await fetcher('/shop/orders/');
        const active = orders.find((o: any) => o.status === 'PENDING' || o.status === 'SHIPPED');
        setActiveOrder(active || null);
        if (!active) setIsOpen(false);
      } catch (e) {
        // If auth fails, don't spam errors
      }
    };

    checkActiveOrder();
    const interval = setInterval(checkActiveOrder, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Poll for messages if chat is open
  useEffect(() => {
    if (!isOpen || !activeOrder) return;

    const fetchMessages = async () => {
      try {
        const msgs = await fetcher(`/shop/orders/${activeOrder.id}/chat_messages/`);
        setMessages(msgs);
      } catch (e) {
        console.error("Error fetching messages", e);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, activeOrder]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeOrder) return;

    try {
      await fetch(`/api/shop/orders/${activeOrder.id}/chat_messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      setNewMessage('');
      // Optimistically fetch immediately
      const msgs = await fetcher(`/shop/orders/${activeOrder.id}/chat_messages/`);
      setMessages(msgs);
    } catch (e) {
      console.error("Error sending message", e);
    }
  };

  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    if (!confirm("¿Estás seguro de que deseas cancelar este pedido? Solo puedes hacerlo en los primeros 10 minutos.")) return;
    
    try {
      const res = await fetch(`/api/shop/orders/${activeOrder.id}/cancel_order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo cancelar el pedido.");
        return;
      }
      setActiveOrder(null);
      setIsOpen(false);
    } catch (e) {
      alert("Error de conexión al cancelar.");
    }
  };

  if (!user || user.is_staff || !activeOrder) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-premium shadow-2xl mb-4 w-[340px] overflow-hidden flex flex-col animate-premium h-[450px]">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <div>
              <h4 className="font-black text-white uppercase text-sm flex items-center gap-2">
                {activeOrder.status === 'SHIPPED' ? <Navigation size={14} className="text-ceviche-teal" /> : <Package size={14} className="text-ceviche-orange" />}
                Orden #{activeOrder.id}
              </h4>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold flex items-center gap-2">
                {activeOrder.status === 'SHIPPED' ? 'En Camino' : 'Preparando'}
                {activeOrder.status === 'PENDING' && (
                  <button onClick={handleCancelOrder} className="text-ceviche-red hover:underline ml-2">
                    Cancelar
                  </button>
                )}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-center mb-4">
              <span className="text-[10px] bg-white/5 text-white/40 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                Chat Iniciado
              </span>
            </div>
            {messages.map((msg) => {
              const isMine = msg.sender_name === user.username;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 ${isMine ? 'bg-ceviche-teal text-black rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
                    {!isMine && (
                      <p className="text-[9px] font-black uppercase opacity-60 mb-1">{msg.is_staff ? '🚚 Repartidor' : msg.sender_name}</p>
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

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-white/5 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-ceviche-teal transition-colors"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-ceviche-teal text-black p-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Bubble Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-ceviche-teal to-blue-500 shadow-[0_0_30px_rgba(45,212,191,0.3)] flex items-center justify-center text-black hover:scale-110 transition-transform relative"
      >
        <MessageCircle size={24} className="animate-pulse" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-ceviche-red rounded-full border-2 border-black"></span>
        )}
      </button>
    </div>
  );
}
