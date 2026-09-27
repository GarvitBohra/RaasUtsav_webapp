import React, { useState } from 'react';
import { Venue } from '../data/garbaVenues';
import { ExternalLink, X, Search, ArrowUpDown, Filter, Sparkles, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

interface BookMyShowDistrictModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  onSelectVenueForBooking: (venue: Venue) => void;
}

export const BookMyShowDistrictModal: React.FC<BookMyShowDistrictModalProps> = ({
  isOpen,
  onClose,
  venues,
  onSelectVenueForBooking,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'bms' | 'district'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-low' | 'price-high' | 'rating'>('popularity');

  if (!isOpen) return null;

  const filteredVenues = venues
    .filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.artist.toLowerCase().includes(search.toLowerCase()) ||
        v.location.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.popularityScore - a.popularityScore;
    });

  return (
    <div className="fixed inset-0 z-50 bg-[#110c18]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#1f1926] border border-[#393240] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#231d2a] via-[#2e2735] to-[#231d2a] border-b border-[#393240] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f77f00]/20 text-[#ffb784] border border-[#f77f00]/30 text-xs font-bold uppercase tracking-wider">
                Official Listing Directory
              </span>
              <span className="text-xs text-[#c9bccc]">Synced with BMS & District APIs</span>
            </div>
            <h2 className="text-2xl font-bold font-playfair text-[#eadff1]">
              BookMyShow & District App All-Listings Directory
            </h2>
            <p className="text-xs text-[#dec1af] mt-1">
              Direct official event pages for all Ahmedabad & Gandhinagar Navratri grounds. Compare prices, pass perks, and book instantly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#2e2735] hover:bg-[#393240] text-[#eadff1] hover:text-[#ffba27] flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Sort Bar */}
        <div className="p-4 bg-[#16111d] border-b border-[#2e2735] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#dec1af] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search listings by ground name, artist (Atul Purohit, Kinjal Dave)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#231d2a] text-[#eadff1] placeholder:text-[#887890] pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#f77f00] border border-[#393240]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-[#231d2a] px-3 py-1.5 rounded-xl border border-[#393240]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#ffba27]" />
              <span className="text-[11px] text-[#dec1af] font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-[#eadff1] focus:outline-none cursor-pointer pr-1"
              >
                <option value="popularity" className="bg-[#231d2a]">Most Popular</option>
                <option value="rating" className="bg-[#231d2a]">Highest Rated</option>
                <option value="price-low" className="bg-[#231d2a]">Price: Low to High</option>
                <option value="price-high" className="bg-[#231d2a]">Price: High to Low</option>
              </select>
            </div>

            {/* Platform Quick Badges */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  platformFilter === 'all'
                    ? 'bg-[#f77f00] text-white'
                    : 'bg-[#231d2a] text-[#c9bccc] hover:text-white border border-[#393240]'
                }`}
              >
                All ({venues.length})
              </button>
              <button
                onClick={() => setPlatformFilter('bms')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  platformFilter === 'bms'
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#231d2a] text-rose-300 hover:text-white border border-[#393240]'
                }`}
              >
                BookMyShow
              </button>
              <button
                onClick={() => setPlatformFilter('district')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  platformFilter === 'district'
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#231d2a] text-purple-300 hover:text-white border border-[#393240]'
                }`}
              >
                District App
              </button>
            </div>
          </div>
        </div>

        {/* Listings Table / Cards */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVenues.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl bg-[#231d2a] border border-[#393240] hover:border-[#f77f00] transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-[#ffba27] font-bold uppercase tracking-wider block">
                        {v.artist}
                      </span>
                      <h3 className="font-bold text-base text-[#eadff1]">{v.name}</h3>
                      <p className="text-xs text-[#dec1af] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#f77f00] shrink-0" />
                        <span className="truncate">{v.location}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#c9bccc] line-through block">₹{v.originalPrice}</span>
                      <span className="text-lg font-extrabold text-[#ffb784]">₹{v.price}</span>
                      <span className="text-[10px] bg-[#f77f00]/30 text-[#ffba27] px-1.5 py-0.5 rounded font-bold ml-1">
                        {v.tag}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-[#1f1926] text-[#c9bccc] px-2 py-0.5 rounded border border-[#393240]">
                      {v.parkingSlots}
                    </span>
                    <span className="text-[10px] bg-[#1f1926] text-[#c9bccc] px-2 py-0.5 rounded border border-[#393240]">
                      ★ {v.rating} ({v.reviewCount})
                    </span>
                    <span className="text-[10px] bg-[#1f1926] text-[#ffba27] px-2 py-0.5 rounded border border-[#393240]">
                      {v.timings}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#393240] grid grid-cols-3 gap-2">
                  <a
                    href={v.bookmyshowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1 transition-all shadow-md"
                  >
                    BookMyShow <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={v.districtUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1 transition-all shadow-md"
                  >
                    District App <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectVenueForBooking(v);
                    }}
                    className="py-2 px-2 rounded-lg bg-[#f77f00] hover:bg-[#ea580c] text-white text-xs font-bold text-center transition-all shadow-md"
                  >
                    Instant Pass
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredVenues.length === 0 && (
            <div className="text-center py-12 text-[#c9bccc]">
              <p>No listings found matching "{search}". Try searching for another artist or ground.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16111d] border-t border-[#2e2735] flex flex-wrap items-center justify-between text-xs text-[#dec1af]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verified digital barcode wristbands valid across all partner gates.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2e2735] hover:bg-[#393240] text-white text-xs font-semibold"
          >
            Back to Grounds
          </button>
        </div>
      </div>
    </div>
  );
};
