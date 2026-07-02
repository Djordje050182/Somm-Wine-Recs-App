import React, { useEffect, useRef, useState } from 'react';
import { ImageAsset } from '../types';
import { useRegion } from '../contexts/RegionContext';

// Leaflet map for the guide and trip planner. Pins follow the house palette:
// claret for wineries, vine for experiences, brass dot for lunch stops.

const PIN_COLOURS = {
  winery: '#5E1A26', // claret
  experience: '#4A5D3A', // vine
};

interface MapStop {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  image?: ImageAsset | string;
  arrival?: string;
  isLunchStop?: boolean;
  type?: 'winery' | 'experience';
}

interface MapLayerProps {
  stops: MapStop[];
  onMarkerClick?: (stop: MapStop) => void;
}

const imageUrl = (image?: ImageAsset | string): string | null => {
  if (!image) return null;
  return typeof image === 'string' ? image : image.url;
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MapLayer: React.FC<MapLayerProps> = ({ stops, onMarkerClick }) => {
  const { region } = useRegion();
  const mapRef = useRef<any>(null);
  const mapContainerId = 'leaflet-map-container';
  const [leafletReady, setLeafletReady] = useState(!!(window as any).L);

  // Leaflet loads from a CDN script tag; wait for it briefly if we mounted first.
  useEffect(() => {
    if (leafletReady) return;
    const poll = setInterval(() => {
      if ((window as any).L) {
        setLeafletReady(true);
        clearInterval(poll);
      }
    }, 100);
    const stop = setTimeout(() => clearInterval(poll), 10000);
    return () => {
      clearInterval(poll);
      clearTimeout(stop);
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!leafletReady || !(window as any).L) return;
    const L = (window as any).L;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerId).setView([region.centre.lat, region.centre.lng], region.mapZoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(mapRef.current);
    }

    // Clear existing markers and lines
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

        const pinColour = PIN_COLOURS[stop.type ?? 'winery'];

        const iconHtml = `
          <div class="relative w-8 h-8 flex items-center justify-center group">
            <div class="absolute inset-0 rounded-full border-2 border-[#F6F1E7] shadow-sm transition-transform duration-300 transform group-hover:scale-110" style="background-color: ${pinColour};"></div>
            <span class="relative text-[#F6F1E7] font-bold text-sm" style="font-family: Archivo, system-ui, sans-serif;">${index + 1}</span>
            ${stop.isLunchStop ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-[#96742E] rounded-full border border-[#F6F1E7]"></div>' : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.marker(latLng, { icon }).addTo(mapRef.current);

        const url = imageUrl(stop.image);
        const popupContent = `
          <div style="font-family: Archivo, system-ui, sans-serif; min-width: 160px; text-align: left;">
            ${url ? `<img src="${escapeHtml(url)}" style="width:100%; height:88px; object-fit:cover; display:block; margin-bottom:8px; background:#E2D9C8;" onerror="this.style.display='none'" alt=""/>` : ''}
            <strong style="font-family: Fraunces, Georgia, serif; font-weight: 500; font-size: 15px; color: #211A16; display:block; margin-bottom:4px;">${escapeHtml(stop.name)}</strong>
            ${stop.arrival ? `<div style="font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#96742E; margin-bottom:4px;">Arrive ${escapeHtml(stop.arrival)}</div>` : ''}
            <div style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:${pinColour};">${stop.type === 'experience' ? 'Experience' : 'Winery'} · tap pin for details</div>
          </div>
        `;

        marker.bindPopup(popupContent, { minWidth: 170 });

        marker.on('click', () => {
          if (onMarkerClick) onMarkerClick(stop);
        });

        markers.addLayer(marker);
      });

      // The touring route between stops — only when this is an itinerary
      // (stops carry arrival times), never on the all-pins guide map.
      const isRoute = stops.some(s => s.arrival);
      if (isRoute && latLngs.length > 1) {
        L.polyline(latLngs, {
          color: '#5E1A26',
          weight: 2,
          dashArray: '4, 8',
          opacity: 0.8,
        }).addTo(mapRef.current);
      }

      mapRef.current.fitBounds(markers.getBounds().pad(0.1));
    }

    // Leaflet needs a nudge after layout settles
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 100);
  }, [stops, onMarkerClick, leafletReady, region]);

  return <div id={mapContainerId} className="w-full h-full z-0" style={{ minHeight: '400px' }} />;
};

export default MapLayer;
