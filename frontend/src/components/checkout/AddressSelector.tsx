'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetcher } from '@/lib/api';

// Componente para manejar el cambio de vista del mapa
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface AddressSelectorProps {
  onAddressChange: (address: string, lat: number, lng: number) => void;
}

export default function AddressSelector({ onAddressChange }: AddressSelectorProps) {
  const [position, setPosition] = useState<[number, number]>([33.4484, -112.0740]); // Phoenix default
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [markerIcon, setMarkerIcon] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Inicializar Leaflet solo en el cliente
  useEffect(() => {
    const L = require('leaflet');
    setMarkerIcon(L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    }));
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        // Usar nuestro proxy del backend para evitar CORS - IMPORTANTE: Incluir slash final antes del ?
        const data = await fetcher(`/shop/geocode/?q=${encodeURIComponent(searchTerm)}`);
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Geocoding error", e);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (query: string) => {
    setAddress(query);
    setSearchTerm(query);
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setAddress(result.display_name);
    setSearchResults([]);
    onAddressChange(result.display_name, lat, lng);
  };

  const handleMarkerDrag = async (e: any) => {
    const latLng = e.target.getLatLng();
    setPosition([latLng.lat, latLng.lng]);
    
    // Reverse geocode via proxy - IMPORTANTE: Incluir slash final antes del ?
    try {
      setLoading(true);
      const data = await fetcher(`/shop/reverse-geocode/?lat=${latLng.lat}&lon=${latLng.lng}`);
      setAddress(data.display_name);
      onAddressChange(data.display_name, latLng.lat, latLng.lng);
    } catch (e) {
      console.error("Reverse geocoding error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-premium">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ceviche-teal">
          {loading ? (
            <div className="w-5 h-5 border-2 border-ceviche-teal border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Search size={18} />
          )}
        </div>
        <input 
          type="text"
          placeholder="Busca tu dirección (Ej: Phoenix Downtown)..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-ceviche-teal/50 transition-all shadow-inner"
          value={address}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        />

        {/* Clear button */}
        {address && (
          <button
            onClick={() => {
              setAddress('');
              setSearchTerm('');
              setSearchResults([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
          >
            <div className="text-xl">×</div>
          </button>
        )}
        
        {/* Results Dropdown */}
        {searchTerm.length >= 3 && (searchResults.length > 0 || loading) && (
          <div className="absolute z-[2000] w-full mt-2 bg-ceviche-brown/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            {loading ? (
              <div className="p-8 text-center text-white/40 text-xs font-bold uppercase tracking-widest">
                Buscando en el mapa...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-[280px] overflow-y-auto">
                {searchResults.map((res, i) => {
                  const addr = res.address || {};
                  const mainTitle = addr.house_number 
                    ? `${addr.road} ${addr.house_number}`
                    : addr.road || addr.pedestrian || addr.suburb || res.display_name.split(',')[0];
                  
                  const subTitle = res.display_name.split(',').slice(1).join(',').trim();

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectResult(res)}
                      className="w-full text-left p-4 hover:bg-ceviche-teal/10 flex items-start gap-3 border-b border-white/5 last:border-0 transition-all group"
                    >
                      <MapPin size={16} className="text-ceviche-teal mt-0.5 shrink-0 group-hover:scale-125 transition-transform" />
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span className="text-xs font-bold text-white leading-tight truncate">
                          {mainTitle}
                        </span>
                        <span className="text-[10px] text-white/40 truncate">
                          {subTitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-white/40 text-xs font-bold uppercase tracking-widest">
                No se encontraron resultados
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-[350px] w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl group">
        <MapContainer 
          center={position} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {markerIcon && (
            <Marker 
              position={position} 
              draggable={true} 
              icon={markerIcon}
              eventHandlers={{ dragend: handleMarkerDrag }}
            />
          )}
          <ChangeView center={position} />
        </MapContainer>
        
        <div className="absolute bottom-4 right-4 z-[1000]">
          <button 
            type="button"
            onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(pos => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  setPosition([lat, lng]);
                  onAddressChange("Mi ubicación actual", lat, lng);
                });
              }
            }}
            className="p-3 bg-ceviche-orange text-ceviche-brown rounded-full shadow-xl hover:scale-110 transition-all"
          >
            <Navigation size={20} />
          </button>
        </div>
        
        {loading && (
          <div className="absolute inset-0 z-[1001] bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-ceviche-lime border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
