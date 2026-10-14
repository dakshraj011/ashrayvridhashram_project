import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { OmSymbol, SwastikSymbol, KrishnaLotusEmblem } from './KrishnaAccents';
import memory1 from '../assets/memory1.png';
import memory2 from '../assets/memory2.jpeg';
import memory3 from '../assets/memory3.png';

interface Slide {
  id: number;
  url: string;
  title: string;
  subtitle: string;
  badge: string;
}

const slides: Slide[] = [
  {
    id: 1,
    url: memory1,
    title: 'मुस्कुराते चेहरे एवं अपनत्व भरा परिवार',
    subtitle: 'हमारे आश्रय धाम में बुजुर्ग माता-पिता समान निवासियों के बीच प्यार और सम्मान',
    badge: 'आनंदित जीवन'
  },
  {
    id: 2,
    url: memory2,
    title: 'सुंदर वातावरण में प्राकृतिक एवं सुखद समय',
    subtitle: 'आश्रम के प्रांगण में धूप, शुद्ध हवा और साथ में बिताए यादगार स्नेहपूर्ण क्षण',
    badge: 'प्रकृति एवं स्वास्थ्य'
  },
  {
    id: 3,
    url: memory3,
    title: 'उल्लासपूर्ण उत्सव एवं सांस्कृतिक कार्यक्रम',
    subtitle: 'सभी प्रमुख त्योहार, भजन-सत्संग तथा मांगलिक अवसर एक साथ मिलकर मनाना',
    badge: 'उल्लास एवं पर्व'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1200&q=80',
    title: 'सक्रिय गतिविधियाँ एवं सात्विक जीवन',
    subtitle: 'दैनिक योग, इनडोर खेल, पुस्तकालय एवं 24 घंटे समर्पित सेवा तथा स्वास्थ्य लाभ',
    badge: 'आरोग्य एवं सेवा'
  }
];

export const ImageSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative max-w-6xl mx-auto my-4 sm:my-8 px-2 sm:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Container Frame with Krishna Gold Glow */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/60 bg-slate-900 group">
        
        {/* Slider Images with Mobile Responsive Aspect Height */}
        <div className="relative h-[340px] sm:h-[420px] md:h-[500px] w-full overflow-hidden">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                } transform transition-transform duration-700`}
              >
                {/* Background Image - Object Cover Center */}
                <img
                  src={slide.url}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />

                {/* Gradient Overlay for Mobile & Desktop contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/95 via-slate-950/60 to-transparent sm:via-slate-950/40" />

                {/* Top Corner Accents */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 bg-maroon/85 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-gold/50 shadow-md">
                  <SwastikSymbol className="text-gold text-xs sm:text-sm" />
                  <span className="text-[11px] sm:text-xs font-bold text-cream tracking-wide">
                    {slide.badge}
                  </span>
                </div>

                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-saffron/85 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-gold/50 text-white text-[11px] sm:text-xs font-bold shadow-md">
                  <KrishnaLotusEmblem className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>आश्रय धाम</span>
                </div>

                {/* Bottom Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-10 z-20 text-white">
                  <div className="max-w-3xl pr-12 sm:pr-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <OmSymbol className="text-gold text-base sm:text-xl shrink-0" />
                      <h3 className="text-lg sm:text-2xl md:text-4xl font-extrabold font-heading text-amber-200 drop-shadow-md leading-tight line-clamp-2 sm:line-clamp-none">
                        {slide.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-base md:text-lg text-amber-50/90 font-medium leading-snug sm:leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Arrow Button - Responsive size */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-maroon/80 hover:bg-saffron text-gold hover:text-white transition-all duration-300 backdrop-blur-md border border-gold/50 shadow-xl opacity-90 active:scale-95 hover:scale-110"
          aria-label="पिछली तस्वीर"
        >
          <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>

        {/* Right Arrow Button - Responsive size */}
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-maroon/80 hover:bg-saffron text-gold hover:text-white transition-all duration-300 backdrop-blur-md border border-gold/50 shadow-xl opacity-90 active:scale-95 hover:scale-110"
          aria-label="अगली तस्वीर"
        >
          <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
        </button>

        {/* Play/Pause indicator & Navigation Dots Bar */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-4 z-30 flex items-center gap-2 sm:gap-3 bg-maroon/85 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gold/40 shadow-lg">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-gold hover:text-white transition-colors"
            title={isPaused ? "ऑटो स्लाइड शुरू करें" : "ऑटो स्लाइड रोकें"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />}
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-5 sm:w-7 h-2 sm:h-2.5 bg-gradient-to-r from-saffron to-gold shadow-md'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`स्लाइड ${index + 1} पर जाएं`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
