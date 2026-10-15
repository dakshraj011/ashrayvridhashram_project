import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import api, { getAssetUrl } from '../services/api';

interface MultiImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onChange,
  maxPhotos = 5,
  label = 'कार्यक्रम की तस्वीरें अपलोड करें (अधिकतम 5 फ़ोटो)'
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setErrorMsg(null);
    const availableSlots = maxPhotos - images.length;
    if (availableSlots <= 0) {
      setErrorMsg(`आप पहले ही अधिकतम ${maxPhotos} फ़ोटो जोड़ चुके हैं।`);
      return;
    }

    const filesToUpload = Array.from(fileList).slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      setErrorMsg(`केवल पहली ${availableSlots} फ़ोटो ली गईं क्योंकि अधिकतम सीमा ${maxPhotos} है।`);
    }

    // Validate size (10MB max per image, 100MB per video)
    for (const f of filesToUpload) {
      const isVid = f.type.startsWith('video/');
      const limit = isVid ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (f.size > limit) {
        setErrorMsg(`फ़ाइल '${f.name}' का आकार बहुत बड़ा है। (अधिकतम 10MB प्रति फ़ोटो)`);
        return;
      }
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Upload files
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('media', file);

        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success && res.data.url) {
          uploadedUrls.push(res.data.url);
        }
      }

      const updated = [...images, ...uploadedUrls].slice(0, maxPhotos);
      onChange(updated);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'तस्वीरें अपलोड करने में त्रुटि हुई।');
    } finally {
      setUploading(false);
      // Reset input value so user can upload again if needed
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-maroon dark:text-gold flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-saffron" />
          {label}
        </label>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
          images.length >= maxPhotos
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
        }`}>
          {images.length} / {maxPhotos} फ़ोटो
        </span>
      </div>

      {/* Upload Drop Area (Only visible if < maxPhotos) */}
      {images.length < maxPhotos ? (
        <div className="relative border-2 border-dashed border-gold/50 rounded-2xl p-5 bg-cream/40 dark:bg-slate-900/60 hover:border-gold hover:bg-gold/5 transition-all text-center">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            disabled={uploading}
            onChange={handleFilesSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />

          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            {uploading ? (
              <div className="flex flex-col items-center py-2 space-y-2">
                <Loader2 className="w-8 h-8 text-saffron animate-spin" />
                <p className="text-sm font-bold text-maroon dark:text-gold">
                  तस्वीरें अपलोड की जा रही हैं... कृपया प्रतीक्षा करें
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-saffron/10 text-saffron flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    यहाँ क्लिक करें या एक साथ 1 से {maxPhotos - images.length} फ़ोटो चुनें
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    (JPG, PNG, WEBP — आप एक साथ या बारी-बारी अधिकतम 5 फ़ोटो तक अपलोड कर सकते हैं)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>अधिकतम 5 फ़ोटो पूरी हो चुकी हैं। यदि कोई फ़ोटो बदलना चाहें, तो नीचे से डिलीट (❌) करके नई फ़ोटो जोड़ें।</span>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thumbnails Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-slate-500">
            चयनित तस्वीरें (पहली फ़ोटो मुख्य कवर फ़ोटो बनेगी):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((url, idx) => {
              const isVid = /\.(mp4|webm|mov|mkv|avi)$/i.test(url);
              return (
                <div
                  key={idx}
                  className={`relative group rounded-xl overflow-hidden border-2 shadow bg-black aspect-square flex items-center justify-center ${
                    idx === 0 ? 'border-gold ring-2 ring-gold/40' : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isVid ? (
                    <video src={getAssetUrl(url)} className="w-full h-full object-cover" />
                  ) : (
                    <img src={getAssetUrl(url)} alt={`फोटो ${idx + 1}`} className="w-full h-full object-cover" />
                  )}

                  {/* Badge */}
                  <div className="absolute top-1.5 left-1.5 pointer-events-none">
                    {idx === 0 ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gold text-maroon shadow flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> कवर
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(idx);
                    }}
                    title="यह फ़ोटो हटाएँ"
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform transform hover:scale-110 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
