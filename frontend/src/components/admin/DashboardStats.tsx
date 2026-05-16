import React from 'react';
import StatCard from './StatCard';
import { DollarSign, Wallet, Percent, Box } from 'lucide-react';

export default function DashboardStats({ stats }: { stats: any }) {
  if (!stats) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-premium"></div>)}
    </div>
  );

  const { financials, inventory } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Ventas Brutas" 
        value={`$${financials.gross_sales.toLocaleString()}`} 
        icon={DollarSign} 
        color="orange"
        description="Ingresos totales por pedidos pagados"
      />
      <StatCard 
        title="Costos Totales" 
        value={`$${financials.total_costs.toLocaleString()}`} 
        icon={Wallet} 
        color="white"
        description="Costo de producción + gastos operativos"
      />
      <StatCard 
        title="Utilidad Neta" 
        value={`$${financials.net_profit.toLocaleString()}`} 
        icon={Percent} 
        color="lime"
        trend={{ value: financials.margin.toFixed(1), isUp: true }}
        description="Ganancia real después de todos los costos"
      />
      <StatCard 
        title="Valor Inventario" 
        value={`$${inventory.total_value.toLocaleString()}`} 
        icon={Box} 
        color="brown"
        description="Valor actual de ingredientes en stock"
      />
    </div>
  );
}
