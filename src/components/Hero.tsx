import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-[#FAF9F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Copy */}
          <div className="space-y-5 sm:space-y-6 order-2 lg:order-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
              Ndoki Clan · Abia State, Nigeria
            </span>

            <h1 className="font-serif-display text-[2.4rem] leading-[1.05] sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900">
              Handwoven<br className="hidden sm:block" /> Akwete Cloth.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-md">
              Woven thread by thread on traditional vertical upright looms by master female artisans in Akwete Town.
              Authentic double wrappers for traditional weddings, titles, and milestones.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>View Collection</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#weavers"
                className="inline-flex items-center text-sm font-semibold text-stone-700 hover:text-stone-950 px-3 py-3 transition-colors"
              >
                Meet The Weavers
              </a>
            </div>

            <div className="pt-5 border-t border-stone-200 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400 font-medium">
              <span>Continuous broadloom</span>
              <span className="hidden sm:inline">·</span>
              <span>100% reversible finish</span>
              <span className="hidden sm:inline">·</span>
              <span>Direct artisan payout</span>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden bg-stone-100 shadow-md">
              <img
                src="/images/akwaete_hero_cloth_1790722114411.jpg"
                alt="Akwete handwoven cloth — double wrapper set with royal Ikaki motifs"
                className="w-full h-auto aspect-4/3 sm:aspect-video lg:aspect-4/3 object-cover object-center"
              />
            </div>
            <p className="mt-2.5 text-[11px] text-stone-400 text-right leading-snug">
              Double wrapper set with royal Ikaki motifs, woven by Mama Grace Nwosu in Akwete.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
