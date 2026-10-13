import React, { useState, useEffect } from 'react';
import { SectionHeader, OmSymbol, SwastikSymbol } from '../components/KrishnaAccents';
import api, { getAssetUrl } from '../services/api';
import type { Event } from '../types';
import { Calendar, ChevronLeft, ChevronRight, X, Eye, Images } from 'lucide-react';

interface EventWithPhotos extends Event {
  photos?: string[];
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventWithPhotos[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Lightbox Slider Modal State
  const [selectedEvent, setSelectedEvent] = useState<EventWithPhotos | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/events');
        if (res.data.success) {
          setEvents(res.data.events);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openLightbox = (event: EventWithPhotos) => {
    setSelectedEvent(event);
    setCurrentPhotoIndex(0);
  };

  const closeLightbox = () => {
    setSelectedEvent(null);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = () => {
    if (!selectedEvent || !selectedEvent.photos) return;
    setCurrentPhotoIndex((prev) => (prev === selectedEvent.photos!.length - 1 ? 0 : prev + 1));
  };

  const prevPhoto = () => {
    if (!selectedEvent || !selectedEvent.photos) return;
    setCurrentPhotoIndex((prev) => (prev === 0 ? selectedEvent.photos!.length - 1 : prev - 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SectionHeader
        title="कार्यक्रम एवं फोटो गैलरी (Events & Gallery)"
        subtitle="आश्रम में आयोजित पावन उत्सवों, त्योहारों और स्वास्थ्य शिविरों की झलकियाँ। (किसी भी कार्यक्रम पर क्लिक करके तस्वीरें देखें)"
      />

      {loading ? (
        <div className="text-center py-16 text-saffron font-bold text-lg">
          कार्यक्रम लोड हो रहे हैं...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 card-krishna max-w-md mx-auto">
          <p className="text-slate-600 dark:text-slate-400 font-bold">कोई कार्यक्रम प्रकाशित नहीं किया गया है।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((evt) => {
            const photoCount = evt.photos?.length || 1;
            const coverImage = evt.photos?.[0] || evt.image_url || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80";

            return (
              <div 
                key={evt.id} 
                className="card-krishna flex flex-col justify-between group cursor-pointer hover:border-saffron transition-all duration-300 shadow-xl"
                onClick={() => openLightbox(evt)}
              >
                <div>
                  <div className="relative overflow-hidden rounded-2xl mb-4 border border-gold/40 h-56 bg-slate-900">
                    <img
                      src={getAssetUrl(coverImage)}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Photo Count Badge */}
                    <div className="absolute top-3 right-3 bg-maroon/85 text-gold px-3 py-1 rounded-full text-xs font-bold border border-gold/40 shadow-md flex items-center gap-1.5 backdrop-blur-md">
                      <Images className="w-3.5 h-3.5" />
                      <span>{photoCount} तस्वीरें</span>
                    </div>

                    {/* View overlay hover icon */}
                    <div className="absolute inset-0 bg-maroon/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="btn-gold py-2 px-4 text-xs flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-4 h-4" /> गैलरी देखें
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-saffron font-bold text-xs sm:text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(evt.event_date).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-heading mb-2 text-maroon dark:text-gold group-hover:text-saffron transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gold/20 flex items-center justify-between text-xs font-bold text-saffron">
                  <span>श्री कृष्ण कृपा सेवा</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    गैलरी स्लाइडर खोलें &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX EVENT PHOTO SLIDER MODAL */}
      {selectedEvent && selectedEvent.photos && selectedEvent.photos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-gold/60 shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-maroon/90 border-b border-gold/40 text-cream">
              <div className="flex items-center gap-2">
                <SwastikSymbol className="text-gold text-lg" />
                <OmSymbol className="text-gold text-lg" />
                <h3 className="text-lg sm:text-xl font-bold font-heading text-amber-200">
                  {selectedEvent.title}
                </h3>
              </div>

              <button
                onClick={closeLightbox}
                className="p-2 rounded-full hover:bg-white/20 text-gold hover:text-white transition-colors"
                title="बंद करें"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Image Slider Container */}
            <div className="relative h-[320px] sm:h-[480px] md:h-[540px] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={getAssetUrl(selectedEvent.photos[currentPhotoIndex])}
                alt={`${selectedEvent.title} - फोटो ${currentPhotoIndex + 1}`}
                className="max-h-full max-w-full object-contain transition-all duration-500"
              />

              {/* Prev Arrow */}
              {selectedEvent.photos.length > 1 && (
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-maroon/80 hover:bg-saffron text-gold hover:text-white transition-all backdrop-blur-md border border-gold/50 shadow-xl"
                  aria-label="पिछली तस्वीर"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Next Arrow */}
              {selectedEvent.photos.length > 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-maroon/80 hover:bg-saffron text-gold hover:text-white transition-all backdrop-blur-md border border-gold/50 shadow-xl"
                  aria-label="अगली तस्वीर"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Photo Indicator Counter Badge */}
              <div className="absolute top-4 left-4 bg-maroon/85 backdrop-blur-md px-3 py-1 rounded-full border border-gold/50 text-gold text-xs font-bold shadow-md">
                तस्वीर {currentPhotoIndex + 1} / {selectedEvent.photos.length}
              </div>
            </div>

            {/* Modal Footer Description */}
            <div className="p-6 bg-slate-950 text-slate-200 border-t border-gold/30">
              <div className="flex items-center gap-2 text-saffron font-bold text-xs mb-1">
                <Calendar className="w-4 h-4" />
                <span>आयोजन तिथि: {new Date(selectedEvent.event_date).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {selectedEvent.description}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
