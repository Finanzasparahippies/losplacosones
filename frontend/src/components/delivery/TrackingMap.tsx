'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for Leaflet icon issues in Next.js
const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const truckIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048329.png', // Food truck icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const clientIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3673/3673199.png', // Delivery home icon
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface Location {
  latitude: number;
  longitude: number;
}

interface Stop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const lat = Number(center[0]);
    const lng = Number(center[1]);
    
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0) {
      console.log("✈️ Flying to:", lat, lng);
      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 2.0
      });
    } else {
      console.warn("⚠️ Invalid coordinates received:", center);
    }
  }, [center, map]);
  return null;
}

export default function TrackingMap({ 
  vehicleLocation, 
  stops = [],
  isDraggable = false,
  onMarkerDrag,
  clientLocation
}: { 
  vehicleLocation?: Location, 
  stops?: Stop[],
  isDraggable?: boolean,
  onMarkerDrag?: (lat: number, lng: number) => void,
  clientLocation?: Location
}) {
  console.log("📍 TrackingMap Received Location:", vehicleLocation);
  
  const defaultCenter: [number, number] = [33.4484, -112.0740]; // Phoenix, AZ
  
  // Si hay location del cliente pero no de vehiculo, centrar en el cliente. Si ambos, en vehiculo.
  const center: [number, number] = vehicleLocation 
    ? [Number(vehicleLocation.latitude), Number(vehicleLocation.longitude)] 
    : clientLocation 
      ? [Number(clientLocation.latitude), Number(clientLocation.longitude)]
      : defaultCenter;

  const eventHandlers = {
    dragend(e: any) {
      const marker = e.target;
      if (marker != null && onMarkerDrag) {
        const { lat, lng } = marker.getLatLng();
        onMarkerDrag(lat, lng);
      }
    },
  };

  return (
    <div className="h-[500px] w-full bg-ceviche-brown/20 rounded-premium overflow-hidden border-2 border-ceviche-orange/20 shadow-inner relative group">
      <div className="absolute inset-0 bg-gradient-to-t from-ceviche-brown/40 to-transparent pointer-events-none z-10"></div>
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {vehicleLocation && (
          <>
            <Marker 
              position={[Number(vehicleLocation.latitude), Number(vehicleLocation.longitude)]} 
              icon={truckIcon}
              draggable={isDraggable}
              eventHandlers={eventHandlers}
            >
              <Popup className="premium-popup">
                <div className="p-2 font-black uppercase italic text-ceviche-red">
                  {isDraggable ? "📍 Arrástrame para mover el camión" : "🚚 Ceviche Movil en Camino"}
                </div>
              </Popup>
            </Marker>
            {!clientLocation && <ChangeView center={[Number(vehicleLocation.latitude), Number(vehicleLocation.longitude)]} />}
          </>
        )}

        {clientLocation && (
          <>
            <Marker 
              position={[Number(clientLocation.latitude), Number(clientLocation.longitude)]} 
              icon={clientIcon}
            >
              <Popup className="premium-popup">
                <div className="p-2 font-black uppercase italic text-ceviche-teal">
                  📍 Tu Ubicación de Entrega
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[Number(clientLocation.latitude), Number(clientLocation.longitude)]} 
              radius={200}
              pathOptions={{ color: '#00F0FF', fillColor: '#00F0FF', fillOpacity: 0.1, dashArray: '4 8' }}
            />
            {vehicleLocation && (
              <Polyline 
                positions={[
                  [Number(vehicleLocation.latitude), Number(vehicleLocation.longitude)],
                  [Number(clientLocation.latitude), Number(clientLocation.longitude)]
                ]}
                pathOptions={{ color: '#FF4500', weight: 4, dashArray: '10 10', className: 'animate-pulse' }}
              />
            )}
            {/* Si tenemos ambos o solo cliente, centramos al medio o al cliente */}
            <ChangeView center={[
              vehicleLocation ? (Number(vehicleLocation.latitude) + Number(clientLocation.latitude)) / 2 : Number(clientLocation.latitude),
              vehicleLocation ? (Number(vehicleLocation.longitude) + Number(clientLocation.longitude)) / 2 : Number(clientLocation.longitude)
            ]} />
          </>
        )}

        {stops.map((stop) => (
          <Marker 
            key={stop.id} 
            position={[Number(stop.latitude), Number(stop.longitude)]} 
            icon={icon}
          >
            <Popup>
              <div className="text-ceviche-brown">
                <p className="font-bold">{stop.name}</p>
                <p className="text-sm">Status: {stop.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
