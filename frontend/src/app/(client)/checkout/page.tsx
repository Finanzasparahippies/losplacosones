'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Banknote, 
  MapPin, 
  ChevronLeft, 
  CheckCircle2, 
  Truck,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

import dynamic from 'next/dynamic';

const AddressSelector = dynamic(() => import('@/components/checkout/AddressSelector'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />
});

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!address) {
      alert("Por favor selecciona una dirección.");
      return;
    }

    setLoading(true);
    try {
      const itemsData = cart.map(item => ({
        product: item.id,
        quantity: item.quantity
      }));

      const response = await fetcher('/shop/orders/', {
        method: 'POST',
        body: JSON.stringify({
          delivery_address: address,
          latitude: coords?.lat,
          longitude: coords?.lng,
          payment_method: paymentMethod,
          items_data: itemsData
        })
      });

      setOrderId(response.id);
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-ceviche-brown text-ceviche-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-12 rounded-premium text-center animate-premium">
          <div className="w-20 h-20 bg-ceviche-lime/20 text-ceviche-lime rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black uppercase italic mb-4 tracking-tighter">¡Pedido Exitoso!</h1>
          <p className="text-white/60 mb-8 font-medium">
            Tu orden <span className="text-ceviche-orange font-black">#{orderId}</span> ha sido recibida. 
            {paymentMethod === 'TRANSFER' 
              ? " Por favor realiza la transferencia a la cuenta: CLABE 1234567890 (Ceviche Placosones)."
              : " Prepara el efectivo, ¡tu ceviche va en camino!"}
          </p>
          <Link 
            href="/tracking" 
            className="block w-full bg-ceviche-orange text-ceviche-brown py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-ceviche-orange/20"
          >
            Rastrear Pedido
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-ceviche-brown text-ceviche-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen gap-6">
          <p className="text-2xl font-black uppercase italic opacity-20">Tu carrito está vacío</p>
          <Link href="/menu" className="bg-ceviche-teal text-ceviche-brown px-8 py-3 rounded-full font-black uppercase text-sm">
            Ir al Menú
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceviche-brown text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-8 pt-40 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Side: Form */}
        <div className="animate-premium">
          <Link href="/menu" className="flex items-center gap-2 text-ceviche-teal text-xs font-black uppercase tracking-widest mb-8 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            Volver al Menú
          </Link>
          
          <h1 className="text-5xl font-black uppercase italic mb-12 tracking-tighter">Finalizar <span className="text-ceviche-orange">Compra</span></h1>
          
          <form onSubmit={handleCheckout} className="space-y-10">
            {/* Address */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ceviche-teal/20 text-ceviche-teal rounded-lg">
                  <MapPin size={20} />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tight">Punto de Entrega</h2>
              </div>
              <AddressSelector 
                onAddressChange={(addr, lat, lng) => {
                  setAddress(addr);
                  setCoords({ lat, lng });
                }} 
              />
            </section>

            {/* Payment Method */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ceviche-orange/20 text-ceviche-orange rounded-lg">
                  <Banknote size={20} />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tight">Método de Pago</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PaymentOption 
                  active={paymentMethod === 'CASH'} 
                  onClick={() => setPaymentMethod('CASH')}
                  icon={Banknote}
                  title="Efectivo"
                  subtitle="Paga al recibir"
                />
                <PaymentOption 
                  active={paymentMethod === 'TRANSFER'} 
                  onClick={() => setPaymentMethod('TRANSFER')}
                  icon={CreditCard}
                  title="Transferencia"
                  subtitle="Envía comprobante"
                />
              </div>
            </section>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-ceviche-lime text-ceviche-brown py-6 rounded-2xl font-black uppercase text-xl tracking-tighter flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-ceviche-lime/20 disabled:opacity-50"
            >
              {loading ? "Procesando..." : (
                <>
                  Confirmar Pedido Placoso
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Summary */}
        <div className="lg:sticky lg:top-40 h-fit bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md animate-premium" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center justify-between">
            Resumen
            <span className="text-xs text-white/40 not-italic font-bold tracking-[0.2em]">{cart.length} ITEMS</span>
          </h2>
          
          <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center group">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/5">
                  <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black uppercase italic text-sm group-hover:text-ceviche-lime transition-colors">{item.name}</h4>
                  <p className="text-xs text-white/40">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-black text-ceviche-orange">${(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 space-y-4">
            <div className="flex justify-between text-sm opacity-60 font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm opacity-60 font-bold uppercase tracking-widest">
              <span>Envío</span>
              <span className="text-ceviche-lime">GRATIS</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-white/5">
              <span className="text-xl font-black uppercase italic">Total</span>
              <span className="text-4xl font-black text-ceviche-orange tracking-tighter">${total.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-10 flex items-center gap-4 p-4 bg-ceviche-teal/10 rounded-2xl border border-ceviche-teal/20">
            <Truck className="text-ceviche-teal" />
            <p className="text-[10px] uppercase font-black tracking-widest text-ceviche-teal leading-tight">
              Entrega estimada: 30-45 min <br />
              en Phoenix Central Area
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function PaymentOption({ active, onClick, icon: Icon, title, subtitle }: any) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left ${
        active 
          ? 'border-ceviche-orange bg-ceviche-orange/10 shadow-lg shadow-ceviche-orange/10' 
          : 'border-white/10 bg-white/5 hover:border-white/30'
      }`}
    >
      <Icon className={active ? 'text-ceviche-orange' : 'text-white/40'} />
      <div>
        <h3 className={`font-black uppercase text-sm ${active ? 'text-white' : 'text-white/60'}`}>{title}</h3>
        <p className="text-[10px] uppercase font-bold opacity-40">{subtitle}</p>
      </div>
    </button>
  );
}
