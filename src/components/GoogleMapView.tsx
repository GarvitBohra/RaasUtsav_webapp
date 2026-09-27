/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Venue } from '../data/garbaVenues';
import { MapPin, Navigation, ExternalLink, Ticket, Sparkles, Compass, LocateFixed, Radio, Layers } from 'lucide-react';
import { calculateDistanceKm } from '../utils/distance';

interface GoogleMapViewProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onSelectVenue: (venue: Venue) => void;
  onBookTickets: (venue: Venue) => void;
  onOpenRadarModal?: (venue: Venue) => void;
  userCoords: { lat: number; lng: number } | null;
  onRequestUserLocation: () => void;
  isCompact?: boolean;
}

// Custom Dark Navratri Gold Theme for Google Maps
const NAVRATRI_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#18121f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#16111d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#dec1af' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffb784' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffba27' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e1a27' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2233' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c9bccc' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f77f00' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#391a00' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f273b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ffba27' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0d0a12' }],
  },
];

const GOOGLE_MAPS_KEY = 'de74cb0dc11b43ddbb58c6ab692ffa10';

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  venues,
  selectedVenue,
  onSelectVenue,
  onBookTickets,
  onOpenRadarModal,
  userCoords,
  onRequestUserLocation,
  isCompact = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  // Load Google Maps JavaScript API
  useEffect(() => {
    // Intercept Google Maps Auth Failure (e.g. invalid key or domain restriction)
    (window as unknown as { gm_authFailure: () => void }).gm_authFailure = () => {
      console.warn('Google Maps authentication failed with provided API key. Activating interactive Twin-City radar fallback.');
      setMapLoadError('Google Maps API Key authorization issue detected. Interactive Radar mode active.');
      setFallbackMode(true);
    };

    if (window.google && window.google.maps) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places,marker&callback=onGoogleMapsInit`;
      script.async = true;
      script.defer = true;

      (window as unknown as { onGoogleMapsInit: () => void }).onGoogleMapsInit = () => {
        setIsScriptLoaded(true);
      };

      script.onload = () => {
        setIsScriptLoaded(true);
      };

      script.onerror = () => {
        setMapLoadError('Google Maps network request failed. Interactive Radar view enabled.');
        setFallbackMode(true);
      };

      document.head.appendChild(script);

      // Timeout safeguard: if script doesn't initialize within 3 seconds, activate radar fallback
      const timer = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          setFallbackMode(true);
        }
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (fallbackMode || !isScriptLoaded || !mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    try {
      const centerPos = { lat: 23.0900, lng: 72.5600 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: centerPos,
        zoom: isCompact ? 11 : 12,
        styles: NAVRATRI_MAP_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        backgroundColor: '#16111d',
      });

      const iw = new window.google.maps.InfoWindow();
      setInfoWindow(iw);
      setMapInstance(map);
    } catch (err) {
      console.warn('Google Map creation failed, falling back to Interactive Radar:', err);
      setFallbackMode(true);
    }
  }, [isScriptLoaded, isCompact, fallbackMode]);

  // Update Markers
  useEffect(() => {
    if (!mapInstance || !window.google || !window.google.maps || fallbackMode) return;

    markers.forEach((m) => m.setMap(null));
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    venues.forEach((v) => {
      const position = { lat: v.coordinates.lat, lng: v.coordinates.lng };
      bounds.extend(position);

      const isSelected = selectedVenue?.id === v.id;

      const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <path d="M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 46 18 46 C18 46 36 31.5 36 18 C36 8.06 27.94 0 18 0 Z" 
                fill="${isSelected ? '#ffba27' : '#f77f00'}" 
                stroke="#ffffff" 
                stroke-width="1.5" />
          <circle cx="18" cy="18" r="13" fill="#16111d" />
          <text x="18" y="22" font-size="11" font-weight="bold" fill="${isSelected ? '#ffba27' : '#ffdcc6'}" text-anchor="middle" font-family="Arial">
            ₹${v.price}
          </text>
        </svg>
      `;

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        title: v.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
          scaledSize: new window.google.maps.Size(36, 46),
          anchor: new window.google.maps.Point(18, 46),
        },
      });

      marker.addListener('click', () => {
        onSelectVenue(v);
        if (infoWindow) {
          const content = `
            <div style="background-color: #1f1926; color: #eadff1; padding: 12px; border-radius: 12px; max-width: 260px; font-family: sans-serif;">
              <div style="font-size: 10px; color: #ffba27; font-weight: bold; text-transform: uppercase;">${v.artist}</div>
              <h4 style="font-size: 14px; font-weight: bold; color: #ffffff; margin: 2px 0;">${v.name}</h4>
              <p style="font-size: 11px; color: #c9bccc; margin-bottom: 8px;">📍 ${v.location}</p>
              <div style="display: flex; gap: 4px; margin-bottom: 8px;">
                <span style="font-size: 16px; font-weight: 800; color: #ffb784;">₹${v.price}</span>
                <span style="font-size: 10px; background: #f77f00; color: white; padding: 2px 4px; border-radius: 4px;">${v.tag}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <a href="${v.bookmyshowUrl}" target="_blank" rel="noopener noreferrer" style="background: #e11d48; color: white; padding: 5px; font-size: 10px; font-weight: bold; text-align: center; border-radius: 4px; text-decoration: none;">BookMyShow</a>
                <a href="${v.districtUrl}" target="_blank" rel="noopener noreferrer" style="background: #8b5cf6; color: white; padding: 5px; font-size: 10px; font-weight: bold; text-align: center; border-radius: 4px; text-decoration: none;">District</a>
              </div>
            </div>
          `;
          infoWindow.setContent(content);
          infoWindow.open(mapInstance, marker);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    if (venues.length > 0 && !selectedVenue) {
      mapInstance.fitBounds(bounds);
    }
  }, [mapInstance, venues, selectedVenue, fallbackMode]);

  // Center on selected venue
  useEffect(() => {
    if (!mapInstance || !selectedVenue || fallbackMode) return;
    mapInstance.panTo(selectedVenue.coordinates);
    mapInstance.setZoom(14);
  }, [mapInstance, selectedVenue, fallbackMode]);

  return (
    <div
      id="map-radar-section"
      className={`relative w-full rounded-2xl overflow-hidden border border-[#2e2735] shadow-xl bg-[#16111d] ${
        isCompact ? 'h-[380px]' : 'h-[500px]'
      }`}
    >
      {/* 1. Google Maps JS Container (Visible if working) */}
      {!fallbackMode && <div ref={mapRef} className="w-full h-full" />}

      {/* 2. Interactive Twin-City Radar View (High Performance Fallback) */}
      {fallbackMode && (
        <div className="w-full h-full bg-[#110c18] relative flex flex-col justify-between p-4 overflow-hidden">
          {/* Radar Header */}
          <div className="flex items-center justify-between border-b border-[#2e2735] pb-2 z-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f77f00] animate-ping" />
              <span className="font-bold text-xs text-[#ffba27] uppercase tracking-wider">
                Live Twin-City Maps Radar (Amdavad & Gandhinagar)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#dec1af] bg-[#231d2a] px-2.5 py-1 rounded-full border border-[#393240]">
                {venues.length} Grounds Synced
              </span>
              <button
                onClick={() => setFallbackMode(false)}
                className="text-[11px] text-[#ffba27] hover:underline"
              >
                Try Standard Map
              </button>
            </div>
          </div>

          {/* Radar Canvas with interactive grounds */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            {/* Concentric rings */}
            <div className="absolute w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-full border border-[#f77f00]/30 flex items-center justify-center pointer-events-none">
              <div className="w-[200px] h-[200px] rounded-full border border-[#ffba27]/30 flex items-center justify-center">
                <div className="w-[110px] h-[110px] rounded-full border border-sky-400/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-sky-400/40"></div>
                </div>
              </div>
            </div>

            {/* Sweep effect */}
            <div
              className="absolute w-[140px] sm:w-[160px] h-[140px] sm:h-[160px] top-[calc(50%-140px)] sm:top-[calc(50%-160px)] left-[calc(50%-140px)] sm:left-[calc(50%-160px)] origin-bottom-right pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(247, 127, 0, 0.35) 0deg, transparent 55deg)',
                animation: 'spin 4s linear infinite',
                borderRadius: '100% 0 0 0',
              }}
            />

            {/* Ground Radar Blips */}
            <div className="absolute inset-0 z-10">
              {venues.map((v, i) => {
                const centerLat = userCoords ? userCoords.lat : 23.0800;
                const centerLng = userCoords ? userCoords.lng : 72.5600;
                const dy = (v.coordinates.lat - centerLat) * 111;
                const dx = (v.coordinates.lng - centerLng) * 102;
                const posX = 50 + (dx * 120) / 18;
                const posY = 50 - (dy * 120) / 18;
                const isSelected = selectedVenue?.id === v.id;

                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      onSelectVenue(v);
                      if (onOpenRadarModal) onOpenRadarModal(v);
                    }}
                    style={{
                      left: `${Math.max(10, Math.min(90, posX))}%`,
                      top: `${Math.max(12, Math.min(88, posY))}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    <div
                      className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 border transition-all ${
                        isSelected
                          ? 'bg-[#ffba27] text-black border-white ring-2 ring-[#ffba27]'
                          : 'bg-[#1f1926] text-[#eadff1] border-[#f77f00] hover:bg-[#f77f00] hover:text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f77f00]"></span>
                      <span className="truncate max-w-[80px] sm:max-w-[120px]">{v.name.split(' ')[0]}</span>
                      <span className="text-[#ffb784]">₹{v.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Ground Navigation Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 z-10 pt-2 border-t border-[#2e2735]">
            {venues.slice(0, 4).map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  onSelectVenue(v);
                  if (onOpenRadarModal) onOpenRadarModal(v);
                }}
                className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedVenue?.id === v.id
                    ? 'border-[#ffba27] bg-[#2e2735]'
                    : 'border-[#393240] bg-[#1f1926] hover:border-[#f77f00]'
                }`}
              >
                <div className="font-bold text-white truncate">{v.name}</div>
                <div className="text-[10px] text-[#ffba27] truncate">{v.artist}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[#ffb784] font-bold">₹{v.price}</span>
                  <span className="text-[9px] text-[#dec1af] bg-[#231d2a] px-1.5 py-0.5 rounded">
                    Open Radar ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Control Overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button
          onClick={onRequestUserLocation}
          className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold border shadow-lg flex items-center gap-1.5 transition-all ${
            userCoords
              ? 'bg-sky-950/90 border-sky-500 text-sky-300'
              : 'bg-[#16111d]/90 border-[#393240] text-[#eadff1] hover:text-[#ffba27]'
          }`}
        >
          <LocateFixed className="w-3.5 h-3.5 text-sky-400" />
          {userCoords ? 'GPS Active (Near Me)' : 'Detect My Location'}
        </button>

        {selectedVenue && onOpenRadarModal && (
          <button
            onClick={() => onOpenRadarModal(selectedVenue)}
            className="px-3 py-1.5 rounded-full bg-[#f77f00] hover:bg-[#ea580c] text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Compass className="w-3.5 h-3.5" /> Fullscreen Radar for {selectedVenue.name}
          </button>
        )}
      </div>

      {/* Selected Venue Floating Quick-Card */}
      {selectedVenue && (
        <div className="absolute bottom-4 right-4 z-20 max-w-xs bg-[#1f1926]/95 backdrop-blur-md border border-[#f77f00] rounded-xl p-3 shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] text-[#ffba27] font-bold uppercase">{selectedVenue.artist}</span>
              <h4 className="text-sm font-bold text-white line-clamp-1">{selectedVenue.name}</h4>
              <p className="text-[11px] text-[#c9bccc] line-clamp-1">{selectedVenue.location}</p>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-[#ffb784]">₹{selectedVenue.price}</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={selectedVenue.bookmyshowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 rounded bg-[#e11d48] text-white text-[10px] font-bold text-center flex items-center justify-center gap-1"
            >
              BookMyShow ↗
            </a>
            <a
              href={selectedVenue.districtUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 rounded bg-[#8b5cf6] text-white text-[10px] font-bold text-center flex items-center justify-center gap-1"
            >
              District App ↗
            </a>
          </div>
          <div className="mt-2 flex gap-1.5">
            {onOpenRadarModal && (
              <button
                onClick={() => onOpenRadarModal(selectedVenue)}
                className="flex-1 py-1.5 rounded-lg bg-[#2e2735] hover:bg-[#393240] text-[#ffba27] text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Compass className="w-3 h-3" /> Radar View
              </button>
            )}
            <button
              onClick={() => onBookTickets(selectedVenue)}
              className="flex-1 py-1.5 rounded-lg bg-[#f77f00] hover:bg-[#ea580c] text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <Ticket className="w-3 h-3" /> Book Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
