'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/utils/googleMaps';
import { Target } from 'lucide-react';

interface SalesMapProps {
  sales: MapSale[];
  center?: [number, number]; // user location
  distance?: number; // distance in miles for zoom calculation
  onSaleClick?: (sale: MapSale) => void;
  onCenterChange?: (center: [number, number]) => void; // Manual center change callback
}

export type MapSale = {
  id: string;
  title: string;
  /** Preferred coordinates (exact) */
  lat?: number | null;
  lng?: number | null;
  /** Alternate coordinate field names (from older projects) */
  latitude?: number | null;
  longitude?: number | null;
  /** If false, map will jitter coordinates for privacy */
  addressVisible?: boolean;
  /** For marker styling */
  created_by?: string | null;
  workspace_id?: string | null;
  /** Optional listing image */
  main_display_image?: string | null;
  /** Optional dates (old shape) */
  sale_dates?: { sale_date: string }[];
  /** Optional link target for “View Sale →” */
  href?: string;
};

function coalesceCoords(sale: MapSale): { lat: number; lng: number } | null {
  const lat = sale.lat ?? sale.latitude ?? null;
  const lng = sale.lng ?? sale.longitude ?? null;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return { lat, lng };
}

function isAddressVisible(sale: MapSale): boolean {
  return sale.addressVisible !== false;
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

export default function SalesMap({ sales, center, distance = 25, onCenterChange }: SalesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  type AnyMarker = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;
  type AdvancedMarkerCtor = new (opts: google.maps.marker.AdvancedMarkerElementOptions) => google.maps.marker.AdvancedMarkerElement;
  const centerDotRef = useRef<AnyMarker | null>(null);
  const salesMarkersRef = useRef<AnyMarker[]>([]);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);

  const metersPerMile = 1609.34;

  const drawRadiusCircle = useCallback((centerCoords: { lat: number; lng: number }, radiusMiles: number) => {
    if (!mapInstanceRef.current || typeof google === 'undefined') return;

    // Clear existing radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setMap(null);
    }

    // Create new radius circle
    radiusCircleRef.current = new google.maps.Circle({
      strokeColor: '#4F46E5',
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: '#4F46E5',
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center: centerCoords,
      radius: radiusMiles * metersPerMile,
    });

    // Removed autozoom - let users control their own zoom/pan experience
    // The radius circle will still draw correctly without forcing map bounds
  }, []);

  // Calculate zoom level based on distance
  const getZoomLevel = (distanceMiles: number): number => {
    // More precise zoom calculation based on distance
    if (distanceMiles <= 2) return 13; // Very close - high zoom
    if (distanceMiles <= 5) return 12; // Close - high zoom
    if (distanceMiles <= 10) return 11; // Medium-close - medium-high zoom
    if (distanceMiles <= 25) return 10; // Medium - medium zoom
    if (distanceMiles <= 50) return 9; // Far - medium-low zoom
    if (distanceMiles <= 100) return 8; // Very far - low zoom
    return 8; // Default for very large distances
  };

  const clearSalesMarkers = useCallback(() => {
    // Clear existing sales markers
    salesMarkersRef.current.forEach((marker) => {
      // AdvancedMarkerElement uses `.map = null`, classic Marker uses `.setMap(null)`
      if ("setMap" in marker) {
        marker.setMap(null);
      } else {
        marker.map = null;
      }
    });
    salesMarkersRef.current = [];
  }, []);

  const jitterCoordinates = (lat: number, lng: number, radiusInMeters = 100): [number, number] => {
    const earthRadius = 6378137; // in meters
    const dn = (Math.random() - 0.5) * 2 * radiusInMeters;
    const de = (Math.random() - 0.5) * 2 * radiusInMeters;

    const dLat = dn / earthRadius;
    const dLng = de / (earthRadius * Math.cos((Math.PI * lat) / 180));

    const newLat = lat + (dLat * 180) / Math.PI;
    const newLng = lng + (dLng * 180) / Math.PI;

    return [newLat, newLng];
  };

  const updateCenterDot = useCallback((coords: [number, number]) => {
    if (!mapInstanceRef.current || typeof google === 'undefined') return;

    const centerPosition = { lat: coords[0], lng: coords[1] };

    // If marker exists, just update position
    if (centerDotRef.current) {
      if ("setPosition" in centerDotRef.current) {
        centerDotRef.current.setPosition(centerPosition);
      } else {
        centerDotRef.current.position = centerPosition;
      }
    } else {
      const hasAdvanced =
        Boolean(google.maps.marker?.AdvancedMarkerElement) &&
        typeof google.maps.marker.AdvancedMarkerElement === "function";

      if (hasAdvanced) {
        const AdvancedMarkerElement =
          google.maps.marker.AdvancedMarkerElement as unknown as AdvancedMarkerCtor;

        const el = document.createElement("div");
        el.style.width = "16px";
        el.style.height = "16px";
        el.style.borderRadius = "9999px";
        el.style.background = "#4285F4";
        el.style.border = "2px solid #FFFFFF";
        el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";

        centerDotRef.current = new AdvancedMarkerElement({
          position: centerPosition,
          map: mapInstanceRef.current,
          title: "Search center",
          content: el,
        });
      } else {
        centerDotRef.current = new google.maps.Marker({
          position: centerPosition,
          map: mapInstanceRef.current,
          title: 'Search center',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4', // Google Blue
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
      }
    }
  }, []);
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // miles
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  const handleCenterHere = () => {
    if (!mapInstanceRef.current || !onCenterChange) return;

    const center = mapInstanceRef.current.getCenter();
    if (center) {
      const newCenter: [number, number] = [center.lat(), center.lng()];
      onCenterChange(newCenter);
    }
  };

  const plotSalesMarkers = useCallback(() => {
    if (!mapInstanceRef.current || typeof google === 'undefined') return;

    // Clear existing markers first
    clearSalesMarkers();

    const bounds = new google.maps.LatLngBounds();
    const infoWindows: google.maps.InfoWindow[] = [];

    sales.forEach((sale, index) => {
      const coords = coalesceCoords(sale);
      if (!coords) return;

      const [lat, lng] = isAddressVisible(sale)
        ? [coords.lat, coords.lng]
        : jitterCoordinates(coords.lat, coords.lng, 100); // 100m radius

      const position = { lat, lng };

      // Determine marker style based on sale type
      const isCompanySale = sale.workspace_id && sale.workspace_id !== sale.created_by;

      const hasAdvanced =
        Boolean(google.maps.marker?.AdvancedMarkerElement) &&
        typeof google.maps.marker.AdvancedMarkerElement === "function";

      const marker: AnyMarker = hasAdvanced
        ? (() => {
            const AdvancedMarkerElement =
              google.maps.marker.AdvancedMarkerElement as unknown as AdvancedMarkerCtor;

            const el = document.createElement("div");
            el.style.width = "28px";
            el.style.height = "28px";
            el.style.borderRadius = "9999px";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.justifyContent = "center";
            el.style.fontSize = "12px";
            el.style.fontWeight = "700";
            el.style.color = "#ffffff";
            el.style.border = "2px solid #ffffff";
            el.style.background = isCompanySale ? "#10B981" : "#4F46E5";
            el.style.boxShadow = "0 10px 24px rgba(0,0,0,0.35)";
            el.textContent = String(index + 1);

            return new AdvancedMarkerElement({
              position,
              map: mapInstanceRef.current,
              title: sale.title,
              content: el,
            });
          })()
        : new google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: sale.title,
            label: (index + 1).toString(),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: isCompanySale ? '#10B981' : '#4F46E5', // Green for company, Blue for personal
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

      // Store marker reference for cleanup
      salesMarkersRef.current.push(marker);

      const distance = center
        ? `${Math.round(haversineDistance(center[0], center[1], lat, lng))} mi`
        : '';

      const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="w-64 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
              <img src="${sale.main_display_image || '/placeholder.jpg'}" class="w-full h-32 object-cover" />
              <div class="p-3">
                <h3 class="text-sm font-semibold text-gray-900 mb-1">${sale.title}</h3>
                <p class="text-xs text-gray-500 mb-2">
                  ${distance} away
                  <br />
                  ${
                    sale.sale_dates?.[0]?.sale_date
                      ? formatDate(sale.sale_dates[0].sale_date)
                      : 'TBD'
                  } – ${
                    sale.sale_dates?.[sale.sale_dates.length - 1]?.sale_date
                      ? formatDate(sale.sale_dates[sale.sale_dates.length - 1].sale_date)
                      : 'TBD'
                  }
                </p>
                <div class="flex justify-between items-center text-sm">
                  <button onclick="this.closest('.gm-style-iw').style.display='none'" class="text-gray-500 hover:text-gray-700">Close</button>
                  <div class="flex gap-2">
                    <a href="${sale.href || `/sales/${sale.id}`}" class="text-blue-600 hover:text-blue-800">View Sale →</a>
                  </div>
                </div>
              </div>
            </div>
          `,
      });

      // Works for both Marker and AdvancedMarkerElement
      google.maps.event.addListener(marker, "click", () => {
        infoWindows.forEach((iw) => iw.close());
        // New signature supports advanced markers as anchors.
        infoWindow.open({ map: mapInstanceRef.current!, anchor: marker });
      });

      infoWindows.push(infoWindow);
      bounds.extend(position);
    });

    // Removed forced centering and zooming - let users control their map experience
    // The radius circle will still show the search area without interfering with user's view
  }, [center, clearSalesMarkers, sales]);

  const initMap = useCallback(() => {
    if (!mapRef.current || typeof google === 'undefined') return;

    const initialCenter = center
      ? { lat: center[0], lng: center[1] }
      : { lat: 33.749, lng: -84.388 };

    const initialZoom = getZoomLevel(distance);

    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      // Use string literal to avoid crashing if MapTypeId is undefined in some loads.
      mapTypeId: "roadmap",
      // Required for Advanced Markers (recommended). Create in Google Cloud Console → Maps → Map IDs.
      mapId,
      // If you set a Map ID, styles must be configured in Cloud Console.
      // Only apply inline styles when no mapId is present.
      ...(mapId
        ? {}
        : {
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }),
    });

    if (center) {
      updateCenterDot(center);
      // Draw radius circle after map is initialized
      setTimeout(() => {
        drawRadiusCircle({ lat: center[0], lng: center[1] }, distance);
      }, 100);
    }

    plotSalesMarkers(); // Call plotSalesMarkers after map initialization
  }, [center, distance, drawRadiusCircle, plotSalesMarkers, updateCenterDot]);

  // Update radius circle when center or distance changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      drawRadiusCircle({ lat: center[0], lng: center[1] }, distance);
    }
  }, [center, distance, drawRadiusCircle]);

  // Update zoom level when distance changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const newZoom = getZoomLevel(distance);
      mapInstanceRef.current.setZoom(newZoom);
    }
  }, [distance]);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMaps();
        if (!mapInstanceRef.current) {
          initMap();
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initializeGoogleMaps();
  }, [initMap]); // Only run once per init callback

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      updateCenterDot(center);
    }
  }, [center, updateCenterDot]); // Only update center dot when center changes

  useEffect(() => {
    if (mapInstanceRef.current) {
      plotSalesMarkers();
    }
  }, [plotSalesMarkers]); // Re-plot markers when sales/center change

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Purple Center Dot - Always Visible */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-4 h-4 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          <div className="w-4 h-4 bg-purple-500 rounded-full shadow-lg"></div>
        </div>
      </div>

      {/* Center Here Button */}
      <div className="absolute top-24 left-4">
        <button
          onClick={handleCenterHere}
          className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 hover:bg-white transition-colors"
          title="Center search here"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Center Here</span>
          </div>
        </button>
      </div>
    </div>
  );
}