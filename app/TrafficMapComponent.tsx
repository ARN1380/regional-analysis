'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TrafficMapComponent({ ships }) {
  const mapCenter = [26.2, 56.0]; 
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cache the ship icons by type and heading degree
  const iconCache = useRef({});

  const getIcon = (type, heading = 0) => {
    const cacheKey = `${type}-${heading}`;
    
    if (!iconCache.current[cacheKey]) {
      const color = type === 'tanker' ? '#ef4444' : '#eab308'; 
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${color}" stroke="#000000" stroke-width="1.5" style="transform: rotate(${heading}deg); filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.8));">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      `;

      iconCache.current[cacheKey] = L.divIcon({
        className: 'bg-transparent border-none',
        html: svgString,
        iconSize: [14, 14],
        iconAnchor: [7, 7], 
      });
    }
    
    return iconCache.current[cacheKey];
  };

  if (!mounted) return <div className="h-full w-full bg-[#121212]" />;

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={7} 
      zoomControl={false} 
      dragging={false} 
      scrollWheelZoom={false} 
      touchZoom={false} 
      doubleClickZoom={false} 
      attributionControl={false} 
      className="h-full w-full rounded-lg outline-none z-0"
      style={{ background: '#121212', cursor: 'default' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      
      {ships && ships.map((ship) => (
        <Marker
          key={ship.id}
          position={[ship.lat, ship.lng]}
          icon={getIcon(ship.type, ship.heading)}
        />
      ))}
    </MapContainer>
  );
}