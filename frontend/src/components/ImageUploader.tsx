import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Video, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api, { getAssetUrl } from '../services/api';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  defaultUrl?: string;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  defaultUrl = '',
  label = 'फ़ोटो या वीडियो अपलोड करें (ऐच्छिक)'
}) => {
  const [preview, setPreview] = useState<string>(defaultUrl);
  const [isVideo, setIsVideo] = useState<boolean>(() => {
    return defaultUrl ? /\.(mp4|webm|mov|mkv|avi)$/i.test(defaultUrl) : false;
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileIsVideo = file.type.startsWith('video/');

    // Validate size (100MB max for video, 10MB for image)
    const maxBytes = fileIsVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setStatusMsg({
        text: `फ़ाइल का आकार बहुत बड़ा है। (अधिकतम सीमा: ${fileIsVideo ? '100MB वीडियो' : '10MB इमेज'})`,
        isError: true
      });
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setPreview(res.data.url);
        setIsVideo(fileIsVideo || res.data.resourceType === 'video');
        onImageUploaded(res.data.url);
        setStatusMsg({
          text: res.data.message || (fileIsVideo ? 'वीडियो सफलतापूर्वक अपलोड हो गया!' : 'इमेज सफलतापूर्वक अपलोड हो गई!'),
          isError: false
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        text: err.response?.data?.message || 'फ़ाइल अपलोड करने में विफलता हुई।',
        isError: true
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-maroon dark:text-gold">{label}</label>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gold/40 rounded-xl bg-amber-50/50 dark:bg-slate-900">
        {preview ? (
          <div className="relative w-32 h-28 rounded-lg overflow-hidden border border-gold shadow bg-black flex items-center justify-center">
            {isVideo ? (
              <video
                src={getAssetUrl(preview)}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={getAssetUrl(preview)}
                alt="अपलोड पूर्वावलोकन"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="w-32 h-28 rounded-lg bg-cream dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 border border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-1">
              <ImageIcon className="w-6 h-6 text-saffron" />
              <Video className="w-6 h-6 text-gold" />
            </div>
            <span className="text-xs mt-1 font-semibold">फ़ोटो या वीडियो</span>
          </div>
        )}

        <div className="flex-1 space-y-2 w-full text-center sm:text-left">
          <label className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2 cursor-pointer w-fit mx-auto sm:mx-0">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                अपलोड हो रहा है...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                फ़ाइल चुनें (Photo / Video)
              </>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            स्वीकृत प्रारूप: JPG, PNG, WEBP, MP4, WEBM (फ़ोटो max 10MB, वीडियो max 100MB)
          </p>

          {statusMsg && (
            <div className={`text-xs flex items-center gap-1 font-semibold ${statusMsg.isError ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {statusMsg.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
