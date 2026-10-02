import React, { useState, useMemo } from 'react';
import { Search, Heart, MessageCircle, Eye, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClothCatalog: React.FC = () => {
  const {
    cloths,
    formatPrice,
    favorites,
    toggleFavorite,
    setActiveClothModal,
    producers,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Bridal', value: 'Bridal' },
    { label: 'Royal', value: 'Royal' },
    { label: 'Ceremonial', value: 'Ceremonial' },
    { label: 'Contemporary', value: 'Contemporary' },
    { label: 'Wall Tapestry', value: 'Wall Tapestry' },
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
    <section id="catalog" className="py-24 sm:py-32 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-900 block mb-2">
              Authentic Handloom Archive
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
              The Collection
            </h2>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              Every wrapper individually created on upright looms in Akwete Town, Abia State.
              Available for immediate dispatch or custom commission.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="catalog-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Motif, color, weaver…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-800 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* ── Category Pills ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {categories.map(cat => {
            const count =
              cat.value === 'All'
                ? cloths.length
                : cloths.filter(c => c.category === cat.value).length;
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                id={`filter-${cat.value.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border ${
                  active
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {cat.label}
                <span
                  className={`text-[10px] min-w-[18px] text-center rounded-full px-1 ${
                    active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Product Grid ── */}
        {filteredCloths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredCloths.map(cloth => {
              const isFav = favorites.includes(cloth.id);
              const producer = producers.find(p => p.id === cloth.producerId) || producers[0];

              return (
                <article
                  key={cloth.id}
                  id={`cloth-${cloth.id}`}
                  className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col"
                >
                  {/* Image — flush to card edges */}
                  <div
                    className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer"
                    onClick={() => setActiveClothModal(cloth)}
                  >
                    <img
                      src={cloth.imageUrl}
                      alt={cloth.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Category badge */}
                    <div className="absolute top-3.5 left-3.5 bg-stone-950/75 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                      {cloth.category}
                    </div>

                    {/* Favourite */}
                    <button
                      id={`fav-${cloth.id}`}
                      onClick={e => { e.stopPropagation(); toggleFavorite(cloth.id); }}
                      className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-white shadow transition-colors"
                      title="Save to favourites"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isFav ? 'fill-red-500 text-red-500' : 'text-stone-500'
                        }`}
                      />
                    </button>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold tracking-wide bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/30">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Info body */}
                  <div
                    className="flex-1 p-5 space-y-2 cursor-pointer"
                    onClick={() => setActiveClothModal(cloth)}
                  >
                    <div className="text-xs text-stone-500">
                      Woven by{' '}
                      <span className="font-semibold text-stone-700">{cloth.producerName}</span>
                    </div>
                    <h3 className="font-serif-display text-lg font-bold text-stone-900 leading-snug group-hover:text-amber-950 transition-colors">
                      {cloth.title}
                    </h3>
                    <p className="text-[11px] text-stone-400 line-clamp-1">
                      {cloth.motifName} · {cloth.dimensions}
                    </p>
                  </div>

                  {/* Footer strip — mirrors admin style */}
                  <div className="px-5 py-3.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 -mb-0.5">
                        Direct Price
                      </span>
                      <span className="text-base font-bold text-stone-900 tabular-nums">
                        {formatPrice(cloth)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp quick inquiry */}
                      <a
                        href={`https://wa.me/${producer.whatsapp}?text=Hello%20${encodeURIComponent(producer.name)},%20I%20am%20interested%20in%20your%20${encodeURIComponent(cloth.title)}%20on%20Akwete%20Luxe.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        title="Inquire via WhatsApp"
                        className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {/* View details */}
                      <button
                        id={`view-${cloth.id}`}
                        onClick={() => setActiveClothModal(cloth)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 px-3 py-2 rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="py-24 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <p className="font-serif-display text-xl font-bold text-stone-800">No Pieces Found</p>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              No cloths matched <em>"{searchQuery}"</em>. Try "Ikaki", "Indigo", or clear the filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
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
