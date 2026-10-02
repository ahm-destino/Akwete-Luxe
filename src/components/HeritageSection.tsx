import React from 'react';

export const HeritageSection: React.FC = () => {
  return (
    <section id="heritage" className="py-16 sm:py-24 bg-[#F7F5EE] border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            Heritage & Provenance
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-stone-900 mt-2">
            The Living Craft of Akwete
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
            In Ukwa East, Abia State, the upright wooden loom has remained largely unchanged for generations. 
            Unlike fabrics stitched from narrow strips, genuine Akwete is handwoven as a single continuous broadloom sheet.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 text-sm text-stone-700 leading-relaxed">
          
          <div className="space-y-3">
            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              Dada Nwakata's Invention
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              In the 19th century, an Akwete woman named Dada Nwakata unraveled imported threads brought up the Imo River to decode their construction. Working behind woven bamboo screens, she developed Akwete's famous reversible weaving technique.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              The Vertical Broadloom
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              While other West African textiles like Aso-Oke or Kente are woven in 4-inch strips and joined with a sewing machine, Akwete is woven on a tall vertical frame up to 50 inches wide. It has no joined seams.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              Language of Motifs
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              The patterns are intentional cultural statements. The famed <em>Ikaki</em> (tortoise) symbolizes royal wisdom and longevity, while <em>Ochi</em> celebrates fertility and joyful new beginnings on wedding days.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
