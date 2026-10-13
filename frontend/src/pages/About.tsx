import React, { useState, useEffect } from 'react';
import { SectionHeader, PeacockFeatherIcon } from '../components/KrishnaAccents';
import api from '../services/api';
import type { HomeInfo } from '../types';
import { Heart, ShieldCheck, Sun, Sparkles, CheckCircle2, Phone, Mail, MapPin, Code2, ExternalLink } from 'lucide-react';

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

  const facilitiesList = safeParseArray(info?.facilities);
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
            {info?.description || 'आश्रय वृद्धाश्रम श्री कृष्ण की पावन नगरी में असहाय, बेघर एवं वरिष्ठ नागरिकों की सेवा और देखभाल के लिए समर्पित एक गैर-लाभकारी संस्था है।'}
          </p>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-saffron flex-shrink-0" />
              <span><strong>पता:</strong> {info?.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-saffron flex-shrink-0" />
              <span><strong>दूरभाष:</strong> {info?.phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-saffron flex-shrink-0" />
              <span><strong>ईमेल:</strong> {info?.email}</span>
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
                  src="/developer-daksh.jpg"
                  alt="Daksh Raj Singh - Website Developer"
                  className="relative w-48 h-48 sm:w-56 sm:h-56 object-cover object-top rounded-2xl border-4 border-white dark:border-slate-900 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
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
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 shadow-md font-medium text-sm transition-all transform hover:-translate-y-0.5"
                  title="Daksh Raj Singh on GitHub"
                >
                  <GithubIcon className="w-5 h-5 text-gold" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-blue-700 text-white hover:bg-blue-800 shadow-md font-medium text-sm transition-all transform hover:-translate-y-0.5"
                  title="Daksh Raj Singh on LinkedIn"
                >
                  <LinkedinIcon className="w-5 h-5 text-white" />
                  <span>LinkedIn Profile</span>
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

