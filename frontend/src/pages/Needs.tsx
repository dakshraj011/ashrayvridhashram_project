import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '../components/KrishnaAccents';
import { StatusBadge } from '../components/StatusBadge';
import api, { getAssetUrl } from '../services/api';
import type { Need } from '../types';
import { Filter, Gift, HeartHandshake } from 'lucide-react';

export const Needs: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी');

  const categories = ['सभी', 'भोजन', 'कपड़े', 'दवाइयाँ', 'पंखे', 'कूलर', 'अन्य'];

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const catQuery = selectedCategory !== 'सभी' ? `?category=${encodeURIComponent(selectedCategory)}` : '';
        const res = await api.get(`/needs${catQuery}`);
        if (res.data.success) {
          setNeeds(res.data.needs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNeeds();
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SectionHeader
        title="वर्तमान आवश्यकताएँ (Current Needs)"
        subtitle="डेटाबेस में दर्ज आश्रम के बुजुर्गों की वास्तविक आवश्यकताएँ।"
      />

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-4 h-4" /> श्रेणी फ़िल्टर:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-saffron text-white shadow-md scale-105'
                : 'bg-cream dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-gold/40 hover:bg-gold/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Needs Grid */}
      {loading ? (
        <div className="text-center py-12 text-saffron font-bold text-lg animate-pulse">
          आवश्यकताएँ लोड हो रही हैं...
        </div>
      ) : needs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-gold/30 p-8 space-y-3">
          <Gift className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">इस श्रेणी में कोई आवश्यकता नहीं मिली।</h3>
          <p className="text-sm text-slate-500">कृपया अन्य श्रेणी चुनें।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {needs.map((item) => {
            const percentage = Math.min(100, Math.round((item.available_quantity / item.required_quantity) * 100));

            return (
              <div key={item.id} className="card-krishna flex flex-col justify-between">
                <div>
                  <div className="h-48 -mx-6 -mt-6 mb-4 overflow-hidden relative">
                    <img
                      src={item.photo_url ? getAssetUrl(item.photo_url) : "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-saffron bg-saffron/10 px-3 py-1 rounded-md">
                    {item.category}
                  </span>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-heading">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-500">आवश्यक मात्रा:</span>
                    <span className="text-maroon dark:text-gold font-bold">{item.required_quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-500">वर्तमान उपलब्ध:</span>
                    <span className="text-emerald-600 font-bold">{item.available_quantity} {item.unit}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-saffron h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-slate-500 font-bold">{percentage}% पूर्ति</p>

                  <div className="pt-2">
                    <Link
                      to="/contact"
                      className="btn-primary w-full text-center text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      इस आवश्यकता हेतु संपर्क करें
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
