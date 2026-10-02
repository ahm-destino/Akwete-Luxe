import React from 'react';

export const HeritageSection: React.FC = () => {
  return (
    <section id="heritage" className="py-16 sm:py-24 bg-[#F7F5EE] border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
            Heritage & Provenance
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-stone-900 mt-2 leading-tight">
            The Living Craft<br className="hidden sm:block" /> of Akwete
          </h2>
          <p className="mt-3 text-stone-500 text-sm sm:text-base leading-relaxed">
            In Ukwa East, Abia State, the upright wooden loom has remained largely unchanged for generations.
            Unlike fabrics stitched from narrow strips, genuine Akwete is handwoven as a single continuous broadloom sheet.
          </p>
        </div>

        {/* 3 stories — stack on mobile, row on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">

          <div className="space-y-2.5 pb-8 sm:pb-0 border-b sm:border-b-0 border-stone-200 last:border-0">
            <h3 className="font-serif-display text-lg sm:text-xl font-bold text-stone-900">
              Dada Nwakata's Invention
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              In the 19th century, an Akwete woman named Dada Nwakata unraveled imported threads brought up the Imo River to decode their construction.
              Working behind woven bamboo screens, she developed Akwete's famous reversible weaving technique.
            </p>
          </div>

          <div className="space-y-2.5 pb-8 sm:pb-0 border-b sm:border-b-0 border-stone-200 last:border-0">
            <h3 className="font-serif-display text-lg sm:text-xl font-bold text-stone-900">
              The Vertical Broadloom
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              While other West African textiles like Aso-Oke or Kente are woven in 4-inch strips and joined,
              Akwete is woven on a tall vertical frame up to 50 inches wide — with no joined seams.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="font-serif-display text-lg sm:text-xl font-bold text-stone-900">
              Language of Motifs
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              The patterns are intentional cultural statements. The famed <em>Ikaki</em> (tortoise) symbolizes royal wisdom and longevity,
              while <em>Ochi</em> celebrates fertility and joyful new beginnings on wedding days.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
