import React from 'react';

export const PeacockFeatherIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5C30 25 15 45 15 65C15 80 30 95 50 95C70 95 85 80 85 65C85 45 70 25 50 5Z" fill="url(#peacockGrad)" />
    <circle cx="50" cy="65" r="18" fill="#1E3A8A" />
    <circle cx="50" cy="65" r="12" fill="#0EA5E9" />
    <circle cx="50" cy="65" r="6" fill="#D9AA55" />
    <path d="M50 5V95" stroke="#D9AA55" strokeWidth="2.5" strokeDasharray="4 4" />
    <defs>
      <linearGradient id="peacockGrad" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#047857" />
        <stop offset="0.5" stopColor="#0D9488" />
        <stop offset="1" stopColor="#E87924" />
      </linearGradient>
    </defs>
  </svg>
);

export const OmSymbol: React.FC<{ className?: string }> = ({ className = "w-8 h-8 text-saffron" }) => (
  <span className={`font-heading font-extrabold select-none inline-block ${className}`}>
    ॐ
  </span>
);

export const SwastikSymbol: React.FC<{ className?: string }> = ({ className = "w-8 h-8 text-gold" }) => (
  <span className={`font-heading font-extrabold select-none inline-block ${className}`}>
    卐
  </span>
);

export const KrishnaLotusEmblem: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-saffron via-gold to-maroon p-0.5 shadow-lg ${className}`}>
    <div className="w-full h-full bg-cream dark:bg-slate-900 rounded-full flex items-center justify-center border border-gold/50 shadow-inner">
      <span className="text-xl sm:text-2xl font-extrabold text-saffron select-none">
        🪷
      </span>
    </div>
  </div>
);

export const AashrayBlessingSymbol: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="url(#blessingGrad)" stroke="#D9AA55" strokeWidth="4" />
    <path d="M50 20C35 35 25 50 25 65C25 75 35 85 50 85C65 85 75 75 75 65C75 50 65 35 50 20Z" fill="#FFF6E9" opacity="0.3" />
    <text x="50" y="58" textAnchor="middle" fill="#852D36" fontSize="32" fontWeight="bold" fontFamily="serif">ॐ</text>
    <defs>
      <linearGradient id="blessingGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E87924" />
        <stop offset="0.5" stopColor="#D9AA55" />
        <stop offset="1" stopColor="#852D36" />
      </linearGradient>
    </defs>
  </svg>
);

export const AashrayLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <img
    src="/aashray-logo.jpg"
    alt="आश्रय वृद्धाश्रम प्रतीक"
    className={`rounded-full object-cover shadow-md border-2 border-gold ${className}`}
  />
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center my-10 relative z-10">
    <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
      <SwastikSymbol className="text-gold text-2xl" />
      <AashrayLogo className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-gold shadow-lg" />
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-maroon dark:text-gold font-heading tracking-tight">
        {title}
      </h2>
      <PeacockFeatherIcon className="w-8 h-8 sm:w-10 sm:h-10" />
      <SwastikSymbol className="text-gold text-2xl" />
    </div>
    {subtitle && (
      <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
        {subtitle}
      </p>
    )}
    <div className="gold-divider mx-auto"></div>
  </div>
);

