'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationToast from '@/components/admin/NotificationToast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const { notifications, removeNotification } = useNotifications(isAdmin);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/login');
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-ceviche-brown flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ceviche-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ceviche-brown text-ceviche-white">
      {/* Container for Toasts */}
      <div className="fixed top-8 right-8 z-[1000] flex flex-col gap-4 max-w-md">
        {notifications.map(notif => (
          <NotificationToast 
            key={notif.id} 
            notification={notif} 
            onRemove={() => removeNotification(notif.id)} 
          />
        ))}
      </div>

      {/* Sidebar Administrativo Premium */}
      <aside className="w-72 bg-ceviche-brown border-r border-ceviche-orange/30 flex flex-col fixed inset-y-0 shadow-2xl z-50">
        <div className="p-8 border-b border-white/10 bg-ceviche-brown/50 backdrop-blur-xl">
          <Link href="/dashboard" className="group">
            <h1 className="text-3xl font-black text-ceviche-red uppercase tracking-tighter leading-none italic group-hover:scale-105 transition-transform">
              PLACO<br />SONES
            </h1>
            <span className="text-[10px] font-bold text-ceviche-teal tracking-[0.2em] uppercase">Control Center</span>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4 overflow-y-auto">
          <NavLink href="/dashboard" icon="🏠" label="Resumen" />
          <NavLink href="/dashboard/orders" icon="📋" label="Órdenes" />
          <NavLink href="/dashboard/delivery" icon="🚚" label="Delivery GPS" />
          
          <div className="pt-8 pb-2 px-3 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Backend / Gestión</div>
          <NavLink href="/dashboard/system" label="Rendimiento" icon="⚙️" />
          <NavLink href="/dashboard/products" label="Productos" icon="📦" />
          <NavLink href="/dashboard/users" label="Equipo y Usuarios" icon="👥" />
        </nav>

        <div className="p-6 bg-black/20 border-t border-white/5 mt-auto">
          <button 
            onClick={() => {
              auth.logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ceviche-red/10 transition-colors group border border-transparent hover:border-ceviche-red/20"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-ceviche-orange to-ceviche-red flex items-center justify-center font-bold shadow-lg text-white group-hover:rotate-12 transition-transform">
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white group-hover:text-ceviche-red">Salir</p>
              <p className="text-[10px] text-ceviche-teal font-bold uppercase tracking-wider italic">Cerrar Sesión</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Área de Contenido con margen para el Sidebar */}
      <div className="flex-1 ml-72 min-h-screen relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <main className="animate-premium p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label, isExternal = false }: { href: string, icon: string, label: string, isExternal?: boolean }) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-ceviche-orange/10 group border border-transparent hover:border-ceviche-orange/20">
      <span className="text-xl group-hover:scale-125 transition-transform duration-300 filter drop-shadow-sm">{icon}</span>
      <span className="font-bold text-sm text-ceviche-white/70 group-hover:text-white transition-colors">{label}</span>
      {isExternal && <span className="text-[10px] opacity-20 ml-auto">↗</span>}
    </div>
  );

  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
  }

  return <Link href={href} className="block">{content}</Link>;
}
