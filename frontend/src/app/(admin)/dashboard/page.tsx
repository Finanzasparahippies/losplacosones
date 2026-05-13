import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-ceviche-orange uppercase tracking-tighter italic animate-premium">
            Control de Mando
          </h1>
          <p className="text-ceviche-teal/60 font-light text-lg">Resumen operativo de Ceviche Placosones</p>
        </header>

        <Suspense fallback={<div className="text-ceviche-teal animate-pulse">Cargando métricas...</div>}>
          <DashboardClient />
        </Suspense>
      </div>
    </div>
  );
}
