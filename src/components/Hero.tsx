import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="py-12 sm:py-18 lg:py-24 bg-[#FAF9F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Ndoki Clan · Abia State, Nigeria
            </span>

            <h1 className="font-serif-display text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 leading-[1.08]">
              Handwoven Akwete Cloth.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-lg font-normal">
              Woven thread by thread on traditional vertical upright looms by master female artisans in Akwete Town. 
              Authentic double wrappers for traditional weddings, titles, and milestones.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>View Collection</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#weavers"
                className="inline-flex items-center text-sm font-semibold text-stone-700 hover:text-stone-950 px-3 py-3.5 transition-colors"
              >
                <span>Meet The Weavers</span>
              </a>
            </div>

            <div className="pt-6 border-t border-stone-200 flex items-center gap-6 text-xs text-stone-500">
              <span>Continuous broadloom</span>
              <span>·</span>
              <span>100% reversible finish</span>
              <span>·</span>
              <span>Direct artisan payout</span>
            </div>
          </div>

          {/* Clean Editorial Photo */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden bg-stone-100 shadow-md">
              <img
                src="/images/akwaete_hero_cloth_1790722114411.jpg"
                alt="Akwete handwoven cloth"
                className="w-full h-auto aspect-4/3 object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-3 text-xs text-stone-500 text-right">
              Double wrapper set with royal Ikaki motifs, woven by Mama Grace Nwosu in Akwete.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
