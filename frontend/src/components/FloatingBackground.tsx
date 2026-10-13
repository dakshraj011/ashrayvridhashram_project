import React from 'react';

export const FloatingBackground: React.FC = () => {
  // Configured positions for darker, visible background floating symbols & logos
  const symbols = [
    { text: 'ॐ', left: '6%', top: '12%', size: '3.8rem', anim: 'animate-float-gentle', delay: '0s', duration: '12s' },
    { text: '卐', left: '88%', top: '18%', size: '3.2rem', anim: 'animate-float-rotate', delay: '1.5s', duration: '20s' },
    { text: 'ॐ', left: '78%', top: '58%', size: '4.2rem', anim: 'animate-float-pulse', delay: '3s', duration: '15s' },
    { text: '卐', left: '10%', top: '72%', size: '3.5rem', anim: 'animate-float-drift', delay: '0.8s', duration: '18s' },
    { text: 'ॐ', left: '48%', top: '35%', size: '5rem', anim: 'animate-float-gentle', delay: '2s', duration: '14s' },
    { text: '卐', left: '92%', top: '82%', size: '3rem', anim: 'animate-float-rotate', delay: '4s', duration: '22s' },
    { text: 'ॐ', left: '4%', top: '48%', size: '3.5rem', anim: 'animate-float-pulse', delay: '2.2s', duration: '16s' },
    { text: '🪷', left: '32%', top: '15%', size: '2.5rem', anim: 'animate-float-drift', delay: '1s', duration: '17s' },
    { text: '🪷', left: '65%', top: '80%', size: '2.8rem', anim: 'animate-float-gentle', delay: '3.5s', duration: '15s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Darker, visible Om & Swastik symbols */}
      {symbols.map((s, idx) => (
        <span
          key={idx}
          className={`absolute font-heading font-extrabold text-saffron/45 dark:text-gold/40 drop-shadow-[0_2px_10px_rgba(232,121,36,0.2)] ${s.anim}`}
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        >
          {s.text}
        </span>
      ))}

      {/* Floating subtle logo watermark accent in background */}
      <img
        src="/aashray-logo.jpg"
        alt=""
        className="absolute w-48 h-48 rounded-full opacity-10 dark:opacity-15 blur-xs left-[85%] top-[45%] animate-float-pulse"
        style={{ animationDuration: '24s' }}
      />
      <img
        src="/aashray-logo.jpg"
        alt=""
        className="absolute w-56 h-56 rounded-full opacity-10 dark:opacity-15 blur-xs left-[3%] top-[82%] animate-float-gentle"
        style={{ animationDuration: '28s' }}
      />
    </div>
  );
};

