'use client';

import { useState, useEffect } from 'react';
import DashboardStats from '@/components/admin/DashboardStats';
import Link from 'next/link';

export default function DashboardClient() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/analytics/');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          if (res.status === 403) {
            setError("Acceso denegado. Se requiere ser Administrador.");
          } else {
            setError("Error al cargar las analíticas.");
          }
        }
      } catch (err) {
        setError("Error de conexión con el servidor.");
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="bg-ceviche-red/10 border border-ceviche-red/20 p-6 rounded-premium text-ceviche-red">
        <p className="font-bold">⚠️ {error}</p>
        <p className="text-sm mt-2">Asegúrate de estar logueado como superusuario en el admin de Django.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Metrics Grid */}
      <DashboardStats stats={stats} />

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-black text-ceviche-white uppercase mb-6 italic border-b border-ceviche-white/10 pb-2">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/delivery" className="group">
            <div className="bg-ceviche-teal/10 border border-ceviche-teal/20 p-8 rounded-premium group-hover:bg-ceviche-teal/20 transition-all">
              <h3 className="text-2xl font-black text-ceviche-teal mb-2">🚚 DELIVERY</h3>
              <p className="text-ceviche-white/60 text-sm">Gestionar rutas y seguimiento en tiempo real.</p>
            </div>
          </Link>
          <Link href="/admin/shop/order/" target="_blank" className="group">
            <div className="bg-ceviche-orange/10 border border-ceviche-orange/20 p-8 rounded-premium group-hover:bg-ceviche-orange/20 transition-all">
              <h3 className="text-2xl font-black text-ceviche-orange mb-2">🛒 ÓRDENES</h3>
              <p className="text-ceviche-white/60 text-sm">Ver y procesar pedidos en el panel de Django.</p>
            </div>
          </Link>
          <Link href="/admin/newsletter/subscriber/" target="_blank" className="group">
            <div className="bg-ceviche-lime/10 border border-ceviche-lime/20 p-8 rounded-premium group-hover:bg-ceviche-lime/20 transition-all">
              <h3 className="text-2xl font-black text-ceviche-lime mb-2">📧 CLIENTES</h3>
              <p className="text-ceviche-white/60 text-sm">Lista de suscriptores y marketing.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Future Section: Recent Activity or Charts */}
      <section className="bg-ceviche-white/5 border border-ceviche-white/10 rounded-premium p-8 h-64 flex items-center justify-center italic text-ceviche-teal/30">
        Gráficas de ventas y actividad reciente próximamente...
      </section>
    </div>
  );
}
