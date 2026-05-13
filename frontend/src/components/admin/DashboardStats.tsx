import React from 'react';

interface StatProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: 'red' | 'orange' | 'teal' | 'lime';
}

const StatCard: React.FC<StatProps> = ({ title, value, unit, icon, trend, color }) => {
  const colorClasses = {
    red: 'text-ceviche-red bg-ceviche-red/10',
    orange: 'text-ceviche-orange bg-ceviche-orange/10',
    teal: 'text-ceviche-teal bg-ceviche-teal/10',
    lime: 'text-ceviche-lime bg-ceviche-lime/10',
  };

  return (
    <div className="bg-ceviche-white/5 border border-ceviche-white/10 p-6 rounded-premium hover:border-ceviche-teal/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isUp ? 'bg-ceviche-lime/20 text-ceviche-lime' : 'bg-ceviche-red/20 text-ceviche-red'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <h3 className="text-ceviche-teal/60 text-sm font-bold uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-ceviche-white group-hover:text-ceviche-orange transition-colors">{value}</span>
        {unit && <span className="text-ceviche-teal/40 text-xs">{unit}</span>}
      </div>
    </div>
  );
};

export default function DashboardStats({ stats }: { stats: any }) {
  if (!stats) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-ceviche-white/5 rounded-premium"></div>)}
  </div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Ventas Totales" 
        value={stats.total_sales.toLocaleString()} 
        unit="USD" 
        icon="💰" 
        color="orange"
      />
      <StatCard 
        title="Órdenes" 
        value={stats.total_orders} 
        icon="📦" 
        color="teal"
      />
      <StatCard 
        title="Suscriptores" 
        value={stats.total_subscribers} 
        icon="📧" 
        color="lime"
      />
      <StatCard 
        title="Stock Bajo" 
        value={stats.low_stock_count} 
        unit="productos"
        icon="⚠️" 
        color="red"
      />
    </div>
  );
}
