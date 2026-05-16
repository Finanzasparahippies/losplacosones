'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { Package, Plus, Edit2, Trash2, Tag, Archive } from 'lucide-react';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await fetcher('/shop/products/');
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if(window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await fetch(`/api/shop/products/${id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        fetchProducts();
      } catch (e) {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-premium">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Gestión de <span className="text-ceviche-teal">Productos</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">
            Control de Inventario y Precios
          </p>
        </div>
        <button className="bg-ceviche-teal text-ceviche-brown px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-ceviche-teal/20">
          <Plus size={16} /> Nuevo Producto
        </button>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-ceviche-teal animate-pulse font-black uppercase tracking-widest">
          Cargando inventario...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-20 rounded-premium text-center">
          <Package size={48} className="mx-auto mb-6 text-white/10" />
          <p className="text-white/20 font-black uppercase italic text-xl">No hay productos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-premium overflow-hidden group hover:border-white/20 transition-all shadow-2xl flex flex-col"
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-white/5 relative overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Package size={48} className="text-white/10" />
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                  <Tag size={12} className="text-ceviche-teal" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">${product.price}</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{product.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed mb-6 flex-1 line-clamp-3">
                  {product.description || "Sin descripción"}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/40">
                    <Archive size={14} className={product.stock > 10 ? "text-ceviche-lime" : "text-ceviche-red"} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Stock: <span className="text-white">{product.stock}</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="w-8 h-8 rounded-lg bg-ceviche-red/10 flex items-center justify-center text-ceviche-red hover:bg-ceviche-red/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
