import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';

  if (status === 'स्वीकार किया गया' || status === 'पूर्ण' || status === 'सक्रिय' || status === 'हल किया गया') {
    badgeStyle = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300';
  } else if (status === 'लंबित' || status === 'अपठित' || status === 'प्रक्रिया में') {
    badgeStyle = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300';
  } else if (status === 'अस्वीकार किया गया') {
    badgeStyle = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${badgeStyle}`}>
      <span className="w-2 h-2 rounded-full mr-1.5 bg-current"></span>
      {status}
    </span>
  );
};
