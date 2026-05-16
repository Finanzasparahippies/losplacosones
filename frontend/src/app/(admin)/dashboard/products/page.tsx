'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { Package, Plus, Edit2, Trash2, Tag, Archive, X, Beaker, TrendingUp, TrendingDown } from 'lucide-react';

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
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
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-ceviche-teal text-ceviche-brown px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-ceviche-teal/20"
        >
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
                  <div className="flex items-center gap-2 text-white/40">
                    <Beaker size={14} className="text-ceviche-orange" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Costo: <span className="text-white">${parseFloat(product.cost || 0).toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    {parseFloat(product.margin) >= 50 && <TrendingUp size={14} className="text-ceviche-lime" />}
                    {parseFloat(product.margin) < 50 && <TrendingDown size={14} className="text-ceviche-red" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Margen: <span className="text-white">{parseFloat(product.margin || 0).toFixed(1)}%</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
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
          ))}
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onRefresh }: { product: any, onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    image: product?.image || ''
  });

  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [recipe, setRecipe] = useState<any[]>(
    product?.ingredients?.map((pi: any) => ({
      ingredient: pi.ingredient,
      quantity: parseFloat(pi.quantity),
      name: pi.ingredient_name,
      unit: pi.unit,
      unit_cost: parseFloat(pi.unit_cost)
    })) || []
  );

  useEffect(() => {
    fetcher('/shop/ingredients/').then(setAvailableIngredients).catch(console.error);
  }, []);

  const totalCost = recipe.reduce((acc, item) => acc + (item.unit_cost * item.quantity), 0);
  const marginPercent = formData.price > 0 ? ((formData.price - totalCost) / formData.price) * 100 : 0;

  const handleAddIngredient = (e: any) => {
    const ingId = parseInt(e.target.value);
    if (!ingId) return;
    const ing = availableIngredients.find(i => i.id === ingId);
    if (ing && !recipe.find(r => r.ingredient === ing.id)) {
      setRecipe([...recipe, {
        ingredient: ing.id,
        quantity: 1,
        name: ing.name,
        unit: ing.unit,
        unit_cost: parseFloat(ing.unit_cost)
      }]);
    }
    e.target.value = '';
  };

  const handleRemoveIngredient = (id: number) => {
    setRecipe(recipe.filter(r => r.ingredient !== id));
  };

  const handleQuantityChange = (id: number, val: number) => {
    setRecipe(recipe.map(r => r.ingredient === id ? { ...r, quantity: val } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = product ? 'PATCH' : 'POST';
      const url = product ? `/api/shop/products/${product.id}/` : '/api/shop/products/';

      const payload = { ...formData };
      if (!payload.image) delete payload.image;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });
      const savedProduct = await res.json();

      if (savedProduct.id) {
        await fetch(`/api/shop/products/${savedProduct.id}/update_recipe/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ ingredients: recipe.map(r => ({ ingredient: r.ingredient, quantity: r.quantity })) })
        });
      }

      onRefresh();
      onClose();
    } catch (e) {
      alert("Error al guardar el producto");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-premium overflow-y-auto py-10"
      onClick={onClose}
    >
      <div
        className="bg-black/90 border border-white/10 w-full max-w-4xl rounded-premium shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-10 backdrop-blur-xl">
          <h3 className="font-black text-white uppercase tracking-tight text-xl">
            {product ? 'Editar Producto y Costos' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col md:flex-row gap-8">
          {/* Columna Izquierda: Info Básica */}
          <div className="flex-1 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/60 mb-4 border-b border-white/10 pb-2">Datos Comerciales</h4>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Nombre</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ceviche-teal transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Precio Venta ($)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ceviche-teal transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Stock Inicial</label>
                <input required type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ceviche-teal transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Descripción</label>
              <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ceviche-teal transition-colors resize-none"></textarea>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 mt-6">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/60">Análisis Financiero</h5>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 font-bold">Costo de Producción (COGS):</span>
                <span className="text-ceviche-orange font-black">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 font-bold">Ganancia Bruta:</span>
                <span className="text-white font-black">${(formData.price - totalCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 font-bold">Margen de Ganancia:</span>
                <span className={`font-black ${marginPercent >= 50 ? 'text-ceviche-lime' : marginPercent > 20 ? 'text-yellow-500' : 'text-ceviche-red'}`}>
                  {marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Receta */}
          <div className="flex-1 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/60 mb-4 border-b border-white/10 pb-2">Formulación (Receta)</h4>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Agregar Insumo</label>
              <select onChange={handleAddIngredient} defaultValue="" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ceviche-orange transition-colors appearance-none">
                <option value="" disabled>Seleccionar de bóveda...</option>
                {availableIngredients.filter(ai => !recipe.find(r => r.ingredient === ai.id)).map(ai => (
                  <option key={ai.id} value={ai.id}>{ai.name} (${ai.unit_cost}/{ai.unit})</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 mt-4">
              {recipe.map((item) => (
                <div key={item.ingredient} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex-1">
                    <p className="text-xs font-black text-white uppercase">{item.name}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold">${item.unit_cost}/{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.ingredient, parseFloat(e.target.value) || 0)}
                      className="w-16 bg-black text-white text-xs font-bold text-center py-1 rounded border border-white/10 focus:border-ceviche-orange outline-none"
                    />
                    <span className="text-[10px] uppercase font-black text-white/40 w-6">{item.unit}</span>
                    <button type="button" onClick={() => handleRemoveIngredient(item.ingredient)} className="text-ceviche-red hover:scale-110 transition-transform ml-2">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {recipe.length === 0 && (
                <div className="text-center p-6 border border-dashed border-white/10 rounded-xl text-white/20 text-[10px] font-black uppercase tracking-widest">
                  Sin insumos formulados
                </div>
              )}
            </div>
          </div>

          {/* Botones Flotantes Ocultos (movidos a un div absoluto o al final) */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-end gap-4 rounded-b-premium">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-black uppercase text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-ceviche-teal text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg shadow-ceviche-teal/20">
              Guardar y Calcular
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
