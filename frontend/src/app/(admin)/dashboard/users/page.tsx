'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/api';
import { Users, Shield, ShieldAlert, Key, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                    <h3 className="text-lg font-black text-white">{user.name || 'Sin Nombre'}</h3>
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
                {user.address && (
                  <div className="flex items-center gap-3 text-white/70 text-xs">
                    <MapPin size={14} className="text-white/30" />
                    <span className="truncate">{user.address}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  Se unió: {new Date(user.date_joined).toLocaleDateString()}
                </span>
                
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
          ))}
        </div>
      )}
    </div>
  );
}
