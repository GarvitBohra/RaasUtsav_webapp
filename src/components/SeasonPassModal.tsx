import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, CheckCircle2, Ticket, QrCode, Truck, User, Phone, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SeasonPassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeasonPassModal: React.FC<SeasonPassModalProps> = ({ isOpen, onClose }) => {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('Amdavadi Garba Premi');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Bodakdev, Ahmedabad - 380054');
  const [isSuccess, setIsSuccess] = useState(false);
  const [seasonPassId, setSeasonPassId] = useState('');

  if (!isOpen) return null;

  const unitPrice = 4299;
  const subtotal = unitPrice * qty;
  const delivery = 0; // Free BlueDart delivery
  const grandTotal = subtotal + delivery;

  const handleCheckout = () => {
    const id = 'SEASON-ROYAL-' + Math.floor(10000 + Math.random() * 90000);
    setSeasonPassId(id);
    setIsSuccess(true);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ffba27', '#f77f00', '#ec4899', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#110c18]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#231d2a] border border-[#f77f00]/50 rounded-2xl shadow-2xl overflow-hidden relative my-6">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#2e2735] hover:bg-[#393240] text-[#eadff1] hover:text-[#ffba27] flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="p-6 max-h-[88vh] overflow-y-auto space-y-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f77f00]/20 text-[#ffb784] border border-[#f77f00]/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#ffba27]" /> Exclusive Twin-City Pass
              </span>
              <h2 className="text-2xl font-bold font-playfair text-white mt-1">
                9-Nights Royal Season Pass
              </h2>
              <p className="text-xs text-[#c9bccc] mt-1">
                Unlimited flexible entry across all 120+ partnered arenas in Ahmedabad & Gandhinagar for all nine nights of Navratri.
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#2e2735] to-[#1f1926] border border-[#393240] flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#c9bccc] uppercase">Full Season Combo Pass</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#ffba27]">₹4,299</span>
                  <span className="text-xs text-[#887890] line-through">₹6,850</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#f77f00] text-white text-xs font-extrabold">
                SAVE 37%
              </span>
            </div>

            {/* Perks Checklist */}
            <div className="space-y-2 text-xs text-[#eadff1]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffba27] shrink-0" />
                <span>Express barcode wristband home delivery via BlueDart</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffba27] shrink-0" />
                <span>Guaranteed Reserved Parking QR at all SG Highway venues</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffba27] shrink-0" />
                <span>Maha Ashtami VIP Royal Gazebo Access (Day 8 & 9)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffba27] shrink-0" />
                <span>Unlimited access transfer between Ahmedabad & Gandhinagar</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between p-3 bg-[#1f1926] rounded-xl border border-[#393240]">
              <span className="text-xs font-bold text-white uppercase">Pass Quantity:</span>
              <div className="flex items-center gap-2 bg-[#2e2735] px-2 py-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded bg-[#393240] text-white font-bold"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-white">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(6, q + 1))}
                  className="w-7 h-7 rounded bg-[#393240] text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-[#dec1af] block mb-1">Passholder Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#c9bccc] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1f1926] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#393240]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#dec1af] block mb-1">WhatsApp & Call Mobile</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#c9bccc] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1f1926] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#393240]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#dec1af] block mb-1">
                  Wristband Shipping Address (BlueDart Express)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#c9bccc] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#1f1926] text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-[#393240]"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 bg-[#16111d] rounded-xl text-xs space-y-1 text-[#c9bccc] border border-[#2e2735]">
              <div className="flex justify-between">
                <span>{qty}x 9-Nights Season Pass</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> BlueDart Tracked Courier
                </span>
                <span>FREE</span>
              </div>
              <div className="pt-2 border-t border-[#2e2735] flex justify-between font-bold text-white text-sm">
                <span>Total Payable</span>
                <span className="text-[#ffba27] text-lg">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-[#f77f00] hover:bg-[#ea580c] text-white text-sm font-bold shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <Ticket className="w-4 h-4" /> Claim Royal Season Pass
            </button>
            <p className="text-center text-[10px] text-[#dec1af]">
              Only 184 early passes remaining at this promotional tier.
            </p>
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold font-playfair text-white">
              Royal Season Pass Secured!
            </h3>
            <p className="text-xs text-[#c9bccc]">
              Congratulations {name}! Your RFID wristbands for all 9 nights are being packed and dispatched via BlueDart to <strong>{address}</strong>.
            </p>

            <div className="p-4 rounded-xl bg-[#16111d] border border-[#ffba27]/50 max-w-sm mx-auto text-left">
              <div className="flex justify-between border-b border-[#2e2735] pb-2 mb-2 text-xs">
                <span className="text-[#ffba27] font-bold">Season Pass ID</span>
                <span className="font-mono text-white font-bold">{seasonPassId}</span>
              </div>
              <div className="text-[11px] text-[#c9bccc] space-y-1">
                <p>• Access: 120+ Partner Arenas (Amdavad & Gandhinagar)</p>
                <p>• Validity: All 9 Navratri Nights (Oct 3 - Oct 11)</p>
                <p>• Valet Access: VIP Fast-Lane Enabled</p>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-[#2e2735] pt-2">
                <QrCode className="w-10 h-10 text-[#ffba27]" />
                <span className="text-[9px] font-mono text-[#c9bccc]">
                  DIGITAL COMPANION QR SYNCED TO WHATSAPP ({phone})
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="py-2.5 px-6 rounded-xl bg-[#2e2735] hover:bg-[#393240] text-xs font-bold text-white"
            >
              Done & Explore Arenas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
