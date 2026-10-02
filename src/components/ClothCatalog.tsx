import React, { useState, useMemo } from 'react';
import { Search, Heart, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClothCatalog: React.FC = () => {
  const {
    cloths,
    formatPrice,
    favorites,
    toggleFavorite,
    setActiveClothModal,
    producers
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { label: 'All Pieces', value: 'All' },
    { label: 'Traditional Wedding (Igba Nkwu)', value: 'Bridal' },
    { label: 'Royal & Chieftaincy', value: 'Royal' },
    { label: 'Ceremonial Heirlooms', value: 'Ceremonial' }
  ];

  const filteredCloths = useMemo(() => {
    return cloths.filter(cloth => {
      const matchesSearch =
        cloth.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cloth.motifName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cloth.producerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cloth.colors.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || cloth.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [cloths, searchQuery, selectedCategory]);

  return (
    <section id="catalog" className="py-24 sm:py-32 bg-[#FAF9F5] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Curated Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-900 block mb-1.5">
              Authentic Handloom Archive
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight">
              The Collection
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
              Every double wrapper set is individually created on vertical upright looms in Akwete Town, Abia State. Available for immediate dispatch or custom weaving.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search motif, color, weaver..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const count = cat.value === 'All' 
              ? cloths.length 
              : cloths.filter(c => c.category === cat.value).length;

            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === cat.value
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.value ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Spacious, Floating Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-18 lg:gap-x-14 lg:gap-y-24">
          {filteredCloths.map(cloth => {
            const isFav = favorites.includes(cloth.id);
            const producer = producers.find(p => p.id === cloth.producerId) || producers[0];

            return (
              <div
                key={cloth.id}
                onClick={() => setActiveClothModal(cloth)}
                className="group cursor-pointer bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-2 hover:border-amber-900/30 transition-all duration-300 ease-out flex flex-col justify-between"
              >
                <div>
                  {/* Portrait Aspect Ratio (4:5) for Textile Drape */}
                  <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 mb-5 shadow-2xs">
                    <img
                      src={cloth.imageUrl}
                      alt={cloth.title}
                      className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />

                    {/* Translucent Category Badge */}
                    <div className="absolute top-3.5 left-3.5 bg-stone-950/75 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
                      {cloth.category}
                    </div>

                    {/* Discreet Favorite Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(cloth.id);
                      }}
                      className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 transition-colors shadow-2xs"
                      title="Save to favorites"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : ''}`} />
                    </button>

                    {/* Slide-Up Hover Bar */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-stone-950/80 via-stone-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between text-white text-xs font-semibold">
                      <span className="flex items-center gap-1.5 pl-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Inspect Weave & Motifs</span>
                      </span>
                      <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                        Details →
                      </span>
                    </div>
                  </div>

                  {/* Clean Editorial Typography & Hierarchy */}
                  <div className="space-y-2.5">
                    
                    {/* Weaver attribution & Provenance */}
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-semibold text-stone-700">
                        {cloth.producerName}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Akwete Town, Abia
                      </span>
                    </div>

                    {/* Piece Title */}
                    <h3 className="font-serif-display text-xl font-bold text-stone-900 group-hover:text-amber-950 transition-colors leading-snug">
                      {cloth.title}
                    </h3>

                    {/* Motif and Dimensions */}
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {cloth.motifName} · {cloth.dimensions}
                    </p>
                  </div>
                </div>

                {/* Price and Action Bar */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block -mb-0.5">
                      Direct Price
                    </span>
                    <span className="font-bold text-stone-900 text-base sm:text-lg tabular-nums">
                      {formatPrice(cloth)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${producer.whatsapp}?text=Hello%20${encodeURIComponent(producer.name)},%20I%20am%20interested%20in%20your%20${encodeURIComponent(cloth.title)}%20on%20Akwete%20Luxe.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-2 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Inquire directly on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => setActiveClothModal(cloth)}
                      className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCloths.length === 0 && (
          <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-stone-200">
            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              No Pieces Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No cloths matched "{searchQuery}". Try searching for motifs like "Ikaki", colors like "Indigo" or "Gold", or clear your filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-2 text-xs font-bold text-amber-900 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
