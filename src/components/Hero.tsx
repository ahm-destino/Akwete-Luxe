import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const slides = [
  { src: '/images/Akwete 001.jpg', alt: 'Woman wearing a colourful handwoven Akwete wrapper set', caption: 'Akwete cloth for ceremonies, weddings, and milestones.' },
  { src: '/images/Akwete 002.jpg', alt: 'Woman wearing a contemporary green and pink Akwete outfit', caption: 'Heritage weaving, styled for contemporary life.' },
  { src: '/images/Akwete 003.jpg', alt: 'Woman in red ceremonial dress with a handwoven Akwete cloth', caption: 'Distinctive patterns, woven thread by thread in Akwete.' },
];

export const Hero: React.FC = () => {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const goTo = (index: number) => setActive((index + slides.length) % slides.length);
  const previous = () => goTo(active - 1);
  const next = () => goTo(active + 1);

  useEffect(() => {
    const timer = window.setInterval(next, 10000);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-[#FAF9F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-5 sm:space-y-6 order-2 lg:order-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-600">Ndoki Clan · Abia State, Nigeria</span>
            <h1 className="font-serif-display text-[2.4rem] leading-[1.05] sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900">Handwoven<br className="hidden sm:block" /> Akwete Cloth.</h1>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-md">Woven thread by thread on traditional vertical upright looms by master female artisans in Akwete Town. Authentic double wrappers for traditional weddings, titles, and milestones.</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#catalog" className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors">View Collection <ArrowRight className="w-4 h-4" /></a>
              <a href="#weavers" className="inline-flex items-center text-sm font-semibold text-stone-700 hover:text-stone-950 px-3 py-3 transition-colors">Meet The Weavers</a>
            </div>
            <div className="pt-5 border-t border-stone-200 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-600 font-medium"><span>Continuous broadloom</span><span className="hidden sm:inline">·</span><span>100% reversible finish</span><span className="hidden sm:inline">·</span><span>Direct artisan payout</span></div>
          </div>

          <div className="order-1 lg:order-2">
            <div
              className="relative rounded-2xl overflow-hidden bg-stone-100 shadow-md touch-pan-y"
              onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
              onTouchEnd={event => { if (touchStart.current === null) return; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 40) distance > 0 ? previous() : next(); touchStart.current = null; }}
              aria-roledescription="carousel"
              aria-label="Akwete cloth styles"
            >
              {slides.map((slide, index) => (
                <img key={slide.src} src={slide.src} alt={slide.alt} className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${index === active ? 'opacity-100' : 'opacity-0'}`} aria-hidden={index !== active} />
              ))}
              <div className="relative aspect-4/3 sm:aspect-video lg:aspect-4/3" />
              <button onClick={previous} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
              <button onClick={next} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-stone-900 shadow-sm"><ArrowRight className="w-5 h-5" /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((slide, index) => <button key={slide.src} onClick={() => goTo(index)} aria-label={`Show image ${index + 1}`} aria-current={index === active} className={`w-2.5 h-2.5 rounded-full transition-colors ${index === active ? 'bg-white' : 'bg-white/55 hover:bg-white/80'}`} />)}
              </div>
            </div>
            <p className="mt-2.5 text-[11px] text-stone-600 text-right leading-snug" aria-live="polite">{slides[active].caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
