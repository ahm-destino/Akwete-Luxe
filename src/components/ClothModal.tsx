import React, { useState } from 'react';
import { X, Heart, MessageCircle, ShoppingBag, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClothModal: React.FC = () => {
  const {
    activeClothModal,
    setActiveClothModal,
    formatPrice,
    addToCart,
    favorites,
    toggleFavorite,
    producers
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);

  if (!activeClothModal) return null;

  const cloth = activeClothModal;
  const isFav = favorites.includes(cloth.id);
  const producer = producers.find(p => p.id === cloth.producerId) || producers[0];

  const images = [
    cloth.imageUrl,
    cloth.secondaryImageUrl || cloth.imageUrl
  ];

  const handleAddToCart = () => {
    addToCart(cloth, 1);
    setIsAddedFeedback(true);
    setTimeout(() => {
      setIsAddedFeedback(false);
    }, 2000);
  };

  const whatsappMessage = `Hello ${producer.name}, I am looking at your ${cloth.title} (${formatPrice(cloth)}) on Akwete Luxe. Is this piece available for delivery?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveClothModal(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 shadow-sm border border-stone-200 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Visual Gallery */}
          <div className="md:col-span-6 bg-stone-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
            <div className="space-y-3">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-white shadow-2xs">
                <img
                  src={images[activeImageIndex]}
                  alt={cloth.title}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-stone-900' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 text-xs text-stone-500">
              <span>Woven on traditional upright wooden frame in Akwete. Both front and reverse sides are completely finished.</span>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Woven by {producer.name}</span>
                  <button
                    onClick={() => toggleFavorite(cloth.id)}
                    className="text-stone-400 hover:text-red-600"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : ''}`} />
                  </button>
                </div>

                <h2 className="font-serif-display text-2xl font-bold text-stone-900 leading-snug">
                  {cloth.title}
                </h2>

                <p className="font-serif-display text-2xl font-bold text-stone-900 mt-2 tabular-nums">
                  {formatPrice(cloth)}
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-2 py-3 border-y border-stone-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Cut:</span>
                  <span className="font-medium text-stone-900">{cloth.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Yarns:</span>
                  <span className="font-medium text-stone-900">{cloth.materials}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Motif:</span>
                  <span className="font-medium text-stone-900">{cloth.motifName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Time on Loom:</span>
                  <span className="font-medium text-stone-900">{cloth.weaveTimeDays} Days</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed">
                {cloth.description}
              </p>

              <div className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-200">
                Waybill dispatch available across Nigeria via GIG Logistics / Peace Mass, and worldwide via DHL Express.
              </div>

            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {isAddedFeedback && (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold text-center rounded-lg flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Added to bag!</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <a
                  href={`https://wa.me/${producer.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
