import React, { useState, useEffect } from 'react';
import { SectionHeader, OmSymbol, SwastikSymbol, PeacockFeatherIcon } from '../components/KrishnaAccents';
import api, { getAssetUrl } from '../services/api';
import type { Event, GalleryImage } from '../types';
import { Calendar, ChevronLeft, ChevronRight, X, Eye, Images, Sparkles, Filter } from 'lucide-react';

interface EventWithPhotos extends Event {
  photos?: string[];
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventWithPhotos[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'photos'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Lightbox Slider Modal State (Supports both Event Sliders and Gallery Photos)
  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    event_date?: string;
    description?: string;
    photos: string[];
  } | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  const fetchData = async () => {
    try {
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.events || []);
        setGallery(res.data.gallery || []);
      }
    } catch (err) {
      console.error('Events & Gallery fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openLightboxForEvent = (event: EventWithPhotos) => {
    setSelectedEvent({
      title: event.title,
      event_date: event.event_date,
      description: event.description,
      photos: event.photos && event.photos.length > 0 ? event.photos : [event.image_url || '']
    });
    setCurrentPhotoIndex(0);
  };

  const openLightboxForPhoto = (photo: GalleryImage, allPhotosList: string[]) => {
    const idx = allPhotosList.indexOf(photo.image_url);
    setSelectedEvent({
      title: photo.title || 'आश्रम गैलरी तस्वीर',
      description: `श्रेणी: ${photo.category || 'गैलरी'} | आश्रम पावन स्मृतियाँ`,
      photos: allPhotosList.length > 0 ? allPhotosList : [photo.image_url]
    });
    setCurrentPhotoIndex(idx >= 0 ? idx : 0);
  };

  const closeLightbox = () => {
    setSelectedEvent(null);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = () => {
    if (!selectedEvent || !selectedEvent.photos || selectedEvent.photos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev === selectedEvent.photos.length - 1 ? 0 : prev + 1));
  };

  const prevPhoto = () => {
    if (!selectedEvent || !selectedEvent.photos || selectedEvent.photos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev === 0 ? selectedEvent.photos.length - 1 : prev - 1));
  };

  // Compile unique gallery photos
  const filteredGallery = gallery.filter((img) => {
    if (selectedCategory === 'all') return true;
    return img.category === selectedCategory;
  });

  const categories = ['all', ...Array.from(new Set(gallery.map(g => g.category || 'कार्यक्रम')))];
  const allGalleryUrls = filteredGallery.map(g => g.image_url);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SectionHeader
        title="कार्यक्रम एवं फोटो गैलरी (Events & Gallery)"
        subtitle="आश्रम में आयोजित पावन उत्सवों, त्योहारों, भोजन वितरण और स्वास्थ्य शिविरों की सहेजी गई स्मृतियाँ।"
      />

      {/* FILTER & TAB BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gold/40 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-maroon text-gold border border-gold shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-gold/10'
            }`}
          >
            सभी (All) ({events.length + gallery.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'events'
                ? 'bg-maroon text-gold border border-gold shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-gold/10'
            }`}
          >
            कार्यक्रम (Events) ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'photos'
                ? 'bg-maroon text-gold border border-gold shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-gold/10'
            }`}
          >
            फोटो गैलरी (Gallery) ({gallery.length})
          </button>
        </div>

        {activeTab !== 'events' && categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Filter className="w-4 h-4 text-saffron shrink-0" />
            <span className="text-xs font-bold text-slate-500 mr-1">श्रेणी:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-saffron text-white shadow-sm'
                    : 'bg-cream/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gold/20'
                }`}
              >
                {cat === 'all' ? 'सभी श्रेणियां' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-saffron font-bold text-lg animate-pulse flex flex-col items-center gap-3">
          <PeacockFeatherIcon className="w-10 h-10 animate-bounce" />
          <span>कार्यक्रम एवं गैलरी लोड हो रही है... कृपया प्रतीक्षा करें</span>
        </div>
      ) : events.length === 0 && gallery.length === 0 ? (
        <div className="text-center py-16 card-krishna max-w-md mx-auto space-y-3">
          <Images className="w-12 h-12 mx-auto text-saffron opacity-80" />
          <h4 className="text-lg font-bold text-maroon dark:text-gold">कोई तस्वीर या कार्यक्रम उपलब्ध नहीं है</h4>
          <p className="text-xs text-slate-500">व्यवस्थापक द्वारा जोड़ी गई नई तस्वीरें यहाँ स्वतः प्रदर्शित होंगी।</p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* SECTION 1: EVENTS WITH MULTI-PHOTO LIGHTBOX */}
          {(activeTab === 'all' || activeTab === 'events') && events.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gold/30 pb-3">
                <Sparkles className="w-5 h-5 text-saffron" />
                <h3 className="text-2xl font-bold font-heading text-maroon dark:text-gold">
                  आयोजित कार्यक्रम (Ashram Events)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((evt) => {
                  const photoCount = evt.photos?.length || 1;
                  const coverImage = evt.photos?.[0] || evt.image_url || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80";

                  return (
                    <div 
                      key={evt.id} 
                      className="card-krishna flex flex-col justify-between group cursor-pointer hover:border-saffron transition-all duration-300 shadow-xl"
                      onClick={() => openLightboxForEvent(evt)}
                    >
                      <div>
                        <div className="relative overflow-hidden rounded-2xl mb-4 border border-gold/40 h-56 bg-slate-900">
                          <img
                            src={getAssetUrl(coverImage)}
                            alt={evt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
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

                        <h4 className="text-xl sm:text-2xl font-bold font-heading mb-2 text-maroon dark:text-gold group-hover:text-saffron transition-colors">
                          {evt.title}
                        </h4>

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
            </div>
          )}

          {/* SECTION 2: STANDALONE & ALL GALLERY PHOTOS GRID */}
          {(activeTab === 'all' || activeTab === 'photos') && filteredGallery.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-gold/30 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Images className="w-5 h-5 text-saffron" />
                  <h3 className="text-2xl font-bold font-heading text-maroon dark:text-gold">
                    आश्रम फोटो गैलरी (Photo Gallery)
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
                  कुल {filteredGallery.length} सहेजी गई तस्वीरें
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredGallery.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="relative group rounded-2xl overflow-hidden border-2 border-gold/40 shadow-lg bg-slate-900 aspect-square cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-saffron hover:shadow-2xl"
                    onClick={() => openLightboxForPhoto(img, allGalleryUrls)}
                  >
                    <img
                      src={getAssetUrl(img.image_url)}
                      alt={img.title || `आश्रम तस्वीर ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-maroon/85 text-gold border border-gold/40 shadow backdrop-blur-sm">
                        {img.category || 'गैलरी'}
                      </span>
                    </div>

                    {/* Bottom Caption on Hover / Visible */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-xs sm:text-sm font-bold truncate text-amber-200">
                        {img.title || 'आश्रम स्मृति'}
                      </p>
                      <span className="text-[10px] text-slate-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3" /> बड़ा करके देखें
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <h4 className="text-lg sm:text-xl font-bold font-heading text-amber-200 truncate max-w-md sm:max-w-xl">
                  {selectedEvent.title}
                </h4>
              </div>

              <button
                onClick={closeLightbox}
                className="p-2 rounded-full hover:bg-white/20 text-gold hover:text-white transition-colors cursor-pointer"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-maroon/80 hover:bg-saffron text-gold hover:text-white transition-all backdrop-blur-md border border-gold/50 shadow-xl cursor-pointer"
                  aria-label="पिछली तस्वीर"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Next Arrow */}
              {selectedEvent.photos.length > 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-maroon/80 hover:bg-saffron text-gold hover:text-white transition-all backdrop-blur-md border border-gold/50 shadow-xl cursor-pointer"
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
            <div className="p-5 sm:p-6 bg-slate-950 text-slate-200 border-t border-gold/30">
              {selectedEvent.event_date && (
                <div className="flex items-center gap-2 text-saffron font-bold text-xs mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>आयोजन तिथि: {new Date(selectedEvent.event_date).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {selectedEvent.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {selectedEvent.description}
                </p>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
