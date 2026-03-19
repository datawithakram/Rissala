import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

const PWAUpdatePrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  React.useEffect(() => {
    if (offlineReady) {
      toast.success('التطبيق جاهز للعمل بدون إنترنت', {
        description: 'يمكنك تصفح التطبيق حتى في حال انقطاع الشبكة.',
        duration: 5000,
      });
    }
  }, [offlineReady]);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-80">
      <div className="bg-[#215B4C] text-white p-4 rounded-xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 transition-all duration-300">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-sm">تحديث جديد متوفر</h3>
              <p className="text-xs text-white/80">نسخة جديدة من التطبيق متوفرة الآن.</p>
            </div>
          </div>
          <button 
            onClick={close}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-white text-[#215B4C] hover:bg-white/90 font-bold"
            onClick={() => updateServiceWorker(true)}
          >
            تحديث الآن
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={close}
          >
            لاحقاً
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
