import React, { useState } from 'react';
import { X, CheckCircle2, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CommissionModal: React.FC = () => {
  const {
    isCommissionModalOpen,
    setIsCommissionModalOpen,
    commissionTargetProducer,
    producers,
    requestCommission,
    user
  } = useApp();

  const [selectedProducerId, setSelectedProducerId] = useState<string>(
    commissionTargetProducer?.id || producers[0].id
  );
  const [motif, setMotif] = useState<string>('Ikaki (Royal Tortoise)');
  const [occasion, setOccasion] = useState<string>('Traditional Wedding (Igba Nkwu)');
  const [colors, setColors] = useState<string>('Wine Red & Champagne Gold');
  const [budget, setBudget] = useState<number>(135000);
  const [targetDate, setTargetDate] = useState<string>('2026-11-20');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isCommissionModalOpen) return null;

  const currentProducer = producers.find(p => p.id === selectedProducerId) || producers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    requestCommission({
      buyerId: user?.id || 'guest-buyer',
      buyerName: user?.name || 'Inquiring Buyer',
      buyerContact: user?.phone || user?.email || '+234 800 000 0000',
      producerId: currentProducer.id,
      producerName: currentProducer.name,
      desiredMotif: motif,
      occasion,
      colors,
      estimatedBudgetNGN: budget,
      targetDate,
      notes
    });

    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsCommissionModalOpen(false);
    setIsSubmitted(false);
  };

  const customOrderWhatsappMsg = `Hello ${currentProducer.name}, I just submitted a custom order on the Akwete app for: ${motif}, Colors: ${colors}, Occasion: ${occasion}, Needed by: ${targetDate}. Can we discuss?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                Custom Order Sent to {currentProducer.name}
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Your request has been received. You can also message {currentProducer.name.split(' ')[0]} directly on WhatsApp right now to send photos of your fabric sample or lace.
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 max-w-sm mx-auto text-left space-y-1">
              <p><span className="text-stone-400">Weaver:</span> <span className="font-semibold text-stone-800">{currentProducer.name}</span></p>
              <p><span className="text-stone-400">Pattern:</span> {motif}</p>
              <p><span className="text-stone-400">Colors:</span> {colors}</p>
              <p><span className="text-stone-400">Needed by:</span> {targetDate}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
              <a
                href={`https://wa.me/${currentProducer.whatsapp}?text=${encodeURIComponent(customOrderWhatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Follow Up on WhatsApp Now</span>
              </a>

              <button
                onClick={handleClose}
                className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors"
              >
                Back to Shop
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-7">
            <div className="mb-5">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block mb-0.5">
                Custom Weaving
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                Order Custom Akwete Colors
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Choose a weaver and specify the exact colors you need for your wedding or event.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Select Weaver */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Choose Weaver:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {producers.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setSelectedProducerId(p.id)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        selectedProducerId === p.id
                          ? 'border-amber-900 bg-amber-50 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <img
                        src={p.avatarUrl}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-stone-300 shrink-0"
                      />
                      <div className="truncate text-xs">
                        <p className="font-bold text-stone-900 truncate">{p.name.split(' ')[0]}</p>
                        <p className="text-[10px] text-stone-500 truncate">{p.yearsOfExperience} yrs</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design & Occasion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Design Pattern:
                  </label>
                  <select
                    value={motif}
                    onChange={e => setMotif(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900"
                  >
                    <option value="Ikaki (Royal Tortoise)">Ikaki (Classic Tortoise Design)</option>
                    <option value="Bridal Diamond & Ochi">Bridal Diamond & Ochi</option>
                    <option value="Agwa (Ribbed Geometric Lines)">Agwa (Ribbed Geometric Lines)</option>
                    <option value="Ebe Nze (Chieftaincy Stool)">Ebe Nze (Chieftaincy Stool)</option>
                    <option value="Kpakpando (Morning Star)">Kpakpando (Morning Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Occasion:
                  </label>
                  <select
                    value={occasion}
                    onChange={e => setOccasion(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900"
                  >
                    <option value="Traditional Wedding (Igba Nkwu)">Traditional Wedding (Igba Nkwu)</option>
                    <option value="Chieftaincy / Title Taking">Chieftaincy / Title Taking</option>
                    <option value="Church Thanksgiving & Dedication">Church Thanksgiving & Dedication</option>
                    <option value="Everyday Cultural Dress / Stole">Everyday Cultural Dress / Stole</option>
                  </select>
                </div>
              </div>

              {/* Colors & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Color Combination:
                  </label>
                  <input
                    type="text"
                    required
                    value={colors}
                    onChange={e => setColors(e.target.value)}
                    placeholder="e.g. Wine red, champagne gold & cream"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date Needed (Allows 14-21 days to weave):
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Additional Details:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Standard 2-piece double wrapper set, or 1 wrapper with matching headtie..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  Send Custom Order Request to {currentProducer.name.split(' ')[0]}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
