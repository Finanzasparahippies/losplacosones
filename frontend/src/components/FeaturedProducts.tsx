'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string | null;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        console.log('Fetching from:', `${apiUrl}/shop/products/`);
        const response = await fetch(`${apiUrl}/shop/products/`);
        if (response.ok) {
          const data = await response.json();
          // Take only the first 3 products for the landing page
          setProducts(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-white/5 rounded-premium animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-black/20 rounded-premium border border-dashed border-white/5">
        <p className="text-white/20 italic font-black uppercase tracking-widest text-2xl">Próximamente...</p>
        <p className="text-ceviche-teal/30 uppercase text-[10px] font-bold mt-2">Nuevos platillos en preparación</p>
      </div>
    );
  }

  const colors = ['border-ceviche-red', 'border-ceviche-orange', 'border-ceviche-teal'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((item, i) => (
        <div
          key={item.id}
          className={`p-8 bg-ceviche-brown rounded-premium border-t-8 ${colors[i % 3]} shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group relative overflow-hidden`}
        >
          {/* Background decoration */}
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:rotate-12 transition-transform duration-700">
            {item.image ? '' : '🍤'}
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-6 border border-white/5 group-hover:bg-ceviche-orange/10 group-hover:border-ceviche-orange/20 transition-colors">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                '🥣'
              )}
            </div>

            <h4 className="text-2xl font-black uppercase italic mb-2 group-hover:text-ceviche-lime transition-colors leading-none">{item.name}</h4>
            <p className="text-ceviche-white/50 text-xs mb-8 leading-relaxed font-medium line-clamp-2">
              {item.description}
            </p>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
              <span className="text-3xl font-black text-ceviche-orange">${item.price}</span>
              <span className="bg-ceviche-lime text-ceviche-brown px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-widest shadow-lg shadow-ceviche-lime/20">
                Pídelo Ya
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
