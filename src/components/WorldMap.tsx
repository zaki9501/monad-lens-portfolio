import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validators } from '@/utils/validatorData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define the RayLayer type
interface RayLayerOptions extends L.LayerOptions {
  // Add any custom options here
}

// Custom ray layer for Leaflet
class RayLayer extends L.Layer {
  protected _rays: HTMLElement[];
  protected _container: HTMLElement | null;

  constructor(options?: RayLayerOptions) {
    super(options);
    this._rays = [];
    this._container = null;
  }

  onAdd(map: L.Map): this {
    this._map = map;
    this._container = L.DomUtil.create('div', 'leaflet-ray-layer');
    this._container.style.position = 'absolute';
    this._container.style.pointerEvents = 'none';
    this._container.style.zIndex = '1000';
    map.getPanes().overlayPane.appendChild(this._container);
    return this;
  }

  onRemove(map: L.Map): this {
    if (this._container && map.getPanes().overlayPane) {
      map.getPanes().overlayPane.removeChild(this._container);
    }
    this._container = null;
    this._map = null;
    return this;
  }

  createRay(latLng: L.LatLngExpression): void {
    if (!this._map || !this._container) return;

    const point = this._map.latLngToContainerPoint(latLng);
    const ray = document.createElement('div');
    ray.className = 'validator-ray';
    ray.style.cssText = `
      position: absolute;
      left: ${point.x}px;
      top: ${point.y}px;
    `;
    this._container.appendChild(ray);
    this._rays.push(ray);

    // Remove ray after animation
    setTimeout(() => {
      if (ray.parentNode) {
        ray.parentNode.removeChild(ray);
      }
      this._rays = this._rays.filter(r => r !== ray);
    }, 600);
  }
}

// Add CSS for enhanced animations
const style = document.createElement('style');
style.textContent = `
  @keyframes ray-animation {
    0% {
      transform: scaleY(0) translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      transform: scaleY(1) translateY(-400px);
      opacity: 0;
    }
  }

  @keyframes pulse-glow {
    0% {
      box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
    }
    100% {
      box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
    }
  }

  .validator-ray {
    position: absolute;
    width: 4px;
    height: 400px;
    background: linear-gradient(to top, 
      rgba(34, 197, 94, 0) 0%,
      rgba(34, 197, 94, 0.2) 20%,
      rgba(34, 197, 94, 0.8) 50%,
      rgba(34, 197, 94, 0.2) 80%,
      rgba(34, 197, 94, 0) 100%
    );
    transform-origin: bottom center;
    filter: blur(1px);
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
    will-change: transform, opacity;
    animation: ray-animation 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards, pulse-glow 0.6s ease-in-out;
  }

  .validator-marker {
    transition: all 0.3s ease-out;
  }

  .validator-marker.active {
    transform: scale(1.2);
  }

  .validator-count {
    animation: count-pulse 0.6s ease-out;
  }

  @keyframes count-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
      color: rgb(34, 197, 94);
    }
    100% {
      transform: scale(1);
    }
  }
`;
document.head.appendChild(style);

const WorldMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const rayLayerRef = useRef<RayLayer | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Group validators by country
  const validatorsByCountry = validators.reduce((acc, validator) => {
    if (!acc[validator.country]) {
      acc[validator.country] = [];
    }
    acc[validator.country].push(validator);
    return acc;
  }, {} as Record<string, typeof validators>);

  useEffect(() => {
    // Initialize map
    const map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add custom zoom control
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Add custom attribution
    L.control.attribution({
      position: 'bottomleft',
      prefix: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize ray layer
    const rayLayer = new RayLayer();
    rayLayer.addTo(map);
    rayLayerRef.current = rayLayer;

    // Add custom style to the map container
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.style.filter = 'brightness(0.8) contrast(1.2)';
    }

    // Add markers for each country
    Object.entries(validatorsByCountry).forEach(([country, countryValidators]) => {
      if (countryValidators.length > 0 && countryValidators[0].coordinates) {
        const [lat, lng] = countryValidators[0].coordinates;
        
        // Create custom marker with pulsing effect
        const markerHtml = `
          <div class="relative">
            <div class="absolute w-4 h-4 bg-green-400 rounded-full opacity-30 animate-ping"></div>
            <div class="absolute w-2 h-2 bg-green-400 rounded-full border border-white"></div>
            <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-mono whitespace-nowrap">
              ${countryValidators.length}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        markersRef.current[country] = marker;

        // Add popup with validator details
        const popupContent = `
          <div class="p-2 bg-gray-900 text-green-400">
            <h3 class="font-bold text-green-400">${country}</h3>
            <p class="text-sm text-green-600">Validators: ${countryValidators.length}</p>
            <div class="mt-2">
              ${countryValidators.map(v => `
                <div class="text-xs text-green-400">
                  ${v.name}
                </div>
              `).join('')}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Simulate block production (replace with actual block production events)
    const simulateBlockProduction = () => {
      const countries = Object.keys(validatorsByCountry);
      
      // Shoot rays from 3-4 random validators simultaneously
      const numValidators = Math.floor(Math.random() * 2) + 3; // Random number between 3 and 4
      
      for (let i = 0; i < numValidators; i++) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        const validator = validatorsByCountry[randomCountry][0];
        
        if (validator && validator.coordinates) {
          const [lat, lng] = validator.coordinates;
          rayLayerRef.current?.createRay([lat, lng]);
          
          // Highlight the marker with enhanced effects
          const marker = markersRef.current[randomCountry];
          if (marker) {
            marker.setIcon(L.divIcon({
              html: `
                <div class="relative validator-marker active">
                  <div class="absolute w-10 h-10 bg-green-400 rounded-full opacity-50 animate-ping"></div>
                  <div class="absolute w-8 h-8 bg-green-400 rounded-full border-2 border-white"></div>
                  <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-mono whitespace-nowrap validator-count">
                    ${validatorsByCountry[randomCountry].length}
                  </div>
                </div>
              `,
              className: 'custom-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            }));

            // Reset marker after animation
            setTimeout(() => {
              marker.setIcon(L.divIcon({
                html: `
                  <div class="relative validator-marker">
                    <div class="absolute w-4 h-4 bg-green-400 rounded-full opacity-30 animate-ping"></div>
                    <div class="absolute w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-mono whitespace-nowrap">
                      ${validatorsByCountry[randomCountry].length}
                    </div>
                  </div>
                `,
                className: 'custom-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              }));
            }, 600);
          }
        }
      }
    };

    // Simulate block production even more frequently
    const interval = setInterval(simulateBlockProduction, 150); // Changed to 150ms (0.15 seconds)

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      map.remove();
    };
  }, []);

  return (
    <Card className="bg-gray-900/30 border-green-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-400 text-sm">GLOBAL VALIDATOR NETWORK</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[600px] bg-gradient-to-b from-blue-950/50 to-blue-900/30 rounded-lg overflow-hidden">
          {/* Leaflet Map Container */}
          <div id="map" className="w-full h-full" />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 text-xs space-y-1 z-[1000] bg-black/50 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Active Validators</span>
            </div>
            <div className="text-green-600">
              Total: {validators.length} validators across {Object.keys(validatorsByCountry).length} regions
            </div>
          </div>
          
          {/* Stats */}
          <div className="absolute top-4 right-4 space-y-1 z-[1000]">
            <Badge variant="outline" className="border-green-600 text-green-400 bg-black/50">
              Global Coverage: {Object.keys(validatorsByCountry).length} Countries
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMap;
