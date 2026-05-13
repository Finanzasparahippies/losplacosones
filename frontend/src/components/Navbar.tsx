'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

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
          <NavLink href="/tracking" active={pathname === '/tracking'} label="Rastreo" />
          
          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
          
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
          <Link 
            href="/dashboard" 
            className="bg-ceviche-red text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-ceviche-red/20"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Toggle (Placeholder) */}
        <div className="md:hidden text-ceviche-orange text-2xl">☰</div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, label }: { href: string, active: boolean, label: string }) {
  return (
    <Link 
      href={href} 
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
