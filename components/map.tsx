"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";

interface Expedicao {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  localizacao?: {
    id: number;
    pais: string;
    latitude: number;
    longitude: number;
  };
  ruina?: {
    id: number;
    nome: string;
  };
  equipe?: {
    id: number;
    nome: string;
  };
}

interface MapProps {
  expedicoes?: Expedicao[];
}

// Create custom primary colored marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: oklch(0.7917 0.1337 73.85);
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Create custom expedition marker icon (primary color)
const getPrimaryColor = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#3b82f6';
  }
  return '#3b82f6';
};

const createExpeditionIcon = () => {
  const primary = getPrimaryColor();
  return L.divIcon({
    className: 'expedition-marker',
    html: `
      <div style="
        width: 25px;
        height: 25px;
        background: ${primary};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12.5, 25],
    popupAnchor: [0, -25]
  });
};

// Get tile layer URL based on theme
const getTileLayerUrl = (theme: string | undefined) => {
  if (theme === 'dark') {
    // Dark theme tiles - using CartoDB Dark Matter
    return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  } else {
    // Light theme tiles - using CartoDB Positron
    return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  }
};

// Get attribution based on theme
const getAttribution = (theme: string | undefined) => {
  if (theme === 'dark') {
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
  } else {
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
  }
};

export default function Map({ expedicoes = [] }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme ? useTheme() : { resolvedTheme: undefined };

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (mapRef.current && !mapInstance.current) {
      // Initialize map with a more global view
      mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);

      // Add initial tile layer
      tileLayerRef.current = L.tileLayer(getTileLayerUrl(resolvedTheme), {
        attribution: getAttribution(resolvedTheme),
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Add custom CSS for dark mode
      const style = document.createElement('style');
      style.id = 'leaflet-dark-mode';
      style.textContent = `
        .dark .leaflet-container {
          background: #1a1a1a !important;
        }
        .dark .leaflet-popup-content-wrapper {
          background: #2d2d2d !important;
          color: #ffffff !important;
          border: 1px solid #404040 !important;
        }
        .dark .leaflet-popup-tip {
          background: #2d2d2d !important;
        }
        .dark .leaflet-control-zoom a {
          background: #2d2d2d !important;
          color: #ffffff !important;
          border: 1px solid #404040 !important;
        }
        .dark .leaflet-control-zoom a:hover {
          background: #404040 !important;
        }
        .dark .leaflet-control-attribution {
          background: rgba(45, 45, 45, 0.8) !important;
          color: #ffffff !important;
        }
        .dark .leaflet-control-attribution a {
          color: #60a5fa !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapInstance.current = null;
      }
      // Remove custom CSS
      const style = document.getElementById('leaflet-dark-mode');
      if (style) {
        try {
          style.remove();
        } catch (error) {
          console.error('Error removing style:', error);
        }
      }
    };
  }, [mounted]);

  // Update tile layer when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    if (mapInstance.current && tileLayerRef.current) {
      // Remove old tile layer
      mapInstance.current.removeLayer(tileLayerRef.current);
      
      // Add new tile layer with updated theme
      tileLayerRef.current = L.tileLayer(getTileLayerUrl(resolvedTheme), {
        attribution: getAttribution(resolvedTheme),
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstance.current);
    }
  }, [resolvedTheme, mounted]);

  // Add expedition markers when expeditions data changes
  useEffect(() => {
    if (!mounted) return;
    
    if (!mapInstance.current || !expedicoes.length) return;

    // Clear existing markers (except base tiles)
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current!.removeLayer(layer);
      }
    });

    // Add markers for expeditions
    expedicoes.forEach((expedicao) => {
      if (expedicao.localizacao?.latitude && expedicao.localizacao?.longitude) {
        const marker = L.marker(
          [expedicao.localizacao.latitude, expedicao.localizacao.longitude], 
          { icon: createExpeditionIcon() }
        )
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 8px; color: ${resolvedTheme === 'dark' ? '#ffffff' : '#1f2937'};">${expedicao.nome}</h3>
              <p style="margin: 4px 0; font-size: 12px; color: ${resolvedTheme === 'dark' ? '#d1d5db' : '#6b7280'};"><strong>Status:</strong> ${expedicao.status}</p>
              <p style="margin: 4px 0; font-size: 12px; color: ${resolvedTheme === 'dark' ? '#d1d5db' : '#6b7280'};"><strong>País:</strong> ${expedicao.localizacao.pais}</p>
              <p style="margin: 4px 0; font-size: 12px; color: ${resolvedTheme === 'dark' ? '#d1d5db' : '#6b7280'};"><strong>Ruína:</strong> ${expedicao.ruina?.nome || 'N/A'}</p>
              <p style="margin: 4px 0; font-size: 12px; color: ${resolvedTheme === 'dark' ? '#d1d5db' : '#6b7280'};"><strong>Equipe:</strong> ${expedicao.equipe?.nome || 'N/A'}</p>
              <p style="margin: 4px 0; font-size: 11px; color: ${resolvedTheme === 'dark' ? '#9ca3af' : '#374151'};"><strong>Período:</strong> ${new Date(expedicao.data_inicio).toLocaleDateString()} - ${new Date(expedicao.data_fim).toLocaleDateString()}</p>
            </div>
          `);
      }
    });

    // Fit map to show all markers if there are any
    if (expedicoes.length > 0) {
      const validExpedicoes = expedicoes.filter(exp => exp.localizacao?.latitude && exp.localizacao?.longitude);
      
      if (validExpedicoes.length > 0) {
        const bounds = L.latLngBounds(
          validExpedicoes.map(exp => [exp.localizacao!.latitude, exp.localizacao!.longitude])
        );
        
        mapInstance.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [expedicoes, resolvedTheme, mounted]);

  // Adicionar um useEffect para atualizar os markers ao trocar o tema
  useEffect(() => {
    if (!mounted) return;
    
    if (mapInstance.current) {
      mapInstance.current.invalidateSize();
    }
  }, [resolvedTheme, mounted]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ zIndex: 1, height: "100%", minHeight: "300px" }}
      suppressHydrationWarning
    />
  );
}