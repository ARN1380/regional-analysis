'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ locations }) {
  const mapCenter = [29.5, 45.0]; // Center over the Middle East

  // Memoize the icons so Leaflet isn't generating new DOM nodes on every 
  // timeline slider tick. This completely prevents the 'appendChild' crash.
  const icons = useMemo(() => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'critical': return '#ef4444'; // Tailwind red-500
        case 'medium': return '#eab308';   // Tailwind yellow-500
        case 'normal': return '#3b82f6';   // Tailwind blue-500
        default: return '#9ca3af';
      }
    };

    const createIcon = (severity) => {
      const color = getSeverityColor(severity);
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#18181b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5)); transform: translateY(-4px);">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"></circle>
        </svg>
      `;

      return L.divIcon({
        className: 'bg-transparent border-none',
        html: svgString,
        iconSize: [32, 32],
        iconAnchor: [16, 32], 
      });
    };

    return {
      critical: createIcon('critical'),
      medium: createIcon('medium'),
      normal: createIcon('normal'),
      default: createIcon('default')
    };
  }, []);

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
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          // Pull the pre-created icon from our memoized dictionary
          icon={icons[loc.severity] || icons.default}
        />
      ))}
    </MapContainer>
  );
}