'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { Server, Cpu, HardDrive, Database, Activity, Clock } from 'lucide-react';

export default function SystemPerformancePage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      const data = await fetcher('/dashboard/system-status/');
      setMetrics(data);
      setError('');
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Polling cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-ceviche-teal animate-pulse font-black uppercase tracking-widest">
        Estableciendo conexión con el núcleo...
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 animate-premium">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Estado del <span className="text-ceviche-teal">Sistema</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
            <Activity size={14} className="text-ceviche-lime animate-pulse" /> Monitoreo de Hardware en Tiempo Real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
            <Server size={18} className={error ? "text-ceviche-red" : "text-ceviche-lime"} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
              {error ? "Desconectado" : "Conexión Estable"}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-ceviche-red/20 border border-ceviche-red/50 p-6 rounded-2xl text-ceviche-red text-xs font-bold uppercase tracking-widest animate-shake">
          {error}
        </div>
      )}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* CPU Metric */}
          <MetricCard 
            title="CPU Usage" 
            icon={Cpu} 
            value={metrics.cpu.percent} 
            unit="%" 
            subtitle={`${metrics.cpu.cores} Nucleos Lógicos`}
            color="orange"
          />

          {/* Memory Metric */}
          <MetricCard 
            title="Memoria RAM" 
            icon={Activity} 
            value={metrics.memory.percent} 
            unit="%" 
            subtitle={`${metrics.memory.used_gb} GB / ${metrics.memory.total_gb} GB`}
            color="teal"
          />

          {/* Disk Metric */}
          <MetricCard 
            title="Almacenamiento" 
            icon={HardDrive} 
            value={metrics.disk.percent} 
            unit="%" 
            subtitle={`${metrics.disk.used_gb} GB / ${metrics.disk.total_gb} GB`}
            color="lime"
          />

          {/* Database Status */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-premium flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-white/40 tracking-widest mb-2">Base de Datos</h3>
              <p className="text-2xl font-black italic uppercase text-white">PostgreSQL</p>
              <p className="text-[10px] font-bold text-white/20 uppercase mt-1">Conexión Principal</p>
            </div>
            <div className={`p-4 rounded-full ${metrics.database.status === 'Conectado' ? 'bg-ceviche-lime/20 text-ceviche-lime' : 'bg-ceviche-red/20 text-ceviche-red'}`}>
              <Database size={32} />
            </div>
          </div>

          {/* Server Uptime */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-premium flex items-center justify-between lg:col-span-2">
            <div>
              <h3 className="text-sm font-black uppercase text-white/40 tracking-widest mb-2">Tiempo de Actividad</h3>
              <p className="text-4xl font-black italic uppercase text-white">{metrics.system.uptime}</p>
              <p className="text-[10px] font-bold text-white/20 uppercase mt-1">Tiempo continuo sin reinicios</p>
            </div>
            <div className="p-4 rounded-full bg-white/5 text-white/40">
              <Clock size={32} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function MetricCard({ title, icon: Icon, value, unit, subtitle, color }: any) {
  const colors: any = {
    orange: 'text-ceviche-orange bg-ceviche-orange/20 border-ceviche-orange/30',
    teal: 'text-ceviche-teal bg-ceviche-teal/20 border-ceviche-teal/30',
    lime: 'text-ceviche-lime bg-ceviche-lime/20 border-ceviche-lime/30',
  };

  const ringColors: any = {
    orange: 'stroke-ceviche-orange',
    teal: 'stroke-ceviche-teal',
    lime: 'stroke-ceviche-lime',
  };

  const radius = 40;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-premium flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute top-6 left-6 text-white/20">
        <Icon size={24} />
      </div>
      <h3 className="absolute top-6 right-6 text-[10px] font-black uppercase text-white/40 tracking-widest">{title}</h3>
      
      <div className="relative w-32 h-32 mt-4 flex items-center justify-center">
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="64" cy="64" r={radius} 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="8" fill="transparent" 
          />
          {/* Progress Ring */}
          <circle 
            cx="64" cy="64" r={radius} 
            stroke="currentColor" 
            strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${ringColors[color]} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center Value */}
        <div className="absolute flex items-baseline gap-1">
          <span className="text-3xl font-black italic text-white">{Math.round(value)}</span>
          <span className="text-xs font-bold text-white/40">{unit}</span>
        </div>
      </div>
      
      <p className="mt-6 text-[10px] font-bold uppercase text-white/40 tracking-widest bg-white/5 px-4 py-1.5 rounded-full">
        {subtitle}
      </p>
    </div>
  );
}
