'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { Users, Shield, ShieldAlert, Key, Mail, Phone, MapPin, CheckCircle2, User, Edit2, X } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const data = await fetcher('/users/manage/');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStaffStatus = async (userId: number, currentStatus: boolean) => {
    if(window.confirm(`¿Seguro que quieres ${currentStatus ? 'quitar' : 'dar'} permisos de administrador a este usuario?`)) {
      try {
        await fetch(`/api/users/manage/${userId}/`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ is_staff: !currentStatus })
        });
        fetchUsers();
      } catch (e) {
        alert("Error al actualizar permisos");
      }
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-premium">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Gestión de <span className="text-ceviche-teal">Equipo</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-2">
            Directorio de Usuarios y Permisos
          </p>
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-ceviche-teal animate-pulse font-black uppercase tracking-widest">
          Cargando directorio...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-20 rounded-premium text-center">
          <Users size={48} className="mx-auto mb-6 text-white/10" />
          <p className="text-white/20 font-black uppercase italic text-xl">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-premium flex flex-col gap-6 relative overflow-hidden group hover:border-white/20 transition-all shadow-2xl"
            >
              {/* Background Accent */}
              {user.is_staff && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ceviche-teal to-ceviche-lime opacity-50"></div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black uppercase ${
                    user.is_staff ? 'bg-ceviche-teal/20 text-ceviche-teal' : 'bg-white/5 text-white/40'
                  }`}>
                    {user.email.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{user.username || user.name || 'Sin Nombre'}</h3>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
                      ID: {user.id}
                    </p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                  user.is_staff 
                    ? 'bg-ceviche-teal/10 text-ceviche-teal border-ceviche-teal/30' 
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}>
                  {user.is_staff ? <Shield size={10} /> : <User size={10} />}
                  {user.is_staff ? 'Admin' : 'Cliente'}
                </div>
              </div>

              <div className="space-y-3 flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 text-white/70 text-xs">
                  <Mail size={14} className="text-white/30" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-white/70 text-xs">
                    <Phone size={14} className="text-white/30" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  Se unió: {new Date(user.date_joined).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => toggleStaffStatus(user.id, user.is_staff)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      user.is_staff 
                        ? 'bg-ceviche-red/10 text-ceviche-red hover:bg-ceviche-red/20' 
                        : 'bg-ceviche-teal/10 text-ceviche-teal hover:bg-ceviche-teal/20'
                    }`}
                  >
                    {user.is_staff ? <ShieldAlert size={14} /> : <Key size={14} />}
                    {user.is_staff ? 'Quitar Admin' : 'Hacer Admin'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={fetchUsers} 
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onRefresh }: { user: any, onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    username: user?.username || user?.name || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/users/manage/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });
      onRefresh();
      onClose();
    } catch (e) {
      alert("Error al actualizar usuario");
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
            Editar Usuario
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Nombre / Username</label>
              <input required type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ceviche-teal transition-colors" />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Teléfono</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ceviche-teal transition-colors" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-black uppercase text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-ceviche-teal text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg shadow-ceviche-teal/20">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
