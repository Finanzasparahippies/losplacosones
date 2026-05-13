import Link from 'next/link';
import Newsletter from '@/components/Newsletter';
import FeaturedProducts from '@/components/FeaturedProducts';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ceviche-brown text-ceviche-white font-sans overflow-hidden">
      <Navbar />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ceviche-orange/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ceviche-teal/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-40 pb-40 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="animate-premium">
          <h2 className="text-ceviche-teal font-black uppercase tracking-[0.3em] mb-4 text-xs">El sabor de Phoenix, AZ</h2>
          <h1 className="text-7xl md:text-9xl font-black uppercase italic leading-[0.8] mb-8 tracking-tighter">
            Fresco. <br />
            <span className="text-ceviche-lime">Urbano.</span> <br />
            <span className="text-ceviche-red">Móvil.</span>
          </h1>
          <p className="text-xl text-ceviche-white/70 max-w-md mb-12 leading-relaxed italic font-medium">
            No buscamos clientes, creamos experiencias placosonas. El ceviche más fresco de Arizona, directo a tu ubicación.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tracking" className="bg-ceviche-orange text-ceviche-brown px-10 py-5 rounded-full font-black uppercase text-lg hover:bg-ceviche-orange/90 transition-all text-center shadow-xl shadow-ceviche-orange/20">
              Rastrear Mi Ceviche
            </Link>
            <Link href="/menu" className="border-2 border-ceviche-teal text-ceviche-teal px-10 py-5 rounded-full font-black uppercase text-lg hover:bg-ceviche-teal hover:text-ceviche-brown transition-all text-center">
              Ver el Menú
            </Link>
          </div>
        </div>

        <div className="relative group animate-premium" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-ceviche-red/20 rounded-full blur-2xl group-hover:bg-ceviche-lime/20 transition-colors duration-700"></div>
          <div className="relative aspect-square rounded-full border-8 border-ceviche-orange overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-gradient-to-tr from-ceviche-brown via-ceviche-red to-ceviche-orange flex items-center justify-center p-20 text-center">
              <span className="text-9xl opacity-20">🍤</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-3xl font-black uppercase italic -rotate-12 bg-ceviche-lime text-ceviche-brown px-6 py-2 shadow-lg">
                  100% Placoso
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-10 -left-10 bg-ceviche-teal text-ceviche-brown p-6 rounded-premium shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <p className="font-black text-2xl">OPEN</p>
            <p className="text-[10px] uppercase font-bold tracking-widest">Everywhere</p>
          </div>
          <div className="absolute bottom-10 -right-5 bg-ceviche-lime text-ceviche-brown p-6 rounded-premium shadow-xl -rotate-6 group-hover:rotate-0 transition-transform duration-500">
            <p className="font-black text-2xl">LIVE</p>
            <p className="text-[10px] uppercase font-bold tracking-widest">Tracking ON</p>
          </div>
        </div>
      </main>

      {/* Featured Section */}
      <section className="bg-white/5 py-32 mb-20 relative overflow-hidden">
        <div className="absolute -left-20 top-0 text-[200px] font-black text-white/[0.02] pointer-events-none select-none uppercase italic tracking-tighter">
          Original
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="animate-premium">
              <h2 className="text-ceviche-teal font-black uppercase text-xs tracking-[0.5em] mb-4">Nuestro Menú</h2>
              <h3 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">Los Favoritos <br /><span className="text-ceviche-orange">del Barrio</span></h3>
            </div>
            <Link href="/menu" className="text-ceviche-lime border-b-2 border-ceviche-lime font-black uppercase pb-1 hover:text-ceviche-white hover:border-ceviche-white transition-all text-sm tracking-widest">
              Explorar Todo el Menú →
            </Link>
          </div>
          
          <FeaturedProducts />
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      <footer className="py-20 text-center border-t border-white/5 bg-ceviche-brown">
        <p className="text-ceviche-teal/40 text-[10px] uppercase font-black tracking-[0.3em]">Ceviche Placosones &copy; 2026 • Phoenix, Arizona</p>
      </footer>
    </div>
  );
}
