'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/shop/products/');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-ceviche-brown text-ceviche-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 py-40">
        <div className="text-center mb-20 animate-premium">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic text-ceviche-orange mb-4 tracking-tighter drop-shadow-2xl">Menú</h1>
          <p className="text-ceviche-teal uppercase font-black tracking-[0.4em] text-xs">Sabor Directo del Mar</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-ceviche-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="text-ceviche-teal font-black uppercase tracking-widest text-[10px]">Preparando el sazón...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 opacity-20 italic">
            <p>Aún no hay platillos en la cocina.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {products.map((item, idx) => (
              <div 
                key={item.id} 
                className="group relative flex gap-6 p-4 rounded-3xl hover:bg-white/5 transition-all animate-premium"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5 group-hover:border-ceviche-orange/30 transition-colors">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20 grayscale group-hover:grayscale-0 transition-all">🍤</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight group-hover:text-ceviche-lime transition-colors leading-none">{item.name}</h3>
                    <span className="text-xl md:text-2xl font-black text-ceviche-orange">${item.price}</span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed font-medium line-clamp-3 italic">
                    {item.description}
                  </p>
                </div>
                
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-12 bg-ceviche-red transition-all duration-300"></div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-32 p-12 bg-gradient-to-tr from-ceviche-red to-ceviche-orange rounded-premium text-center shadow-2xl shadow-ceviche-red/20 overflow-hidden relative group">
          <div className="absolute -right-10 -top-10 text-[160px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">🌊</div>
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic mb-4 tracking-tighter">¿Hambre Placosa?</h3>
            <p className="mb-8 font-bold uppercase tracking-widest text-xs opacity-80">Pedidos grandes y eventos privados</p>
            <a href="tel:6020000000" className="bg-ceviche-brown text-ceviche-white px-10 py-4 rounded-full font-black uppercase text-xl hover:scale-105 transition-all inline-block shadow-xl">
              (602) Placoso-1
            </a>
          </div>
        </div>
      </main>

      <footer className="py-20 text-center text-ceviche-teal/40 italic text-[10px] font-black uppercase tracking-[0.2em]">
        <p>Phoenix, Arizona • Sabor 100% Sonorense</p>
      </footer>
    </div>
  );
}
