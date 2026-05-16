'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, ShieldAlert, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-ceviche-brown/80 backdrop-blur-xl py-4 shadow-2xl border-b border-white/5' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex flex-col group">
          <span className="text-xl font-black text-ceviche-red uppercase tracking-tighter leading-none group-hover:scale-105 transition-transform">Ceviche</span>
          <span className="text-2xl font-black text-ceviche-orange uppercase tracking-tighter leading-none -mt-1 ml-4 italic group-hover:scale-105 transition-transform">Placosones</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex gap-8 items-center">
          <NavLink href="/menu" active={pathname === '/menu'} label="Menú" />
          <NavLink href="/profile/orders" active={pathname === '/profile/orders'} label="Mis Órdenes" />
          <NavLink href="/tracking" active={pathname === '/tracking'} label="Rastreo" />
          
          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
          
          <Link href="/checkout" className="relative group p-2">
            <ShoppingCart size={20} className="text-white group-hover:text-ceviche-lime transition-colors" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-ceviche-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {count}
              </span>
            )}
          </Link>

          {!user ? (
            <>
              <Link 
                href="/login" 
                className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-ceviche-orange text-ceviche-brown px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-ceviche-orange/20"
              >
                Registro
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link 
                  href="/dashboard" 
                  className="bg-ceviche-red text-white px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                >
                  <ShieldAlert size={14} />
                  Admin
                </Link>
              )}
              <button 
                onClick={logout}
                className="text-white/40 hover:text-ceviche-red transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-ceviche-orange hover:text-white transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-3xl border-b border-white/10 p-8 flex flex-col gap-6 items-center shadow-2xl">
          <NavLink href="/menu" active={pathname === '/menu'} label="Menú" onClick={() => setIsMobileOpen(false)} />
          <NavLink href="/profile/orders" active={pathname === '/profile/orders'} label="Mis Órdenes" onClick={() => setIsMobileOpen(false)} />
          <NavLink href="/tracking" active={pathname === '/tracking'} label="Rastreo" onClick={() => setIsMobileOpen(false)} />
          
          <Link href="/checkout" className="relative p-2 mt-2" onClick={() => setIsMobileOpen(false)}>
            <ShoppingCart size={24} className="text-white" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-ceviche-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {!user ? (
            <div className="flex flex-col gap-4 mt-6 w-full">
              <Link href="/login" onClick={() => setIsMobileOpen(false)} className="w-full text-center text-xs font-black uppercase tracking-widest text-white/50 hover:text-white py-2">
                Login
              </Link>
              <Link href="/register" onClick={() => setIsMobileOpen(false)} className="w-full text-center bg-ceviche-orange text-ceviche-brown px-6 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-lg shadow-ceviche-orange/20">
                Registro
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-6 w-full items-center">
              {isAdmin && (
                <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="w-full flex justify-center bg-ceviche-red text-white px-5 py-4 rounded-full font-black uppercase text-xs tracking-widest items-center gap-2 shadow-lg shadow-ceviche-red/20">
                  <ShieldAlert size={16} /> Admin
                </Link>
              )}
              <button onClick={() => { logout(); setIsMobileOpen(false); }} className="w-full py-4 text-white/40 hover:text-ceviche-red uppercase font-black text-xs tracking-widest flex justify-center items-center gap-2 border border-white/10 rounded-full mt-2">
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, label, onClick }: { href: string, active: boolean, label: string, onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`text-xs font-black uppercase tracking-[0.3em] transition-all relative group ${
        active ? 'text-ceviche-lime' : 'text-white/60 hover:text-white'
      }`}
    >
      {label}
      <span className={`absolute -bottom-2 left-0 h-[2px] bg-ceviche-lime transition-all duration-500 ${
        active ? 'w-full' : 'w-0 group-hover:w-full'
      }`}></span>
    </Link>
  );
}
