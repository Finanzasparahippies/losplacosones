'use client';

import { useState, useEffect, useRef } from 'react';

interface GPSManagerProps {
  onLocationUpdate: (lat: number, lng: number) => void;
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;
}

// Global refs to ensure GPS stability across remounts
const lastUpdateRef = { current: 0 };
const updateCallbackRef = { current: (lat: number, lng: number) => {} };

export default function GPSManager({ onLocationUpdate, isTracking, setIsTracking }: GPSManagerProps) {
  useEffect(() => {
    if (isTracking) console.log("🚀 GPS-TRACKING-ACTIVE-V2.1", new Date().toLocaleTimeString());
  }, [isTracking]);
  
  const [error, setError] = useState<string | null>(null);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    updateCallbackRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  const [lastCoords, setLastCoords] = useState<{lat: number, lng: number} | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number;
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    };

    if (isTracking && navigator.geolocation) {
      requestWakeLock();
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📡 RAW GPS SENSOR: Lat:${latitude} Lng:${longitude} (Precisión: ${accuracy}m)`);
          const now = Date.now();
          
          if (now - lastUpdateRef.current >= 10000) {
            updateCallbackRef.current(latitude, longitude);
            lastUpdateRef.current = now;
            setLastCoords({ lat: latitude, lng: longitude });
            setLastSync(new Date().toLocaleTimeString());
          }
          setError(null);
        },
        (err) => {
          setError(`Error de GPS: ${err.message}`);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0, // Force fresh location, no cache
          timeout: 10000,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (wakeLock) wakeLock.release();
    };
  }, [isTracking, setIsTracking]); // Removed onLocationUpdate from dependencies

  return (
    <div className="p-6 bg-ceviche-brown/80 rounded-premium border border-ceviche-teal/30 backdrop-blur-md shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-black text-ceviche-lime uppercase tracking-tighter italic">GPS Tracker v2.5</h3>
        <span className="text-[10px] bg-ceviche-teal/20 text-ceviche-teal px-2 py-0.5 rounded border border-ceviche-teal/30 font-bold uppercase">Live</span>
      </div>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            isTracking 
              ? 'bg-ceviche-red text-white hover:bg-ceviche-red/80' 
              : 'bg-ceviche-lime text-ceviche-brown hover:bg-ceviche-lime/80'
          }`}
        >
          {isTracking ? 'Detener Seguimiento' : 'Iniciar Seguimiento (GPS)'}
        </button>

        {isTracking && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-ceviche-teal animate-pulse">
              <span className="w-3 h-3 bg-ceviche-teal rounded-full"></span>
              <span className="text-sm font-bold uppercase tracking-tight">Transmitiendo ubicación...</span>
            </div>
            
            {lastCoords && (
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-ceviche-teal/50">
                  <span>Coordenadas RAW</span>
                  <span>Sincronizado: {lastSync}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Latitud</p>
                    <p className="font-mono text-lg text-ceviche-lime">{lastCoords.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Longitud</p>
                    <p className="font-mono text-lg text-ceviche-lime">{lastCoords.lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setIsTracking(false);
            setTimeout(() => {
              lastUpdateRef.current = 0;
              setIsTracking(true);
            }, 500);
          }}
          className="text-[10px] text-ceviche-teal underline uppercase font-black tracking-widest hover:text-white transition-colors"
        >
          ⚙️ Calibrar Sensor (Reset)
        </button>

        {error && (
          <div className="p-3 bg-ceviche-red/20 border border-ceviche-red text-ceviche-red rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
