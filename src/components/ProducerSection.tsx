import React from 'react';
import { MessageCircle, ArrowRight, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProducerSection: React.FC = () => {
  const {
    producers,
    setActiveProducerModal,
    actOnBehalfOfProducer,
    setIsAdminOpen,
    cloths
  } = useApp();

  return (
    <section id="weavers" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            The Artisans
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Meet The Master Weavers
          </h2>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            In Akwete Town, weaving is a family craft taught from mother to daughter. You deal directly with the women behind each loom.
          </p>
        </div>

        {/* Weavers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {producers.map(producer => {
            const producerCloths = cloths.filter(c => c.producerId === producer.id);

            return (
              <div
                key={producer.id}
                className="flex flex-col justify-between group"
              >
                <div>
                  {/* Portrait */}
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 mb-4">
                    <img
                      src={producer.avatarUrl}
                      alt={producer.name}
                      className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-3 bg-stone-950/75 text-white text-[11px] px-2.5 py-0.5 rounded">
                      {producer.yearsOfExperience} years at the loom
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="text-xs text-stone-500">
                      {producer.village}
                    </div>

                    <h3 className="font-serif-display text-xl font-bold text-stone-900">
                      {producer.name}
                    </h3>

                    <p className="text-xs text-amber-900 font-medium">
                      {producer.nativeTitle}
                    </p>

                    <p className="text-xs text-stone-600 leading-relaxed pt-2 line-clamp-3">
                      "{producer.quote}"
                    </p>
                  </div>
                </div>

                {/* Clean Actions */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveProducerModal(producer)}
                    className="font-semibold text-stone-900 hover:text-amber-950 flex items-center gap-1 transition-colors"
                  >
                    <span>Read Her Story ({producerCloths.length} pieces)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://wa.me/${producer.whatsapp}?text=Hello%20${encodeURIComponent(producer.name)},%20I%20am%20interested%20in%20ordering%20an%20Akwete%20cloth%20from%20your%20loom.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
