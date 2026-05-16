'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Dynamically import Map components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false });

interface AddressSelectorProps {
  onAddressChange: (address: string, lat: number, lng: number) => void;
}

export default function AddressSelector({ onAddressChange }: AddressSelectorProps) {
  const [position, setPosition] = useState<[number, number]>([33.4484, -112.0740]); // Phoenix default
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Function to move map to current position
  function ChangeView({ center }: { center: [number, number] }) {
    const map = (useMap as any)();
    useEffect(() => {
      if (map) map.setView(center, 16);
    }, [center, map]);
    return null;
  }

  const handleSearch = async (query: string) => {
    setAddress(query);
    if (query.length < 3) return;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Geocoding error", e);
    }
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
    
    // Reverse geocode
    try {
      setLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}`);
      const data = await res.json();
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
          <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder="Busca tu dirección o mueve el pin..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-ceviche-teal/50 transition-all"
          value={address}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-ceviche-brown border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            {searchResults.map((res, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(res)}
                className="w-full text-left p-4 hover:bg-white/5 text-xs font-bold uppercase tracking-tight border-b border-white/5 last:border-0 transition-colors"
              >
                {res.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 relative group">
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <Marker 
            position={position} 
            draggable={true} 
            icon={icon}
            eventHandlers={{ dragend: handleMarkerDrag }}
          />
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
