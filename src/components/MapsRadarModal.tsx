import React, { useState } from 'react';
import { Venue } from '../data/garbaVenues';
import { calculateDistanceKm } from '../utils/distance';
import {
  X,
  Navigation,
  Compass,
  MapPin,
  ExternalLink,
  Ticket,
  Car,
  Clock,
  Sparkles,
  Layers,
  Radio,
  LocateFixed,
  Maximize2,
} from 'lucide-react';

interface MapsRadarModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  allVenues: Venue[];
  onSelectVenue: (venue: Venue) => void;
  onBookTickets: (venue: Venue) => void;
  userCoords: { lat: number; lng: number } | null;
  onRequestUserLocation: () => void;
}

export const MapsRadarModal: React.FC<MapsRadarModalProps> = ({
  venue,
  isOpen,
  onClose,
  allVenues,
  onSelectVenue,
  onBookTickets,
  userCoords,
  onRequestUserLocation,
}) => {
  const [radarRangeKm, setRadarRangeKm] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<'radar' | 'gmap' | 'transit'>('radar');

  if (!isOpen || !venue) return null;

  // Center coordinate reference: userCoords or current venue
  const centerLat = userCoords ? userCoords.lat : 23.0425; // Amdavad Central
  const centerLng = userCoords ? userCoords.lng : 72.5320;

  // Calculate distance for all venues
  const venuesWithDist = allVenues.map((v) => {
    const dist = calculateDistanceKm(centerLat, centerLng, v.coordinates.lat, v.coordinates.lng);
    return { ...v, distKm: dist };
  });

  const selectedVenueDist = calculateDistanceKm(
    centerLat,
    centerLng,
    venue.coordinates.lat,
    venue.coordinates.lng
  );

  // Google Maps directions URL
  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    venue.name + ', ' + venue.location
  )}&destination_place_id=${venue.coordinates.lat},${venue.coordinates.lng}`;

  // Embedded Google Map search URL (works 100% reliably in any browser)
  const gmapsEmbedUrl = `https://maps.google.com/maps?q=${venue.coordinates.lat},${venue.coordinates.lng}&hl=en&z=14&output=embed`;

  return (
    <div className="fixed inset-0 z-50 bg-[#110c18]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#1f1926] border border-[#ffba27]/50 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative my-4">
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#231d2a] via-[#2e2735] to-[#231d2a] border-b border-[#393240] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f77f00]/20 border border-[#f77f00]/40 flex items-center justify-center text-[#ffba27] relative">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="w-2 h-2 rounded-full bg-[#f77f00] absolute top-1 right-1 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#f77f00] text-white text-[10px] font-bold uppercase tracking-wider">
                  Live Maps Radar
                </span>
                <span className="text-xs text-[#ffba27] font-semibold">
                  Twin-City Geolocation Active
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-playfair text-white mt-0.5">
                {venue.name} • Location Radar
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#2e2735] hover:bg-[#393240] text-white hover:text-[#ffba27] flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls & Quick GPS */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#16111d] border-b border-[#2e2735] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-[#f77f00] text-white shadow-md'
                  : 'bg-[#231d2a] text-[#c9bccc] hover:text-white border border-[#393240]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#ffba27]" /> 360° Radar Sweep
            </button>
            <button
              onClick={() => setActiveTab('gmap')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'gmap'
                  ? 'bg-[#f77f00] text-white shadow-md'
                  : 'bg-[#231d2a] text-[#c9bccc] hover:text-white border border-[#393240]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#ffba27]" /> Google Maps Satellite
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRequestUserLocation}
              className={`px-3 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 transition-all ${
                userCoords
                  ? 'bg-sky-950 border-sky-500 text-sky-300'
                  : 'bg-[#231d2a] border-[#393240] text-[#eadff1] hover:text-[#ffba27]'
              }`}
            >
              <LocateFixed className="w-3.5 h-3.5 text-sky-400" />
              {userCoords ? 'GPS: Exact Location Locked' : 'Detect My Exact Location'}
            </button>
            <a
              href={gmapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" /> Navigate in Google Maps App ↗
            </a>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: 360° RADAR SWEEP DISPLAY */}
          {activeTab === 'radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Radar Canvas Visualizer */}
              <div className="lg:col-span-7 bg-[#110c18] border border-[#393240] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px] shadow-inner">
                {/* Concentric Radar Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Outer Ring */}
                  <div className="w-[340px] h-[340px] rounded-full border border-[#f77f00]/25 flex items-center justify-center relative">
                    <span className="absolute top-1 text-[9px] text-[#ffba27]/50 font-mono">15 KM</span>
                    {/* Mid Ring */}
                    <div className="w-[240px] h-[240px] rounded-full border border-[#ffba27]/25 flex items-center justify-center relative">
                      <span className="absolute top-1 text-[9px] text-[#ffba27]/50 font-mono">10 KM</span>
                      {/* Inner Ring */}
                      <div className="w-[140px] h-[140px] rounded-full border border-sky-400/30 flex items-center justify-center relative">
                        <span className="absolute top-1 text-[9px] text-sky-400/50 font-mono">5 KM</span>
                        {/* Center Point */}
                        <div className="w-3 h-3 rounded-full bg-sky-400 ring-4 ring-sky-400/30 shadow-[0_0_12px_#38bdf8]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Crosshairs */}
                  <div className="absolute w-[360px] h-[1px] bg-[#393240]/60"></div>
                  <div className="absolute h-[360px] w-[1px] bg-[#393240]/60"></div>

                  {/* Rotating Radar Sweep Line */}
                  <div
                    className="absolute w-[170px] h-[170px] top-[calc(50%-170px)] left-[calc(50%-170px)] origin-bottom-right"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(247, 127, 0, 0.4) 0deg, transparent 60deg)',
                      animation: 'spin 4s linear infinite',
                      borderRadius: '100% 0 0 0',
                    }}
                  ></div>
                </div>

                {/* Radar Ground Markers */}
                <div className="relative w-full h-[360px] z-10">
                  {venuesWithDist.map((v) => {
                    // Position calculations relative to center
                    // Latitude delta: 1 deg lat ~ 111 km
                    // Longitude delta: 1 deg lng ~ 102 km
                    const dyKm = (v.coordinates.lat - centerLat) * 111;
                    const dxKm = (v.coordinates.lng - centerLng) * 102;

                    // Scale to fit inside 340px circle (max radius ~ 160px for ~ 18km)
                    const scaleFactor = 160 / radarRangeKm;
                    const leftPx = 50 + (dxKm * scaleFactor) / 3.4;
                    const topPx = 50 - (dyKm * scaleFactor) / 3.4;

                    const isCurrent = v.id === venue.id;

                    return (
                      <div
                        key={v.id}
                        onClick={() => onSelectVenue(v)}
                        style={{
                          left: `${Math.max(8, Math.min(92, leftPx))}%`,
                          top: `${Math.max(8, Math.min(92, topPx))}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all z-20 ${
                          isCurrent ? 'scale-125 z-30' : 'hover:scale-110'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all ${
                            isCurrent
                              ? 'bg-[#ffba27] text-[#110c18] ring-4 ring-[#ffba27]/50 font-bold'
                              : 'bg-[#f77f00] text-white hover:ring-2 hover:ring-white'
                          }`}
                        >
                          <span className="text-[10px] font-bold">★</span>
                        </div>

                        {/* Hover Tooltip */}
                        <div
                          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-[10px] whitespace-nowrap shadow-xl border pointer-events-none transition-all ${
                            isCurrent
                              ? 'bg-[#2e2735] text-[#ffba27] border-[#ffba27] font-bold opacity-100'
                              : 'bg-[#16111d]/90 text-white border-[#393240] opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {v.name} ({v.distKm} km)
                        </div>
                      </div>
                    );
                  })}

                  {/* User Position Marker */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <div className="px-2 py-0.5 rounded-full bg-sky-950 border border-sky-400 text-sky-300 text-[9px] font-bold shadow-md -translate-y-6 -translate-x-1/2 whitespace-nowrap">
                      {userCoords ? 'You (GPS)' : 'Amdavad Central'}
                    </div>
                  </div>
                </div>

                {/* Radar Range Slider */}
                <div className="w-full flex items-center justify-between text-[11px] text-[#dec1af] pt-2 border-t border-[#2e2735] z-10">
                  <span className="flex items-center gap-1 font-mono">
                    <Radio className="w-3.5 h-3.5 text-[#ffba27] animate-pulse" /> Range: {radarRangeKm} KM
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRadarRangeKm(10)}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        radarRangeKm === 10 ? 'bg-[#f77f00] text-white font-bold' : 'bg-[#231d2a]'
                      }`}
                    >
                      10km
                    </button>
                    <button
                      onClick={() => setRadarRangeKm(15)}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        radarRangeKm === 15 ? 'bg-[#f77f00] text-white font-bold' : 'bg-[#231d2a]'
                      }`}
                    >
                      15km
                    </button>
                    <button
                      onClick={() => setRadarRangeKm(25)}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        radarRangeKm === 25 ? 'bg-[#f77f00] text-white font-bold' : 'bg-[#231d2a]'
                      }`}
                    >
                      25km
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Focused Ground Radar Card */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="p-4 rounded-xl bg-[#231d2a] border border-[#393240] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-[#ffba27] font-bold uppercase tracking-wider block">
                        Target Ground
                      </span>
                      <h3 className="text-lg font-bold font-playfair text-white">{venue.name}</h3>
                      <p className="text-xs text-[#c9bccc] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#f77f00] shrink-0" />
                        <span>{venue.location}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#dec1af] block">Proximity</span>
                      <span className="text-base font-extrabold text-[#ffb784]">
                        {selectedVenueDist} KM
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#16111d] flex items-center justify-between text-xs">
                    <span className="text-[#dec1af]">Coordinates:</span>
                    <span className="font-mono text-[#ffba27] font-bold">
                      {venue.coordinates.lat.toFixed(4)}° N, {venue.coordinates.lng.toFixed(4)}° E
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#1f1926] border border-[#393240]">
                      <span className="text-[10px] text-[#dec1af] uppercase block">Parking & Valet</span>
                      <strong className="text-white text-xs">{venue.parkingSlots}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1f1926] border border-[#393240]">
                      <span className="text-[10px] text-[#dec1af] uppercase block">Aarti & Timings</span>
                      <strong className="text-[#ffba27] text-xs">{venue.timings}</strong>
                    </div>
                  </div>

                  {/* Direct Platform Links */}
                  <div className="pt-2 border-t border-[#393240]">
                    <span className="text-[10px] font-bold text-[#dec1af] uppercase tracking-wider block mb-2">
                      Direct Ticket Listings
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={venue.bookmyshowUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1 shadow-md"
                      >
                        BookMyShow <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={venue.districtUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1 shadow-md"
                      >
                        District App <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-2">
                  <a
                    href={gmapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Navigation className="w-4 h-4" /> Start Turn-by-Turn GPS Directions
                  </a>
                  <button
                    onClick={() => {
                      onClose();
                      onBookTickets(venue);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#f77f00] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <Ticket className="w-4 h-4" /> Instant Pass Reservation (₹{venue.price})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE GOOGLE MAPS EMBEDDED SATELLITE/ROAD VIEW */}
          {activeTab === 'gmap' && (
            <div className="w-full space-y-4">
              <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#393240] shadow-2xl relative bg-[#110c18]">
                <iframe
                  title="Google Maps Location"
                  src={gmapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                <div className="absolute top-3 left-3 bg-[#110c18]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#393240] text-xs font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#ffba27]" />
                  <span>{venue.name}</span>
                </div>

                <a
                  href={gmapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-[#f77f00] hover:bg-[#ea580c] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" /> Open in Google Maps Full App ↗
                </a>
              </div>

              {/* Other Grounds Near this Venue */}
              <div>
                <h4 className="text-xs font-bold text-[#ffba27] uppercase tracking-wider mb-2">
                  Other Popular Grounds Nearby on SG Highway & Gandhinagar:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {venuesWithDist
                    .filter((v) => v.id !== venue.id)
                    .slice(0, 3)
                    .map((nearV) => (
                      <div
                        key={nearV.id}
                        onClick={() => onSelectVenue(nearV)}
                        className="p-2.5 rounded-xl bg-[#231d2a] border border-[#393240] hover:border-[#f77f00] cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-white block line-clamp-1">{nearV.name}</strong>
                          <span className="text-[10px] text-[#ffba27]">{nearV.artist}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#ffb784]">
                          {nearV.distKm} km
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#16111d] border-t border-[#2e2735] flex items-center justify-between text-xs text-[#dec1af] px-6">
          <span>Official Gujarat Tourism & Smart City GIS Coordinates Verified</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2e2735] hover:bg-[#393240] text-white font-semibold"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
