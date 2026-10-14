import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, OmSymbol, SwastikSymbol, PeacockFeatherIcon, AashrayLogo } from '../components/KrishnaAccents';
import { StatusBadge } from '../components/StatusBadge';
import { ImageSlider } from '../components/ImageSlider';
import api from '../services/api';
import heroPhoto from '../assets/hero_photo.jpeg';
import type { Need, Event, HomeInfo } from '../types';
import { Heart, Calendar, Users, Utensils, Gift, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const Home: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [homeInfo, setHomeInfo] = useState<HomeInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [needsRes, eventsRes, infoRes] = await Promise.all([
          api.get('/needs?status=सक्रिय'),
          api.get('/events'),
          api.get('/home/info')
        ]);

        if (needsRes.data.success) setNeeds(needsRes.data.needs.slice(0, 4));
        if (eventsRes.data.success) setEvents(eventsRes.data.events.slice(0, 3));
        if (infoRes.data.success) setHomeInfo(infoRes.data.info);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">

      {/* KRISHNA INSPIRED HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/80 via-cream to-[#FFF6E9] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-10 pb-20 px-4 sm:px-6 lg:px-8 border-b-2 border-gold/40 shadow-inner">

        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-saffron/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gold/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Text Block */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
              <AashrayLogo className="w-16 h-16 sm:w-20 sm:h-20 shadow-xl border-2 border-gold rounded-full" />
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-saffron/20 via-gold/30 to-maroon/20 border-2 border-gold/50 shadow-md text-maroon dark:text-gold font-bold text-xs sm:text-base flex-wrap">
                <SwastikSymbol className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                <OmSymbol className="text-saffron text-sm sm:text-lg" />
                <span>॥ श्री कृष्णः शरणं मम ॥</span>
                <PeacockFeatherIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-maroon dark:text-gold leading-tight font-heading tracking-tight drop-shadow">
              {homeInfo?.name || 'आश्रय वृद्धाश्रम'}
            </h1>


            <p className="text-xl sm:text-2xl md:text-3xl text-saffron-600 font-extrabold font-heading">
              {homeInfo?.tagline || 'वरिष्ठ नागरिकों का अपना स्नेहपूर्ण एवं पावन धाम'}
            </p>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {homeInfo?.description || 'आश्रय में हम असहाय एवं बुजुर्ग माता-पिता समान निवासियों की सात्विक सेवा, उत्तम स्वास्थ्य देखभाल और परिवार जैसा आत्मीय वातावरण प्रदान करते हैं।'}
            </p>

            {/* Shloka Highlight Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border-l-4 border-gold shadow-md italic text-maroon dark:text-gold font-heading text-base sm:text-lg">
              "मातृदेवो भव । पितृदेवो भव । वृद्ध सेवा ही नारायण सेवा है।"
            </div>

            {/* Primary Action Buttons - Mobile Full Width Stacking */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4 w-full">
              <Link to="/meal-sponsorship" className="btn-primary text-base sm:text-xl py-3.5 sm:py-4 px-6 sm:px-8 shadow-xl w-full sm:w-auto">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
                भोजन प्रायोजित करें
              </Link>
              <Link to="/needs" className="btn-gold text-base sm:text-xl py-3.5 sm:py-4 px-6 sm:px-8 shadow-xl w-full sm:w-auto">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                आवश्यकताएँ देखें
              </Link>
              <Link to="/volunteer-register" className="btn-secondary text-base sm:text-xl py-3.5 sm:py-4 px-6 sm:px-8 shadow-xl w-full sm:w-auto">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                स्वयंसेवक बनें
              </Link>
            </div>
          </div>

          {/* Right Hero Image (Lord Krishna Inspired Art Image + Glowing Aura) */}
          <div className="relative flex justify-center mt-4 lg:mt-0">
            <div className="absolute -inset-4 bg-gradient-to-tr from-saffron via-gold to-maroon rounded-3xl blur-2xl opacity-40 animate-pulse"></div>

            <div className="relative rounded-3xl overflow-hidden border-4 border-gold shadow-2xl krishna-aura max-w-lg w-full bg-maroon">
              <img
                src={heroPhoto}
                alt="आश्रय धाम में आनंदित बुजुर्ग सदस्य"
                className="w-full h-[280px] sm:h-[400px] md:h-[450px] object-cover transform hover:scale-105 transition-transform duration-700"
              />

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-maroon via-maroon/80 to-transparent p-4 sm:p-6 text-white text-center">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
                  <PeacockFeatherIcon className="w-5 h-5 sm:w-7 sm:h-7" />
                  <p className="font-heading font-extrabold text-lg sm:text-2xl text-gold">॥ सर्व धर्मान्परित्यज्य ॥</p>
                </div>
                <p className="text-xs sm:text-sm text-cream/90 font-semibold">उरई (जालौन) की पावन माटी में बुजुर्गों का अपना स्नेहास्पद आश्रम</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VISUALLY ATTRACTIVE HIGHLIGHT SERVICES CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="card-krishna text-center space-y-4 group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-saffron to-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Utensils className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-maroon dark:text-gold">सात्विक अन्न सेवा</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              जन्मदिन, विवाह वर्षगांठ या पुण्यतिथि के अवसर पर 45+ बुजुर्गों को खीर-पूरी व सात्विक भोजन प्रायोजित करें।
            </p>
          </div>

          <div className="card-krishna text-center space-y-4 group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-maroon to-rose-700 text-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-maroon dark:text-gold">24x7 स्वास्थ्य सेवा</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              दैनिक बीपी/मधुमेह जांच, निःशुल्क दवाइयाँ, फिजियोथेरेपी एवं विशेषज्ञों द्वारा नियमित डॉक्टर परामर्श।
            </p>
          </div>

          <div className="card-krishna text-center space-y-4 group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold to-amber-600 text-maroon flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-maroon dark:text-gold">स्वयंसेवक सेवा</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              अपना अमूल्य समय देकर बुजुर्गों के साथ बातचीत करें, भजन गायें, भोजन परोसें या सहायता करें।
            </p>
          </div>

          <div className="card-krishna text-center space-y-4 group">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Heart className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-maroon dark:text-gold">बुजुर्ग सहायता</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              यदि आपके आसपास कोई असहाय, बेघर या अस्वस्थ वृद्ध जन हैं, तो आश्रम में उनका आश्रय अनुरोध दर्ज करें।
            </p>
          </div>

        </div>
      </section>

      {/* IMAGE SLIDER SECTION */}
      <section className="relative z-10 py-6">
        <SectionHeader
          title="॥ आश्रय धाम जीवन झलकियाँ ॥"
          subtitle="हमारे आश्रम परिसर में निवास कर रहे बुजुर्गों के खुशहाल जीवन, सात्विक गतिविधियों तथा प्राकृतिक परिवेश के दृश्य"
        />
        <ImageSlider />
      </section>

      {/* OLD AGE HOME VISUAL OVERVIEW & FACILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-cream via-amber-50 to-cream dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl border-2 border-gold/50 p-8 sm:p-12 shadow-2xl space-y-8">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-saffron font-bold text-sm bg-saffron/10 px-4 py-1.5 rounded-full border border-saffron/30">
              ॥ आश्रम परिचय एवं भौतिक सुविधाएँ ॥
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-maroon dark:text-gold font-heading">
              स्नेह, सुरक्षा और श्री कृष्ण भक्ति का संगम
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-lg">
              आश्रय परिसर में वरिष्ठ नागरिकों के मानसिक, शारीरिक एवं आध्यात्मिक कल्याण का विशेष ध्यान रखा जाता है।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80"
                alt="आश्रम विश्राम कक्ष"
                className="rounded-2xl border-2 border-gold shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform"
              />
              <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">आरामदायक एवं स्वच्छ आवास</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">वातानुकूलित (AC) कमरे, आरामदायक बेड, संलग्न शौचालय एवं लिफ्ट सुविधा।</p>
            </div>

            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80"
                alt="स्वास्थ्य परीक्षण एवं योग"
                className="rounded-2xl border-2 border-gold shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform"
              />
              <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">दैनिक योग एवं सत्संग</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">प्रातः योगाभ्यास, संध्या आरती, भगवद्गीता पाठ एवं संगीतमय कृष्ण कीर्तन।</p>
            </div>

            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                alt="आश्रम रसोई एवं अन्न सेवा"
                className="rounded-2xl border-2 border-gold shadow-lg w-full h-56 object-cover hover:scale-105 transition-transform"
              />
              <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">शुद्ध सात्विक रसोई</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">शुद्ध देसी घी में तैयार पौष्टिक नाश्ता, फल, दूध, दोपहर व रात का महाप्रसाद।</p>
            </div>
          </div>

        </div>
      </section>

      {/* CURRENT NEEDS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title="वर्तमान आवश्यकताएँ (Current Needs)"
          subtitle="डेटाबेस में दर्ज आश्रम के बुजुर्गों की वास्तविक आवश्यकताएँ।"
        />

        {loading ? (
          <div className="text-center py-12 text-saffron font-bold text-xl animate-pulse">आवश्यकताएँ लोड हो रही हैं...</div>
        ) : needs.length === 0 ? (
          <p className="text-center py-8 text-slate-500">वर्तमान में कोई आवश्यकता दर्ज नहीं है।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {needs.map((need) => (
              <div key={need.id} className="card-krishna flex flex-col justify-between">
                <div>
                  <div className="h-48 -mx-7 -mt-7 mb-4 overflow-hidden relative">
                    <img
                      src={need.photo_url || "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80"}
                      alt={need.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={need.status} />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-saffron bg-saffron/10 border border-saffron/30 px-3 py-1 rounded-md">
                    {need.category}
                  </span>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-heading">
                    {need.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {need.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-500">कुल आवश्यक:</span>
                    <span className="text-maroon dark:text-gold font-bold">{need.required_quantity} {need.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-500">उपलब्ध:</span>
                    <span className="text-emerald-600 font-bold">{need.available_quantity} {need.unit}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-saffron to-gold h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((need.available_quantity / need.required_quantity) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/needs" className="btn-gold text-lg inline-flex items-center gap-2">
            सभी आवश्यकताएँ देखें <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* MEAL SPONSORSHIP BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-maroon via-maroon-600 to-saffron text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-gold">

          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/20 text-gold rounded-full text-sm font-bold border border-gold/40">
              <Sparkles className="w-4 h-4" /> अन्नदान महादान
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gold font-heading leading-tight">
              भोजन प्रायोजन (Meal Sponsorship)
            </h2>
            <p className="text-cream/95 text-lg sm:text-xl leading-relaxed font-medium">
              आप अपने या अपने प्रियजनों के जन्मदिन, विवाह वर्षगांठ या पुण्यतिथि पर आश्रम के पूज्य बुजुर्गों को नाश्ता, दोपहर का भोजन या रात्रि का भोजन प्रायोजित कर सकते हैं।
            </p>
          </div>

          <div>
            <Link to="/meal-sponsorship" className="btn-gold text-xl py-4 px-10 shadow-2xl font-extrabold whitespace-nowrap">
              भोजन प्रायोजित करें
            </Link>
          </div>

        </div>
      </section>

      {/* UPCOMING EVENTS & FESTIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title="कार्यक्रम एवं उत्सव (Events & Festivals)"
          subtitle="आश्रम में बुजुर्गों के साथ मनाए जाने वाले त्यौहार एवं स्वास्थ्य शिविर।"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((evt) => (
            <div key={evt.id} className="card-krishna flex flex-col justify-between">
              <div>
                <img
                  src={evt.image_url || "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80"}
                  alt={evt.title}
                  className="w-full h-52 object-cover rounded-xl mb-4 border-2 border-gold/40"
                />
                <div className="flex items-center gap-2 text-saffron font-bold text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(evt.event_date).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-2 text-maroon dark:text-gold">{evt.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/events" className="btn-secondary text-lg inline-flex items-center gap-2">
            उत्सव गैलरी देखें <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* QUICK ELDERLY ASSISTANCE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-cream dark:bg-slate-900 border-4 border-gold/50 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-saffron font-bold text-sm bg-saffron/10 px-3.5 py-1 rounded-full border border-saffron/30">
              ॥ हेल्पडेस्क सेवा ॥
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-maroon dark:text-gold font-heading">
              क्या आप किसी असहाय बुजुर्ग को जानते हैं?
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
              यदि आपके आसपास कोई बेघर, असहाय या अस्वस्थ वृद्ध जन हैं जिन्हें भोजन, दवाइियाँ या आश्रय की आवश्यकता है, तो तुरंत उनका अनुरोध यहाँ दर्ज करें।
            </p>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300 font-semibold text-base">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-saffron" />
                निःशुल्क सात्विक भोजन एवं नियमित दवाइयों की सहायता
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-saffron" />
                सुरक्षित, स्नेहास्पद एवं सम्मानजनक आश्रय व्यवस्था
              </li>
            </ul>
            <Link to="/elderly-assistance" className="btn-primary text-xl py-4 px-8 inline-flex items-center gap-2">
              सहायता अनुरोध दर्ज करें <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80"
              alt="बुजुर्ग सहायता"
              className="rounded-3xl border-4 border-gold shadow-2xl w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
