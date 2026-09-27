import React, { useState, useMemo } from 'react';
import {
  GARBA_VENUES,
  NAVRATRI_DAYS,
  Venue,
} from './data/garbaVenues';
import { GoogleMapView } from './components/GoogleMapView';
import { BookingModal } from './components/BookingModal';
import { SeasonPassModal } from './components/SeasonPassModal';
import { VenueDetailsModal } from './components/VenueDetailsModal';
import { BookMyShowDistrictModal } from './components/BookMyShowDistrictModal';
import { MapsRadarModal } from './components/MapsRadarModal';
import { calculateDistanceKm } from './utils/distance';
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Car,
  Ticket,
  ExternalLink,
  Navigation,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  Map,
  Compass,
  Radio,
  SlidersHorizontal,
  FlameKindling,
  Smartphone,
  Info,
} from 'lucide-react';

export default function App() {
  // Navigation / Filter States
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [selectedCityZone, setSelectedCityZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'popular' | 'rating' | 'price-low' | 'price-high' | 'near'
  >('popular');
  const [filterParking, setFilterParking] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSetting, setFilterSetting] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'bms' | 'district'>('all');

  // View Mode: 'list' | 'map' | 'split'
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');

  // Modals
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isSeasonPassOpen, setIsSeasonPassOpen] = useState<boolean>(false);
  const [detailVenue, setDetailVenue] = useState<Venue | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isBmsDistrictModalOpen, setIsBmsDistrictModalOpen] = useState<boolean>(false);
  const [radarVenue, setRadarVenue] = useState<Venue | null>(null);
  const [isRadarOpen, setIsRadarOpen] = useState<boolean>(false);

  // Map Selected Venue
  const [mapSelectedVenue, setMapSelectedVenue] = useState<Venue | null>(null);

  // User Geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortBy('near');
        setGeoError(null);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable', err);
        // Default to Vastrapur Ahmedabad as demo anchor
        setUserCoords({ lat: 23.0425, lng: 72.5320 });
        setSortBy('near');
        setGeoError('Using Amdavad Central as reference point.');
      }
    );
  };

  // Filter and Sort venues
  const filteredVenues = useMemo(() => {
    return GARBA_VENUES.filter((v) => {
      // Hub filter
      if (selectedHub !== 'all' && v.hub !== selectedHub) {
        return false;
      }

      // City Zone selector
      if (selectedCityZone === 'amd-west') {
        if (!['sg-highway', 'sindhu-bhavan', 'bopal'].includes(v.hub)) return false;
      } else if (selectedCityZone === 'amd-central') {
        if (!['gmdc', 'navrangpura'].includes(v.hub)) return false;
      } else if (selectedCityZone === 'gandhinagar') {
        if (v.city !== 'Gandhinagar') return false;
      }

      // Parking filter
      if (filterParking !== 'all' && v.parking !== filterParking) {
        return false;
      }

      // Setting filter
      if (filterSetting !== 'all' && v.setting !== filterSetting) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          v.name.toLowerCase().includes(query) ||
          v.artist.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query) ||
          v.hubName.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'near') {
        const refLat = userCoords ? userCoords.lat : 23.0425;
        const refLng = userCoords ? userCoords.lng : 72.5320;
        const distA = calculateDistanceKm(refLat, refLng, a.coordinates.lat, a.coordinates.lng);
        const distB = calculateDistanceKm(refLat, refLng, b.coordinates.lat, b.coordinates.lng);
        return distA - distB;
      }
      // Default: popular
      return b.popularityScore - a.popularityScore;
    });
  }, [
    selectedHub,
    selectedCityZone,
    filterParking,
    filterSetting,
    searchQuery,
    sortBy,
    userCoords,
  ]);

  const activeNavratriDay = NAVRATRI_DAYS.find((d) => d.dayNumber === selectedDay) || NAVRATRI_DAYS[0];

  const handleOpenBooking = (v: Venue) => {
    setBookingVenue(v);
    setIsBookingOpen(true);
  };

  const handleOpenDetails = (v: Venue) => {
    setDetailVenue(v);
    setIsDetailOpen(true);
  };

  const handleOpenRadar = (v: Venue) => {
    setRadarVenue(v);
    setMapSelectedVenue(v);
    setIsRadarOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#16111d] text-[#eadff1] font-sans antialiased selection:bg-[#f77f00] selection:text-white">
      {/* 1. TOP MARIGOLD ANNOUNCEMENT BAR */}
      <header className="fixed top-0 left-0 w-full z-50 shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
        <div className="bg-[#b20213] text-[#ffdad6] py-1.5 px-4 lg:px-8 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#ffba27]" />
          <span>
            Early Bird passes live! Apply promo code{' '}
            <strong className="text-[#ffba27] tracking-wider uppercase font-bold">
              GARBA2025
            </strong>{' '}
            for flat ₹250 off on All-Nights Season Pass
          </span>
          <button
            onClick={() => setIsSeasonPassOpen(true)}
            className="ml-2 underline font-bold text-[#ffba27] hover:text-white"
          >
            Claim Now
          </button>
        </div>

        {/* 2. MAIN NAVBAR */}
        <div className="bg-[#16111d]/90 backdrop-blur-xl border-b border-[#2e2735]">
          <div className="h-20 w-full px-4 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Brand Logo & Location Dropdown */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSelectedHub('all')}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f77f00] to-[#ffba27] flex items-center justify-center shadow-lg shadow-[#f77f00]/30 text-white font-bold font-playfair text-xl">
                  R
                </div>
                <div className="flex flex-col">
                  <span className="font-playfair text-2xl font-extrabold text-[#ffb784] tracking-tight leading-none">
                    RaasUtsav
                  </span>
                  <span className="text-[10px] text-[#ffba27] font-semibold tracking-widest uppercase mt-0.5">
                    Amdavad & Gandhinagar
                  </span>
                </div>
              </div>

              {/* City Zone Dropdown */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2e2735] text-[#eadff1] border border-[#393240]">
                <MapPin className="w-4 h-4 text-[#ffb784]" />
                <select
                  value={selectedCityZone}
                  onChange={(e) => setSelectedCityZone(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#eadff1] focus:outline-none cursor-pointer pr-1"
                >
                  <option className="bg-[#231d2a]" value="all">
                    Ahmedabad & Gandhinagar (All)
                  </option>
                  <option className="bg-[#231d2a]" value="amd-west">
                    Ahmedabad West (SG Highway & Bopal)
                  </option>
                  <option className="bg-[#231d2a]" value="amd-central">
                    Ahmedabad Central (Vastrapur / GMDC)
                  </option>
                  <option className="bg-[#231d2a]" value="gandhinagar">
                    Gandhinagar (Kudasan & GIFT City)
                  </option>
                </select>
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9bccc]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search grounds, garba artists (Atul Purohit, Kinjal Dave)..."
                  className="w-full bg-[#1f1926] text-[#eadff1] placeholder:text-[#887890] pl-10 pr-4 py-2 rounded-full text-xs border border-[#393240] focus:outline-none focus:border-[#f77f00] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#c9bccc] hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Nav Links & CTA */}
            <div className="flex items-center gap-4">
              <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold">
                <a
                  href="#schedule"
                  className="text-[#ffb784] hover:text-white transition-colors"
                >
                  9 Nights Schedule
                </a>
                <a
                  href="#venues-section"
                  className="text-[#dec1af] hover:text-white transition-colors"
                >
                  Popular Grounds
                </a>
                <button
                  onClick={() => setIsBmsDistrictModalOpen(true)}
                  className="text-[#ffba27] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" /> BookMyShow & District Hubs
                </button>
                <button
                  onClick={() => setIsSeasonPassOpen(true)}
                  className="text-[#dec1af] hover:text-white transition-colors"
                >
                  Passes & Combos
                </button>
                <a
                  href="#commute-section"
                  className="text-[#dec1af] hover:text-white transition-colors"
                >
                  Valet & Parking Guide
                </a>
              </nav>

              {/* Passholder Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#2e2735]">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white">Garba Premi</span>
                  <span className="text-[10px] text-[#ffba27]">Passholder</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f77f00] to-[#b20213] p-0.5 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="User Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FESTIVE ZONES TICKER RIBBON */}
        <div className="bg-[#110c18]/95 backdrop-blur-md px-4 lg:px-8 border-b border-[#2e2735]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 py-1.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap text-xs">
              <span className="text-[#ffba27] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f77f00] animate-pulse"></span>
                Festive Zones:
              </span>
              <button
                onClick={() => setSelectedHub('sg-highway')}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedHub === 'sg-highway'
                    ? 'bg-[#f77f00] text-white font-bold'
                    : 'bg-[#1f1926] text-[#dec1af] hover:bg-[#2e2735] hover:text-white'
                }`}
              >
                Ahmedabad West (SG Highway, Sindhu Bhavan, Bopal)
              </button>
              <button
                onClick={() => setSelectedHub('gmdc')}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedHub === 'gmdc'
                    ? 'bg-[#f77f00] text-white font-bold'
                    : 'bg-[#1f1926] text-[#dec1af] hover:bg-[#2e2735] hover:text-white'
                }`}
              >
                Ahmedabad Central (Navrangpura, University Ground)
              </button>
              <button
                onClick={() => setSelectedHub('infocity')}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedHub === 'infocity'
                    ? 'bg-[#f77f00] text-white font-bold'
                    : 'bg-[#1f1926] text-[#dec1af] hover:bg-[#2e2735] hover:text-white'
                }`}
              >
                Gandhinagar (Kudasan, GIFT City Arena, Sector 11)
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-[#ffb784]">
              <Flame className="w-3.5 h-3.5 text-[#ffba27]" />
              <span>Pratham Aarti 07:30 PM Tonight</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="pt-36 w-full">
        {/* TOP MARIGOLD FESTIVAL BANNER */}
        <section className="w-full bg-[#110c18] px-4 lg:px-8 py-2.5 border-b border-[#2e2735]">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-[#ffba27]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#f77f00] text-white font-bold text-[10px]">
                ★
              </span>
              <span className="text-[#eadff1]">
                Official Ticketing Partner:{' '}
                <strong className="text-[#ffb784]">
                  Gujarat Cultural Garba Federation 2025
                </strong>{' '}
                (Amdavad & Gandhinagar Chapter)
              </span>
            </div>

            <div className="flex items-center gap-4 text-[#dec1af] flex-wrap">
              <span className="flex items-center gap-1 text-[#ffb784]">
                <Car className="w-3.5 h-3.5 text-[#ffba27]" /> 35,000+ Verified Parking Slots
              </span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span className="flex items-center gap-1 text-[#ffb784]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ffba27]" /> 100% Genuine Encrypted RFID Bands
              </span>
              <span className="hidden md:inline opacity-30">•</span>
              <span className="flex items-center gap-1 text-[#ffba27]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Metro Feeder Shuttles Active
              </span>
            </div>
          </div>
        </section>

        {/* HERO SECTION */}
        <section className="relative px-4 lg:px-8 py-10 bg-gradient-to-b from-[#110c18] via-[#16111d] to-[#16111d] overflow-hidden">
          {/* Ambient Diya Glow Spots */}
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#f77f00]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#ffba27]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2e2735] text-[#ffb784] text-xs font-bold uppercase tracking-wider mb-3 border border-[#393240] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#f77f00] animate-ping" />
                  Amdavad & Gandhinagar Navratri Mahotsav 2025
                </div>

                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-[#ffb784] font-bold tracking-tight leading-tight">
                  Divine 9 Nights of Royal Raas & Traditional Garba
                </h1>

                <p className="text-base sm:text-lg text-[#dec1af] mt-3 max-w-2xl leading-relaxed">
                  Reserve verified digital season passes, lawn tickets, and guaranteed valet parking
                  across the most prestigious heritage grounds and high-energy arenas of
                  Ahmedabad & Gandhinagar.
                </p>

                {/* Quick Action Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsBmsDistrictModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xs font-bold shadow-lg hover:brightness-110 flex items-center gap-2 transition-all"
                  >
                    <Smartphone className="w-4 h-4" /> View BookMyShow & District All-Listings
                  </button>
                  <button
                    onClick={() => handleOpenRadar(filteredVenues[0] || GARBA_VENUES[0])}
                    className="px-4 py-2 rounded-xl bg-[#f77f00] hover:bg-[#ea580c] text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all"
                  >
                    <Compass className="w-4 h-4" /> Open 360° Maps Radar
                  </button>
                  <button
                    onClick={() => {
                      const nextMode = viewMode === 'list' ? 'split' : 'list';
                      setViewMode(nextMode);
                      if (nextMode === 'split') {
                        setTimeout(() => {
                          document.getElementById('map-radar-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2e2735] hover:bg-[#393240] text-[#ffba27] text-xs font-bold border border-[#393240] flex items-center gap-2 transition-all"
                  >
                    <Map className="w-4 h-4" />{' '}
                    {viewMode === 'list' ? 'Inline Map Split' : 'Hide Inline Map'}
                  </button>
                  <button
                    onClick={() => setIsSeasonPassOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#231d2a] hover:bg-[#2e2735] text-white border border-[#393240] text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Ticket className="w-4 h-4 text-[#ffba27]" /> Season Pass (₹4,299)
                  </button>
                </div>
              </div>

              {/* Live Pulse Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="p-4 bg-[#1f1926] rounded-2xl text-center border border-[#393240] shadow-md">
                  <span className="font-playfair text-3xl font-extrabold text-[#ffba27] block">
                    120+
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-[#dec1af] font-semibold">
                    Verified Grounds
                  </span>
                </div>
                <div className="p-4 bg-[#1f1926] rounded-2xl text-center border border-[#393240] shadow-md">
                  <span className="font-playfair text-3xl font-extrabold text-[#ffb784] block">
                    2.4M
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-[#dec1af] font-semibold">
                    Fervent Revelers
                  </span>
                </div>
                <div className="p-4 bg-[#1f1926] rounded-2xl text-center border border-[#393240] shadow-md">
                  <span className="font-playfair text-3xl font-extrabold text-[#ffba27] block">
                    100%
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-[#dec1af] font-semibold">
                    Reserved Parking
                  </span>
                </div>
                <div className="p-4 bg-[#1f1926] rounded-2xl text-center border border-[#393240] shadow-md">
                  <span className="font-playfair text-3xl font-extrabold text-[#ffb784] block">
                    36+
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-[#dec1af] font-semibold">
                    Folk Maestros
                  </span>
                </div>
              </div>
            </div>

            {/* Fast Filter Enclave Pills */}
            <div className="pt-4 border-t border-[#2e2735]">
              <p className="text-xs uppercase tracking-wider text-[#ffba27] font-bold mb-2.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#ffba27]" /> Fast Filter by Festive Twin-City Enclaves:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedHub('all')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'all'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  All Twin-City Venues (120+)
                </button>
                <button
                  onClick={() => setSelectedHub('sg-highway')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'sg-highway'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  SG Highway (AHD)
                </button>
                <button
                  onClick={() => setSelectedHub('sindhu-bhavan')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'sindhu-bhavan'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  Sindhu Bhavan (AHD)
                </button>
                <button
                  onClick={() => setSelectedHub('infocity')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'infocity'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  Infocity (Gandhinagar)
                </button>
                <button
                  onClick={() => setSelectedHub('gift-city')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'gift-city'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  GIFT City Arena (GNR)
                </button>
                <button
                  onClick={() => setSelectedHub('gmdc')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'gmdc'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  GMDC Ground (AHD)
                </button>
                <button
                  onClick={() => setSelectedHub('bopal')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'bopal'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  Bopal & Ambli (AHD)
                </button>
                <button
                  onClick={() => setSelectedHub('kudasan')}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedHub === 'kudasan'
                      ? 'bg-[#f77f00] text-white font-bold shadow-md'
                      : 'bg-[#231d2a] text-[#eadff1] hover:text-[#ffb784] border border-[#393240]'
                  }`}
                >
                  Kudasan (Gandhinagar)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 9-DAY SACRED NAVRATRI CALENDAR TRACKER BAR */}
        <section id="schedule" className="w-full bg-[#1f1926] px-4 lg:px-8 py-4 border-y border-[#2e2735]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#ffb784]" />
                <span className="font-bold text-sm text-white">Select Festival Night</span>
                <span className="text-xs text-[#dec1af] hidden md:inline">
                  • Color-coded traditional Navratri rituals & avatar blessings ({activeNavratriDay.deviName})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#ffba27] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#ffba27] inline-block animate-pulse"></span>
                <span>Pratham Aarti 07:30 PM Tonight</span>
              </div>
            </div>

            {/* Scrollable Day Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 overflow-x-auto pb-1 no-scrollbar">
              {NAVRATRI_DAYS.map((day) => {
                const isActive = selectedDay === day.dayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDay(day.dayNumber)}
                    className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl transition-all text-center group ${
                      isActive
                        ? 'bg-[#f77f00] text-white shadow-lg ring-2 ring-[#ffba27]'
                        : 'bg-[#231d2a] text-[#eadff1] hover:bg-[#2e2735] border border-[#393240]'
                    }`}
                  >
                    {day.specialBadge && (
                      <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#b20213] text-white text-[9px] uppercase font-bold tracking-wider shadow-sm">
                        {day.specialBadge}
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        isActive ? 'text-white' : 'text-[#dec1af] group-hover:text-[#ffb784]'
                      }`}
                    >
                      Day {day.dayNumber}
                    </span>
                    <span className="text-base font-extrabold my-1 font-playfair">{day.dateStr}</span>
                    <span className="text-[11px] line-clamp-1 opacity-90">{day.tithi}</span>
                    <span
                      className={`w-full mt-1 py-0.5 rounded-full text-[9px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#2e2735] text-[#ffba27]'
                      }`}
                    >
                      {day.colorName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SORT & FILTER CONTROL DECK */}
        <section className="w-full bg-[#16111d] px-4 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#1f1926] p-4 rounded-2xl border border-[#393240] shadow-md">
            {/* Sort Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <span className="text-xs uppercase text-[#ffba27] tracking-wider whitespace-nowrap mr-1 font-bold">
                Sort:
              </span>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === 'popular'
                    ? 'bg-[#2e2735] text-[#ffb784] border border-[#f77f00] shadow-sm'
                    : 'bg-[#231d2a] text-[#dec1af] hover:text-white border border-[#393240]'
                }`}
              >
                Most Popular
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === 'rating'
                    ? 'bg-[#2e2735] text-[#ffb784] border border-[#f77f00] shadow-sm'
                    : 'bg-[#231d2a] text-[#dec1af] hover:text-white border border-[#393240]'
                }`}
              >
                Highest Rated
              </button>
              <button
                onClick={() => setSortBy('price-low')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === 'price-low'
                    ? 'bg-[#2e2735] text-[#ffb784] border border-[#f77f00] shadow-sm'
                    : 'bg-[#231d2a] text-[#dec1af] hover:text-white border border-[#393240]'
                }`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => setSortBy('price-high')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  sortBy === 'price-high'
                    ? 'bg-[#2e2735] text-[#ffb784] border border-[#f77f00] shadow-sm'
                    : 'bg-[#231d2a] text-[#dec1af] hover:text-white border border-[#393240]'
                }`}
              >
                Price: High to Low
              </button>
              <button
                onClick={requestUserLocation}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                  sortBy === 'near'
                    ? 'bg-sky-950 text-sky-300 border border-sky-500 shadow-sm'
                    : 'bg-[#231d2a] text-[#dec1af] hover:text-white border border-[#393240]'
                }`}
              >
                <Navigation className="w-3 h-3 text-sky-400" />
                Near Me {userCoords ? '✓' : ''}
              </button>
            </div>

            {/* Quick Filter Dropdowns + View Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Parking */}
              <div className="relative">
                <select
                  value={filterParking}
                  onChange={(e) => setFilterParking(e.target.value)}
                  className="bg-[#231d2a] text-[#eadff1] text-xs font-semibold rounded-xl pl-3 pr-8 py-2 border border-[#393240] focus:outline-none focus:border-[#f77f00] cursor-pointer"
                >
                  <option value="all">Parking: All Types</option>
                  <option value="free">Free Ground Parking</option>
                  <option value="valet">Valet Available</option>
                  <option value="covered">Covered Multi-Level</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#dec1af]" />
              </div>

              {/* Pass Category */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#231d2a] text-[#eadff1] text-xs font-semibold rounded-xl pl-3 pr-8 py-2 border border-[#393240] focus:outline-none focus:border-[#f77f00] cursor-pointer"
                >
                  <option value="all">Pass: All Categories</option>
                  <option value="regular">Regular Raas Pass</option>
                  <option value="vip">VIP Royal Lounge</option>
                  <option value="season">9-Nights Season Combo</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#dec1af]" />
              </div>

              {/* Setting */}
              <div className="relative">
                <select
                  value={filterSetting}
                  onChange={(e) => setFilterSetting(e.target.value)}
                  className="bg-[#231d2a] text-[#eadff1] text-xs font-semibold rounded-xl pl-3 pr-8 py-2 border border-[#393240] focus:outline-none focus:border-[#f77f00] cursor-pointer"
                >
                  <option value="all">Setting: All Grounds</option>
                  <option value="lawn">Natural Lush Lawn</option>
                  <option value="dome">Air-Cooled AC Dome</option>
                  <option value="club">Exclusive Heritage Club</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#dec1af]" />
              </div>

              {/* View Switcher: List vs Map */}
              <div className="flex items-center gap-1 bg-[#231d2a] p-1 rounded-xl border border-[#393240]">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#f77f00] text-white shadow-sm'
                      : 'text-[#c9bccc] hover:text-white'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'split'
                      ? 'bg-[#f77f00] text-white shadow-sm'
                      : 'text-[#c9bccc] hover:text-white'
                  }`}
                >
                  <Map className="w-3 h-3" /> Map + Cards
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-[#f77f00] text-white shadow-sm'
                      : 'text-[#c9bccc] hover:text-white'
                  }`}
                >
                  Full Map
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MAP BANNER (If in Split View or Map Mode) */}
        {viewMode !== 'list' && (
          <section className="w-full px-4 lg:px-8 pb-6 bg-[#16111d]">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#ffba27]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Google Map & Locations Radar
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => setIsBmsDistrictModalOpen(true)}
                    className="text-[#ffba27] hover:underline flex items-center gap-1"
                  >
                    Compare BMS & District Apps ↗
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="text-[#dec1af] hover:text-white"
                  >
                    Hide Map
                  </button>
                </div>
              </div>
              <GoogleMapView
                venues={filteredVenues}
                selectedVenue={mapSelectedVenue}
                onSelectVenue={(v) => {
                  setMapSelectedVenue(v);
                  handleOpenDetails(v);
                }}
                onBookTickets={handleOpenBooking}
                onOpenRadarModal={handleOpenRadar}
                userCoords={userCoords}
                onRequestUserLocation={requestUserLocation}
                isCompact={viewMode === 'split'}
              />
            </div>
          </section>
        )}

        {/* MAIN DUAL-COLUMN CONTENT GRID (8 COLS VENUES + 4 COLS SIDEBAR UTILITIES) */}
        <section id="venues-section" className="w-full px-4 lg:px-8 py-6 bg-[#16111d]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT 8 COLUMNS: VENUE CARDS LIST */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Results count & Quick Actions */}
              <div className="flex items-center justify-between text-xs text-[#dec1af] px-1">
                <span>
                  Showing <strong className="text-[#ffb784]">{filteredVenues.length}</strong> verified
                  grounds for <strong className="text-[#ffba27]">{activeNavratriDay.tithi} ({activeNavratriDay.dateStr})</strong>
                </span>
                <button
                  onClick={() => setIsBmsDistrictModalOpen(true)}
                  className="text-xs text-[#ffba27] hover:underline font-semibold flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5" /> BookMyShow & District All-Listings Table
                </button>
              </div>

              {filteredVenues.map((v) => {
                const distanceKm = userCoords
                  ? calculateDistanceKm(userCoords.lat, userCoords.lng, v.coordinates.lat, v.coordinates.lng)
                  : null;

                return (
                  <article
                    key={v.id}
                    className="bg-[#1f1926] rounded-2xl overflow-hidden border border-[#393240] hover:border-[#f77f00]/70 shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                      {/* Left Image & Overlay Badges */}
                      <div className="md:col-span-5 relative min-h-[250px] overflow-hidden">
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <span className="px-3 py-1 rounded-full bg-[#b20213] text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#ffba27] animate-pulse"></span>
                            {v.artist}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#110c18]/90 backdrop-blur-md text-[#ffba27] text-[11px] font-semibold">
                            {v.hubName}
                          </span>
                        </div>

                        {/* Distance Badge if Geolocation Active */}
                        {distanceKm !== null && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-sky-950/90 border border-sky-500/50 text-sky-300 text-[10px] font-bold">
                            {distanceKm} km away
                          </div>
                        )}

                        {/* Bottom Parking Badge */}
                        <div className="absolute bottom-3 left-3 right-3 bg-[#110c18]/85 backdrop-blur-md rounded-xl p-2 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-[#ffb784] font-bold">
                            <Car className="w-3.5 h-3.5 text-[#ffba27]" />
                            {v.parkingSlots}
                          </span>
                          <span className="text-[#ffba27] font-semibold text-[11px]">
                            {v.parkingPerk}
                          </span>
                        </div>
                      </div>

                      {/* Right Content Details */}
                      <div className="md:col-span-7 p-6 flex flex-col justify-between">
                        <div>
                          {/* Title & Rating */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3
                                onClick={() => handleOpenDetails(v)}
                                className="font-playfair text-xl font-bold text-white hover:text-[#ffb784] cursor-pointer transition-colors"
                              >
                                {v.name}
                              </h3>
                              <p className="text-xs text-[#c9bccc] flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-[#f77f00] shrink-0" />
                                <span>{v.location}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-1 bg-[#2e2735] px-2.5 py-1 rounded-xl border border-[#393240] shrink-0">
                              <Star className="w-3.5 h-3.5 text-[#ffba27] fill-[#ffba27]" />
                              <span className="text-xs font-bold text-white">{v.rating}</span>
                              <span className="text-[10px] text-[#dec1af]">({v.reviewCount})</span>
                            </div>
                          </div>

                          {/* Tag Badges */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {v.badges.map((badge, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md bg-[#231d2a] text-[11px] text-[#dec1af] border border-[#393240]"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-[#c9bccc] mt-3 line-clamp-2 leading-relaxed">
                            {v.description}
                          </p>

                          {/* Platform Links: BookMyShow & District App */}
                          <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-[#2e2735]">
                            <span className="text-[10px] font-bold text-[#dec1af] uppercase tracking-wider">
                              Listing Links:
                            </span>
                            <a
                              href={v.bookmyshowUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              BookMyShow <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <a
                              href={v.districtUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              District App <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <button
                              onClick={() => handleOpenRadar(v)}
                              className="px-2.5 py-1 rounded-lg bg-[#f77f00]/20 hover:bg-[#f77f00] text-[#ffba27] hover:text-white border border-[#f77f00]/40 text-[11px] font-bold flex items-center gap-1.5 ml-auto transition-all shadow-sm"
                            >
                              <Compass className="w-3.5 h-3.5 text-[#ffba27]" /> Maps Radar
                            </button>
                          </div>
                        </div>

                        {/* Price & Action Bottom Row */}
                        <div className="mt-4 pt-3 bg-[#231d2a] rounded-xl p-3 flex items-center justify-between border border-[#393240]">
                          <div>
                            <span className="text-[10px] text-[#dec1af] block uppercase tracking-wider font-semibold">
                              Per Person From
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-playfair text-xl sm:text-2xl font-extrabold text-[#ffb784]">
                                ₹{v.price}
                              </span>
                              <span className="text-xs text-[#887890] line-through">
                                ₹{v.originalPrice}
                              </span>
                              <span className="text-[10px] text-[#ffba27] font-bold ml-1 bg-[#f77f00]/20 px-1.5 py-0.5 rounded">
                                {v.tag}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenDetails(v)}
                              className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-[#2e2735] hover:bg-[#393240] text-white text-xs font-semibold"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleOpenBooking(v)}
                              className="px-5 py-2.5 rounded-xl bg-[#f77f00] hover:bg-[#ea580c] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                            >
                              <span>Book Tickets</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredVenues.length === 0 && (
                <div className="text-center py-16 bg-[#1f1926] rounded-2xl border border-[#393240] p-6">
                  <Info className="w-10 h-10 text-[#ffba27] mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white">No grounds match your criteria</h4>
                  <p className="text-xs text-[#c9bccc] mt-1">
                    Try clearing the search query or selecting "All Twin-City Venues".
                  </p>
                  <button
                    onClick={() => {
                      setSelectedHub('all');
                      setSearchQuery('');
                      setFilterParking('all');
                      setFilterSetting('all');
                    }}
                    className="mt-4 px-4 py-2 bg-[#f77f00] text-white text-xs font-bold rounded-xl"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: COMBO BOX & UTILITY MODULES */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              {/* 9-NIGHTS ALL-ACCESS PASS COMBO CARD */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2e2735] via-[#1f1926] to-[#110c18] border border-[#f77f00]/40 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#f77f00]/20 rounded-full blur-2xl pointer-events-none" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b20213] text-[#ffdad6] text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffba27]" /> Exclusive Twin-City Pass
                </div>

                <h3 className="font-playfair text-2xl font-bold text-[#ffb784]">
                  9-Nights Royal Season Pass
                </h3>

                <p className="text-xs text-[#dec1af] mt-1.5 leading-relaxed">
                  Unlimited flexible entry across all 120+ partnered arenas in Ahmedabad &
                  Gandhinagar for all nine nights of Navratri.
                </p>

                <div className="my-4 p-4 rounded-xl bg-[#231d2a] border border-[#393240] flex items-baseline justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-[#dec1af] block uppercase tracking-wider">
                      Full Season Combo
                    </span>
                    <span className="font-playfair text-3xl font-extrabold text-[#ffba27]">
                      ₹4,299
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f77f00] text-white text-[11px] font-bold">
                      SAVE 37%
                    </span>
                    <span className="block text-xs text-[#887890] line-through mt-0.5">
                      ₹6,850
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-[#eadff1] mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ffb784] shrink-0" />
                    <span>Express barcode wristband home delivery via BlueDart</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ffb784] shrink-0" />
                    <span>Guaranteed Reserved Parking QR at all SG Highway venues</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ffb784] shrink-0" />
                    <span>Maha Ashtami VIP Royal Gazebo Access (Day 8 & 9)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ffb784] shrink-0" />
                    <span>Unlimited access transfer between Ahmedabad & Gandhinagar</span>
                  </li>
                </ul>

                <button
                  onClick={() => setIsSeasonPassOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#f77f00] hover:bg-[#ea580c] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Claim Season Pass Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="block text-center text-[11px] text-[#dec1af] mt-2">
                  Only 184 early passes remaining at this slab
                </span>
              </div>

              {/* BOOKMYSHOW & DISTRICT QUICK ACCESS PROMO */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-purple-950/40 border border-[#393240] shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#ffba27] uppercase tracking-wider flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" /> BookMyShow & District
                  </span>
                  <span className="text-[10px] bg-[#2e2735] px-2 py-0.5 rounded text-[#dec1af]">
                    All Listings
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Looking for official app event listings?
                </h4>
                <p className="text-xs text-[#dec1af] mt-1">
                  Access every verified listing across BookMyShow and District (Zomato) with direct ticket links.
                </p>
                <button
                  onClick={() => setIsBmsDistrictModalOpen(true)}
                  className="mt-3 w-full py-2 rounded-xl bg-[#2e2735] hover:bg-[#393240] text-xs font-bold text-white border border-[#393240] flex items-center justify-center gap-1.5 transition-all"
                >
                  Open Comparison Directory ↗
                </button>
              </div>

              {/* COMMUTE & PARKING GUIDELINES CARD */}
              <div id="commute-section" className="p-6 rounded-2xl bg-[#1f1926] border border-[#393240] shadow-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <Car className="w-5 h-5 text-[#ffba27]" />
                  <h4 className="text-base font-bold text-white">
                    Ahmedabad & Gandhinagar Commute Protocols
                  </h4>
                </div>
                <p className="text-xs text-[#c9bccc] mb-4 leading-relaxed">
                  Joint city advisory by Ahmedabad Traffic Police & Gandhinagar Smart City Control.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#231d2a] border border-[#393240]">
                    <div className="w-8 h-8 rounded-lg bg-[#2e2735] flex items-center justify-center text-[#ffb784] shrink-0">
                      📱
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Advance Digital Parking Slips
                      </span>
                      <span className="text-[11px] text-[#dec1af]">
                        Scan QR pass 500m prior to gate to access express VIP entry corridors.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#231d2a] border border-[#393240]">
                    <div className="w-8 h-8 rounded-lg bg-[#2e2735] flex items-center justify-center text-sky-400 shrink-0">
                      🚇
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Amdavad Metro Late Timings
                      </span>
                      <span className="text-[11px] text-[#dec1af]">
                        Red & Blue lines operational till 02:00 AM from Vastrapur, Thaltej, and
                        Gandhinagar Sector 1.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#231d2a] border border-[#393240]">
                    <div className="w-8 h-8 rounded-lg bg-[#2e2735] flex items-center justify-center text-pink-400 shrink-0">
                      🛡️
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Dedicated Women & Family Drop-Off
                      </span>
                      <span className="text-[11px] text-[#dec1af]">
                        Well-lit safe pick-and-drop bays equipped with She-Teams at every venue gate.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TONIGHT'S LIVE CROWD METER */}
              <div className="p-6 rounded-2xl bg-[#1f1926] border border-[#393240] shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">Tonight's Crowd Meter</h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#b20213] text-[#ffdad6] text-[10px] font-bold">
                    Live Pulse
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#eadff1]">SG Highway Enclave</span>
                      <span className="text-[#ffb784] font-bold">88% Capacity (Very Busy)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#16111d]">
                      <div className="h-2 rounded-full bg-[#f77f00]" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#eadff1]">Sindhu Bhavan Grounds</span>
                      <span className="text-[#ffba27] font-bold">94% Capacity (Near Sold Out)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#16111d]">
                      <div className="h-2 rounded-full bg-[#b20213]" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#eadff1]">Gandhinagar Arenas (GIFT & Infocity)</span>
                      <span className="text-[#ffba27] font-bold">62% Capacity (Comfortable)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#16111d]">
                      <div className="h-2 rounded-full bg-[#ffba27]" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* AUTHENTIC REVELER TESTIMONIALS */}
        <section className="w-full bg-[#110c18] px-4 lg:px-8 py-14 border-t border-[#2e2735]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#ffba27] font-bold">
                  Community Voices
                </span>
                <h2 className="font-playfair text-3xl font-bold text-[#ffb784] mt-1">
                  Loved by Amdavadi & Gandhinagar Garba Lovers
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-[#ffb784] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Over 45,000 Verified Reveler Reviews from 2024 Season</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Review 1 */}
              <div className="p-6 rounded-2xl bg-[#1f1926] border border-[#393240] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center gap-1 text-[#ffba27] mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#ffba27]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#eadff1] italic leading-relaxed">
                    "Booking the Shankus Pass with reserved parking on RaasUtsav eliminated the terrible
                    SG Highway traffic headache completely. We scanned our QR code, got into the dedicated VIP
                    valet lane within 3 minutes, and danced till 2 AM!"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#2e2735]">
                  <div className="w-10 h-10 rounded-full bg-[#f77f00] text-white font-bold flex items-center justify-center text-sm shadow-md">
                    KP
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">Kinari Patel</h5>
                    <span className="text-[11px] text-[#dec1af]">
                      Bopal, Ahmedabad • 7-Year Passholder
                    </span>
                  </div>
                </div>
              </div>

              {/* Review 2 */}
              <div className="p-6 rounded-2xl bg-[#1f1926] border border-[#393240] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center gap-1 text-[#ffba27] mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#ffba27]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#eadff1] italic leading-relaxed">
                    "Atul Purohit's night at Infocity Gandhinagar was deeply spiritual and traditional.
                    Zero fake tickets at the gate because the RFID band scanning is instant. Truly
                    authentic Navratri vibe with pure devotional joy."
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#2e2735]">
                  <div className="w-10 h-10 rounded-full bg-[#ffba27] text-[#16111d] font-bold flex items-center justify-center text-sm shadow-md">
                    MS
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">Mayur Shah</h5>
                    <span className="text-[11px] text-[#dec1af]">
                      Sector 8, Gandhinagar • Season Passholder
                    </span>
                  </div>
                </div>
              </div>

              {/* Review 3 */}
              <div className="p-6 rounded-2xl bg-[#1f1926] border border-[#393240] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center gap-1 text-[#ffba27] mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#ffba27]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#eadff1] italic leading-relaxed">
                    "Karnavati Club on Sindhu Bhavan Road was majestic. Aditya Gadhvi created sheer magic
                    with his live folk orchestra. Having our M-ticket synced directly to Apple Wallet
                    with immediate QR parking was seamless."
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#2e2735]">
                  <div className="w-10 h-10 rounded-full bg-[#b20213] text-white font-bold flex items-center justify-center text-sm shadow-md">
                    DS
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">Devanshi Sheth</h5>
                    <span className="text-[11px] text-[#dec1af]">
                      Navrangpura, Ahmedabad • Group Captain
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#110c18] text-[#dec1af] pt-12 pb-8 border-t border-[#2e2735]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Trust Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 mb-8 bg-[#1f1926]/60 rounded-2xl p-6 border border-[#2e2735]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f77f00]/20 flex items-center justify-center text-[#ffb784]">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Genuine Venue Passes</h4>
                <p className="text-xs text-[#c9bccc]">
                  RFID band barcode validation directly at ground gates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f77f00]/20 flex items-center justify-center text-[#ffb784]">
                <Ticket className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant M-Ticket Delivery</h4>
                <p className="text-xs text-[#c9bccc]">
                  Direct WhatsApp & Apple Wallet sync in seconds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f77f00]/20 flex items-center justify-center text-[#ffb784]">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">24/7 Navratri Helpline</h4>
                <p className="text-xs text-[#c9bccc]">
                  +91 79 4000 RAAS (Toll-Free Amdavad & Gandhinagar)
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10 text-xs">
            <div>
              <h5 className="font-bold text-[#ffba27] mb-3 uppercase tracking-wider">
                9 Sacred Nights
              </h5>
              <ul className="space-y-1.5 text-[#c9bccc]">
                <li>Night 1: Shailaputri Puja</li>
                <li>Night 2: Brahmacharini Garba</li>
                <li>Night 3: Chandraghanta Utsav</li>
                <li>Night 4: Kushmanda Raas</li>
                <li>Night 5: Skandamata Night</li>
                <li>Night 6: Katyayani Dhol Beats</li>
                <li>Night 7: Kaalratri Doli Taali</li>
                <li>Night 8: Mahagauri Maha Aarti</li>
                <li>Night 9: Siddhidatri Grand Finale</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-[#ffba27] mb-3 uppercase tracking-wider">
                Twin City Hubs
              </h5>
              <ul className="space-y-1.5 text-[#c9bccc]">
                <li>Shankus Dandiya Arena</li>
                <li>Rajpath Club Garba Lawn</li>
                <li>Karnavati Club SG Highway</li>
                <li>Gandhinagar Helipad Ground</li>
                <li>GIFT City Dome Complex</li>
                <li>Bopal Festive Amphitheatre</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-[#ffba27] mb-3 uppercase tracking-wider">
                Artists & Lineups
              </h5>
              <ul className="space-y-1.5 text-[#c9bccc]">
                <li>Atul Purohit Live Tour</li>
                <li>Kinjal Dave Char Bangdi Raas</li>
                <li>Aditya Gadhvi Folk Symphony</li>
                <li>Geeta Rabari Kutchhi Beats</li>
                <li>Falguni Pathak Exclusive</li>
                <li>Hemant Chauhan Bhajan Aarti</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-[#ffba27] mb-3 uppercase tracking-wider">
                Passes & Logistics
              </h5>
              <ul className="space-y-1.5 text-[#c9bccc]">
                <li>All 9 Nights Season Pass</li>
                <li>VIP Lounge & Stage Access</li>
                <li>Group & Corporate Passes</li>
                <li>Reserved Valet Slots</li>
                <li>Shuttle Bus Route Map</li>
                <li>Traditional Dress Guidelines</li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h5 className="font-bold text-[#ffba27] mb-3 uppercase tracking-wider">
                Festival Advisory
              </h5>
              <p className="text-xs text-[#c9bccc] mb-3 leading-relaxed">
                Strict adherence to authentic Chaniya Choli and Kediyu attire required across all
                traditional premium grounds. Amdavad Metro special late-night hours active till 02:00 AM.
              </p>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#231d2a] rounded-xl border border-[#393240]">
                <ShieldCheck className="w-4 h-4 text-[#ffb784]" />
                <span className="text-[11px] text-white font-semibold">
                  Official Partner: Gujarat Tourism
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2e2735] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#887890]">
            <p>© 2025-2026 RaasUtsav Portal Pvt Ltd. Celebrating Ahmedabad & Gandhinagar Navratri Mahotsav.</p>
            <div className="flex items-center gap-4 text-[#c9bccc]">
              <a href="#" className="hover:text-white transition-colors">
                Traditional Code of Conduct
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Ticket Refund Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Emergency Protocols
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Pass Booking Modal */}
      <BookingModal
        venue={bookingVenue}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedNight={selectedDay}
      />

      {/* 2. 9-Nights Season Pass Modal */}
      <SeasonPassModal
        isOpen={isSeasonPassOpen}
        onClose={() => setIsSeasonPassOpen(false)}
      />

      {/* 3. Venue Details Modal */}
      <VenueDetailsModal
        venue={detailVenue}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onBookTickets={handleOpenBooking}
      />

      {/* 4. BookMyShow & District All-Listings Directory Modal */}
      <BookMyShowDistrictModal
        isOpen={isBmsDistrictModalOpen}
        onClose={() => setIsBmsDistrictModalOpen(false)}
        venues={GARBA_VENUES}
        onSelectVenueForBooking={handleOpenBooking}
      />

      {/* 5. Maps Radar Modal */}
      <MapsRadarModal
        venue={radarVenue}
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        allVenues={GARBA_VENUES}
        onSelectVenue={(v) => {
          setRadarVenue(v);
          setMapSelectedVenue(v);
        }}
        onBookTickets={handleOpenBooking}
        userCoords={userCoords}
        onRequestUserLocation={requestUserLocation}
      />
    </div>
  );
}
