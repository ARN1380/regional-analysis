'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapController = ({ activeLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (activeLocation) {
      map.flyTo([activeLocation.lat, activeLocation.lng], 6, { animate: true, duration: 1.2 });
    } else {
      map.flyTo([29.5, 45.0], 4, { animate: true, duration: 1.2 });
    }
  }, [activeLocation, map]);
  return null;
};

export default function MapComponent({ locations, newsList, activeNewsId, setActiveNewsId, appLanguage }) {
  const mapCenter = [29.5, 45.0];
  
  // 1. SAFEGUARD: Wait for Next.js to fully mount to prevent SSR/hydration mismatch crashes
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 2. SAFEGUARD: Cache icons so Leaflet isn't choked by new DOM elements on every slider tick
  const iconCache = useRef({});

  const getIcon = (severity, isActive) => {
    const cacheKey = `${severity}-${isActive}`;
    
    // Create the icon only if it doesn't already exist in the cache
    if (!iconCache.current[cacheKey]) {
      const getSeverityColor = (sev) => {
        switch (sev) {
          case 'critical': return '#ef4444';
          case 'success': return '#22c55e';
          case 'medium': return '#eab308';
          case 'normal': return '#3b82f6';
          default: return '#9ca3af';
        }
      };

      const color = getSeverityColor(severity);
      const scale = isActive ? 'scale(1.4)' : 'scale(1)';
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#18181b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5)); transform: translateY(-4px) ${scale}; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"></circle>
        </svg>
      `;

      iconCache.current[cacheKey] = L.divIcon({
        className: 'bg-transparent border-none',
        html: svgString,
        iconSize: [32, 32],
        iconAnchor: [16, 32], 
      });
    }
    
    return iconCache.current[cacheKey];
  };

  if (!mounted) return <div className="h-full w-full bg-[#121212]" />;

  const activeLoc = locations.find(l => l.id === activeNewsId);

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={4} 
      zoomControl={true} 
      scrollWheelZoom={true} 
      attributionControl={false} 
      className="h-full w-full rounded-lg outline-none z-0"
      style={{ background: '#121212' }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
      
      <MapController activeLocation={activeLoc} />
      
      {locations.map((loc) => {
        const isActive = activeNewsId === loc.id;
        const relatedNews = newsList.find(n => n.id === loc.id);
        const newsTitle = relatedNews ? (appLanguage === 'en' ? relatedNews.titleEn : relatedNews.titleFa) : '';

        return (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={getIcon(loc.severity, isActive)}
            zIndexOffset={isActive ? 1000 : 0}
            eventHandlers={{
              click: () => setActiveNewsId(isActive ? null : loc.id)
            }}
          >
            {newsTitle && (
              <Tooltip 
                direction="top" 
                offset={[0, -32]} 
                opacity={1}
              >
                <div className="font-sans text-xs font-medium">
                  {newsTitle}
                </div>
              </Tooltip>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}