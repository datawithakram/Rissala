import React, { useState } from 'react';
import { X, Copy, Share2, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, text }) => {
  const { isRTL, lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleNativeShare = async () => {
    // If we're on a browser that supports navigator.share
    if (navigator.share) {
      try {
        await navigator.share({
          title: isRTL ? "ذكر من تطبيق الرسالة" : "Remembrance from Al Risala",
          text: text,
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed
        console.error('Share failed:', err);
      }
    } else {
        // Fallback is already covered by the copy button in this modal
        handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gradient-primary p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm mx-auto">
            <Share2 size={32} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold font-cairo text-center">
            {isRTL ? "مشاركة الذكر" : "Share Zikr"}
          </h2>
          <p className="text-sm opacity-80 text-center font-cairo mt-1">
            {isRTL ? "اختر الطريقة المناسبة للمشاركة" : "Choose how to share this zikr"}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-muted/50 p-5 rounded-3xl border border-primary/5 max-h-40 overflow-y-auto">
            <p className="font-amiri text-lg leading-loose text-center text-card-foreground">
              {text}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-secondary/30 hover:bg-secondary/50 transition-all border border-primary/5 active:scale-95 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                {copied ? <Check size={24} className="text-emerald-500" /> : <Copy size={24} />}
              </div>
              <span className="text-sm font-bold font-cairo text-card-foreground">
                {copied ? (isRTL ? "تم النسخ" : "Copied") : (isRTL ? "نسخ الذكر" : "Copy")}
              </span>
            </button>

            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-primary/10 hover:bg-primary/20 transition-all border border-primary/10 active:scale-95 group"
            >
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                <Share2 size={24} />
              </div>
              <span className="text-sm font-bold font-cairo text-primary">
                {isRTL ? "إرسال لصديق" : "Send to friend"}
              </span>
            </button>
          </div>
        </div>
        
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-muted text-card-foreground font-cairo font-bold transition hover:bg-muted/80 text-sm"
          >
            {isRTL ? "تراجع" : "Go Back"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
