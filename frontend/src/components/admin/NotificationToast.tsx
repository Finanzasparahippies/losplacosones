'use client';

import { Bell, X, ShoppingBag, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function NotificationToast({ notification, onRemove }: any) {
  return (
    <div className="bg-ceviche-brown/90 border border-white/10 p-6 rounded-premium shadow-2xl backdrop-blur-xl animate-premium flex items-start gap-5 min-w-[320px] relative group overflow-hidden">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-ceviche-orange animate-pulse"></div>
      
      <div className="p-3 bg-ceviche-orange/10 text-ceviche-orange rounded-2xl">
        <ShoppingBag size={24} />
      </div>
      
      <div className="flex-1 pr-4">
        <h3 className="font-black uppercase italic text-sm tracking-tight text-white mb-1">
          {notification.message}
        </h3>
        {notification.address && (
          <p className="text-[11px] text-ceviche-teal/80 font-bold uppercase leading-tight mb-2 italic">
            📍 {notification.address.split(',')[0]}
          </p>
        )}
        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </p>
        
        <div className="mt-4 flex gap-4">
          <Link 
            href="/dashboard/orders"
            className="text-[9px] font-black uppercase text-white/60 hover:text-white transition-colors flex items-center gap-1 border border-white/10 px-3 py-1.5 rounded-lg bg-white/5"
          >
            Gestionar Todo <ChevronRight size={10} />
          </Link>
          
          {notification.lat && notification.lng && (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${notification.lat},${notification.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase text-ceviche-brown bg-ceviche-lime px-3 py-1.5 rounded-lg hover:scale-105 transition-all shadow-lg shadow-ceviche-lime/20 flex items-center gap-1"
            >
              Google Maps 🚀
            </a>
          )}
        </div>
      </div>

      <button 
        onClick={onRemove}
        className="text-white/20 hover:text-white transition-colors p-1"
      >
        <X size={16} />
      </button>

      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 text-white/[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
        <Bell size={80} />
      </div>
    </div>
  );
}
