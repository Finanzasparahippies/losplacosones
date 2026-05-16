'use client';

import { useState, useEffect } from 'react';
import DashboardStats from '@/components/admin/DashboardStats';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Truck, ShoppingCart, Users, ChevronRight } from 'lucide-react';
import { fetcher } from '@/lib/api';

export default function DashboardClient() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await fetcher('/dashboard/analytics/');
        setData(result);
      } catch (err: any) {
        setError(err.message.includes("403") ? "Acceso denegado." : "Error de carga.");
      }
    };
    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="bg-ceviche-orange/10 border border-ceviche-orange/20 p-6 rounded-premium text-ceviche-orange">
        <p className="font-black italic uppercase">⚠️ {error}</p>
        <p className="text-sm mt-2 opacity-60">Asegúrate de ser superusuario en Django.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Metrics Grid */}
      <DashboardStats stats={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Chart */}
        <section className="lg:col-span-2 bg-ceviche-brown/20 border border-white/5 p-8 rounded-premium backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-ceviche-lime pointer-events-none">
            <TrendingUp size={120} />
          </div>
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic leading-none">Flujo de Ventas</h2>
              <p className="text-ceviche-teal/40 text-xs font-bold uppercase tracking-widest mt-2">Últimos 30 días de operación</p>
            </div>
            <div className="text-right">
              <span className="text-ceviche-lime font-black text-2xl tracking-tighter">
                +${data?.financials?.gross_sales.toLocaleString()}
              </span>
              <p className="text-[10px] text-white/20 uppercase font-black">Ventas Totales</p>
            </div>
          </div>

          <div className="h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={data?.charts?.daily_sales || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ADFF2F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ADFF2F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#ffffff20', fontSize: 10, fontWeight: 'bold'}}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1a1412', border: '1px solid #ffffff10', borderRadius: '12px'}}
                  itemStyle={{color: '#ADFF2F', fontWeight: '900'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#ADFF2F" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Quick Actions & Menu */}
        <section className="space-y-6">
          <h2 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-3">
            <span className="w-8 h-[2px] bg-ceviche-orange"></span>
            Operaciones
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <QuickActionLink 
              href="/dashboard/delivery" 
              title="Logística" 
              subtitle="Rutas y Envíos" 
              icon={Truck} 
              color="lime" 
            />
            <QuickActionLink 
              href="/admin/shop/order/" 
              title="Pedidos" 
              subtitle="Gestión de Ventas" 
              icon={ShoppingCart} 
              color="orange" 
              external
            />
            <QuickActionLink 
              href="/admin/users/user/" 
              title="Clientes" 
              subtitle="Base de Datos" 
              icon={Users} 
              color="white" 
              external
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickActionLink({ href, title, subtitle, icon: Icon, color, external }: any) {
  const colors: any = {
    lime: 'text-ceviche-lime border-ceviche-lime/20 bg-ceviche-lime/5 hover:bg-ceviche-lime/10',
    orange: 'text-ceviche-orange border-ceviche-orange/20 bg-ceviche-orange/5 hover:bg-ceviche-orange/10',
    white: 'text-white border-white/10 bg-white/5 hover:bg-white/10',
  };

  const Content = (
    <div className={`p-6 rounded-premium border ${colors[color]} transition-all group flex items-center justify-between`}>
      <div className="flex items-center gap-5">
        <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-black uppercase italic leading-none text-lg tracking-tight">{title}</h3>
          <p className="text-[10px] uppercase font-bold opacity-40 mt-1">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </div>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{Content}</a>
  ) : (
    <Link href={href}>{Content}</Link>
  );
}
