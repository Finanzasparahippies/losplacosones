import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  color?: 'lime' | 'orange' | 'white' | 'brown';
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  color = 'white' 
}: StatCardProps) {
  const colors = {
    lime: 'from-ceviche-lime/20 to-transparent border-ceviche-lime/20 text-ceviche-lime',
    orange: 'from-ceviche-orange/20 to-transparent border-ceviche-orange/20 text-ceviche-orange',
    white: 'from-white/10 to-transparent border-white/10 text-white',
    brown: 'from-ceviche-brown/40 to-transparent border-ceviche-brown/20 text-ceviche-white',
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-premium border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br",
      colors[color]
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-60 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter">{value}</h3>
          
          {trend && (
            <div className={cn(
              "flex items-center mt-2 text-xs font-bold",
              trend.isUp ? "text-ceviche-lime" : "text-ceviche-orange"
            )}>
              <span>{trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="ml-2 opacity-50 font-medium">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10",
          color === 'lime' && "text-ceviche-lime",
          color === 'orange' && "text-ceviche-orange"
        )}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      
      {description && (
        <p className="mt-4 text-xs opacity-40 font-medium leading-relaxed">
          {description}
        </p>
      )}

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-5 blur-2xl">
        <Icon size={120} />
      </div>
    </div>
  );
}
