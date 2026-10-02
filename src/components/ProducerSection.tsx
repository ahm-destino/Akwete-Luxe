import React from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProducerSection: React.FC = () => {
  const { producers, setActiveProducerModal, cloths } = useApp();

  return (
    <section id="weavers" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
            The Artisans
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1.5">
            Meet The Master Weavers
          </h2>
          <p className="mt-2 text-sm text-stone-500 leading-relaxed">
            In Akwete Town, weaving is a family craft taught from mother to daughter. You deal directly with the women behind each loom.
          </p>
        </div>

        {/* Grid — 1 col mobile, 3 col md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {producers.map(producer => {
            const producerCloths = cloths.filter(c => c.producerId === producer.id);

            return (
              <div key={producer.id} className="flex flex-col justify-between group">
                <div>
                  {/* Portrait */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 mb-4">
                    <img
                      src={producer.avatarUrl}
                      alt={producer.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-stone-950/75 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full">
                      {producer.yearsOfExperience} yrs at the loom
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-stone-400 font-medium">{producer.village}</div>
                    <h3 className="font-serif-display text-xl font-bold text-stone-900">{producer.name}</h3>
                    <p className="text-xs text-amber-900 font-semibold">{producer.nativeTitle}</p>
                    <p className="text-xs text-stone-500 leading-relaxed pt-1 line-clamp-3">
                      "{producer.quote}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveProducerModal(producer)}
                    className="font-semibold text-stone-900 hover:text-amber-950 flex items-center gap-1 transition-colors"
                  >
                    <span>Her Story ({producerCloths.length} pieces)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://wa.me/${producer.whatsapp}?text=Hello%20${encodeURIComponent(producer.name)},%20I%20saw%20your%20work%20on%20Akwete%20Luxe%20and%20I%27d%20like%20to%20order.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-700 hover:text-emerald-950 flex items-center gap-1"
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
