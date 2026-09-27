import React, { useState } from 'react';
import { Venue } from '../data/garbaVenues';
import { X, MapPin, Car, ShieldCheck, Ticket, QrCode, Sparkles, CheckCircle, Tag, Phone, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  selectedNight: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  venue,
  isOpen,
  onClose,
  selectedNight,
}) => {
  const [tier, setTier] = useState<'general' | 'vip'>('general');
  const [qty, setQty] = useState<number>(1);
  const [includeValet, setIncludeValet] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('GARBA2025');
  const [promoApplied, setPromoApplied] = useState<boolean>(true);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Form Details
  const [name, setName] = useState<string>('Garba Lover');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [generatedPassId, setGeneratedPassId] = useState<string>('');

  if (!isOpen || !venue) return null;

  const basePrice = tier === 'vip' ? venue.price + 800 : venue.price;
  const passSubtotal = basePrice * qty;
  const valetFee = includeValet ? 200 * qty : 0;
  const discount = promoApplied ? 250 : 0;
  const subtotalAfterDiscount = Math.max(0, passSubtotal + valetFee - discount);
  const gst = Math.round(subtotalAfterDiscount * 0.18);
  const grandTotal = subtotalAfterDiscount + gst;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'GARBA2025') {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoApplied(false);
      setPromoError('Invalid coupon code. Use GARBA2025 for ₹250 off.');
    }
  };

  const handleCompletePayment = () => {
    const randomId = 'RAAS-' + Math.floor(100000 + Math.random() * 900000);
    setGeneratedPassId(randomId);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f77f00', '#ffba27', '#ffffff', '#ef4444'],
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#110c18]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#231d2a] border border-[#393240] rounded-2xl shadow-2xl overflow-hidden relative my-6">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#2e2735] hover:bg-[#393240] text-[#eadff1] hover:text-[#ffba27] flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="p-6 max-h-[88vh] overflow-y-auto space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[#f77f00]/20 text-[#ffb784] border border-[#f77f00]/30 text-[10px] font-bold uppercase tracking-wider">
                  Night {selectedNight} Pass
                </span>
                <span className="text-xs text-[#ffba27] font-semibold">{venue.artist}</span>
              </div>
              <h3 className="text-xl font-bold font-playfair text-white">{venue.name}</h3>
              <p className="text-xs text-[#c9bccc] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#f77f00] shrink-0" />
                <span>{venue.location}</span>
              </p>
            </div>

            {/* Official Platform Direct Booking Options */}
            <div className="p-3 bg-[#16111d] rounded-xl border border-[#2e2735]">
              <span className="text-[11px] text-[#dec1af] font-semibold block mb-2">
                Prefer booking via Partner Apps?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={venue.bookmyshowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1"
                >
                  Book on BookMyShow ↗
                </a>
                <a
                  href={venue.districtUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1"
                >
                  Book on District App ↗
                </a>
              </div>
            </div>

            {/* Pass Tier Selection */}
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                Select Pass Category
              </label>
              <div className="space-y-2">
                <label
                  onClick={() => setTier('general')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    tier === 'general'
                      ? 'border-[#f77f00] bg-[#2e2735]'
                      : 'border-[#393240] bg-[#1f1926] hover:border-[#574335]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="pass-tier"
                      checked={tier === 'general'}
                      onChange={() => setTier('general')}
                      className="accent-[#f77f00] w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-sm text-white block">General Raas Lawn Pass</span>
                      <span className="text-xs text-[#c9bccc]">Full lawn access, food village & sanitized water</span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-[#ffb784]">₹{venue.price}</span>
                </label>

                <label
                  onClick={() => setTier('vip')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    tier === 'vip'
                      ? 'border-[#ffba27] bg-[#2e2735]'
                      : 'border-[#393240] bg-[#1f1926] hover:border-[#574335]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="pass-tier"
                      checked={tier === 'vip'}
                      onChange={() => setTier('vip')}
                      className="accent-[#ffba27] w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-sm text-white block flex items-center gap-1.5">
                        VIP Royal Stage Gazebo <Sparkles className="w-3.5 h-3.5 text-[#ffba27]" />
                      </span>
                      <span className="text-xs text-[#c9bccc]">
                        Elevated amphitheatre viewing + Fafda Jalebi box
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-[#ffba27]">₹{venue.price + 800}</span>
                </label>
              </div>
            </div>

            {/* Parking Add-on */}
            <div className="p-3.5 rounded-xl bg-[#1f1926] border border-[#393240] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-[#f77f00]" />
                <div>
                  <span className="text-xs font-bold text-white block">Guaranteed Valet Slot</span>
                  <span className="text-[11px] text-[#c9bccc]">
                    Dedicated express gate with QR digital barcode
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#ffb784]">+₹200</span>
                <input
                  type="checkbox"
                  checked={includeValet}
                  onChange={(e) => setIncludeValet(e.target.checked)}
                  className="w-4 h-4 accent-[#f77f00] cursor-pointer"
                />
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Number of Passes:</span>
              <div className="flex items-center gap-2 bg-[#1f1926] p-1 rounded-xl border border-[#393240]">
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-[#2e2735] text-white hover:text-[#ffba27] font-bold text-base flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-base text-[#ffb784]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.min(10, prev + 1))}
                  className="w-8 h-8 rounded-lg bg-[#2e2735] text-white hover:text-[#ffba27] font-bold text-base flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#dec1af] flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#ffba27]" /> Apply Festive Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter coupon (e.g. GARBA2025)"
                  className="flex-1 bg-[#1f1926] text-white uppercase tracking-wider text-xs px-3 py-2 rounded-xl border border-[#393240] focus:outline-none focus:border-[#f77f00]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-[#2e2735] hover:bg-[#393240] text-xs font-bold text-[#ffba27] rounded-xl transition-all"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" /> Code GARBA2025 applied! Flat ₹250 off
                </span>
              )}
              {promoError && <span className="text-[11px] text-rose-400">{promoError}</span>}
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-[#dec1af] block mb-1">Passholder Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#c9bccc] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1f1926] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#393240] focus:outline-none focus:border-[#f77f00]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#dec1af] block mb-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#c9bccc] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1f1926] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#393240] focus:outline-none focus:border-[#f77f00]"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#16111d] space-y-1.5 text-xs text-[#c9bccc] border border-[#2e2735]">
              <div className="flex justify-between">
                <span>Pass Subtotal ({qty}x {tier === 'vip' ? 'VIP' : 'General'})</span>
                <span>₹{passSubtotal}</span>
              </div>
              {includeValet && (
                <div className="flex justify-between">
                  <span>Reserved Valet Parking</span>
                  <span>₹{valetFee}</span>
                </div>
              )}
              {promoApplied && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Festive Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Convenience & GST (18%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="pt-2 border-t border-[#2e2735] flex justify-between items-baseline text-white">
                <span className="font-bold text-sm">Grand Total</span>
                <span className="text-xl font-extrabold text-[#ffb784]">₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCompletePayment}
              className="w-full py-3 rounded-xl bg-[#f77f00] hover:bg-[#ea580c] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <Ticket className="w-4 h-4" /> Proceed to Instant Pay & Sync Pass
            </button>
            <p className="text-center text-[10px] text-[#dec1af]">
              Encrypted via Gujarat Tourism Payment Gateway • Immediate WhatsApp Pass Delivery
            </p>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs text-[#ffba27] font-bold uppercase tracking-widest">
                Jay Mataji! Reservation Confirmed
              </span>
              <h3 className="text-2xl font-bold font-playfair text-white mt-1">
                Your Navratri M-Pass is Ready!
              </h3>
              <p className="text-xs text-[#c9bccc] mt-1">
                A verified RFID encrypted barcode pass has been dispatched to <strong>{phone}</strong>.
              </p>
            </div>

            {/* Pass Card Preview */}
            <div className="p-5 rounded-2xl bg-[#16111d] border border-[#f77f00]/50 shadow-inner max-w-sm mx-auto text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#2e2735] pb-3 mb-3">
                <div>
                  <span className="text-[10px] text-[#ffba27] font-bold uppercase">{venue.name}</span>
                  <h4 className="text-sm font-bold text-white">{venue.artist}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#dec1af] block">Pass ID</span>
                  <span className="text-xs font-mono font-bold text-[#ffb784]">{generatedPassId}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#c9bccc]">
                <div className="flex justify-between">
                  <span>Passholder:</span>
                  <strong className="text-white">{name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <strong className="text-white">{tier === 'vip' ? 'VIP Royal Gazebo' : 'General Lawn'} ({qty}x)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Festival Night:</span>
                  <strong className="text-[#ffba27]">Night {selectedNight}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valet Access:</span>
                  <strong className={includeValet ? 'text-emerald-400' : 'text-zinc-500'}>
                    {includeValet ? 'Guaranteed VIP Bay' : 'Standard Ground'}
                  </strong>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="mt-4 pt-3 border-t border-[#2e2735] flex items-center justify-center gap-2">
                <QrCode className="w-16 h-16 text-[#ffb784]" />
                <div className="text-left font-mono text-[9px] text-[#c9bccc] leading-tight">
                  <p>ENCRYPTED QR WRISTBAND</p>
                  <p>SCAN AT GATE VIP CORRIDOR</p>
                  <p className="text-emerald-400 font-bold">VERIFIED 100% GENUINE</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-[#2e2735] hover:bg-[#393240] text-xs font-bold text-white"
              >
                Close & View Other Grounds
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
