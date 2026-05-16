'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { PackageSearch, Plus, Edit2, Trash2, Scale, DollarSign, AlertTriangle, X, Check } from 'lucide-react';

export default function InventoryManagementPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);

  const fetchIngredients = async () => {
    try {
      const data = await fetcher('/shop/ingredients/');
      setIngredients(data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleDelete = async (id: number) => {
    if(window.confirm('¿Estás seguro de eliminar este insumo? Las recetas que lo contengan perderán esta referencia.')) {
      try {
        await fetch(`/api/shop/ingredients/${id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        fetchIngredients();
      } catch (e) {
        alert("Error al eliminar");
      }
    }
  };

  const criticalStockCount = ingredients.filter(i => parseFloat(i.stock) < 10).length;

  return (
    <div className="space-y-12 pb-20 animate-premium">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Bóveda de <span className="text-ceviche-orange">Insumos</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
            Inteligencia de Costos e Inventario Base
            {criticalStockCount > 0 && (
              <span className="bg-ceviche-red/20 text-ceviche-red px-2 py-0.5 rounded-full text-[10px] animate-pulse flex items-center gap-1">
                <AlertTriangle size={10} /> {criticalStockCount} Insumos Críticos
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={() => { setEditingIngredient(null); setIsModalOpen(true); }}
          className="bg-ceviche-orange text-ceviche-brown px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-ceviche-orange/20"
        >
          <Plus size={16} /> Nuevo Insumo
        </button>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-ceviche-orange animate-pulse font-black uppercase tracking-widest">
          Analizando bóveda...
        </div>
      ) : ingredients.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-20 rounded-premium text-center">
          <PackageSearch size={48} className="mx-auto mb-6 text-white/10" />
          <p className="text-white/20 font-black uppercase italic text-xl">Inventario Vacío</p>
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-premium overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-6 text-xs font-black text-white/40 uppercase tracking-widest">Insumo</th>
                  <th className="p-6 text-xs font-black text-white/40 uppercase tracking-widest">Unidad</th>
                  <th className="p-6 text-xs font-black text-white/40 uppercase tracking-widest">Costo Base</th>
                  <th className="p-6 text-xs font-black text-white/40 uppercase tracking-widest">Stock Disponible</th>
                  <th className="p-6 text-xs font-black text-white/40 uppercase tracking-widest text-right">Gestión</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ingredient) => {
                  const isCritical = parseFloat(ingredient.stock) < 10;
                  return (
                    <tr key={ingredient.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-6">
                        <p className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          {isCritical && <AlertTriangle size={14} className="text-ceviche-red animate-pulse" />}
                          {ingredient.name}
                        </p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-white/50">
                          <Scale size={14} />
                          <span className="text-[10px] uppercase font-bold tracking-widest">{ingredient.unit}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-1 text-ceviche-lime font-bold">
                          <DollarSign size={12} />
                          <span>{ingredient.unit_cost}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`text-xs font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                          isCritical ? 'bg-ceviche-red/20 text-ceviche-red border border-ceviche-red/30' : 'bg-white/10 text-white/70'
                        }`}>
                          {ingredient.stock} {ingredient.unit}
                        </span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button 
                          onClick={() => { setEditingIngredient(ingredient); setIsModalOpen(true); }}
                          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors inline-flex"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ingredient.id)}
                          className="p-2 bg-ceviche-red/20 hover:bg-ceviche-red hover:text-white text-ceviche-red rounded-lg transition-colors inline-flex"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <IngredientModal 
          ingredient={editingIngredient} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchIngredients(); }} 
        />
      )}
    </div>
  );
}

function IngredientModal({ ingredient, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: ingredient?.name || '',
    unit: ingredient?.unit || 'kg',
    unit_cost: ingredient?.unit_cost || '',
    stock: ingredient?.stock || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = ingredient 
        ? `/api/shop/ingredients/${ingredient.id}/`
        : '/api/shop/ingredients/';
      
      const res = await fetch(url, {
        method: ingredient ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Error guardando");
      onSuccess();
    } catch (e) {
      alert("Error al guardar el insumo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-premium"
      onClick={onClose}
    >
      <div 
        className="bg-black/90 border border-white/10 w-full max-w-md rounded-premium shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-white uppercase tracking-tight text-xl">
            {ingredient ? 'Editar Insumo' : 'Nuevo Insumo'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Nombre del Insumo</label>
            <input 
              required 
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ceviche-orange transition-colors"
              placeholder="Ej. Camarón Azul"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Unidad de Medida</label>
              <select 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ceviche-orange transition-colors"
              >
                <option value="kg">Kilogramo (kg)</option>
                <option value="gr">Gramo (gr)</option>
                <option value="l">Litro (l)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="pza">Pieza (pza)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Costo por Unidad ($)</label>
              <input 
                required 
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={e => setFormData({...formData, unit_cost: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ceviche-orange transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Stock Inicial ({formData.unit})</label>
            <input 
              required 
              type="number"
              step="0.01"
              value={formData.stock}
              onChange={e => setFormData({...formData, stock: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ceviche-orange transition-colors"
              placeholder="Ej. 50"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-ceviche-orange text-ceviche-brown py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Guardando...' : <><Check size={16} /> Guardar Insumo</>}
          </button>
        </form>
      </div>
    </div>
  );
}
