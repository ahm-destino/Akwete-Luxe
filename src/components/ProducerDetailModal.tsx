import React from 'react';
import { X, MessageCircle, Phone, ArrowRight, MapPin, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProducerDetailModal: React.FC = () => {
  const {
    activeProducerModal,
    setActiveProducerModal,
    cloths,
    setActiveClothModal,
    setIsCommissionModalOpen,
    setCommissionTargetProducer,
    actOnBehalfOfProducer,
    setIsAdminOpen,
    formatPrice
  } = useApp();

  if (!activeProducerModal) return null;

  const producer = activeProducerModal;
  const producerCloths = cloths.filter(c => c.producerId === producer.id);

  const handleCustomOrder = () => {
    setActiveProducerModal(null);
    setCommissionTargetProducer(producer);
    setIsCommissionModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveProducerModal(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 shadow-sm border border-stone-200 transition-colors"
          title="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          
          {/* Header Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-12 bg-stone-100 border-b border-stone-200">
            <div className="sm:col-span-5 relative aspect-square sm:aspect-auto">
              <img
                src={producer.avatarUrl}
                alt={producer.name}
                className="w-full h-full object-cover object-center min-h-[220px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="sm:col-span-7 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{producer.village}</span>
              </div>

              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
                {producer.name}
              </h2>
              <p className="text-xs text-amber-900 font-medium mt-0.5">
                {producer.nativeTitle}
              </p>

              <div className="my-3 py-3 border-y border-stone-200 flex gap-6 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">Experience</span>
                  <span className="font-bold text-stone-900">{producer.yearsOfExperience} Years</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Location</span>
                  <span className="font-bold text-stone-900">Akwete Town</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">Available Weaves</span>
                  <span className="font-bold text-stone-900">{producerCloths.length} Pieces</span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/${producer.whatsapp}?text=Hello%20${encodeURIComponent(producer.name)},%20I%20am%20interested%20in%20ordering%20an%20Akwete%20cloth%20from%20you`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Weaver</span>
                </a>

                <a
                  href={`tel:${producer.phone}`}
                  className="px-3 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>{producer.phone}</span>
                </a>

                <button
                  onClick={() => {
                    setActiveProducerModal(null);
                    actOnBehalfOfProducer(producer.id);
                    setIsAdminOpen(true);
                  }}
                  className="px-3 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin: Act on Her Behalf</span>
                </button>
              </div>
            </div>
          </div>

          {/* Story Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-serif-display text-xl font-bold text-stone-900 mb-2">
                About {producer.name.split(' ')[0]} & Her Loom
              </h3>
              <div className="text-stone-700 text-xs sm:text-sm leading-relaxed space-y-3">
                {producer.story.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 italic">
              "{producer.quote}"
            </div>

            {/* Cloths by this Weaver */}
            <div className="pt-4 border-t border-stone-200">
              <h3 className="font-serif-display text-lg font-bold text-stone-900 mb-3">
                Available Cloths Woven by {producer.name.split(' ')[0]}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {producerCloths.map(cloth => (
                  <div
                    key={cloth.id}
                    onClick={() => {
                      setActiveProducerModal(null);
                      setActiveClothModal(cloth);
                    }}
                    className="flex gap-3 p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <img
                      src={cloth.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded object-cover border border-stone-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {cloth.title}
                        </h4>
                        <p className="text-[11px] text-stone-500">{cloth.motifName}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-stone-900 tabular-nums">
                          {formatPrice(cloth)}
                        </span>
                        <span className="text-[11px] text-amber-900 font-semibold flex items-center">
                          View <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
