"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// Dynamic import for Leaflet to avoid SSR issues
let L: typeof import("leaflet") | null = null;
let leafletLoaded = false;

const loadLeaflet = async () => {
  if (!leafletLoaded) {
    L = await import("leaflet");
    // CSS will be loaded by the component
    leafletLoaded = true;
  }
  return L;
};

interface RuinLocation {
  latitude: number;
  longitude: number;
  nome: string;
  pais: string;
}

interface RuinLocationMapProps {
  location: RuinLocation;
}

// Get primary color from CSS variables
const getPrimaryColor = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary') || 'oklch(0.7917 0.1337 73.85)';
  }
  return 'oklch(0.7917 0.1337 73.85)';
};

// Create custom marker icon for ruin location with primary color
const createRuinMarkerIcon = () => {
  const primary = getPrimaryColor();
  if (!L) throw new Error("Leaflet not loaded");
  return L.divIcon({
    className: 'ruin-marker',
    html: `
      <div style="
        width: 35px;
        height: 35px;
        background: ${primary};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [35, 35],
    iconAnchor: [17.5, 35],
    popupAnchor: [0, -35]
  });
};

// Get tile layer URL based on theme
const getTileLayerUrl = (theme: string | undefined) => {
  if (theme === 'dark') {
    return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  } else {
    return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  }
};

// Get attribution based on theme
const getAttribution = () => {
  return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
};

export default function RuinLocationMap({ location }: RuinLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const resolvedTheme = useTheme().resolvedTheme;

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const initializeMap = async () => {
      if (mapRef.current && !mapInstance.current) {
        try {
          const Leaflet = await loadLeaflet();
          
          if (!Leaflet) throw new Error("Leaflet not loaded");
          // Check if container already has a map
          if ((mapRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
            return;
          }
          
          // Load CSS
          if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
          }

          // Wait a bit for CSS to load
          await new Promise(resolve => setTimeout(resolve, 100));

          // Initialize map centered on the ruin location
          mapInstance.current = Leaflet.map(mapRef.current).setView([location.latitude, location.longitude], 12);

          // Add initial tile layer
          tileLayerRef.current = Leaflet!.tileLayer(getTileLayerUrl(resolvedTheme), {
            attribution: getAttribution(),
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(mapInstance.current);

          // Add custom CSS for dark mode
          const style = document.createElement('style');
          style.id = 'leaflet-dark-mode-ruin';
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

          // Add marker for the ruin location
           
          const marker = Leaflet!.marker(
            [location.latitude, location.longitude], 
            { icon: createRuinMarkerIcon() }
          )
            .addTo(mapInstance.current)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 8px; color: ${resolvedTheme === 'dark' ? '#ffffff' : '#1f2937'};">${location.nome}</h3>
                <p style="margin: 4px 0; font-size: 12px; color: ${resolvedTheme === 'dark' ? '#d1d5db' : '#6b7280'};"><strong>País:</strong> ${location.pais}</p>
                <p style="margin: 4px 0; font-size: 11px; color: ${resolvedTheme === 'dark' ? '#9ca3af' : '#374151'};"><strong>Coordenadas:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
              </div>
            `);

          // Open popup by default
          marker.openPopup();
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading map:', error);
          setIsLoading(false);
        }
      }
    };

    initializeMap();

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
      const style = document.getElementById('leaflet-dark-mode-ruin');
      if (style) {
        try {
          style.remove();
        } catch (error) {
          console.error('Error removing style:', error);
        }
      }
    };
  }, [location.latitude, location.longitude, location.nome, location.pais, resolvedTheme, mounted]);

  // Update tile layer when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const updateTileLayer = async () => {
      if (mapInstance.current && tileLayerRef.current) {
        try {
          const Leaflet = await loadLeaflet();
          
          // Remove old tile layer
          mapInstance.current.removeLayer(tileLayerRef.current);
          
          // Add new tile layer with updated theme
          tileLayerRef.current = Leaflet!.tileLayer(getTileLayerUrl(resolvedTheme), {
            attribution: getAttribution(),
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(mapInstance.current);
        } catch (error) {
          console.error('Error updating tile layer:', error);
        }
      }
    };

    updateTileLayer();
  }, [resolvedTheme, mounted]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 rounded-lg border border-border relative"
      style={{ minHeight: '256px' }}
      suppressHydrationWarning
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Carregando mapa...</div>
        </div>
      )}
    </div>
  );
} 