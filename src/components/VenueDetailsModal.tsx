import React from 'react';
import { Venue } from '../data/garbaVenues';
import { X, MapPin, Navigation, ExternalLink, Ticket, Star, ShieldCheck, Car, Train, Clock, Sparkles } from 'lucide-react';

interface VenueDetailsModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTickets: (venue: Venue) => void;
}

export const VenueDetailsModal: React.FC<VenueDetailsModalProps> = ({
  venue,
  isOpen,
  onClose,
  onBookTickets,
}) => {
  if (!isOpen || !venue) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#110c18]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#231d2a] border border-[#393240] rounded-2xl shadow-2xl overflow-hidden relative my-6 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#16111d]/80 hover:bg-[#2e2735] text-white hover:text-[#ffba27] flex items-center justify-center backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 w-full shrink-0">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#231d2a] via-transparent to-black/40" />

          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <span className="px-3 py-1 rounded-full bg-[#b20213] text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffba27] animate-pulse"></span>
              {venue.artist}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#16111d]/90 backdrop-blur-md text-[#ffba27] text-xs font-semibold">
              {venue.hubName}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold font-playfair text-white drop-shadow-md">
                {venue.name}
              </h2>
              <p className="text-xs text-[#c9bccc] flex items-center gap-1 mt-0.5 drop-shadow">
                <MapPin className="w-3.5 h-3.5 text-[#ffb784]" />
                {venue.location}
              </p>
            </div>
            <div className="bg-[#1f1926]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#393240] flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#ffba27] fill-[#ffba27]" />
              <span className="text-sm font-bold text-white">{venue.rating}</span>
              <span className="text-xs text-[#c9bccc]">({venue.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Badges */}
          <div className="flex flex-wrap gap-2">
            {venue.badges.map((badge, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-[#1f1926] text-xs text-[#eadff1] border border-[#393240] font-medium"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-[#ffba27] uppercase tracking-wider mb-1">
              About Ground & Experience
            </h4>
            <p className="text-sm text-[#dec1af] leading-relaxed">
              {venue.description}
            </p>
          </div>

          {/* Live Platform Links */}
          <div className="p-4 rounded-xl bg-[#16111d] border border-[#2e2735] space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Official Listing Platforms & Navigation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href={venue.bookmyshowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                BookMyShow <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={venue.districtUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                District App <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${venue.coordinates.lat},${venue.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#2e2735] hover:bg-[#393240] text-[#ffba27] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[#393240]"
              >
                Google Maps <Navigation className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#1f1926] border border-[#393240] flex items-start gap-3">
              <Car className="w-5 h-5 text-[#f77f00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">{venue.parkingSlots}</strong>
                <span className="text-[#c9bccc]">{venue.parkingPerk}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1f1926] border border-[#393240] flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#ffba27] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">{venue.timings}</strong>
                <span className="text-[#c9bccc]">Aarti starts sharply at 07:30 PM</span>
              </div>
            </div>

            {venue.metroConnected && (
              <div className="p-3.5 rounded-xl bg-[#1f1926] border border-[#393240] flex items-start gap-3">
                <Train className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Amdavad Metro Connected</strong>
                  <span className="text-[#c9bccc]">{venue.metroLine}</span>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#1f1926] border border-[#393240] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold">
                  {venue.dressCodeStrict ? 'Strict Traditional Attire' : 'Traditional Welcome'}
                </strong>
                <span className="text-[#c9bccc]">
                  {venue.dressCodeStrict
                    ? 'Chaniya Choli / Kediyu mandatory on dance floor'
                    : 'Ethnic dress encouraged for dancers'}
                </span>
              </div>
            </div>
          </div>

          {/* Tonight Live Capacity Bar */}
          <div className="p-4 rounded-xl bg-[#1f1926] border border-[#393240]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-white font-semibold">Ground Capacity Status</span>
              <span className="text-[#ffba27] font-bold">{venue.liveCapacityPercent}% Filled</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#16111d] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f77f00] to-[#ffba27]"
                style={{ width: `${venue.liveCapacityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-[#16111d] border-t border-[#2e2735] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#dec1af] uppercase tracking-wider block">Pass Starts At</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#ffb784]">₹{venue.price}</span>
              <span className="text-xs text-[#887890] line-through">₹{venue.originalPrice}</span>
              <span className="text-xs text-[#ffba27] font-bold">{venue.tag}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#2e2735] hover:bg-[#393240] text-xs font-bold text-white transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookTickets(venue);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#f77f00] hover:bg-[#ea580c] text-white text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all"
            >
              <Ticket className="w-4 h-4" /> Book Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
