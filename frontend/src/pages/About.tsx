import React, { useState, useEffect } from 'react';
import { SectionHeader, PeacockFeatherIcon } from '../components/KrishnaAccents';
import api from '../services/api';
import type { HomeInfo } from '../types';
import { Heart, ShieldCheck, Sun, Sparkles, CheckCircle2, Phone, Mail, MapPin, Code2, ExternalLink, UserCheck, PhoneCall } from 'lucide-react';
import developerPhoto from '../assets/developer-daksh.jpg';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export const About: React.FC = () => {
  const [info, setInfo] = useState<HomeInfo | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get('/home/info');
        if (res.data.success) {
          setInfo(res.data.info);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInfo();
  }, []);

  const safeParseArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return val ? [val] : [];
      }
    }
    return [];
  };

  const rawFacilities = safeParseArray(info?.facilities);
  const facilitiesList = (rawFacilities.length > 0 ? rawFacilities : [
    "24x7 स्वास्थ्य देखभाल एवं डॉक्टर परामर्श",
    "सात्विक एवं पौष्टिक भोजन",
    "हवादार एवं आरामदायक कमरे",
    "दैनिक योग, ध्यान एवं श्री कृष्ण संकीर्तन",
    "पुस्तकालय एवं मनोरंजन कक्ष",
    "धार्मिक एवं सांस्कृतिक यात्राएँ"
  ]).map((f: string) => f.replace(/वातानुकूलित\s*\(AC\)\s*(और|एवं)?\s*/gi, 'हवादार एवं '));

  const aboutImagesList = safeParseArray(info?.about_images);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SectionHeader
        title="हमारे बारे में (About Us)"
        subtitle="आश्रय वृद्धाश्रम की विचार यात्रा, उद्देश्य और सुविधाएँ"
      />

      {/* MAIN ABOUT BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-gold/40 shadow-xl">
        <div className="space-y-4">
          <span className="text-saffron font-bold text-sm bg-saffron/10 px-3 py-1 rounded-full">
            ॥ मातृदेवो भव । पितृदेवो भव ॥
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-maroon dark:text-gold font-heading">
            {info?.name || 'आश्रय वृद्धाश्रम'}
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            {info?.description || 'आश्रय वृद्धाश्रम उरई (जालौन) में असहाय, बेघर एवं वरिष्ठ नागरिकों की सेवा और देखभाल के लिए समर्पित एक गैर-लाभकारी संस्था है। यहाँ बुजुर्गों को सात्विक भोजन, नियमित स्वास्थ्य देखभाल, योगाभ्यास, भक्ति भजन और आत्मीय परिवार जैसा वातावरण प्रदान किया जाता है।'}
          </p>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-saffron flex-shrink-0" />
              <span><strong>पता:</strong> {info?.address || 'आश्रम पता, उरई, जिला जालौन (उत्तर प्रदेश)'}</span>
            </p>
            <p className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-saffron flex-shrink-0" />
              <span>
                <strong>आश्रम प्रबंधक:</strong> संदीप कुमार सिंह (
                <a href="tel:7860437507" className="text-saffron hover:underline font-bold transition-colors">
                  7860437507
                </a>
                )
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-saffron flex-shrink-0" />
              <span>
                <strong>दूरभाष:</strong>{' '}
                <a href={`tel:${info?.phone || '7860437507'}`} className="hover:text-saffron font-bold transition-colors">
                  {info?.phone || '7860437507'}
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-saffron flex-shrink-0" />
              <span>
                <strong>ईमेल:</strong>{' '}
                <a href={`mailto:${info?.email || 'dakshrajs104@gmail.com'}`} className="hover:text-saffron font-bold transition-colors">
                  {info?.email || 'dakshrajs104@gmail.com'}
                </a>
              </span>
            </p>
          </div>
        </div>

        <div>
          <img
            src={info?.hero_image || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80"}
            alt="आश्रय परिसर"
            className="rounded-2xl border-4 border-gold shadow-lg w-full h-[380px] object-cover"
          />
        </div>
      </div>

      {/* ASHRAM MANAGER & LEADERSHIP HIGHLIGHT */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-orange-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 sm:p-8 rounded-3xl border-2 border-gold/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-maroon to-saffron text-gold flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-gold/60">
            <UserCheck className="w-9 h-9 sm:w-11 sm:h-11 text-gold" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-saffron bg-saffron/10 px-3 py-0.5 rounded-full border border-saffron/20">
                ॥ आश्रम प्रबंधन एवं व्यवस्था ॥
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-maroon dark:text-gold font-heading">
              संदीप कुमार सिंह
            </h3>
            <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
              आश्रम व्यवस्थापक एवं प्रबंधक (Ashram Manager)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              आश्रम संचालन, आवास एवं बुजुर्ग सहायता प्रबंधन
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <a
            href="tel:7860437507"
            className="btn-primary w-full sm:w-auto px-6 py-3.5 text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all cursor-pointer"
            title="प्रबंधक संदीप कुमार सिंह से संपर्क करें"
          >
            <PhoneCall className="w-5 h-5 text-white animate-bounce" />
            <span className="font-bold tracking-wide">फोन: 7860437507</span>
          </a>
        </div>
      </div>

      {/* OUR FACILITIES */}
      <div className="space-y-6">
        <h3 className="text-3xl font-bold text-center text-maroon dark:text-gold font-heading">
          प्रमुख सुविधाएँ एवं व्यवस्थाएँ
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilitiesList.map((fac: string, idx: number) => (
            <div key={idx} className="card-krishna flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-saffron text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{fac}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">अनुभवी कर्मचारियों एवं डॉक्टरों द्वारा 24x7 सेवा।</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAILY ROUTINE & ATMOSPHERE */}
      <div className="bg-gradient-to-r from-saffron/10 via-gold/10 to-maroon/10 p-8 rounded-3xl border border-gold/30 space-y-6">
        <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading text-center">
          दैनिक दिनचर्या एवं माहौल
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow">
            <Sun className="w-8 h-8 mx-auto text-saffron mb-2" />
            <h4 className="font-bold text-lg">प्रातः योग व संकीर्तन</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">सुबह 6:00 बजे योगाभ्यास एवं भगवद्गीता पाठ</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow">
            <Heart className="w-8 h-8 mx-auto text-maroon dark:text-gold mb-2" />
            <h4 className="font-bold text-lg">सात्विक भोजन</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">शुद्ध देसी घी में निर्मित पौष्टिक नाश्ता व भोजन</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow">
            <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <h4 className="font-bold text-lg">स्वास्थ्य परीक्षण</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">मालिक डॉक्टरों द्वारा बीपी/मधुमेह की जांच</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow">
            <Sparkles className="w-8 h-8 mx-auto text-gold mb-2" />
            <h4 className="font-bold text-lg">संध्या आरती व सत्संग</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">भजन, कीर्तन एवं बुजुर्गों संग विचार-विमर्श</p>
          </div>
        </div>
      </div>

      {/* PHOTO GALLERY TEASER */}
      {aboutImagesList.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-maroon dark:text-gold font-heading">
            आश्रम के कुछ दृश्य
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {aboutImagesList.map((imgUrl: string, idx: number) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`आश्रम दृश्य ${idx + 1}`}
                className="w-full h-64 object-cover rounded-2xl border-2 border-gold shadow-md hover:scale-[1.02] transition-transform"
              />
            ))}
          </div>
        </div>
      )}

      {/* DEVELOPER PROFILE SECTION */}
      <div id="developer" className="pt-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-2 border-gold/40 shadow-xl rounded-3xl p-6 sm:p-8 md:p-10">
          
          {/* Subtle Krishna Background Decor */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-saffron/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Badge Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 border-b border-gold/20 pb-4">
            <div className="flex items-center gap-2">
              <PeacockFeatherIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-saffron bg-saffron/10 px-3.5 py-1 rounded-full border border-saffron/20">
                ॥ डिजिटल सेवा एवं तकनीक ॥
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Code2 className="w-4 h-4 text-gold" /> Website Developer Profile
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Developer Photo & Name */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-saffron via-gold to-emerald-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <img
                  src={developerPhoto}
                  alt="Daksh Raj Singh - Website Developer"
                  className="relative w-48 h-48 sm:w-56 sm:h-56 object-cover object-top rounded-2xl border-4 border-white dark:border-slate-900 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/developer-daksh.jpg";
                  }}
                />
              </div>

              <div className="mt-4 space-y-1">
                <h4 className="text-2xl font-extrabold text-maroon dark:text-gold font-heading">
                  Daksh Raj Singh
                </h4>
                <p className="text-sm font-semibold text-saffron dark:text-amber-400 flex items-center justify-center gap-1.5">
                  <Code2 className="w-4 h-4 text-gold" />
                  Website Developer
                </p>
              </div>
            </div>

            {/* Developer Bio & Social Links */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <div className="inline-block bg-maroon/10 dark:bg-gold/10 text-maroon dark:text-gold text-xs font-bold px-3 py-1 rounded-md mb-2">
                  मुख्य डेवलपर एवं तकनीक निर्माता
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">
                  आश्रय (Aashray) मंच विकास
                </h3>
              </div>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-5 rounded-2xl border border-gold/20 shadow-inner">
                "मैंने आश्रय (Aashray) डिजिटल मंच का निर्माण श्री कृष्ण की प्रेरणा से असहाय, बेघर एवं पूज्य वरिष्ठ नागरिकों की सेवा, सहयोग और सहायता प्रबंधन को सुगम एवं पारदर्शी बनाने के उद्देश्य से किया है। यह डिजिटल पहल समाज के बुजुर्गों के जीवन में सम्मान, संबल और बेहतर सुविधाएं प्रदान करने के लिए समर्पित है।"
              </p>

              {/* Social Connections */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="https://www.linkedin.com/in/daksh-raj-singh-b68086295?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0077b5] text-white hover:bg-[#006396] shadow-md font-medium text-sm transition-all transform hover:-translate-y-0.5"
                  title="Daksh Raj Singh on LinkedIn"
                >
                  <LinkedinIcon className="w-5 h-5 text-white" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href="https://instagram.com/dakshraj_singh11?srtk=aGM0czMweWpmYXRk&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-95 shadow-md font-medium text-sm transition-all transform hover:-translate-y-0.5"
                  title="Daksh Raj Singh on Instagram (@dakshraj_singh11)"
                >
                  <InstagramIcon className="w-5 h-5 text-white" />
                  <span>Instagram Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href="https://github.com/dakshraj011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 shadow-md font-medium text-sm transition-all transform hover:-translate-y-0.5"
                  title="Daksh Raj Singh on GitHub"
                >
                  <GithubIcon className="w-5 h-5 text-gold" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

