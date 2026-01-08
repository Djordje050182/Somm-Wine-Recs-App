
import React, { useEffect, useRef } from 'react';

interface WineryStop {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  image?: string;
  arrival?: string;
  isLunchStop?: boolean;
  type?: 'winery' | 'experience';
}

interface MapLayerProps {
  stops: WineryStop[];
  onMarkerClick?: (stop: WineryStop) => void;
}

const MapLayer: React.FC<MapLayerProps> = ({ stops, onMarkerClick }) => {
  const mapRef = useRef<any>(null);
  const mapContainerId = 'leaflet-map-container';

  useEffect(() => {
    // Check if Leaflet is loaded
    if (!(window as any).L) return;

    const L = (window as any).L;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerId).setView([-32.7850, 151.3150], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
    }

    // Clear existing markers/lines
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapRef.current.removeLayer(layer);
      }
    });

    if (stops.length > 0) {
      const latLngs: [number, number][] = [];
      const markers = L.featureGroup();

      stops.forEach((stop, index) => {
        const latLng: [number, number] = [stop.lat, stop.lng];
        latLngs.push(latLng);

        // Determine color based on type
        const bgColor = stop.type === 'experience' ? '#2563eb' : '#6b1e2e'; 
        
        // Custom Icon
        const iconHtml = `
          <div class="relative w-8 h-8 flex items-center justify-center group">
            <div class="absolute inset-0 rounded-full shadow-lg border-2 border-white transition-transform duration-300 transform group-hover:scale-110" style="background-color: ${bgColor};"></div>
            <span class="relative text-white font-bold text-sm">${index + 1}</span>
            ${stop.isLunchStop ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-[#a68d60] rounded-full border border-white"></div>' : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = L.marker(latLng, { icon }).addTo(mapRef.current);
        
        // Rich Popup Logic
        const popupContent = `
          <div class="font-sans text-center min-w-[150px]">
            ${stop.image ? `<img src="${stop.image}" class="w-full h-24 object-cover rounded-lg mb-2" onerror="this.style.display='none'"/>` : ''}
            <strong style="color: ${bgColor}" class="text-sm block mb-1">${stop.name}</strong>
            ${stop.arrival ? `<div class="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-500 mb-2">Arrive: ${stop.arrival}</div>` : ''}
            <div class="text-[10px] text-gray-400">Click marker for details</div>
          </div>
        `;

        marker.bindPopup(popupContent, { minWidth: 160 });
        
        marker.on('click', () => {
             if (onMarkerClick) onMarkerClick(stop);
        });

        markers.addLayer(marker);
      });

      // Draw Path
      if (latLngs.length > 1) {
        L.polyline(latLngs, {
          color: '#6b1e2e',
          weight: 3,
          dashArray: '5, 10',
          opacity: 0.8
        }).addTo(mapRef.current);
      }

      // Fit bounds
      mapRef.current.fitBounds(markers.getBounds().pad(0.1));
    }

    // Fix for Leaflet rendering issues
    setTimeout(() => {
        mapRef.current.invalidateSize();
    }, 100);

    return () => {
        // We persist the map instance for performance
    };
  }, [stops]);

  return (
    <div id={mapContainerId} className="w-full h-full rounded-2xl z-0" style={{ minHeight: '400px' }} />
  );
};

export default MapLayer;
